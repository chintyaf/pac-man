// =====================
// VARIABLES
// =====================
let gameRunning = false;
sedangGameOver = false;
sedangMenang = false;
sedangDiStartScreen = false;
frameCount = 0;

const gridData = getGridFromMaze();
let pacman = new Pacman(1, 1, cell_width / 2 - 4);

// =====================
// GAME LOOP
// =====================
async function gameLoop() {
    if (sedangGameOver) return; // 🛑 stop kalau sudah game over

    frameCount++;

    // 1️⃣ Update Pac-Man
    pacman.update();
    pacmanEatDot();
    // 2️⃣ Update Ghost setiap beberapa frame
    if (frameCount % 20 === 0 && typeof ghosts !== "undefined") {
        ghosts.forEach((ghost) => ghost.update?.(pacman));
    }

    // 3️⃣ Cek collision
    if (typeof ghosts !== "undefined") {
        for (const ghost of ghosts) {
            if (ghost.checkCollision(pacman)) {
                console.log("💀 COLLISION!");
                sedangGameOver = true;
                tampilkanYouWin(getScore());
                tampilkanGameOver(getScore());
                console.log("Game over flag:", sedangGameOver);
                return; // ⛔ stop di sini, jangan lanjut render & request frame
            }
        }
    }

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
        tampilkanYouWin(getScore());
        return;
    }

    // 5️⃣ Jalankan frame berikutnya
    requestAnimationFrame(gameLoop);
}

// =====================
// START FUNCTION
// =====================
async function startGameAll() {
    window.cellWidth = cell_width; // <--- penting, biar this.w kebaca
    // var pacman = new Pacman(0, 0, w / 2 - 4);

    document.addEventListener("keydown", (e) => {
        pacman.setDirection(e);
    });

    initializeGhostsAfterMaze();

    // Draw ghosts
    ghosts.forEach((ghost) => {
        ghost.draw();
        console.log(ghost);
    });

    pacman = new Pacman(5, 2, w / 2 - 10);
    pacman.draw();

    generateDotsFromMaze();
    drawDots();

    ctx.putImageData(imageDataA, 0, 0);

    // 4️⃣ Mulai loop (ini akan terus jalan)
    gameLoop();
}

skip = true;
async function startGame() {
    await buatGrid();
    await generateMaze();
    console.log("Maze done — starting game loop!");

    await startGameAll();
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
        sedangGameOver = false;
    }
});
