Place an ONNX cat segmentation model here with the exact name:

cat-segmentation.onnx

The Cat Sketch page will try to load it locally, cache it in IndexedDB,
and fall back to the OpenCV-based heuristic segmentation worker when the
model is missing or incompatible.
