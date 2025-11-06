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

let pacman = new Pacman(1, 1, cell_width / 2 - 4);
// HAPUS: let bfsAnimationTriggered = false; // Sudah tidak diperlukan

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
                console.log("💀 COLLISION!");
                sedangGameOver = true;
                tampilkanGameOver(getScore());
                return;
            }
        }
    }

    // 4️⃣ Gambar ulang
    ctx.clearRect(0, 0, cnv.width, cnv.height);
    drawGrid(); // Menggambar grid (termasuk warna dari BFS)
    imageDataA = ctx.getImageData(0, 0, cnv.width, cnv.height);

    pacman.draw(imageDataA); // Gambar Pac-Man
    
    if (typeof ghosts !== "undefined") {
        // Gambar Ghost (dan visualisasi BFS-nya jika state-nya aktif)
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
    requestAnimationFrame(gameLoop);
}

// =====================
// START FUNCTION
// =====================
async function startGameAll() {
    window.cellWidth = cell_width;

    document.addEventListener("keydown", (e) => {
        pacman.setDirection(e);
        
        // HAPUS SEMUA LOGIKA TOMBOL 'B' DARI SINI
        // Ghost sekarang berjalan otomatis
    });

    initializeGhostsAfterMaze();

    // Set posisi awal Pac-Man
    pacman = new Pacman(5, 2, w / 2 - 10); 

    generateDotsFromMaze();

    // HAPUS SEMUA FUNGSI GAMBAR DARI SINI:
    // ghost.draw(); <-- Hapus
    // pacman.draw(); <-- Hapus
    // drawDots(); <-- Hapus
    // ctx.putImageData(imageDataA, 0, 0); <-- Hapus
    // (Semua sudah ditangani oleh gameLoop)

    // ===== INFO: Tampilkan instruksi (Diperbarui) =====
    console.log("🎮 CONTROLS:");
    console.log("   Arrow Keys = Move Pac-Man");
    console.log("   P = Pause/Resume Visualisasi"); // (dari animation-controls.js)
    console.log("   S = Skip Visualisasi"); // (dari animation-controls.js)
    console.log("   Slider = Atur Kecepatan Visualisasi");
    // ===== AKHIR INFO =====

    gameLoop(); // Mulai game loop
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
        // (Tambahkan logika untuk restart game jika perlu)
        // location.reload(); // Cara mudah untuk restart
        tampilkanStartScreen();
        sedangDiStartScreen = true;
        sedangGameOver = false;
        sedangMenang = false;
    }
});

// HAPUS fungsi 'startGhostBFSAnimation()' jika ada di file ini.
// Sudah tidak digunakan lagi.