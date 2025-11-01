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

const speedSlider = document.getElementById("speed");
const speedValue = document.getElementById("speedValue");

// update value saat slider digeser
speedSlider.addEventListener("input", () => {
    speedValue.textContent = speedSlider.value;
});

function setMessage(text) {
    const messageDiv = document.getElementById("message");
    if (messageDiv) {
        messageDiv.querySelector("p").textContent = text;
    }
}