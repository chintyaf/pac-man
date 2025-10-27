function clearCanvas(r, g, b) {
    for (let i = 0; i < imageDataA.data.length; i += 4) {
        imageDataA.data[i] = r;
        imageDataA.data[i + 1] = g;
        imageDataA.data[i + 2] = b;
        imageDataA.data[i + 3] = 255;
    }
}

