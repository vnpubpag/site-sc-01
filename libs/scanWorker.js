/**
 * scanWorker.js — Web Worker for OpenCV scan processing
 * Runs entirely off the main thread to prevent UI freezes.
 *
 * Protocol:
 *   Main → Worker:  { type: 'init' }
 *   Main → Worker:  { type: 'process', id, imageData, options, manualCorners }
 *   Main → Worker:  { type: 'detect', id, imageData, options }
 *   Worker → Main:  { type: 'ready' }
 *   Worker → Main:  { type: 'error', message }
 *   Worker → Main:  { type: 'result', id, imageData }
 *   Worker → Main:  { type: 'detectResult', id, corners, width, height }
 *   Worker → Main:  { type: 'processError', id, message }
 *   Worker → Main:  { type: 'detectError', id, message }
 */

/* global cv, self, importScripts, ImageData, Uint8ClampedArray */

/* ══════════════════════════════════════════
   OpenCV Init
   ══════════════════════════════════════════ */

function initOpenCV() {
    return new Promise(function (resolve, reject) {
        var timeout = setTimeout(function () {
            reject(new Error("OpenCV WASM init timeout (30s)"));
        }, 30000);

        try {
            importScripts("/libs/opencv.js");
        } catch (err) {
            clearTimeout(timeout);
            reject(new Error("importScripts failed: " + err.message));
            return;
        }

        // Poll for WASM initialization
        function poll() {
            if (typeof cv !== "undefined" && cv.Mat) {
                clearTimeout(timeout);
                resolve();
            } else if (
                typeof cv !== "undefined" &&
                typeof cv.then === "function"
            ) {
                // Some builds return a promise
                cv.then(function (instance) {
                    clearTimeout(timeout);
                    // eslint-disable-next-line no-global-assign
                    cv = instance;
                    resolve();
                }).catch(function (err) {
                    clearTimeout(timeout);
                    reject(err);
                });
            } else {
                setTimeout(poll, 50);
            }
        }
        poll();
    });
}

/* ══════════════════════════════════════════
   Scan Pipeline
   ══════════════════════════════════════════ */

function resizeNormalize(src, maxWidth) {
    var w = src.cols;
    var h = src.rows;
    if (w <= maxWidth) return src.clone();

    var scale = maxWidth / w;
    var dst = new cv.Mat();
    var dsize = new cv.Size(Math.round(w * scale), Math.round(h * scale));
    cv.resize(src, dst, dsize, 0, 0, cv.INTER_AREA);
    return dst;
}

function resizeForDetection(src, maxHeight) {
    var w = src.cols;
    var h = src.rows;
    if (h <= maxHeight) return src.clone();

    var scale = maxHeight / h;
    var dst = new cv.Mat();
    var dsize = new cv.Size(Math.round(w * scale), Math.round(h * scale));
    cv.resize(src, dst, dsize, 0, 0, cv.INTER_AREA);
    return dst;
}

function upscaleAfterWarp(src) {
    var shortEdge = Math.min(src.cols, src.rows);
    var longEdge = Math.max(src.cols, src.rows);
    var targetShortEdge = 2400;
    var maxLongEdge = 5200;

    if (shortEdge >= targetShortEdge) return src.clone();

    var scale = targetShortEdge / Math.max(1, shortEdge);
    if (longEdge * scale > maxLongEdge) {
        scale = maxLongEdge / Math.max(1, longEdge);
    }
    if (scale <= 1.01) return src.clone();

    var dst = new cv.Mat();
    var dsize = new cv.Size(
        Math.max(1, Math.round(src.cols * scale)),
        Math.max(1, Math.round(src.rows * scale)),
    );
    cv.resize(src, dst, dsize, 0, 0, cv.INTER_CUBIC);
    return dst;
}

function clampMat(mat) {
    var data = mat.data;
    for (var i = 0; i < data.length; i++) {
        if (data[i] < 0) data[i] = 0;
        else if (data[i] > 255) data[i] = 255;
    }
}

function clampUnit(value, fallback) {
    if (typeof value !== "number" || isNaN(value)) return fallback;
    return Math.max(0, Math.min(100, value));
}

function mixRange(min, max, amount) {
    return min + (max - min) * amount;
}

function normalizeOdd(value) {
    var rounded = Math.max(3, Math.round(value));
    return rounded % 2 === 0 ? rounded + 1 : rounded;
}

function getScanFilterSettings() {
    var textSensitivity = 28 / 100;
    var textProtection = 96 / 100;
    var paperDetection = 42 / 100;
    var backgroundWhitening = 8 / 100;
    var colorPreservation = 92 / 100;

    return {
        textSensitivity: textSensitivity,
        textProtection: textProtection,
        paperDetection: paperDetection,
        backgroundWhitening: backgroundWhitening,
        colorPreservation: colorPreservation,
        paperSaturationLimit: Math.round(mixRange(84, 66, paperDetection)),
        paperLightFloor: Math.round(mixRange(146, 128, paperDetection)),
        textAdaptiveBlockSize: normalizeOdd(mixRange(43, 33, textSensitivity)),
        textAdaptiveC: Math.round(mixRange(16, 12, textSensitivity)),
        textMaskFallbackCoverage: mixRange(0.0042, 0.0024, textSensitivity),
        textRestoreKernel: normalizeOdd(mixRange(3, 5, textProtection)),
        textRestoreIterations: textProtection > 0.72 ? 2 : 1,
        protectedTextKernel: normalizeOdd(mixRange(7, 9, textProtection)),
        protectedTextIterations: textProtection > 0.68 ? 2 : 1,
        colorSaturationThreshold: Math.round(
            mixRange(74, 44, colorPreservation),
        ),
        colorValueThreshold: Math.round(mixRange(84, 58, colorPreservation)),
        protectedColorKernel: normalizeOdd(mixRange(3, 5, colorPreservation)),
        protectedColorIterations: colorPreservation > 0.55 ? 2 : 1,
        whitenBlend: mixRange(0.06, 0.28, backgroundWhitening),
        chromaNeutralizeBlend: mixRange(0.05, 0.22, backgroundWhitening),
        foregroundRestoreBlend: mixRange(0.975, 0.998, colorPreservation),
        transitionPaperBlend: mixRange(0.03, 0.16, backgroundWhitening),
        sharpenSigma: mixRange(0.48, 0.6, 1 - backgroundWhitening),
        sharpenAmount: mixRange(0, 0.0025, 1 - textProtection * 0.98),
    };
}

function createPaperMask(rgb, normalizedL, saturationLimit, lightFloor) {
    var hsv = new cv.Mat();
    var hsvChannels = new cv.MatVector();
    var saturation = null;
    var saturationMask = new cv.Mat();
    var lightMask = new cv.Mat();
    var paperMask = new cv.Mat();
    var closeKernel = cv.getStructuringElement(
        cv.MORPH_ELLIPSE,
        new cv.Size(5, 5),
    );
    var openKernel = cv.getStructuringElement(
        cv.MORPH_ELLIPSE,
        new cv.Size(3, 3),
    );

    try {
        cv.cvtColor(rgb, hsv, cv.COLOR_RGB2HSV);
        cv.split(hsv, hsvChannels);
        saturation = hsvChannels.get(1);
        cv.threshold(
            saturation,
            saturationMask,
            saturationLimit,
            255,
            cv.THRESH_BINARY_INV,
        );
        cv.threshold(normalizedL, lightMask, lightFloor, 255, cv.THRESH_BINARY);
        cv.bitwise_and(saturationMask, lightMask, paperMask);
        cv.morphologyEx(paperMask, paperMask, cv.MORPH_CLOSE, closeKernel);
        cv.morphologyEx(paperMask, paperMask, cv.MORPH_OPEN, openKernel);
        return paperMask.clone();
    } finally {
        hsv.delete();
        hsvChannels.delete();
        if (saturation) saturation.delete();
        saturationMask.delete();
        lightMask.delete();
        paperMask.delete();
        closeKernel.delete();
        openKernel.delete();
    }
}

function smoothPaperBackground(rgb, paperMask) {
    if (!paperMask || cv.countNonZero(paperMask) === 0) return;

    var softened = new cv.Mat();
    var denoised = new cv.Mat();

    try {
        cv.GaussianBlur(rgb, softened, new cv.Size(0, 0), 1.1);
        softened.copyTo(rgb, paperMask);
        cv.medianBlur(rgb, denoised, 3);
        denoised.copyTo(rgb, paperMask);
    } finally {
        softened.delete();
        denoised.delete();
    }
}

function harmonizePaperEdges(rgb, paperMask) {
    if (!paperMask || cv.countNonZero(paperMask) === 0) return;

    var rows = rgb.rows;
    var cols = rgb.cols;
    var bandX = Math.max(8, Math.round(cols * 0.055));
    var bandY = Math.max(8, Math.round(rows * 0.04));
    var edgeWindow = cv.Mat.zeros(rows, cols, cv.CV_8UC1);
    var sampleWindow = cv.Mat.zeros(rows, cols, cv.CV_8UC1);
    var edgePaperMask = new cv.Mat();
    var samplePaperMask = new cv.Mat();
    var softened = new cv.Mat();
    var blended = new cv.Mat();
    var paperTone = null;

    try {
        cv.rectangle(
            edgeWindow,
            new cv.Point(0, 0),
            new cv.Point(cols - 1, bandY),
            new cv.Scalar(255),
            -1,
        );
        cv.rectangle(
            edgeWindow,
            new cv.Point(0, rows - bandY),
            new cv.Point(cols - 1, rows - 1),
            new cv.Scalar(255),
            -1,
        );
        cv.rectangle(
            edgeWindow,
            new cv.Point(0, 0),
            new cv.Point(bandX, rows - 1),
            new cv.Scalar(255),
            -1,
        );
        cv.rectangle(
            edgeWindow,
            new cv.Point(cols - bandX, 0),
            new cv.Point(cols - 1, rows - 1),
            new cv.Scalar(255),
            -1,
        );

        cv.bitwise_and(paperMask, edgeWindow, edgePaperMask);
        if (cv.countNonZero(edgePaperMask) < rows * cols * 0.0025) return;

        cv.rectangle(
            sampleWindow,
            new cv.Point(
                Math.round(cols * 0.12),
                Math.round(rows * 0.12),
            ),
            new cv.Point(
                Math.round(cols * 0.88),
                Math.round(rows * 0.88),
            ),
            new cv.Scalar(255),
            -1,
        );
        cv.bitwise_and(paperMask, sampleWindow, samplePaperMask);
        if (cv.countNonZero(samplePaperMask) < rows * cols * 0.02) {
            paperMask.copyTo(samplePaperMask);
        }

        var meanColor = cv.mean(rgb, samplePaperMask);
        paperTone = new cv.Mat(
            rows,
            cols,
            rgb.type(),
            new cv.Scalar(meanColor[0], meanColor[1], meanColor[2], 0),
        );
        cv.GaussianBlur(rgb, softened, new cv.Size(0, 0), 2.2);
        cv.addWeighted(softened, 0.78, paperTone, 0.22, 0, blended);
        blended.copyTo(rgb, edgePaperMask);
    } finally {
        edgeWindow.delete();
        sampleWindow.delete();
        edgePaperMask.delete();
        samplePaperMask.delete();
        softened.delete();
        blended.delete();
        if (paperTone) paperTone.delete();
    }
}

function normalizePaperLighting(lChannel) {
    var background = new cv.Mat();
    var normalized = new cv.Mat();
    var l32 = new cv.Mat();
    var bg32 = new cv.Mat();
    var sigma = Math.max(18, Math.round(Math.max(lChannel.cols, lChannel.rows) * 0.025));

    try {
        cv.GaussianBlur(lChannel, background, new cv.Size(0, 0), sigma);
        lChannel.convertTo(l32, cv.CV_32F);
        background.convertTo(bg32, cv.CV_32F);
        bg32.convertTo(bg32, -1, 1, 12);
        cv.divide(l32, bg32, l32, 236);
        l32.convertTo(normalized, cv.CV_8U);
        return normalized.clone();
    } finally {
        background.delete();
        normalized.delete();
        l32.delete();
        bg32.delete();
    }
}

function createTextMask(lChannel, settings) {
    var otsuMask = new cv.Mat();
    var adaptiveMask = new cv.Mat();
    var textMask = new cv.Mat();
    var closeKernel = cv.getStructuringElement(cv.MORPH_RECT, new cv.Size(3, 3));
    var openKernel = cv.getStructuringElement(
        cv.MORPH_ELLIPSE,
        new cv.Size(2, 2),
    );

    try {
        cv.threshold(
            lChannel,
            otsuMask,
            0,
            255,
            cv.THRESH_BINARY_INV + cv.THRESH_OTSU,
        );
        cv.adaptiveThreshold(
            lChannel,
            adaptiveMask,
            255,
            cv.ADAPTIVE_THRESH_GAUSSIAN_C,
            cv.THRESH_BINARY_INV,
            settings.textAdaptiveBlockSize,
            settings.textAdaptiveC,
        );
        cv.bitwise_and(otsuMask, adaptiveMask, textMask);
        if (
            cv.countNonZero(textMask) <
            lChannel.rows * lChannel.cols * settings.textMaskFallbackCoverage
        ) {
            cv.bitwise_or(otsuMask, adaptiveMask, textMask);
        }
        cv.morphologyEx(textMask, textMask, cv.MORPH_CLOSE, closeKernel);
        cv.morphologyEx(textMask, textMask, cv.MORPH_OPEN, openKernel);
        return textMask.clone();
    } finally {
        otsuMask.delete();
        textMask.delete();
        adaptiveMask.delete();
        closeKernel.delete();
        openKernel.delete();
    }
}

function createTextSupportMask(lChannel, coreMask, settings) {
    var otsuMask = new cv.Mat();
    var adaptiveMask = new cv.Mat();
    var looseMask = new cv.Mat();
    var blackhat = new cv.Mat();
    var strokeMask = new cv.Mat();
    var strokeSupport = new cv.Mat();
    var expandedCore = new cv.Mat();
    var supportMask = new cv.Mat();
    var closeKernel = cv.getStructuringElement(
        cv.MORPH_ELLIPSE,
        new cv.Size(3, 3),
    );
    var strokeKernel = cv.getStructuringElement(
        cv.MORPH_ELLIPSE,
        new cv.Size(9, 9),
    );

    try {
        cv.threshold(
            lChannel,
            otsuMask,
            0,
            255,
            cv.THRESH_BINARY_INV + cv.THRESH_OTSU,
        );
        cv.adaptiveThreshold(
            lChannel,
            adaptiveMask,
            255,
            cv.ADAPTIVE_THRESH_GAUSSIAN_C,
            cv.THRESH_BINARY_INV,
            normalizeOdd(settings.textAdaptiveBlockSize + 8),
            Math.max(4, settings.textAdaptiveC - 3),
        );
        cv.bitwise_or(otsuMask, adaptiveMask, looseMask);
        cv.morphologyEx(lChannel, blackhat, cv.MORPH_BLACKHAT, strokeKernel);
        cv.threshold(
            blackhat,
            strokeMask,
            Math.max(4, settings.textAdaptiveC - 1),
            255,
            cv.THRESH_BINARY,
        );
        cv.dilate(
            coreMask,
            expandedCore,
            closeKernel,
            new cv.Point(-1, -1),
            3,
        );
        cv.bitwise_and(strokeMask, expandedCore, strokeSupport);
        cv.bitwise_or(looseMask, strokeSupport, supportMask);
        cv.bitwise_and(supportMask, expandedCore, supportMask);
        cv.morphologyEx(supportMask, supportMask, cv.MORPH_CLOSE, closeKernel);
        return supportMask.clone();
    } finally {
        otsuMask.delete();
        adaptiveMask.delete();
        looseMask.delete();
        blackhat.delete();
        strokeMask.delete();
        strokeSupport.delete();
        expandedCore.delete();
        supportMask.delete();
        closeKernel.delete();
        strokeKernel.delete();
    }
}

function expandMask(mask, kernelSize, iterations) {
    var expanded = new cv.Mat();
    var kernel = cv.getStructuringElement(
        cv.MORPH_ELLIPSE,
        new cv.Size(kernelSize, kernelSize),
    );

    try {
        cv.dilate(mask, expanded, kernel, new cv.Point(-1, -1), iterations);
        return expanded.clone();
    } finally {
        expanded.delete();
        kernel.delete();
    }
}

function createColorForegroundMask(rgb, settings) {
    var hsv = new cv.Mat();
    var hsvChannels = new cv.MatVector();
    var saturation = null;
    var value = null;
    var saturationMask = new cv.Mat();
    var valueMask = new cv.Mat();
    var colorMask = new cv.Mat();
    var closeKernel = cv.getStructuringElement(
        cv.MORPH_ELLIPSE,
        new cv.Size(3, 3),
    );

    try {
        cv.cvtColor(rgb, hsv, cv.COLOR_RGB2HSV);
        cv.split(hsv, hsvChannels);
        saturation = hsvChannels.get(1);
        value = hsvChannels.get(2);
        cv.threshold(
            saturation,
            saturationMask,
            settings.colorSaturationThreshold,
            255,
            cv.THRESH_BINARY,
        );
        cv.threshold(
            value,
            valueMask,
            settings.colorValueThreshold,
            255,
            cv.THRESH_BINARY,
        );
        cv.bitwise_and(saturationMask, valueMask, colorMask);
        cv.morphologyEx(colorMask, colorMask, cv.MORPH_CLOSE, closeKernel);
        return colorMask.clone();
    } finally {
        hsv.delete();
        hsvChannels.delete();
        if (saturation) saturation.delete();
        if (value) value.delete();
        saturationMask.delete();
        valueMask.delete();
        colorMask.delete();
        closeKernel.delete();
    }
}

function applyScanFilter(src) {
    var settings = getScanFilterSettings();
    var resized = src.clone();
    var rgb = new cv.Mat();
    var lab = new cv.Mat();
    var labChannels = new cv.MatVector();
    var l = null;
    var a = null;
    var b = null;
    var flattenedL = null;
    var textMask = null;
    var textSupportMask = null;
    var textRestoreMask = null;
    var protectedTextMask = null;
    var colorMask = null;
    var protectedColorMask = null;
    var restoreForegroundMask = new cv.Mat();
    var protectedForegroundMask = new cv.Mat();
    var inverseProtectedMask = new cv.Mat();
    var inverseRestoreMask = new cv.Mat();
    var backgroundMask = new cv.Mat();
    var transitionMask = new cv.Mat();
    var whitenedL = new cv.Mat();
    var paperLight = null;
    var neutralA = null;
    var neutralB = null;
    var softenedA = new cv.Mat();
    var softenedB = new cv.Mat();
    var mergedChannels = new cv.MatVector();
    var enhancedRgb = new cv.Mat();
    var finalRgb = new cv.Mat();
    var foregroundRgb = new cv.Mat();
    var transitionRgb = new cv.Mat();
    var paperToneRgb = null;
    var blurred = new cv.Mat();
    var rgba = new cv.Mat();
    var paperMask = null;

    cv.cvtColor(resized, rgb, cv.COLOR_RGBA2RGB);
    cv.cvtColor(rgb, lab, cv.COLOR_RGB2Lab);
    cv.split(lab, labChannels);

    l = labChannels.get(0);
    a = labChannels.get(1);
    b = labChannels.get(2);
    flattenedL = normalizePaperLighting(l);
    textMask = createTextMask(flattenedL, settings);
    textSupportMask = createTextSupportMask(flattenedL, textMask, settings);
    textRestoreMask = expandMask(
        textSupportMask,
        Math.max(3, settings.textRestoreKernel - 2),
        settings.textRestoreIterations,
    );
    protectedTextMask = expandMask(
        textSupportMask,
        settings.protectedTextKernel,
        settings.protectedTextIterations,
    );
    colorMask = createColorForegroundMask(rgb, settings);
    protectedColorMask = expandMask(
        colorMask,
        settings.protectedColorKernel,
        settings.protectedColorIterations,
    );
    cv.bitwise_or(textRestoreMask, colorMask, restoreForegroundMask);
    cv.bitwise_or(protectedTextMask, protectedColorMask, protectedForegroundMask);
    paperMask = createPaperMask(
        rgb,
        flattenedL,
        settings.paperSaturationLimit,
        settings.paperLightFloor,
    );
    cv.bitwise_not(protectedForegroundMask, inverseProtectedMask);
    cv.bitwise_and(paperMask, inverseProtectedMask, backgroundMask);
    cv.bitwise_not(restoreForegroundMask, inverseRestoreMask);
    cv.bitwise_and(protectedForegroundMask, inverseRestoreMask, transitionMask);
    paperLight = new cv.Mat(
        flattenedL.rows,
        flattenedL.cols,
        flattenedL.type(),
        new cv.Scalar(255),
    );
    cv.addWeighted(
        flattenedL,
        1 - settings.whitenBlend,
        paperLight,
        settings.whitenBlend,
        0,
        whitenedL,
    );
    whitenedL.copyTo(flattenedL, backgroundMask);
    neutralA = new cv.Mat(a.rows, a.cols, a.type(), new cv.Scalar(128));
    neutralB = new cv.Mat(b.rows, b.cols, b.type(), new cv.Scalar(128));
    cv.addWeighted(
        a,
        1 - settings.chromaNeutralizeBlend,
        neutralA,
        settings.chromaNeutralizeBlend,
        0,
        softenedA,
    );
    cv.addWeighted(
        b,
        1 - settings.chromaNeutralizeBlend,
        neutralB,
        settings.chromaNeutralizeBlend,
        0,
        softenedB,
    );
    softenedA.copyTo(a, backgroundMask);
    softenedB.copyTo(b, backgroundMask);

    mergedChannels.push_back(flattenedL);
    mergedChannels.push_back(a);
    mergedChannels.push_back(b);
    cv.merge(mergedChannels, lab);

    cv.cvtColor(lab, enhancedRgb, cv.COLOR_Lab2RGB);

    cv.addWeighted(
        rgb,
        settings.foregroundRestoreBlend,
        enhancedRgb,
        1 - settings.foregroundRestoreBlend,
        0,
        foregroundRgb,
    );
    finalRgb = enhancedRgb.clone();
    paperToneRgb = new cv.Mat(
        finalRgb.rows,
        finalRgb.cols,
        finalRgb.type(),
        new cv.Scalar(248, 246, 242, 0),
    );
    paperToneRgb.copyTo(finalRgb, backgroundMask);
    cv.addWeighted(
        enhancedRgb,
        1 - settings.transitionPaperBlend,
        paperToneRgb,
        settings.transitionPaperBlend,
        0,
        transitionRgb,
    );
    transitionRgb.copyTo(finalRgb, transitionMask);
    rgb.copyTo(finalRgb, textRestoreMask);
    foregroundRgb.copyTo(finalRgb, colorMask);

    // Unsharp mask keeps text edges crisp after denoising.
    cv.GaussianBlur(finalRgb, blurred, new cv.Size(0, 0), settings.sharpenSigma);
    cv.addWeighted(
        finalRgb,
        1 + settings.sharpenAmount,
        blurred,
        -settings.sharpenAmount,
        0,
        finalRgb,
    );
    clampMat(finalRgb);

    cv.cvtColor(finalRgb, rgba, cv.COLOR_RGB2RGBA);

    resized.delete();
    rgb.delete();
    lab.delete();
    labChannels.delete();
    if (l) l.delete();
    if (a) a.delete();
    if (b) b.delete();
    if (flattenedL) flattenedL.delete();
    if (textMask) textMask.delete();
    if (textSupportMask) textSupportMask.delete();
    if (textRestoreMask) textRestoreMask.delete();
    if (protectedTextMask) protectedTextMask.delete();
    if (colorMask) colorMask.delete();
    if (protectedColorMask) protectedColorMask.delete();
    restoreForegroundMask.delete();
    protectedForegroundMask.delete();
    inverseProtectedMask.delete();
    inverseRestoreMask.delete();
    backgroundMask.delete();
    transitionMask.delete();
    whitenedL.delete();
    if (paperLight) paperLight.delete();
    if (neutralA) neutralA.delete();
    if (neutralB) neutralB.delete();
    softenedA.delete();
    softenedB.delete();
    mergedChannels.delete();
    enhancedRgb.delete();
    finalRgb.delete();
    foregroundRgb.delete();
    transitionRgb.delete();
    blurred.delete();
    if (paperToneRgb) paperToneRgb.delete();
    if (paperMask) paperMask.delete();

    return rgba;
}

/* ══════════════════════════════════════════
   Document Detection + Perspective Correction
   ══════════════════════════════════════════ */

var DEBUG_SCAN =
    typeof self !== "undefined" &&
    self.location &&
    /^(localhost|127\.0\.0\.1)$/.test(self.location.hostname || "");

function debugLog() {
    if (!DEBUG_SCAN || typeof console === "undefined") return;
    console.debug.apply(console, arguments);
}

function dist(a, b) {
    var dx = a.x - b.x;
    var dy = a.y - b.y;
    return Math.sqrt(dx * dx + dy * dy);
}

function clampPoint(value, limit) {
    return Math.max(0, Math.min(limit - 1, Math.round(value)));
}

function orderPoints(pts) {
    var sorted = pts.slice().sort(function (a, b) {
        if (a.y === b.y) return a.x - b.x;
        return a.y - b.y;
    });
    var top = sorted.slice(0, 2).sort(function (a, b) {
        return a.x - b.x;
    });
    var bottom = sorted.slice(2, 4).sort(function (a, b) {
        return a.x - b.x;
    });

    return [top[0], top[1], bottom[1], bottom[0]];
}

function polygonArea(points) {
    var area = 0;
    for (var i = 0; i < points.length; i++) {
        var next = points[(i + 1) % points.length];
        area += points[i].x * next.y - next.x * points[i].y;
    }
    return Math.abs(area) * 0.5;
}

function getPointBounds(points) {
    var minX = Infinity;
    var minY = Infinity;
    var maxX = -Infinity;
    var maxY = -Infinity;

    for (var i = 0; i < points.length; i++) {
        minX = Math.min(minX, points[i].x);
        minY = Math.min(minY, points[i].y);
        maxX = Math.max(maxX, points[i].x);
        maxY = Math.max(maxY, points[i].y);
    }

    return {
        x: minX,
        y: minY,
        width: maxX - minX,
        height: maxY - minY,
    };
}

function centroidOfPoints(points) {
    var x = 0;
    var y = 0;
    for (var i = 0; i < points.length; i++) {
        x += points[i].x;
        y += points[i].y;
    }
    return { x: x / points.length, y: y / points.length };
}

function rectContainsPoint(rect, point) {
    return (
        point.x >= rect.x &&
        point.x <= rect.x + rect.width &&
        point.y >= rect.y &&
        point.y <= rect.y + rect.height
    );
}

function buildPointArrayFromApprox(approx, offsetX, offsetY) {
    var points = [];
    for (var i = 0; i < approx.rows; i++) {
        points.push({
            x: approx.data32S[i * 2] + offsetX,
            y: approx.data32S[i * 2 + 1] + offsetY,
        });
    }
    return points;
}

function extractExtremeQuad(points) {
    if (!points.length) return null;

    var topLeft = points[0];
    var topRight = points[0];
    var bottomRight = points[0];
    var bottomLeft = points[0];

    for (var i = 0; i < points.length; i++) {
        var point = points[i];
        var sum = point.x + point.y;
        var diff = point.x - point.y;
        var topLeftSum = topLeft.x + topLeft.y;
        var bottomRightSum = bottomRight.x + bottomRight.y;
        var topRightDiff = topRight.x - topRight.y;
        var bottomLeftDiff = bottomLeft.x - bottomLeft.y;

        if (sum < topLeftSum) topLeft = point;
        if (sum > bottomRightSum) bottomRight = point;
        if (diff > topRightDiff) topRight = point;
        if (diff < bottomLeftDiff) bottomLeft = point;
    }

    var uniqueKeys = {};
    var ordered = [topLeft, topRight, bottomRight, bottomLeft];
    for (var j = 0; j < ordered.length; j++) {
        var key = ordered[j].x + ":" + ordered[j].y;
        if (uniqueKeys[key]) return null;
        uniqueKeys[key] = true;
    }

    return ordered;
}

function extractQuadrantQuad(points) {
    if (!points.length) return null;

    var center = centroidOfPoints(points);
    var buckets = {
        tl: null,
        tr: null,
        br: null,
        bl: null,
    };

    for (var i = 0; i < points.length; i++) {
        var point = points[i];
        var key;
        var dx = point.x - center.x;
        var dy = point.y - center.y;
        var distance = dx * dx + dy * dy;

        if (dx <= 0 && dy <= 0) key = "tl";
        else if (dx >= 0 && dy <= 0) key = "tr";
        else if (dx >= 0 && dy >= 0) key = "br";
        else key = "bl";

        if (!buckets[key] || distance > buckets[key].distance) {
            buckets[key] = { point: point, distance: distance };
        }
    }

    if (!(buckets.tl && buckets.tr && buckets.br && buckets.bl)) return null;

    return [
        buckets.tl.point,
        buckets.tr.point,
        buckets.br.point,
        buckets.bl.point,
    ];
}

function expandQuad(points, amount, maxCols, maxRows) {
    var center = centroidOfPoints(points);
    return points.map(function (point) {
        var dx = point.x - center.x;
        var dy = point.y - center.y;
        return {
            x: Math.max(0, Math.min(maxCols - 1, point.x + dx * amount)),
            y: Math.max(0, Math.min(maxRows - 1, point.y + dy * amount)),
        };
    });
}

function fitVerticalBoundary(points) {
    if (!points || points.length < 2) return null;

    var sumY = 0;
    var sumX = 0;
    var sumYY = 0;
    var sumYX = 0;
    var minY = Infinity;
    var maxY = -Infinity;

    for (var i = 0; i < points.length; i++) {
        var point = points[i];
        sumY += point.y;
        sumX += point.x;
        sumYY += point.y * point.y;
        sumYX += point.y * point.x;
        minY = Math.min(minY, point.y);
        maxY = Math.max(maxY, point.y);
    }

    var count = points.length;
    var denom = count * sumYY - sumY * sumY;
    var slope = Math.abs(denom) < 1e-5 ? 0 : (count * sumYX - sumY * sumX) / denom;
    var intercept = (sumX - slope * sumY) / count;

    return {
        x1: slope * minY + intercept,
        y1: minY,
        x2: slope * maxY + intercept,
        y2: maxY,
    };
}

function fitHorizontalBoundary(points) {
    if (!points || points.length < 2) return null;

    var sumX = 0;
    var sumY = 0;
    var sumXX = 0;
    var sumXY = 0;
    var minX = Infinity;
    var maxX = -Infinity;

    for (var i = 0; i < points.length; i++) {
        var point = points[i];
        sumX += point.x;
        sumY += point.y;
        sumXX += point.x * point.x;
        sumXY += point.x * point.y;
        minX = Math.min(minX, point.x);
        maxX = Math.max(maxX, point.x);
    }

    var count = points.length;
    var denom = count * sumXX - sumX * sumX;
    var slope = Math.abs(denom) < 1e-5 ? 0 : (count * sumXY - sumX * sumY) / denom;
    var intercept = (sumY - slope * sumX) / count;

    return {
        x1: minX,
        y1: slope * minX + intercept,
        x2: maxX,
        y2: slope * maxX + intercept,
    };
}

function buildBoundaryQuad(points, imageCols, imageRows) {
    if (!points || points.length < 8) return null;

    var bounds = getPointBounds(points);
    var leftLimit = bounds.x + bounds.width * 0.18;
    var rightLimit = bounds.x + bounds.width * 0.82;
    var topLimit = bounds.y + bounds.height * 0.18;
    var bottomLimit = bounds.y + bounds.height * 0.85;
    var leftPoints = [];
    var rightPoints = [];
    var topPoints = [];
    var bottomPoints = [];

    for (var i = 0; i < points.length; i++) {
        var point = points[i];
        if (point.x <= leftLimit) leftPoints.push(point);
        if (point.x >= rightLimit) rightPoints.push(point);
        if (point.y <= topLimit) topPoints.push(point);
        if (point.y >= bottomLimit) bottomPoints.push(point);
    }

    var leftLine = fitVerticalBoundary(leftPoints);
    var rightLine = fitVerticalBoundary(rightPoints);
    var topLine = fitHorizontalBoundary(topPoints);

    if (!(leftLine && rightLine && topLine)) return null;

    var bottomLine = null;
    var topLeft = computeLineIntersection(topLine, leftLine);
    var topRight = computeLineIntersection(topLine, rightLine);
    var bottomLeft = null;
    var bottomRight = null;

    if (
        bottomPoints.length >= 4 &&
        bounds.y + bounds.height < imageRows * 0.98
    ) {
        bottomLine = fitHorizontalBoundary(bottomPoints);
    }

    if (bottomLine) {
        bottomLeft = computeLineIntersection(bottomLine, leftLine);
        bottomRight = computeLineIntersection(bottomLine, rightLine);
    } else {
        var targetY = Math.min(imageRows - 1, bounds.y + bounds.height);
        bottomLeft = {
            x: leftLine.x1 + ((targetY - leftLine.y1) * (leftLine.x2 - leftLine.x1)) / Math.max(1e-5, leftLine.y2 - leftLine.y1),
            y: targetY,
        };
        bottomRight = {
            x: rightLine.x1 + ((targetY - rightLine.y1) * (rightLine.x2 - rightLine.x1)) / Math.max(1e-5, rightLine.y2 - rightLine.y1),
            y: targetY,
        };
    }

    var quad = [topLeft, topRight, bottomRight, bottomLeft];
    if (
        quad.some(function (point) {
            return (
                !point ||
                !isFinite(point.x) ||
                !isFinite(point.y) ||
                point.x < -imageCols * 0.2 ||
                point.x > imageCols * 1.2 ||
                point.y < -imageRows * 0.2 ||
                point.y > imageRows * 1.2
            );
        })
    ) {
        return null;
    }

    return orderPoints(quad);
}

function pointInRect(point, rect) {
    return (
        point.x >= rect.x &&
        point.x < rect.x + rect.width &&
        point.y >= rect.y &&
        point.y < rect.y + rect.height
    );
}

function scalePointsToSource(points, scaleX, scaleY, srcCols, srcRows) {
    return points.map(function (point) {
        return {
            x: clampPoint(point.x * scaleX, srcCols),
            y: clampPoint(point.y * scaleY, srcRows),
        };
    });
}

function scoreScaledQuad(points, area, scaleX, scaleY, srcCols, srcRows, detectCols, detectRows, focusRect, assumeCenteredDocument) {
    return evaluateQuadCandidate(
        scalePointsToSource(points, scaleX, scaleY, srcCols, srcRows),
        area * scaleX * scaleY,
        srcCols,
        srcRows,
        focusRect
            ? {
                  x: focusRect.x * scaleX,
                  y: focusRect.y * scaleY,
                  width: focusRect.width * scaleX,
                  height: focusRect.height * scaleY,
              }
            : null,
        assumeCenteredDocument,
    );
}

function computeLineIntersection(lineA, lineB) {
    var x1 = lineA.x1;
    var y1 = lineA.y1;
    var x2 = lineA.x2;
    var y2 = lineA.y2;
    var x3 = lineB.x1;
    var y3 = lineB.y1;
    var x4 = lineB.x2;
    var y4 = lineB.y2;
    var denom = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4);

    if (Math.abs(denom) < 1e-5) return null;

    return {
        x:
            ((x1 * y2 - y1 * x2) * (x3 - x4) -
                (x1 - x2) * (x3 * y4 - y3 * x4)) /
            denom,
        y:
            ((x1 * y2 - y1 * x2) * (y3 - y4) -
                (y1 - y2) * (x3 * y4 - y3 * x4)) /
            denom,
    };
}

function findQuadFromLines(
    gray,
    scaleX,
    scaleY,
    srcCols,
    srcRows,
    focusRect,
    assumeCenteredDocument,
    offsetX,
    offsetY,
) {
    var edges = new cv.Mat();
    var lines = new cv.Mat();
    var kernel = cv.getStructuringElement(cv.MORPH_RECT, new cv.Size(3, 3));

    try {
        cv.Canny(gray, edges, 40, 120);
        cv.dilate(edges, edges, kernel);
        cv.HoughLinesP(
            edges,
            lines,
            1,
            Math.PI / 180,
            60,
            Math.round(Math.min(gray.cols, gray.rows) * 0.25),
            20,
        );

        if (!lines.rows) return { points: null, score: 0 };

        var topLine = null;
        var bottomLine = null;
        var leftLine = null;
        var rightLine = null;
        var topScore = 0;
        var bottomScore = 0;
        var leftScore = 0;
        var rightScore = 0;

        for (var i = 0; i < lines.rows; i++) {
            var x1 = lines.data32S[i * 4];
            var y1 = lines.data32S[i * 4 + 1];
            var x2 = lines.data32S[i * 4 + 2];
            var y2 = lines.data32S[i * 4 + 3];
            var dx = x2 - x1;
            var dy = y2 - y1;
            var length = Math.sqrt(dx * dx + dy * dy);
            var angle = Math.abs((Math.atan2(dy, dx) * 180) / Math.PI);
            var midX = (x1 + x2) * 0.5;
            var midY = (y1 + y2) * 0.5;
            var line = { x1: x1, y1: y1, x2: x2, y2: y2 };

            if (angle < 30 || angle > 150) {
                var candidateTopScore = length * (1.25 - midY / gray.rows);
                var candidateBottomScore = length * (0.25 + midY / gray.rows);
                if (midY < gray.rows * 0.55 && candidateTopScore > topScore) {
                    topScore = candidateTopScore;
                    topLine = line;
                }
                if (
                    midY > gray.rows * 0.45 &&
                    candidateBottomScore > bottomScore
                ) {
                    bottomScore = candidateBottomScore;
                    bottomLine = line;
                }
            } else if (angle > 60 && angle < 120) {
                var candidateLeftScore = length * (1.25 - midX / gray.cols);
                var candidateRightScore = length * (0.25 + midX / gray.cols);
                if (midX < gray.cols * 0.55 && candidateLeftScore > leftScore) {
                    leftScore = candidateLeftScore;
                    leftLine = line;
                }
                if (
                    midX > gray.cols * 0.45 &&
                    candidateRightScore > rightScore
                ) {
                    rightScore = candidateRightScore;
                    rightLine = line;
                }
            }
        }

        if (!(topLine && bottomLine && leftLine && rightLine)) {
            return { points: null, score: 0 };
        }

        var intersections = [
            computeLineIntersection(topLine, leftLine),
            computeLineIntersection(topLine, rightLine),
            computeLineIntersection(bottomLine, rightLine),
            computeLineIntersection(bottomLine, leftLine),
        ];

        if (intersections.some(function (point) { return !point; })) {
            return { points: null, score: 0 };
        }

        var detectPoints = intersections.map(function (point) {
            return {
                x: point.x + offsetX,
                y: point.y + offsetY,
            };
        });
        var expandedPoints = expandQuad(
            orderPoints(detectPoints),
            0.03,
            gray.cols + offsetX,
            gray.rows + offsetY,
        );
        var orderedExpanded = orderPoints(expandedPoints);
        var avgWidth =
            (dist(orderedExpanded[0], orderedExpanded[1]) +
                dist(orderedExpanded[3], orderedExpanded[2])) *
            0.5;
        var avgHeight =
            (dist(orderedExpanded[0], orderedExpanded[3]) +
                dist(orderedExpanded[1], orderedExpanded[2])) *
            0.5;
        if (
            gray.rows > gray.cols * 1.05 &&
            avgHeight < avgWidth * 1.05
        ) {
            return { points: null, score: 0 };
        }
        var score = evaluateQuadCandidate(
            expandedPoints,
            polygonArea(expandedPoints),
            gray.cols + offsetX,
            gray.rows + offsetY,
            focusRect,
            assumeCenteredDocument,
        );

        if (score <= 0) return { points: null, score: 0 };

        return {
            points: scalePointsToSource(
                orderedExpanded,
                scaleX,
                scaleY,
                srcCols,
                srcRows,
            ),
            score: score,
        };
    } finally {
        edges.delete();
        lines.delete();
        kernel.delete();
    }
}

function evaluateQuadCandidate(
    points,
    contourArea,
    imageCols,
    imageRows,
    focusRect,
    assumeCenteredDocument,
) {
    var ordered = orderPoints(points);
    var topWidth = dist(ordered[0], ordered[1]);
    var bottomWidth = dist(ordered[3], ordered[2]);
    var leftHeight = dist(ordered[0], ordered[3]);
    var rightHeight = dist(ordered[1], ordered[2]);
    var avgWidth = (topWidth + bottomWidth) * 0.5;
    var avgHeight = (leftHeight + rightHeight) * 0.5;
    var quadArea = polygonArea(ordered);
    var bounds = getPointBounds(ordered);
    var fillRatio = quadArea / Math.max(1, avgWidth * avgHeight);
    var areaRatio = quadArea / Math.max(1, imageCols * imageRows);
    var borderPadding = Math.round(Math.min(imageCols, imageRows) * 0.015);
    var borderPenalty = 1;
    var centerWeight = 1;
    var borderTouches = 0;
    var centroid = centroidOfPoints(ordered);
    var dx = (centroid.x - imageCols / 2) / Math.max(1, imageCols / 2);
    var dy = (centroid.y - imageRows / 2) / Math.max(1, imageRows / 2);
    var centerDistance = Math.sqrt(dx * dx + dy * dy);

    if (
        avgWidth < imageCols * 0.35 ||
        avgHeight < imageRows * 0.35 ||
        fillRatio < 0.45 ||
        areaRatio < (assumeCenteredDocument ? 0.18 : 0.12)
    ) {
        return 0;
    }

    for (var i = 0; i < ordered.length; i++) {
        var point = ordered[i];
        if (
            point.x <= borderPadding ||
            point.x >= imageCols - 1 - borderPadding ||
            point.y <= borderPadding ||
            point.y >= imageRows - 1 - borderPadding
        ) {
            borderTouches++;
            borderPenalty *= 0.92;
        }
    }

    if (
        assumeCenteredDocument &&
        bounds.width > imageCols * 0.96 &&
        bounds.height > imageRows * 0.96
    ) {
        return 0;
    }
    if (
        assumeCenteredDocument &&
        borderTouches >= 2 &&
        (bounds.width > imageCols * 0.9 || bounds.height > imageRows * 0.94)
    ) {
        borderPenalty *= 0.08;
    }
    if (borderTouches >= 3) {
        borderPenalty *= assumeCenteredDocument ? 0.2 : 0.55;
    } else if (
        bounds.width > imageCols * 0.93 ||
        bounds.height > imageRows * 0.96
    ) {
        borderPenalty *= 0.55;
    }

    if (assumeCenteredDocument && focusRect) {
        if (!rectContainsPoint(focusRect, centroid)) {
            centerWeight *= 0.75;
        }
        centerWeight *= Math.max(0.75, 1.15 - centerDistance * 0.25);
    }

    return contourArea * (0.7 + fillRatio * 0.3) * borderPenalty * centerWeight;
}

function rectOverlapRatio(rect, focusRect) {
    var x1 = Math.max(rect.x, focusRect.x);
    var y1 = Math.max(rect.y, focusRect.y);
    var x2 = Math.min(rect.x + rect.width, focusRect.x + focusRect.width);
    var y2 = Math.min(rect.y + rect.height, focusRect.y + focusRect.height);
    var overlapW = Math.max(0, x2 - x1);
    var overlapH = Math.max(0, y2 - y1);
    var overlapArea = overlapW * overlapH;
    var rectArea = rect.width * rect.height;

    return rectArea > 0 ? overlapArea / rectArea : 0;
}

function createCenterFocusRect(cols, rows) {
    return {
        x: Math.round(cols * 0.2),
        y: Math.round(rows * 0.15),
        width: Math.round(cols * 0.6),
        height: Math.round(rows * 0.7),
    };
}

function createDetectionRegions(cols, rows, assumeCenteredDocument) {
    var fullRegion = { x: 0, y: 0, width: cols, height: rows };
    return [fullRegion];
}

function centerDistanceScore(rect, imageCols, imageRows) {
    var cx = rect.x + rect.width / 2;
    var cy = rect.y + rect.height / 2;
    var dx = (cx - imageCols / 2) / (imageCols / 2);
    var dy = (cy - imageRows / 2) / (imageRows / 2);
    var distNorm = Math.sqrt(dx * dx + dy * dy);
    return Math.max(0.25, 1.25 - distNorm);
}

function scoreDocumentQuad(
    approx,
    area,
    imageCols,
    imageRows,
    focusRect,
    assumeCenteredDocument,
) {
    var rect = cv.boundingRect(approx);
    var rectArea = rect.width * rect.height;
    var rectangularity = rectArea > 0 ? area / rectArea : 0;
    var score = 0;
    var borderPadding = Math.max(
        10,
        Math.round(Math.min(imageCols, imageRows) * 0.015),
    );
    var borderPenalty = 1;
    var ratio = rect.width > 0 ? rect.height / rect.width : 0;
    var ratioPenalty = 1;

    if (rectangularity >= 0.65) {
        score = area * rectangularity;
    }

    if (rect.x <= borderPadding) borderPenalty *= rect.x <= 1 ? 0.2 : 0.6;
    if (rect.y <= borderPadding) borderPenalty *= rect.y <= 1 ? 0.2 : 0.6;
    if (rect.x + rect.width >= imageCols - borderPadding) {
        borderPenalty *= rect.x + rect.width >= imageCols - 1 ? 0.2 : 0.6;
    }
    if (rect.y + rect.height >= imageRows - borderPadding) {
        borderPenalty *= rect.y + rect.height >= imageRows - 1 ? 0.2 : 0.6;
    }

    if (ratio > 0) {
        if (ratio < 1.15 || ratio > 1.75) {
            ratioPenalty = 0.75;
        } else if (ratio < 1.22 || ratio > 1.62) {
            ratioPenalty = 0.88;
        }
    }

    score *= borderPenalty * ratioPenalty;

    if (assumeCenteredDocument && focusRect) {
        var focusOverlap = rectOverlapRatio(rect, focusRect);
        var centerScore = centerDistanceScore(rect, imageCols, imageRows);

        if (focusOverlap < 0.12) {
            score *= 0.2;
        } else if (focusOverlap < 0.2) {
            score *= 0.55;
        } else {
            score *= 1.1;
        }

        score *= centerScore;
    }

    if (
        rect.width >= imageCols * 0.98 &&
        rect.height >= imageRows * 0.98
    ) {
        score *= 0.1;
    }

    return score;
}

function extractQuadPoints(approx, scaleX, scaleY, srcCols, srcRows) {
    var offsetX =
        arguments.length > 5 && typeof arguments[5] === "number" ? arguments[5] : 0;
    var offsetY =
        arguments.length > 6 && typeof arguments[6] === "number" ? arguments[6] : 0;
    var points = [];
    for (var j = 0; j < 4; j++) {
        points.push({
            x: clampPoint((approx.data32S[j * 2] + offsetX) * scaleX, srcCols),
            y: clampPoint(
                (approx.data32S[j * 2 + 1] + offsetY) * scaleY,
                srcRows,
            ),
        });
    }
    return points;
}

function findBestQuadFromMask(
    mask,
    scaleX,
    scaleY,
    srcCols,
    srcRows,
    minArea,
    epsilonFactor,
    focusRect,
    assumeCenteredDocument,
    offsetX,
    offsetY,
    detectCols,
    detectRows,
) {
    var workingMask = mask.clone();
    var contours = new cv.MatVector();
    var hierarchy = new cv.Mat();
    var bestPoints = null;
    var bestScore = 0;
    var epsilonFactors = [0.015, 0.02, 0.03, 0.05];
    var contourOrder = [];

    try {
        cv.findContours(
            workingMask,
            contours,
            hierarchy,
            cv.RETR_LIST,
            cv.CHAIN_APPROX_SIMPLE,
        );

        for (var i = 0; i < contours.size(); i++) {
            var contourForArea = contours.get(i);
            var contourArea = Math.abs(cv.contourArea(contourForArea));
            contourForArea.delete();
            if (contourArea >= minArea * 0.6) {
                contourOrder.push({ index: i, area: contourArea });
            }
        }

        contourOrder.sort(function (a, b) {
            return b.area - a.area;
        });

        for (
            var contourIndex = 0;
            contourIndex < contourOrder.length && contourIndex < 14;
            contourIndex++
        ) {
            var contour = contours.get(contourOrder[contourIndex].index);
            var area = contourOrder[contourIndex].area;
            var peri = cv.arcLength(contour, true);
            var hull = new cv.Mat();

            cv.convexHull(contour, hull, false, true);
            var hullPeri = cv.arcLength(hull, true);

            for (var epsIndex = 0; epsIndex < epsilonFactors.length; epsIndex++) {
                var approxSources = [
                    { mat: contour, epsilon: epsilonFactors[epsIndex] * peri },
                    { mat: hull, epsilon: epsilonFactors[epsIndex] * hullPeri },
                ];

                for (var sourceIndex = 0; sourceIndex < approxSources.length; sourceIndex++) {
                    var approx = new cv.Mat();
                    cv.approxPolyDP(
                        approxSources[sourceIndex].mat,
                        approx,
                        approxSources[sourceIndex].epsilon,
                        true,
                    );

                    if (
                        approx.rows === 4 &&
                        area > minArea &&
                        cv.isContourConvex(approx)
                    ) {
                        var detectPoints = buildPointArrayFromApprox(
                            approx,
                            offsetX,
                            offsetY,
                        );
                        var score = evaluateQuadCandidate(
                            detectPoints,
                            area,
                            detectCols,
                            detectRows,
                            focusRect,
                            assumeCenteredDocument,
                        );

                        if (score > bestScore) {
                            bestScore = score;
                            bestPoints = scalePointsToSource(
                                orderPoints(detectPoints),
                                scaleX,
                                scaleY,
                                srcCols,
                                srcRows,
                            );
                        }
                    }

                    approx.delete();
                }
            }

            var hullPoints = buildPointArrayFromApprox(hull, offsetX, offsetY);
            var extremeQuad = extractExtremeQuad(hullPoints);
            var quadrantQuad = extractQuadrantQuad(hullPoints);
            if (extremeQuad) {
                var extremeScore = evaluateQuadCandidate(
                    extremeQuad,
                    area,
                    detectCols,
                    detectRows,
                    focusRect,
                    assumeCenteredDocument,
                );
                if (extremeScore > bestScore) {
                    bestScore = extremeScore;
                    bestPoints = scalePointsToSource(
                        orderPoints(extremeQuad),
                        scaleX,
                        scaleY,
                        srcCols,
                        srcRows,
                    );
                }
            }
            if (quadrantQuad) {
                var expandedQuadrantQuad = expandQuad(
                    orderPoints(quadrantQuad),
                    0.02,
                    detectCols,
                    detectRows,
                );
                var quadrantScore = evaluateQuadCandidate(
                    expandedQuadrantQuad,
                    area,
                    detectCols,
                    detectRows,
                    focusRect,
                    assumeCenteredDocument,
                );
                if (quadrantScore > bestScore) {
                    bestScore = quadrantScore;
                    bestPoints = scalePointsToSource(
                        orderPoints(expandedQuadrantQuad),
                        scaleX,
                        scaleY,
                        srcCols,
                        srcRows,
                    );
                }
            }

            hull.delete();
            contour.delete();
        }
    } finally {
        workingMask.delete();
        contours.delete();
        hierarchy.delete();
    }

    return { points: bestPoints, score: bestScore };
}

function findCenterPaperQuad(
    detectRegion,
    scaleX,
    scaleY,
    srcCols,
    srcRows,
    minArea,
    focusRect,
    assumeCenteredDocument,
    offsetX,
    offsetY,
) {
    var gray = new cv.Mat();
    var rgb = new cv.Mat();
    var hsv = new cv.Mat();
    var hsvChannels = new cv.MatVector();
    var grayCenter = null;
    var saturation = null;
    var value = null;
    var satCenter = null;
    var valueCenter = null;
    var saturationMask = new cv.Mat();
    var valueMask = new cv.Mat();
    var grayMask = new cv.Mat();
    var paperMask = new cv.Mat();
    var contours = new cv.MatVector();
    var hierarchy = new cv.Mat();
    var kernel = cv.getStructuringElement(cv.MORPH_RECT, new cv.Size(5, 5));
    var bestPoints = null;
    var bestScore = 0;

    try {
        var centerRect = new cv.Rect(
            Math.round(detectRegion.cols * 0.3),
            Math.round(detectRegion.rows * 0.3),
            Math.max(1, Math.round(detectRegion.cols * 0.4)),
            Math.max(1, Math.round(detectRegion.rows * 0.4)),
        );
        var centerPoint = {
            x: detectRegion.cols / 2,
            y: detectRegion.rows / 2,
        };

        cv.cvtColor(detectRegion, gray, cv.COLOR_RGBA2GRAY);
        cv.cvtColor(detectRegion, rgb, cv.COLOR_RGBA2RGB);
        cv.cvtColor(rgb, hsv, cv.COLOR_RGB2HSV);
        cv.split(hsv, hsvChannels);

        saturation = hsvChannels.get(1);
        value = hsvChannels.get(2);
        grayCenter = gray.roi(centerRect);
        satCenter = saturation.roi(centerRect);
        valueCenter = value.roi(centerRect);

        var meanGray = cv.mean(grayCenter)[0];
        var meanSat = cv.mean(satCenter)[0];
        var meanValue = cv.mean(valueCenter)[0];
        var satLimit = Math.min(110, Math.max(45, meanSat + 26));
        var valueFloor = Math.max(90, meanValue - 48);
        var grayFloor = Math.max(90, meanGray - 42);

        cv.threshold(
            saturation,
            saturationMask,
            satLimit,
            255,
            cv.THRESH_BINARY_INV,
        );
        cv.threshold(value, valueMask, valueFloor, 255, cv.THRESH_BINARY);
        cv.threshold(gray, grayMask, grayFloor, 255, cv.THRESH_BINARY);
        cv.bitwise_and(saturationMask, valueMask, paperMask);
        cv.bitwise_and(paperMask, grayMask, paperMask);
        cv.morphologyEx(paperMask, paperMask, cv.MORPH_CLOSE, kernel);
        cv.dilate(paperMask, paperMask, kernel);
        cv.erode(paperMask, paperMask, kernel);

        cv.findContours(
            paperMask,
            contours,
            hierarchy,
            cv.RETR_EXTERNAL,
            cv.CHAIN_APPROX_SIMPLE,
        );

        for (var i = 0; i < contours.size(); i++) {
            var contour = contours.get(i);
            var area = Math.abs(cv.contourArea(contour));
            var rect = cv.boundingRect(contour);
            var hull = new cv.Mat();

            if (
                area < minArea ||
                !pointInRect(centerPoint, rect)
            ) {
                contour.delete();
                continue;
            }

            cv.convexHull(contour, hull, false, true);
            var contourPoints = buildPointArrayFromApprox(
                contour,
                offsetX,
                offsetY,
            );
            var hullPoints = buildPointArrayFromApprox(hull, offsetX, offsetY);
            var extremeQuad = extractExtremeQuad(hullPoints);
            var quadrantQuad = extractQuadrantQuad(hullPoints);
            var boundaryQuad = buildBoundaryQuad(
                contourPoints,
                detectRegion.cols + offsetX,
                detectRegion.rows + offsetY,
            );

            if (extremeQuad) {
                var score = scoreScaledQuad(
                    expandQuad(
                        orderPoints(extremeQuad),
                        0.025,
                        detectRegion.cols + offsetX,
                        detectRegion.rows + offsetY,
                    ),
                    area,
                    scaleX,
                    scaleY,
                    srcCols,
                    srcRows,
                    detectRegion.cols,
                    detectRegion.rows,
                    focusRect,
                    assumeCenteredDocument,
                );

                if (score > bestScore) {
                    bestScore = score;
                    bestPoints = scalePointsToSource(
                        orderPoints(extremeQuad),
                        scaleX,
                        scaleY,
                        srcCols,
                        srcRows,
                    );
                }
            }
            if (quadrantQuad) {
                var expandedQuadrantQuad = expandQuad(
                    orderPoints(quadrantQuad),
                    0.025,
                    detectRegion.cols + offsetX,
                    detectRegion.rows + offsetY,
                );
                var quadrantScore = scoreScaledQuad(
                    expandedQuadrantQuad,
                    area,
                    scaleX,
                    scaleY,
                    srcCols,
                    srcRows,
                    detectRegion.cols,
                    detectRegion.rows,
                    focusRect,
                    assumeCenteredDocument,
                );
                if (quadrantScore > bestScore) {
                    bestScore = quadrantScore;
                    bestPoints = scalePointsToSource(
                        orderPoints(expandedQuadrantQuad),
                        scaleX,
                        scaleY,
                        srcCols,
                        srcRows,
                    );
                }
            }
            if (boundaryQuad) {
                var expandedBoundaryQuad = expandQuad(
                    boundaryQuad,
                    0.03,
                    detectRegion.cols + offsetX,
                    detectRegion.rows + offsetY,
                );
                var boundaryScore = scoreScaledQuad(
                    expandedBoundaryQuad,
                    area,
                    scaleX,
                    scaleY,
                    srcCols,
                    srcRows,
                    detectRegion.cols,
                    detectRegion.rows,
                    focusRect,
                    assumeCenteredDocument,
                );
                if (boundaryScore > bestScore) {
                    bestScore = boundaryScore * 1.08;
                    bestPoints = scalePointsToSource(
                        orderPoints(expandedBoundaryQuad),
                        scaleX,
                        scaleY,
                        srcCols,
                        srcRows,
                    );
                }
            }

            hull.delete();
            contour.delete();
        }
    } finally {
        gray.delete();
        rgb.delete();
        hsv.delete();
        hsvChannels.delete();
        if (grayCenter) grayCenter.delete();
        if (saturation) saturation.delete();
        if (value) value.delete();
        if (satCenter) satCenter.delete();
        if (valueCenter) valueCenter.delete();
        saturationMask.delete();
        valueMask.delete();
        grayMask.delete();
        paperMask.delete();
        contours.delete();
        hierarchy.delete();
        kernel.delete();
    }

    return { points: bestPoints, score: bestScore };
}

function detectDocumentInRegion(
    detectRegion,
    regionRect,
    detectCols,
    detectRows,
    src,
    options,
) {
    var gray = new cv.Mat();
    var rgb = new cv.Mat();
    var hsv = new cv.Mat();
    var hsvChannels = new cv.MatVector();
    var saturation = null;
    var value = null;
    var attemptMask = new cv.Mat();
    var adaptiveMask = new cv.Mat();
    var otsuMask = new cv.Mat();
    var lowSaturationMask = new cv.Mat();
    var highValueMask = new cv.Mat();
    var paperColorMask = new cv.Mat();
    var kernel = cv.getStructuringElement(cv.MORPH_RECT, new cv.Size(3, 3));
    var closeKernel = cv.getStructuringElement(
        cv.MORPH_RECT,
        new cv.Size(5, 5),
    );
    var bestPoints = null;
    var bestScore = 0;
    var cannyThresholds = [
        [50, 150],
        [30, 120],
        [75, 200],
    ];

    try {
        var scaleX = src.cols / detectCols;
        var scaleY = src.rows / detectRows;
        var minArea =
            detectCols * detectRows * (options.assumeCenteredDocument ? 0.16 : 0.12);
        var focusRect = options.assumeCenteredDocument
            ? createCenterFocusRect(detectCols, detectRows)
            : null;

        cv.cvtColor(detectRegion, gray, cv.COLOR_RGBA2GRAY);
        cv.GaussianBlur(gray, gray, new cv.Size(5, 5), 0);

        if (options.assumeCenteredDocument) {
            var centerPaperCandidate = findCenterPaperQuad(
                detectRegion,
                scaleX,
                scaleY,
                src.cols,
                src.rows,
                minArea,
                focusRect,
                options.assumeCenteredDocument,
                regionRect.x,
                regionRect.y,
            );
            if (centerPaperCandidate.score > bestScore) {
                bestPoints = centerPaperCandidate.points;
                bestScore = centerPaperCandidate.score * 1.18;
            }
        }

        for (var i = 0; i < cannyThresholds.length; i++) {
            cv.Canny(
                gray,
                attemptMask,
                cannyThresholds[i][0],
                cannyThresholds[i][1],
            );
            cv.dilate(attemptMask, attemptMask, kernel);
            cv.morphologyEx(
                attemptMask,
                attemptMask,
                cv.MORPH_CLOSE,
                closeKernel,
            );
            var edgeCandidate = findBestQuadFromMask(
                attemptMask,
                scaleX,
                scaleY,
                src.cols,
                src.rows,
                minArea,
                0.02,
                focusRect,
                options.assumeCenteredDocument,
                regionRect.x,
                regionRect.y,
                detectCols,
                detectRows,
            );
            if (edgeCandidate.score > bestScore) {
                bestPoints = edgeCandidate.points;
                bestScore = edgeCandidate.score;
            }
        }

        if (!bestPoints) {
            cv.adaptiveThreshold(
                gray,
                adaptiveMask,
                255,
                cv.ADAPTIVE_THRESH_GAUSSIAN_C,
                cv.THRESH_BINARY,
                31,
                15,
            );
            cv.morphologyEx(
                adaptiveMask,
                adaptiveMask,
                cv.MORPH_CLOSE,
                closeKernel,
            );
            var adaptiveCandidate = findBestQuadFromMask(
                adaptiveMask,
                scaleX,
                scaleY,
                src.cols,
                src.rows,
                minArea,
                0.02,
                focusRect,
                options.assumeCenteredDocument,
                regionRect.x,
                regionRect.y,
                detectCols,
                detectRows,
            );
            if (adaptiveCandidate.score > bestScore) {
                bestPoints = adaptiveCandidate.points;
                bestScore = adaptiveCandidate.score;
            }
        }

        if (!bestPoints) {
            cv.cvtColor(detectRegion, rgb, cv.COLOR_RGBA2RGB);
            cv.cvtColor(rgb, hsv, cv.COLOR_RGB2HSV);
            cv.split(hsv, hsvChannels);
            saturation = hsvChannels.get(1);
            value = hsvChannels.get(2);
            cv.threshold(
                saturation,
                lowSaturationMask,
                60,
                255,
                cv.THRESH_BINARY_INV,
            );
            cv.threshold(
                value,
                highValueMask,
                135,
                255,
                cv.THRESH_BINARY,
            );
            cv.bitwise_and(lowSaturationMask, highValueMask, paperColorMask);
            cv.morphologyEx(
                paperColorMask,
                paperColorMask,
                cv.MORPH_CLOSE,
                closeKernel,
            );
            cv.erode(paperColorMask, paperColorMask, kernel);
            cv.dilate(paperColorMask, paperColorMask, kernel);
            var paperColorCandidate = findBestQuadFromMask(
                paperColorMask,
                scaleX,
                scaleY,
                src.cols,
                src.rows,
                minArea,
                0.02,
                focusRect,
                options.assumeCenteredDocument,
                regionRect.x,
                regionRect.y,
                detectCols,
                detectRows,
            );
            if (paperColorCandidate.score > bestScore) {
                bestPoints = paperColorCandidate.points;
                bestScore = paperColorCandidate.score;
            }
        }

        if (!bestPoints) {
            cv.threshold(
                gray,
                otsuMask,
                0,
                255,
                cv.THRESH_BINARY + cv.THRESH_OTSU,
            );
            cv.morphologyEx(otsuMask, otsuMask, cv.MORPH_CLOSE, closeKernel);
            var otsuCandidate = findBestQuadFromMask(
                otsuMask,
                scaleX,
                scaleY,
                src.cols,
                src.rows,
                minArea,
                0.02,
                focusRect,
                options.assumeCenteredDocument,
                regionRect.x,
                regionRect.y,
                detectCols,
                detectRows,
            );
            if (otsuCandidate.score > bestScore) {
                bestPoints = otsuCandidate.points;
                bestScore = otsuCandidate.score;
            }
        }

        if (!bestPoints) {
            var lineCandidate = findQuadFromLines(
                gray,
                scaleX,
                scaleY,
                src.cols,
                src.rows,
                focusRect,
                options.assumeCenteredDocument,
                regionRect.x,
                regionRect.y,
            );
            if (lineCandidate.score > bestScore) {
                bestPoints = lineCandidate.points;
                bestScore = lineCandidate.score;
            }
        }

        return { points: bestPoints, score: bestScore };
    } finally {
        gray.delete();
        rgb.delete();
        hsv.delete();
        hsvChannels.delete();
        if (saturation) saturation.delete();
        if (value) value.delete();
        attemptMask.delete();
        adaptiveMask.delete();
        otsuMask.delete();
        lowSaturationMask.delete();
        highValueMask.delete();
        paperColorMask.delete();
        kernel.delete();
        closeKernel.delete();
    }
}

function findMaskBounds(mask) {
    var cols = mask.cols;
    var rows = mask.rows;
    var yStart = Math.max(0, Math.round(rows * 0.08));
    var yEnd = Math.min(rows, Math.round(rows * 0.92));
    var xStart = Math.max(0, Math.round(cols * 0.08));
    var xEnd = Math.min(cols, Math.round(cols * 0.92));
    var minColumnRatio = 0.58;
    var minRowRatio = 0.58;
    var left = 0;
    var right = cols - 1;
    var top = 0;
    var bottom = rows - 1;
    var foundLeft = false;
    var foundRight = false;
    var foundTop = false;
    var foundBottom = false;
    var x;
    var y;

    for (x = 0; x < cols; x++) {
        var columnHits = 0;
        for (y = yStart; y < yEnd; y++) {
            if (mask.ucharPtr(y, x)[0] > 0) columnHits++;
        }
        if (columnHits / Math.max(1, yEnd - yStart) >= minColumnRatio) {
            left = x;
            foundLeft = true;
            break;
        }
    }

    for (x = cols - 1; x >= 0; x--) {
        var reverseColumnHits = 0;
        for (y = yStart; y < yEnd; y++) {
            if (mask.ucharPtr(y, x)[0] > 0) reverseColumnHits++;
        }
        if (
            reverseColumnHits / Math.max(1, yEnd - yStart) >= minColumnRatio
        ) {
            right = x;
            foundRight = true;
            break;
        }
    }

    for (y = 0; y < rows; y++) {
        var rowHits = 0;
        for (x = xStart; x < xEnd; x++) {
            if (mask.ucharPtr(y, x)[0] > 0) rowHits++;
        }
        if (rowHits / Math.max(1, xEnd - xStart) >= minRowRatio) {
            top = y;
            foundTop = true;
            break;
        }
    }

    for (y = rows - 1; y >= 0; y--) {
        var reverseRowHits = 0;
        for (x = xStart; x < xEnd; x++) {
            if (mask.ucharPtr(y, x)[0] > 0) reverseRowHits++;
        }
        if (reverseRowHits / Math.max(1, xEnd - xStart) >= minRowRatio) {
            bottom = y;
            foundBottom = true;
            break;
        }
    }

    if (!(foundLeft && foundRight && foundTop && foundBottom)) return null;
    if (right - left < cols * 0.45 || bottom - top < rows * 0.45) return null;

    return {
        x: left,
        y: top,
        width: right - left + 1,
        height: bottom - top + 1,
    };
}

function intersectRects(a, b) {
    var x1 = Math.max(a.x, b.x);
    var y1 = Math.max(a.y, b.y);
    var x2 = Math.min(a.x + a.width, b.x + b.width);
    var y2 = Math.min(a.y + a.height, b.y + b.height);

    if (x2 <= x1 || y2 <= y1) return null;
    return { x: x1, y: y1, width: x2 - x1, height: y2 - y1 };
}

function refineWarpedCrop(src, assumeCenteredDocument) {
    if (!assumeCenteredDocument) return src.clone();

    var gray = new cv.Mat();
    var rgb = new cv.Mat();
    var hsv = new cv.Mat();
    var hsvChannels = new cv.MatVector();
    var saturation = null;
    var value = null;
    var lowSaturationMask = new cv.Mat();
    var highValueMask = new cv.Mat();
    var paperMask = new cv.Mat();
    var kernel = cv.getStructuringElement(cv.MORPH_RECT, new cv.Size(3, 3));
    var closeKernel = cv.getStructuringElement(
        cv.MORPH_RECT,
        new cv.Size(7, 7),
    );
    var contours = new cv.MatVector();
    var hierarchy = new cv.Mat();
    var bestRect = null;
    var bestScore = 0;

    try {
        cv.cvtColor(src, gray, cv.COLOR_RGBA2GRAY);
        cv.cvtColor(src, rgb, cv.COLOR_RGBA2RGB);
        cv.cvtColor(rgb, hsv, cv.COLOR_RGB2HSV);
        cv.split(hsv, hsvChannels);
        saturation = hsvChannels.get(1);
        value = hsvChannels.get(2);

        cv.threshold(
            saturation,
            lowSaturationMask,
            55,
            255,
            cv.THRESH_BINARY_INV,
        );
        cv.threshold(
            value,
            highValueMask,
            145,
            255,
            cv.THRESH_BINARY,
        );
        cv.bitwise_and(lowSaturationMask, highValueMask, paperMask);
        cv.threshold(gray, gray, 0, 255, cv.THRESH_BINARY + cv.THRESH_OTSU);
        cv.bitwise_and(paperMask, gray, paperMask);
        cv.morphologyEx(paperMask, paperMask, cv.MORPH_CLOSE, closeKernel);
        cv.erode(paperMask, paperMask, kernel);
        cv.dilate(paperMask, paperMask, kernel);

        cv.findContours(
            paperMask,
            contours,
            hierarchy,
            cv.RETR_EXTERNAL,
            cv.CHAIN_APPROX_SIMPLE,
        );

        for (var i = 0; i < contours.size(); i++) {
            var contour = contours.get(i);
            var area = cv.contourArea(contour);
            var rect = cv.boundingRect(contour);
            var rectArea = rect.width * rect.height;
            var rectangularity = rectArea > 0 ? area / rectArea : 0;
            var overlap = rectOverlapRatio(
                rect,
                createCenterFocusRect(src.cols, src.rows),
            );
            var centerScore = centerDistanceScore(rect, src.cols, src.rows);
            var score = area * rectangularity * overlap * centerScore;

            if (
                area > src.cols * src.rows * 0.7 &&
                rect.width > src.cols * 0.75 &&
                rect.height > src.rows * 0.75 &&
                score > bestScore
            ) {
                bestScore = score;
                bestRect = rect;
            }

            contour.delete();
        }

        if (!bestRect) return src.clone();

        var padX = Math.min(16, Math.round(src.cols * 0.012));
        var padY = Math.min(16, Math.round(src.rows * 0.012));
        var cropX = Math.max(0, bestRect.x - padX);
        var cropY = Math.max(0, bestRect.y - padY);
        var cropW = Math.min(src.cols - cropX, bestRect.width + padX * 2);
        var cropH = Math.min(src.rows - cropY, bestRect.height + padY * 2);
        var leftTrim = cropX;
        var rightTrim = src.cols - (cropX + cropW);
        var topTrim = cropY;
        var bottomTrim = src.rows - (cropY + cropH);

        if (cropW < src.cols * 0.55 || cropH < src.rows * 0.55) {
            return src.clone();
        }
        if (
            leftTrim > src.cols * 0.035 ||
            rightTrim > src.cols * 0.035 ||
            topTrim > src.rows * 0.03 ||
            bottomTrim > src.rows * 0.03
        ) {
            return src.clone();
        }

        var roi = src.roi(new cv.Rect(cropX, cropY, cropW, cropH));
        var cropped = roi.clone();
        roi.delete();
        return cropped;
    } finally {
        gray.delete();
        rgb.delete();
        hsv.delete();
        hsvChannels.delete();
        if (saturation) saturation.delete();
        if (value) value.delete();
        lowSaturationMask.delete();
        highValueMask.delete();
        paperMask.delete();
        kernel.delete();
        closeKernel.delete();
        contours.delete();
        hierarchy.delete();
    }
}

function detectDocument(src, options) {
    var detectSrc = resizeForDetection(src, 500);
    var bestPoints = null;
    var bestScore = 0;

    try {
        var detectRegions = createDetectionRegions(
            detectSrc.cols,
            detectSrc.rows,
            options.assumeCenteredDocument,
        );

        for (var i = 0; i < detectRegions.length; i++) {
            var regionRect = detectRegions[i];
            var useFullFrame =
                regionRect.x === 0 &&
                regionRect.y === 0 &&
                regionRect.width === detectSrc.cols &&
                regionRect.height === detectSrc.rows;
            var regionView = null;
            var regionMat = detectSrc;
            var candidate = null;

            try {
                if (!useFullFrame) {
                    regionView = detectSrc.roi(
                        new cv.Rect(
                            regionRect.x,
                            regionRect.y,
                            regionRect.width,
                            regionRect.height,
                        ),
                    );
                    regionMat = regionView.clone();
                }

                candidate = detectDocumentInRegion(
                    regionMat,
                    regionRect,
                    detectSrc.cols,
                    detectSrc.rows,
                    src,
                    options,
                );
            } finally {
                if (!useFullFrame) {
                    regionMat.delete();
                    regionView.delete();
                }
            }

            if (candidate && candidate.score > bestScore) {
                bestPoints = candidate.points;
                bestScore = candidate.score;
            }

            if (
                candidate &&
                candidate.points &&
                options.assumeCenteredDocument &&
                i === 0 &&
                candidate.score > detectSrc.cols * detectSrc.rows * 0.08
            ) {
                debugLog("detectDocument: using center ROI candidate");
                return candidate.points;
            }
        }

        if (!bestPoints) {
            debugLog("detectDocument: no 4-point contour found");
            return null;
        }

        return bestPoints;
    } catch (err) {
        debugLog("detectDocument failed:", err);
        return null;
    } finally {
        detectSrc.delete();
    }
}

function warpDocument(src, pts, options) {
    var ordered = orderPoints(pts);
    var topLeft = ordered[0];
    var topRight = ordered[1];
    var bottomRight = ordered[2];
    var bottomLeft = ordered[3];
    var maxWidth = Math.max(
        dist(topLeft, topRight),
        dist(bottomLeft, bottomRight),
    );
    var maxHeight = Math.max(
        dist(topLeft, bottomLeft),
        dist(topRight, bottomRight),
    );
    var width = Math.max(1, Math.round(maxWidth));
    var height = Math.max(1, Math.round(maxHeight));

    if (width < 100 || height < 100) {
        throw new Error("Warp target too small");
    }

    var srcMat = cv.matFromArray(4, 1, cv.CV_32FC2, [
        topLeft.x, topLeft.y,
        topRight.x, topRight.y,
        bottomRight.x, bottomRight.y,
        bottomLeft.x, bottomLeft.y,
    ]);
    var dstMat = cv.matFromArray(4, 1, cv.CV_32FC2, [
        0, 0,
        width - 1, 0,
        width - 1, height - 1,
        0, height - 1,
    ]);
    var matrix = cv.getPerspectiveTransform(srcMat, dstMat);
    var warped = new cv.Mat();

    cv.warpPerspective(
        src,
        warped,
        matrix,
        new cv.Size(width, height),
        cv.INTER_CUBIC,
        cv.BORDER_REPLICATE,
        new cv.Scalar(),
    );

    srcMat.delete();
    dstMat.delete();
    matrix.delete();

    var refined = refineWarpedCrop(warped, options.assumeCenteredDocument);
    warped.delete();
    var upscaled = upscaleAfterWarp(refined);
    refined.delete();
    return upscaled;
}

function normalizeCorners(corners, cols, rows) {
    if (!corners || corners.length !== 4) return null;

    var normalized = [];
    for (var i = 0; i < corners.length; i++) {
        var point = corners[i];
        if (!point || !isFinite(point.x) || !isFinite(point.y)) {
            return null;
        }
        normalized.push({
            x: clampPoint(point.x, cols),
            y: clampPoint(point.y, rows),
        });
    }

    return orderPoints(normalized);
}

function detectImage(imageData, options) {
    var src = cv.matFromImageData(imageData);

    try {
        return {
            corners: detectDocument(src, options),
            width: src.cols,
            height: src.rows,
        };
    } finally {
        src.delete();
    }
}

/* ══════════════════════════════════════════
   Image Processing Entry
   ══════════════════════════════════════════ */

function processImage(imageData, options, manualCorners) {
    var src = cv.matFromImageData(imageData);

    try {
        var points = normalizeCorners(manualCorners, src.cols, src.rows);

        if (!points && options.detectDocument) {
            points = detectDocument(src, options);
        }

        if (points && points.length === 4) {
            try {
                var warped = warpDocument(src, points, options);
                src.delete();
                src = warped;
            } catch (err) {
                debugLog("warpDocument failed, keeping original:", err);
            }
        } else if (options.detectDocument) {
            debugLog("processImage: fallback to original image");
        }

        var dst = applyScanFilter(src);
        src.delete();

        var result = new ImageData(
            new Uint8ClampedArray(dst.data),
            dst.cols,
            dst.rows,
        );
        dst.delete();

        return result;
    } catch (err) {
        src.delete();
        throw err;
    }
}

/* ══════════════════════════════════════════
   Message Handler
   ══════════════════════════════════════════ */

self.onmessage = function (e) {
    var msg = e.data;

    if (msg.type === "init") {
        initOpenCV()
            .then(function () {
                self.postMessage({ type: "ready" });
            })
            .catch(function (err) {
                self.postMessage({
                    type: "error",
                    message: err.message || "OpenCV init failed",
                });
            });
        return;
    }

    if (msg.type === "process") {
        try {
            var result = processImage(
                msg.imageData,
                msg.options,
                msg.manualCorners || null,
            );
            self.postMessage(
                { type: "result", id: msg.id, imageData: result },
                [result.data.buffer],
            );
        } catch (err) {
            self.postMessage({
                type: "processError",
                id: msg.id,
                message: err.message || "Processing failed",
            });
        }
        return;
    }

    if (msg.type === "detect") {
        try {
            var detection = detectImage(msg.imageData, msg.options);
            self.postMessage({
                type: "detectResult",
                id: msg.id,
                corners: detection.corners,
                width: detection.width,
                height: detection.height,
            });
        } catch (err) {
            self.postMessage({
                type: "detectError",
                id: msg.id,
                message: err.message || "Detection failed",
            });
        }
        return;
    }
};
