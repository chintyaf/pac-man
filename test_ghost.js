// test_ghost.js

// === 1. SETUP CANVAS  ===
var cnv = document.querySelector("#canva1");
var contex1 = cnv.getContext("2d");
var imageDataA = contex1.getImageData(0, 0, cnv.width, cnv.height);

// === 2. KONFIGURASI & OBJEK PALSU ===

const TILE_SIZE = 40; // Samakan dengan TILE_SIZE di ghost.js

// --- MAZE PALSU  ---
// Kita buat maze sederhana manual di sini.
// 0 = Jalan, 1 = Tembok
var mazeGrid = [
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 0, 0, 0, 1, 0, 0, 0, 0, 1],
    [1, 0, 1, 0, 1, 0, 1, 1, 0, 1],
    [1, 0, 1, 0, 0, 0, 0, 1, 0, 1],
    [1, 0, 1, 1, 1, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 1, 0, 1, 1, 1, 1],
    [1, 1, 1, 0, 1, 0, 1, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 1, 0, 1, 1],
    [1, 0, 1, 1, 1, 1, 1, 0, 0, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
];

// --- PAC-MAN PALSU (Tugas Elika) ---
// Objek Pac-Man palsu. Ghost hanya butuh tahu posisinya (`gridX`, `gridY`).
var pacman = {
    gridX: 1,
    gridY: 1,
    // Kita tambahkan fungsi draw palsu agar terlihat di layar
    draw: function(imageData) {
        let pixelX = (this.gridX * TILE_SIZE) + (TILE_SIZE / 2);
        let pixelY = (this.gridY * TILE_SIZE) + (TILE_SIZE / 2);
        lingkaran_polar(imageData, pixelX, pixelY, TILE_SIZE / 2 - 4, 255, 255, 0); // Lingkaran kuning
    }
};

// === 3. INISIALISASI GHOST (KODE KAMU) ===
// Buat ghost-mu di sini
var ghost1 = new Ghost(8, 8, {r: 255, g: 0, b: 0}, TILE_SIZE); // Ghost merah di (8,8)
ghost1.mode = 'CHASE'; // Paksa mode CHASE untuk tes BFS

// === 4. GAME LOOP UNTUK TESTING ===

var lastUpdate = 0;
var updateInterval = 500; // Update logika ghost 2x per detik (500ms)

function testLoop(timestamp) {
    // --- 1. Bersihkan Layar ---
    contex1.clearRect(0, 0, cnv.width, cnv.height); 
    imageDataA = contex1.getImageData(0, 0, cnv.width, cnv.height); 
    
    // --- 2. Update Logika (dibatasi interval) ---
    if (timestamp - lastUpdate > updateInterval) {
        lastUpdate = timestamp;
        
        // Update Ghost (panggil fungsi utamamu)
        ghost1.update(pacman, mazeGrid);

        // Cek tabrakan (panggil fungsi utamamu)
        if (ghost1.checkCollision(pacman)) {
            console.log("TABRAKAN! Tes berhasil.");
            // Pindahkan pacman agar game tidak "berhenti"
            pacman.gridX = 1 + Math.floor(Math.random() * 3);
            pacman.gridY = 1 + Math.floor(Math.random() * 3);
        }
    }

    // --- 3. Gambar Semua Elemen ---
    
    // Gambar Maze Palsu
    for (let y = 0; y < mazeGrid.length; y++) {
        for (let x = 0; x < mazeGrid[y].length; x++) {
            if (mazeGrid[y][x] === 1) { // 1 = Tembok
                let p1 = { x: x * TILE_SIZE, y: y * TILE_SIZE };
                let p2 = { x: (x + 1) * TILE_SIZE, y: y * TILE_SIZE };
                let p3 = { x: (x + 1) * TILE_SIZE, y: (y + 1) * TILE_SIZE };
                let p4 = { x: x * TILE_SIZE, y: (y + 1) * TILE_SIZE };
                polygon(imageDataA, [p1, p2, p3, p4], 50, 50, 150); // Tembok biru
            }
        }
    }

    // Gambar Pac-Man Palsu
    pacman.draw(imageDataA);

    // Gambar Ghost (panggil fungsi utamamu)
    ghost1.draw(imageDataA);

    // --- 4. Tampilkan ke Canvas ---
    contex1.putImageData(imageDataA, 0, 0);

    // --- 5. Ulangi Loop ---
    requestAnimationFrame(testLoop);
}

// Mulai Test Loop
console.log("Memulai Test Loop untuk Ghost...");
requestAnimationFrame(testLoop);