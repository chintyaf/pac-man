var cnv = document.querySelector("#canvas");
var ctx = cnv.getContext("2d");
var imageDataA = ctx.getImageData(0, 0, cnv.width, cnv.height);

var mazeData = null;
var lastPacmanX = -1, lastPacmanY = -1;

function drawPacmanManual(imageDataA, pacman, canvasWidth) {
    if (lastPacmanX != -1) {
    const R_OLD = pacman.radius + 1; 
    for (let x = -R_OLD; x <= R_OLD; x++) {
        for (let y = -R_OLD; y <= R_OLD; y++) {
            if (x * x + y * y <= R_OLD * R_OLD) {
                gbr_titik(imageDataA, lastPacmanX + x, lastPacmanY + y, 239, 110, 160); 
            }
        }
    }
}
    
    const R = pacman.radius;
    const centerX = Math.floor(pacman.x);
    const centerY = Math.floor(pacman.y);
    const angleOffset = pacman.direction * Math.PI / 2; 
    
    const R_COLOR = 255; 
    const G_COLOR = 255;
    const B_COLOR = 255;

    for (let x = -R; x <= R; x++) {
        for (let y = -R; y <= R; y++) {
            if (x * x + y * y <= R * R) {
                let currentAngle = Math.atan2(y, x);
                if (currentAngle < 0) currentAngle += 2 * Math.PI;

                const angle_to_check = currentAngle - angleOffset;
                const is_in_cleft = angle_to_check > pacman.mouthOpen && angle_to_check < (2 * Math.PI - pacman.mouthOpen);
                
                if (!is_in_cleft) {
                    gbr_titik(imageDataA, centerX + x, centerY + y, R_COLOR, G_COLOR, B_COLOR);
                }
            }
        }
    }

    lastPacmanX = centerX;
    lastPacmanY = centerY;
}


function startGame() {
    try {
        mazeData = generateMaze(imageDataA, ctx, cnv, 35);
    } catch (e) {
        console.error("Gagal menjalankan generateMaze.");
        console.error(e);
    }
    
    initializePacman(mazeData); 
    
    gameLoop();
}

function gameLoop() {
    if (mazeData && mazeData.drawGrid) {
        mazeData.drawGrid(); 
    }

    updatePosition();
    drawPacmanManual(imageDataA, pacman, cnv.width); 
    
    ctx.putImageData(imageDataA, 0, 0); 
    
    requestAnimationFrame(gameLoop);
}

cnv.addEventListener("click", function (event){
    const rect = cnv.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    console.log("x: " + x + " y: " + y);
});

startGame();