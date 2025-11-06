// =====================
// VARIABLES
// =====================
let gameRunning = false;
sedangGameOver = false;
sedangMenang = false;
sedangDiStartScreen = false;
frameCount = 0;

// const gridData = getGridFromMaze(); // <-- HAPUS INI, tidak perlu
let pacman = new Pacman(1, 1, cell_width / 2 - 4);

// =====================
// GAME LOOP
// =====================
async function gameLoop() {
    if (sedangGameOver) return;

    frameCount++;

    // 1️⃣ Update Pac-Man
    pacman.update();
    pacmanEatDot();
    
    // 2️⃣ Update Ghost - SETIAP FRAME (delay sudah di dalam ghost)
    if (typeof ghosts !== "undefined") {
        ghosts.forEach((ghost) => {
            if (ghost.update) {
                ghost.update(pacman);
            }
        });
    }

    // 3️⃣ Cek collision
    if (typeof ghosts !== "undefined") {
        for (const ghost of ghosts) {
            if (ghost.checkCollision(pacman)) {
                console.log("💀 COLLISION!");
                sedangGameOver = true;
                tampilkanGameOver(getScore());
                return;
            }
        }
    }

    // 4️⃣ Gambar ulang
    ctx.clearRect(0, 0, cnv.width, cnv.height);
    drawGrid();
    imageDataA = ctx.getImageData(0, 0, cnv.width, cnv.height);

    // ===== VISUALISASI BFS (TAMBAHAN) =====
    if (typeof ghosts !== "undefined") {
        ghosts.forEach((ghost) => {
            if (ghost.drawBFSVisualization) {
                ghost.drawBFSVisualization();
            }
        });
    }
    // ===== AKHIR TAMBAHAN =====

    pacman.draw(imageDataA);
    
    // Gambar ghost
    if (typeof ghosts !== "undefined") {
        ghosts.forEach((ghost) => ghost.draw(imageDataA));
    }
    
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
    window.cellWidth = cell_width;

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

    // 4️⃣ Mulai loop
    gameLoop();
}

skip = true;
async function startGame() {
    await buatGrid();
    await generateMaze();
    console.log("Maze done – starting game loop!");

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