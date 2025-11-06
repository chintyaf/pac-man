// ===================================
// AFTER.JS (Versi Final Bersih)
// ===================================

// =====================
// VARIABLES
// =====================
let gameRunning = false;
sedangGameOver = false;
sedangMenang = false;
sedangDiStartScreen = false;
frameCount = 0;

const gridData = getGridFromMaze();
const fps = 60;
const frameDelay = 1000 / fps; // 33.33 ms per frame
// =====================
// GAME LOOP
// =====================
async function gameLoop() {
    // Cek kondisi berhenti
    if (sedangGameOver) return;
    if (sedangDiStartScreen) return;
    if (sedangMenang) return;

    // --- TAMBAHAN PENTING ---
    // Cek state pause dari animation-controls.js
    // Ini akan menjeda seluruh game loop (termasuk Pac-Man)
    if (window.animationState && window.animationState.isPaused) {
        requestAnimationFrame(gameLoop); // Tetap panggil loop, tapi jangan lakukan apa-apa
        return;
    }
    // --- AKHIR TAMBAHAN ---

    frameCount++;

    // 1️⃣ Update Pac-Man
    pacman.update();
    pacmanEatDot();
    
    // 2️⃣ Update Ghost
    // HAPUS: && frameCount % 20 === 0 (Sangat penting!)
    if (typeof ghosts !== "undefined") {
        ghosts.forEach((ghost) => {
            if (ghost.update) {
                // Biarkan state machine ghost berjalan setiap frame
                ghost.update(pacman);
            }
        });
    }

    // 3️⃣ Cek collision
    if (typeof ghosts !== "undefined") {
        for (const ghost of ghosts) {
            if (ghost.checkCollision(pacman)) {
                // console.log("COLLISION!");
                sedangGameOver = true;
                tampilkanGameOver(getScore());
                return; // ⛔ stop di sini, jangan lanjut render & request frame
            }
        }
    }

    // 4️⃣ Gambar ulang
    ctx.clearRect(0, 0, cnv.width, cnv.height);
    drawGrid(); // Menggambar grid (termasuk warna dari BFS)
    imageDataA = ctx.getImageData(0, 0, cnv.width, cnv.height);

    pacman.draw(imageDataA); // Gambar Pac-Man
    
    if (typeof ghosts !== "undefined") {
        // Gambar Ghost (dan visualisasi BFS/Path-nya jika state-nya aktif)
        ghosts.forEach((ghost) => ghost.draw(imageDataA));
    }
    
    drawDots(); // Gambar dots

    ctx.putImageData(imageDataA, 0, 0);

    // Cek kondisi menang
    if (totalDots == 0) {
        sedangMenang = true;
        tampilkanYouWin(getScore());
        return;
    }

    // 5️⃣ Jalankan frame berikutnya
    // requestAnimationFrame(gameLoop);
    setTimeout(() => {
        requestAnimationFrame(gameLoop);
    }, frameDelay);
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
        
        // HAPUS SEMUA LOGIKA TOMBOL 'B' DARI SINI
        // Ghost sekarang berjalan otomatis
    });

    initializeGhostsAfterMaze();

    // Draw ghosts
    ghosts.forEach((ghost) => {
        ghost.draw();
    });

    pacman = new Pacman(5, 2, w / 2 - 10);
    pacman.draw();

    ctx.putImageData(imageDataA, 0, 0);

    // ===== INFO: Tampilkan instruksi (Diperbarui) =====
    console.log("🎮 CONTROLS:");
    console.log("   Arrow Keys = Move Pac-Man");
    console.log("   P = Pause/Resume Visualisasi"); // (dari animation-controls.js)
    console.log("   S = Skip Visualisasi"); // (dari animation-controls.js)
    console.log("   Slider = Atur Kecepatan Visualisasi");
    // ===== AKHIR INFO =====

    gameLoop(); // Mulai game loop
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
        // (Tambahkan logika untuk restart game jika perlu)
        location.reload(); // Cara mudah untuk restart
    }
});

// HAPUS fungsi 'startGhostBFSAnimation()' jika ada di file ini.
// Sudah tidak digunakan lagi.