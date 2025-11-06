var cnv, ctx, imageDataA;

cnv = document.querySelector("#canvas");
ctx = cnv.getContext("2d");
imageDataA = ctx.getImageData(0, 0, cnv.width, cnv.height);

const mid_x = cnv.width / 2;
const mid_y = cnv.height / 2;

cnv.addEventListener("click", function (event) {
    var rect = cnv.getBoundingClientRect();
    var x = event.clientX - rect.left;
    var y = event.clientY - rect.top;
    console.log("x: " + x + " y: " + y);
});

const cell_width = 80;

const messageDiv = document.getElementById("message");
function setStatus(text) {
    messageDiv.style.display = "block";
    if (messageDiv) {
        const headerEl = messageDiv.querySelector(".status-header");

        if (headerEl) headerEl.textContent = text;
    }
}

function setMessage(text) {
    if (messageDiv) {
        const msgEl = messageDiv.querySelector(".status-msg");

        if (msgEl) msgEl.textContent = text;
    }
}

// setupAnimationControls();
// // Delay

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

let skip = false;

async function animate() {
    if (skip) return;

    drawGrid();
    await sleep(delay);
}

function skipAnimation() {
    skip = true;
    animate();
}
