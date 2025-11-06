var cnv, ctx, imageDataA;
var cnv2, ctx2, imageData2;

cnv = document.querySelector("#canvas");
ctx = cnv.getContext("2d");
imageDataA = ctx.getImageData(0, 0, cnv.width, cnv.height);

cnv2 = document.querySelector("#score-canvas");
ctx2 = cnv2.getContext("2d");
imageData2 = ctx2.getImageData(0, 0, cnv2.width, cnv2.height);

const mid_x = cnv.width / 2;
const mid_y = cnv.height / 2;

cnv.addEventListener("click", function (event) {
    var rect = cnv.getBoundingClientRect();
    var x = event.clientX - rect.left;
    var y = event.clientY - rect.top;
    // console.log("x: " + x + " y:f " + y);
});

const cell_width = 80;

const messageDiv = document.getElementById("message");
function setStatus(text) {
    messageDiv.style.display = "block";
    if (text) {
        const headerEl = messageDiv.querySelector(".status-header");

        if (headerEl) headerEl.textContent = text;
    }
}

function setMessage(text) {
    if (text) {
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
    speedValue.textContent = speedSlider.value + "%";
    delay = getDelayFromSpeed(speedSlider.value);
});

// function sleep(ms = delay) {
//     return new Promise((resolve) => setTimeout(resolve, ms));
// }
let paused = false;
let stepOnce = false;

async function sleep(ms = 0) {
    const step = 50; // check every 50ms
    let elapsed = 0;

    while (elapsed < ms) {
        if (paused) {
            // Wait until unpaused
            await new Promise((resolve) => {
                const check = setInterval(() => {
                    if (!paused) {
                        clearInterval(check);
                        resolve();
                    }
                }, step);
            });
        }
        await new Promise((resolve) => setTimeout(resolve, step));
        elapsed += step;

        // After resuming one step, pause again automatically
        if (stepOnce) {
            stepOnce = false;
            paused = true;
            break; // stop sleeping early
        }
    }
}

let skip = false;

async function animate(customDelay = 0) {
    if (skip) return;

    console.log(paused);
    drawGrid();
    await sleep(customDelay + delay);
}
function skipAnimation() {
    skip = true;
    animate();
}

function pause() {
    paused = true;
}

function resume() {
    paused = false;
}

function next() {
    if (paused) {
        stepOnce = true;
        paused = false;
    }
}
