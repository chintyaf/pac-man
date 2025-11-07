// =====================
// VARIABLES
// =====================
let gameRunning = false;
sedangGameOver = false;
sedangMenang = false;
sedangDiStartScreen = false;
frameCount = 0;

const gridData = getGridFromMaze();

// =====================
// GAME LOOP
// =====================
async function gameLoop() {
    skip = false;
    if (sedangGameOver || sedangMenang) return; // stop kalau sudah game over
    // console.log("gameloop");

    frameCount++;

    // Update Pac-Man (setiap frame)
    pacman.update();
    pacmanEatDot();

    // Update Ghost
    if (typeof ghosts !== "undefined") {
        for (const ghost of ghosts) {
            ghost.update(pacman);
        }
    }

    for (const ghost of ghosts) {
        if (ghost.checkCollision(pacman)) {
            // console.log("collision");
            sedangGameOver = true;
            tampilkanGameOver(getScore());

            return; // stop di sini, jangan lanjut render & request frame
        }
    }
    // if (typeof ghosts !== "undefined") {
    // }
    // const isVisualizing = ghosts.some(g => g.state === "CALCULATING");
    // if (isVisualizing) {
    //     // Jika ada Ghost yang sedang CALCULATING, jangan biarkan gameLoop merender.
    //     // Rendering diambil alih oleh renderFullFrame() di dalam ghost.js.
    //     requestAnimationFrame(gameLoop);
    //     return;
    // }

    // 4️⃣ Gambar ulang
    ctx.clearRect(0, 0, cnv.width, cnv.height);
    drawGrid();
    imageDataA = ctx.getImageData(0, 0, cnv.width, cnv.height);

    pacman.draw(imageDataA);
    ghosts.forEach((ghost) => ghost.draw(imageDataA));
    drawDots();

    ctx.putImageData(imageDataA, 0, 0);

    if (totalDots == 0) {
        sedangMenang = true;
        skip = false;
        tampilkanYouWin(getScore());
        return;
    }

    // 5️⃣ Jalankan frame berikutnya
    // requestAnimationFrame(gameLoop);
    requestAnimationFrame(gameLoop);
    // setTimeout(() => {
    // }, delay);
}

// =====================
// START FUNCTION
// =====================
async function startGameAll() {
    window.cellWidth = cell_width; // <--- penting, biar this.w kebaca
    generateDotsFromMaze();
    drawDots();
    document.addEventListener("keydown", (e) => {
        pacman.setDirection(e);
    });

    initializeGhostsAfterMaze();

    // Draw ghosts
    ghosts.forEach((ghost) => {
        ghost.draw(imageDataA);
    });

    pacman = new Pacman(5, 2, w / 2 - 10);
    pacman.draw();

    ctx.putImageData(imageDataA, 0, 0);

    // Mulai loop (ini akan terus jalan)
    await gameLoop();
}

// skip = true;
async function startGame() {
    clearAllData();

    await buatGrid();
    await generateMaze();
    messageDiv.style.display = "none";
    score_cnv.style.opacity = 1;

    tampilkanScore();

    // console.log("Maze done — starting game loop!");

    await startGameAll();
}

function clearAllData() {
    // Reset global variables
    grid = [];
    walls = [];
    dots = [];
    ghosts = [];

    // Reset score and states
    score = 0;
    totalDots = 0;
    sedangMenang = false;
    sedangGameOver = false;
    gameRunning = false;
    skip = false;

    // Optional: clear canvas visually
    clearCanvas(0, 0, 0);
    score_cnv.style.opacity = 0;
    setStatus();
    setMessage();

    // console.log("All data cleared!");
}

window.onload = () => {
    tampilkanStartScreen();
    sedangDiStartScreen = true;
    sedangGameOver = false;
    sedangMenang = false;
};

document.addEventListener("keydown", function (e) {
    if (e.code !== "Space") {
        return;
    }

    if (sedangDiStartScreen) {
        sedangDiStartScreen = false;

        startGame();
    } else if (sedangGameOver || sedangMenang) {
        tampilkanStartScreen();
        sedangDiStartScreen = true;
        sedangGameOver = false;
        sedangMenang = false;
    } else {
    }
});
