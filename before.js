var cnv, ctx, imageDataA;

cnv = document.querySelector("#canvas");
ctx = cnv.getContext("2d");
imageDataA = ctx.getImageData(0, 0, cnv.width, cnv.height);

cnv.addEventListener("click", function (event) {
    var rect = cnv.getBoundingClientRect();
    var x = event.clientX - rect.left;
    var y = event.clientY - rect.top;
    console.log("x: " + x + " y: " + y);
});

const cell_width = 40;

function setMessage(text) {
    const messageDiv = document.getElementById("message");
    if (messageDiv) {
        messageDiv.querySelector("p").textContent = text;
    }
}

const speedSlider = document.getElementById("speed");
const speedValue = document.getElementById("speedValue");

// Konversi "kecepatan" ke "delay" (ms)
function getDelayFromSpeed(speed) {
    // Semakin tinggi speed, semakin cepat (delay makin kecil)
    // Contoh: 1 → 1000ms, 100 → 50ms
    return Math.round(1050 - Math.pow(speed, 1.2) * 10);
}

let delay = getDelayFromSpeed(speedSlider.value);

speedSlider.addEventListener("input", () => {
    speedValue.textContent = speedSlider.value;
    delay = getDelayFromSpeed(speedSlider.value);
});

function sleep(ms = delay) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}
