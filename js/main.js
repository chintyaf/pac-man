// js/main.js

// === SETUP GLOBAL ===
// Ambil canvas dan context (kode dari grafkom.js)
var cnv = document.querySelector("#canva1");
var contex1 = cnv.getContext("2d");
var imageDataA = contex1.getImageData(0, 0, cnv.width, cnv.height);

// Variabel global game
const TILE_SIZE = 40; // Ukuran 1 petak (pixel)
var gameState = 'PLAYING'; // 'START', 'PLAYING', 'GAME_OVER'

// === INISIALISASI GAME OBJECTS ===

// Placeholder untuk Maze (Tugas Chintya)
// Asumsi: 0 = jalan, 1 = tembok
var mazeGrid = [
    [0, 0, 0, 0, 1, 0, 0, 0, 0, 0],
    [0, 1, 1, 0, 1, 0, 1, 1, 1, 0],
    [0, 1, 0, 0, 0, 0, 0, 0, 1, 0],
    [0, 1, 0, 1, 1, 1, 1, 0, 1, 0],
    [0, 0, 0, 0, 0, 0, 1, 0, 0, 0],
    [0, 1, 1, 1, 1, 0, 1, 1, 1, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
];
// (Nantinya, panggil fungsi Chintya di sini, e.g., var mazeGrid = createMazeKruskal())

// Placeholder untuk Pac-Man (Tugas Elika)
var pacman = {
    gridX: 1,
    gridY: 1,
    pixelX: (1 * TILE_SIZE) + (TILE_SIZE / 2),
    pixelY: (1 * TILE_SIZE) + (TILE_SIZE / 2),
    draw: function(imageData) {
        // Elika akan menggambar Pac-Man di sini
        lingkaran_polar(imageData, this.pixelX, this.pixelY, TILE_SIZE/2 - 2, 255, 255, 0);
    },
    update: function() {
        // Elika akan mengatur kontrol keyboard di sini 
    },
    // ... (property lain)
};

// Inisialisasi Ghost (TUGAS BRIGITTA)
var ghost1 = new Ghost(8, 5, {r: 255, g: 0, b: 0}, TILE_SIZE); // Ghost merah
var ghost2 = new Ghost(1, 5, {r: 0, g: 255, b: 255}, TILE_SIZE); // Ghost cyan
ghost2.mode = 'CHASE'; // Ghost ini akan langsung mengejar 

var allGhosts = [ghost1, ghost2];

// Placeholder untuk UI (Tugas Felicia)
// ... (misal: drawScore(), drawGameOver()) 

// === GAME LOOP UTAMA ===
// (Ini adalah fungsi draw() dari grafkom.js, tapi lebih terstruktur)

var lastUpdate = 0;
var updateInterval = 200; // Update logika game setiap 200ms (5x per detik)

function gameLoop(timestamp) {
    if (gameState !== 'PLAYING') {
        // (Tampilkan menu game over / start)
        // (Panggil fungsi Felicia di sini)
        return; // Stop loop jika game over
    }

    // --- 1. Bersihkan Layar ---
    // Cara cepat membersihkan canvas
    contex1.clearRect(0, 0, cnv.width, cnv.height); 
    // Ambil imageData baru yang bersih
    imageDataA = contex1.getImageData(0, 0, cnv.width, cnv.height); 
    
    // --- 2. Update Logika Game ---
    // Kita perlambat update logika agar game tidak terlalu cepat
    if (timestamp - lastUpdate > updateInterval) {
        lastUpdate = timestamp;
        
        // Update Pac-Man
        pacman.update();
        
        // Update semua Ghost (TUGAS BRIGITTA)
        for (const ghost of allGhosts) {
            ghost.update(pacman, mazeGrid); [cite: 38]
        }

        // Cek Tabrakan (TUGAS BRIGITTA)
        for (const ghost of allGhosts) {
            if (ghost.checkCollision(pacman)) { [cite: 38]
                console.log("GAME OVER!");
                gameState = 'GAME_OVER'; // Hentikan game [cite: 16]
            }
        }
    }

    // --- 3. Gambar Semua Elemen ---
    
    // Gambar Maze (Tugas Chintya)
    // (Placeholder: gambar grid)
    for (let y = 0; y < mazeGrid.length; y++) {
        for (let x = 0; x < mazeGrid[y].length; x++) {
            if (mazeGrid[y][x] === 1) { // 1 = Tembok 
                // Gambar kotak tembok (bisa pakai 'polygon' atau 4 'dda_line')
                let p1 = { x: x * TILE_SIZE, y: y * TILE_SIZE };
                let p2 = { x: (x + 1) * TILE_SIZE, y: y * TILE_SIZE };
                let p3 = { x: (x + 1) * TILE_SIZE, y: (y + 1) * TILE_SIZE };
                let p4 = { x: x * TILE_SIZE, y: (y + 1) * TILE_SIZE };
                polygon(imageDataA, [p1, p2, p3, p4], 0, 0, 255);
            }
        }
    }

    // Gambar Pac-Man (Tugas Elika)
    pacman.draw(imageDataA);

    // Gambar Ghost (TUGAS BRIGITTA)
    for (const ghost of allGhosts) {
        ghost.draw(imageDataA); [cite: 38]
    }

    // Gambar UI/Skor (Tugas Felicia)
    // (panggil fungsi Felicia di sini)

    // --- 4. Tampilkan ke Canvas ---
    contex1.putImageData(imageDataA, 0, 0);

    // --- 5. Ulangi Loop ---
    requestAnimationFrame(gameLoop);
}

// Mulai Game Loop
console.log("Memulai Game Loop...");
requestAnimationFrame(gameLoop);