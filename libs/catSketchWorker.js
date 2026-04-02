/* global cv, self, importScripts, ImageData, Uint8ClampedArray */

function initOpenCV() {
    return new Promise(function (resolve, reject) {
        var timeout = setTimeout(function () {
            reject(new Error("OpenCV WASM init timeout (30s)"));
        }, 30000);

        try {
            importScripts("/libs/opencv.js");
        } catch (error) {
            clearTimeout(timeout);
            reject(new Error("importScripts failed: " + error.message));
            return;
        }

        function poll() {
            if (typeof cv !== "undefined" && cv.Mat) {
                clearTimeout(timeout);
                resolve();
            } else if (typeof cv !== "undefined" && typeof cv.then === "function") {
                cv.then(function (instance) {
                    clearTimeout(timeout);
                    cv = instance;
                    resolve();
                }).catch(function (error) {
                    clearTimeout(timeout);
                    reject(error);
                });
            } else {
                setTimeout(poll, 50);
            }
        }

        poll();
    });
}

function clampRect(rect, width, height) {
    var x = Math.max(0, Math.min(width - 1, rect.x));
    var y = Math.max(0, Math.min(height - 1, rect.y));
    var w = Math.max(1, Math.min(width - x, rect.width));
    var h = Math.max(1, Math.min(height - y, rect.height));
    return new cv.Rect(x, y, w, h);
}

function getLargestRectFromMask(mask) {
    var contours = new cv.MatVector();
    var hierarchy = new cv.Mat();
    var largestRect = null;
    var largestArea = 0;

    try {
        var contourMask = mask.clone();
        cv.findContours(
            contourMask,
            contours,
            hierarchy,
            cv.RETR_EXTERNAL,
            cv.CHAIN_APPROX_SIMPLE,
        );
        contourMask.delete();

        for (var i = 0; i < contours.size(); i++) {
            var contour = contours.get(i);
            var area = cv.contourArea(contour);
            if (area > largestArea) {
                largestArea = area;
                largestRect = cv.boundingRect(contour);
            }
            contour.delete();
        }

        return largestRect;
    } finally {
        contours.delete();
        hierarchy.delete();
    }
}

function createSaliencyMask(src) {
    var rgb = new cv.Mat();
    var lab = new cv.Mat();
    var hsv = new cv.Mat();
    var blurredLab = new cv.Mat();
    var diff = new cv.Mat();
    var gray = new cv.Mat();
    var hsvChannels = new cv.MatVector();
    var saturation = null;
    var combined = new cv.Mat();
    var combined8 = new cv.Mat();
    var binary = new cv.Mat();
    var kernel = cv.getStructuringElement(cv.MORPH_ELLIPSE, new cv.Size(9, 9));

    try {
        cv.cvtColor(src, rgb, cv.COLOR_RGBA2RGB);
        cv.cvtColor(rgb, lab, cv.COLOR_RGB2Lab);
        cv.GaussianBlur(lab, blurredLab, new cv.Size(19, 19), 0);
        cv.absdiff(lab, blurredLab, diff);
        cv.cvtColor(diff, gray, cv.COLOR_RGB2GRAY);

        cv.cvtColor(rgb, hsv, cv.COLOR_RGB2HSV);
        cv.split(hsv, hsvChannels);
        saturation = hsvChannels.get(1);
        cv.addWeighted(gray, 0.72, saturation, 0.28, 0, combined);
        cv.normalize(combined, combined8, 0, 255, cv.NORM_MINMAX, cv.CV_8U);
        cv.threshold(combined8, binary, 0, 255, cv.THRESH_BINARY + cv.THRESH_OTSU);
        cv.morphologyEx(binary, binary, cv.MORPH_CLOSE, kernel);
        cv.morphologyEx(binary, binary, cv.MORPH_OPEN, kernel);
        return binary.clone();
    } finally {
        rgb.delete();
        lab.delete();
        hsv.delete();
        blurredLab.delete();
        diff.delete();
        gray.delete();
        hsvChannels.delete();
        if (saturation) saturation.delete();
        combined.delete();
        combined8.delete();
        binary.delete();
        kernel.delete();
    }
}

function makeGrabCutRect(src, saliencyMask) {
    var width = src.cols;
    var height = src.rows;
    var rect = getLargestRectFromMask(saliencyMask);
    var fallback = {
        x: Math.round(width * 0.08),
        y: Math.round(height * 0.08),
        width: Math.round(width * 0.84),
        height: Math.round(height * 0.84),
    };

    if (!rect) {
        return clampRect(fallback, width, height);
    }

    var paddingX = Math.round(rect.width * 0.14);
    var paddingY = Math.round(rect.height * 0.14);

    return clampRect(
        {
            x: rect.x - paddingX,
            y: rect.y - paddingY,
            width: rect.width + paddingX * 2,
            height: rect.height + paddingY * 2,
        },
        width,
        height,
    );
}

function maskFromGrabCut(grabMask) {
    var foreground = new cv.Mat(grabMask.rows, grabMask.cols, cv.CV_8UC1);
    for (var y = 0; y < grabMask.rows; y++) {
        for (var x = 0; x < grabMask.cols; x++) {
            var value = grabMask.ucharPtr(y, x)[0];
            foreground.ucharPtr(y, x)[0] =
                value === cv.GC_FGD || value === cv.GC_PR_FGD ? 255 : 0;
        }
    }
    return foreground;
}

function findMaskBounds(mask) {
    var minX = mask.cols;
    var minY = mask.rows;
    var maxX = -1;
    var maxY = -1;

    for (var y = 0; y < mask.rows; y++) {
        for (var x = 0; x < mask.cols; x++) {
            if (mask.ucharPtr(y, x)[0] > 0) {
                if (x < minX) minX = x;
                if (y < minY) minY = y;
                if (x > maxX) maxX = x;
                if (y > maxY) maxY = y;
            }
        }
    }

    if (maxX < minX || maxY < minY) return null;

    return {
        x: minX,
        y: minY,
        width: Math.max(1, maxX - minX + 1),
        height: Math.max(1, maxY - minY + 1),
    };
}

function buildRectContour(bounds) {
    return [
        { x: bounds.x, y: bounds.y },
        { x: bounds.x + bounds.width, y: bounds.y },
        { x: bounds.x + bounds.width, y: bounds.y + bounds.height },
        { x: bounds.x, y: bounds.y + bounds.height },
    ];
}

function traceMask(mask) {
    var clean = mask.clone();
    var kernel = cv.getStructuringElement(cv.MORPH_ELLIPSE, new cv.Size(7, 7));
    var contours = new cv.MatVector();
    var hierarchy = new cv.Mat();
    var resultMask = cv.Mat.zeros(mask.rows, mask.cols, cv.CV_8UC1);
    var bestContour = null;
    var bestArea = 0;

    try {
        cv.morphologyEx(clean, clean, cv.MORPH_CLOSE, kernel);
        cv.morphologyEx(clean, clean, cv.MORPH_OPEN, kernel);

        cv.findContours(
            clean,
            contours,
            hierarchy,
            cv.RETR_EXTERNAL,
            cv.CHAIN_APPROX_SIMPLE,
        );

        for (var i = 0; i < contours.size(); i++) {
            var contour = contours.get(i);
            var area = cv.contourArea(contour);
            if (area > bestArea) {
                if (bestContour) bestContour.delete();
                bestContour = contour.clone();
                bestArea = area;
            }
            contour.delete();
        }

        if (!bestContour || bestArea < mask.rows * mask.cols * 0.003) {
            var fallbackBounds = findMaskBounds(clean);
            if (!fallbackBounds) {
                throw new Error("Could not isolate a strong foreground contour");
            }

            cv.rectangle(
                resultMask,
                new cv.Point(fallbackBounds.x, fallbackBounds.y),
                new cv.Point(
                    fallbackBounds.x + fallbackBounds.width - 1,
                    fallbackBounds.y + fallbackBounds.height - 1,
                ),
                new cv.Scalar(255),
                -1,
            );

            return {
                bbox: fallbackBounds,
                contour: buildRectContour(fallbackBounds),
                mask: {
                    width: resultMask.cols,
                    height: resultMask.rows,
                    data: new Uint8ClampedArray(resultMask.data),
                },
            };
        }

        var contourVector = new cv.MatVector();
        contourVector.push_back(bestContour);
        cv.drawContours(resultMask, contourVector, 0, new cv.Scalar(255), -1);

        var perimeter = cv.arcLength(bestContour, true);
        var approx = new cv.Mat();
        cv.approxPolyDP(bestContour, approx, perimeter * 0.004, true);

        var contourPoints = [];
        var sourceContour = approx.rows >= 12 ? approx : bestContour;
        for (var row = 0; row < sourceContour.rows; row++) {
            contourPoints.push({
                x: sourceContour.intPtr(row, 0)[0],
                y: sourceContour.intPtr(row, 0)[1],
            });
        }

        var bbox = cv.boundingRect(bestContour);
        if (contourPoints.length < 4) {
            contourPoints = buildRectContour(bbox);
        }
        var maskBytes = new Uint8ClampedArray(resultMask.data);

        contourVector.delete();
        approx.delete();

        return {
            bbox: {
                x: bbox.x,
                y: bbox.y,
                width: bbox.width,
                height: bbox.height,
            },
            contour: contourPoints,
            mask: {
                width: resultMask.cols,
                height: resultMask.rows,
                data: maskBytes,
            },
        };
    } finally {
        clean.delete();
        kernel.delete();
        contours.delete();
        hierarchy.delete();
        resultMask.delete();
        if (bestContour) bestContour.delete();
    }
}

function segmentImage(imageData) {
    var src = cv.matFromImageData(imageData);
    var saliencyMask = new cv.Mat();
    var grabMask = new cv.Mat();
    var backgroundModel = new cv.Mat();
    var foregroundModel = new cv.Mat();
    var binaryMask = new cv.Mat();

    try {
        saliencyMask = createSaliencyMask(src);
        var rect = makeGrabCutRect(src, saliencyMask);

        grabMask = new cv.Mat(src.rows, src.cols, cv.CV_8UC1, new cv.Scalar(cv.GC_BGD));
        cv.grabCut(
            src,
            grabMask,
            rect,
            backgroundModel,
            foregroundModel,
            4,
            cv.GC_INIT_WITH_RECT,
        );

        binaryMask = maskFromGrabCut(grabMask);
        return traceMask(binaryMask);
    } finally {
        src.delete();
        saliencyMask.delete();
        grabMask.delete();
        backgroundModel.delete();
        foregroundModel.delete();
        binaryMask.delete();
    }
}

function traceMaskPayload(width, height, maskData) {
    var mask = new cv.Mat(height, width, cv.CV_8UC1);
    mask.data.set(maskData);

    try {
        return traceMask(mask);
    } finally {
        mask.delete();
    }
}

self.onmessage = function (event) {
    var message = event.data;

    if (message.type === "init") {
        initOpenCV()
            .then(function () {
                self.postMessage({ type: "ready" });
            })
            .catch(function (error) {
                self.postMessage({
                    type: "error",
                    message: error.message || "OpenCV init failed",
                });
            });
        return;
    }

    if (message.type === "segment") {
        try {
            var result = segmentImage(message.imageData);
            self.postMessage(
                {
                    type: "segmentResult",
                    id: message.id,
                    bbox: result.bbox,
                    contour: result.contour,
                    mask: result.mask,
                },
                [result.mask.data.buffer],
            );
        } catch (error) {
            self.postMessage({
                type: "segmentError",
                id: message.id,
                message: error.message || "Segmentation failed",
            });
        }
        return;
    }

    if (message.type === "traceMask") {
        try {
            var traced = traceMaskPayload(message.width, message.height, message.maskData);
            self.postMessage(
                {
                    type: "segmentResult",
                    id: message.id,
                    bbox: traced.bbox,
                    contour: traced.contour,
                    mask: traced.mask,
                },
                [traced.mask.data.buffer],
            );
        } catch (error) {
            self.postMessage({
                type: "segmentError",
                id: message.id,
                message: error.message || "Mask tracing failed",
            });
        }
    }
};
