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

// Delay

const speedSlider = document.getElementById("speed");
const speedValue = document.getElementById("speedValue");

function getDelayFromSpeed(speed) {
    const minDelay = 20; // fast
    const maxDelay = 1000; // slow
    const normalized = (100 - speed) / 100;
    return Math.round(
        minDelay + (maxDelay - minDelay) * Math.pow(normalized, 2)
    );
}

let delay = getDelayFromSpeed(speedSlider.value);

speedSlider.addEventListener("input", () => {
    speedValue.textContent = speedSlider.value;
    delay = getDelayFromSpeed(speedSlider.value);
    console.log(delay);
});

function sleep(ms = delay) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}
