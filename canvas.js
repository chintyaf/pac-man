var cnv, ctx, imageDataA;

cnv = document.querySelector("#canvas");
ctx = cnv.getContext("2d");
imageDataA = ctx.getImageData(0, 0, cnv.width, cnv.height);

var mazeData = null;

// buat generate maze dan jalanin Pac-Man
function startGame() {
    try {
        mazeData = generateMaze(imageDataA, ctx, cnv, 35);
    } catch (e) {
        console.error("Gagal menjalankan generateMaze.");
        console.error(e);
    }
    initializePacman(ctx, cnv, mazeData); 
    if (mazeData && !mazeData.animating) { 
        ctx.putImageData(imageDataA, 0, 0);
    }
    gameLoop();
}

// Loop game, buat gambar ulang labirin dan update Pac-Man
function gameLoop() {
    ctx.putImageData(imageDataA, 0, 0); 

    updatePosition(); 
    drawPacman(); 
    
    requestAnimationFrame(gameLoop);
}

cnv.addEventListener("click", function (event) {
    const rect = cnv.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    console.log("x: " + x + " y: " + y);
});

startGame();