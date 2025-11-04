<<<<<<< Updated upstream
// test_ghost.js
=======
// Test Ghost - Logic untuk menghubungkan Ghost dengan Maze
// VISUALISASI ALGORITMA BFS - HANYA 1 GHOST
>>>>>>> Stashed changes

// === 1. SETUP CANVAS (dari grafkom.js) ===
var cnv = document.querySelector("#canva1");
var contex1 = cnv.getContext("2d");
var imageDataA = contex1.getImageData(0, 0, cnv.width, cnv.height);

// === 2. KONFIGURASI & OBJEK PALSU ===

const TILE_SIZE = 40; // Samakan dengan TILE_SIZE di ghost.js

// --- MAZE PALSU (Tugas Chintya) ---
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

<<<<<<< Updated upstream
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
=======
// Fungsi untuk mengambil grid dari maze.js
function getGridFromMaze() {
    return window.grid || [];
}

// Fungsi untuk inisialisasi ghost setelah maze selesai
function initializeGhostsAfterMaze() {
    const cellWidth = 35;
    const cols = Math.floor(cnv.width / cellWidth);
    const rows = Math.floor(cnv.height / cellWidth);
    
    // CLEAR ghosts array
    ghosts = [];
    
    // ===== HANYA 1 GHOST UNTUK VISUALISASI =====
    let ghost1 = new Ghost(1, 1, { r: 255, g: 0, b: 0 }, cellWidth);
    ghost1.mode = 'CHASE';
    
    // ===== PENGATURAN KECEPATAN VISUALISASI =====
    ghost1.stepDelayMs = 800;  // UBAH INI UNTUK MENGATUR KECEPATAN!
                               // 500 = 0.5 detik per step BFS (CUKUP LAMBAT)
                               // 800 = 0.8 detik per step BFS (LAMBAT)
                               // 1000 = 1 detik per step BFS (SANGAT LAMBAT)
                               // 1500 = 1.5 detik per step BFS (SUPER LAMBAT - SANGAT JELAS)
                               // 2000 = 2 detik per step BFS (ULTRA LAMBAT)
                               // 200 = 0.2 detik per step BFS (CEPAT)
    
    ghosts.push(ghost1);
    
    console.log("===========================================");
    console.log("VISUALISASI ALGORITMA BFS");
    console.log("Total Ghost:", ghosts.length);
    console.log("Step Delay:", ghost1.stepDelay, "frames");
    console.log("===========================================");
    
    // Inisialisasi Pac-Man di tengah
    dummyPacman.gridX = Math.floor(cols / 2);
    dummyPacman.gridY = Math.floor(rows / 2);
    updatePacmanPixelPosition(cellWidth);
    
    console.log("Ghost position:", ghosts[0].gridX, ghosts[0].gridY);
    console.log("Pac-Man position:", dummyPacman.gridX, dummyPacman.gridY);
    
    // Mulai game loop
    if (!gameLoopRunning) {
        gameLoopRunning = true;
        startGameLoop();
    }
}

// Update posisi pixel Pac-Man
function updatePacmanPixelPosition(cellWidth) {
    dummyPacman.pixelX = dummyPacman.gridX * cellWidth + cellWidth / 2;
    dummyPacman.pixelY = dummyPacman.gridY * cellWidth + cellWidth / 2;
}

// Game loop utama
function startGameLoop() {
    function loop() {
        if (!gameLoopRunning) return;
        
        frameCount++;
        const cellWidth = 35;
        const gridData = getGridFromMaze();
        
        // Update ghost SETIAP FRAME
        // Ghost.update() sudah punya internal delay
        if (gridData) {
            ghosts.forEach(ghost => {
                const cols = Math.floor(cnv.width / cellWidth);
                const rows = Math.floor(cnv.height / cellWidth);
                const mazeGrid2D = [];
                
                for (let j = 0; j < rows; j++) {
                    mazeGrid2D[j] = [];
                    for (let i = 0; i < cols; i++) {
                        mazeGrid2D[j][i] = 0;
                    }
                }
                
                ghost.update(dummyPacman, mazeGrid2D);
                
                // Cek collision
                if (ghost.checkCollision(dummyPacman)) {
                    console.log("COLLISION! Ghost caught Pac-Man!");
                    alert("Game Over! Ghost menangkap Pac-Man!\n\nGhost berhasil menemukan jalur terpendek menggunakan BFS!");
                    dummyPacman.gridX = Math.floor(cols / 2);
                    dummyPacman.gridY = Math.floor(rows / 2);
                    updatePacmanPixelPosition(cellWidth);
                    
                    // Reset ghost ke posisi awal
                    ghost.gridX = 1;
                    ghost.gridY = 1;
                    ghost.pixelX = (ghost.gridX * cellWidth) + (cellWidth / 2);
                    ghost.pixelY = (ghost.gridY * cellWidth) + (cellWidth / 2);
                    ghost.isSearching = false;
                    ghost.bfsQueue = [];
                    ghost.visited.clear();
                }
            });
>>>>>>> Stashed changes
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
<<<<<<< Updated upstream
=======
            
            // ===== VISUALISASI ALGORITMA BFS =====
            // Draw visualisasi SEBELUM ghost, agar ghost di atas
            ghosts.forEach(ghost => {
                ghost.drawVisualization(imageDataA);
            });
            
            // Draw ghosts
            ghosts.forEach(ghost => {
                ghost.draw(imageDataA);
            });
            
            // Draw Pac-Man
            updatePacmanPixelPosition(cellWidth);
            drawPacman();
            
            // Draw legend untuk visualisasi
            drawLegend();
            
            ctx.putImageData(imageDataA, 0, 0);
>>>>>>> Stashed changes
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

<<<<<<< Updated upstream
// Mulai Test Loop
console.log("Memulai Test Loop untuk Ghost...");
requestAnimationFrame(testLoop);
=======
// Draw Pac-Man
function drawPacman() {
    const cellWidth = 35;
    const pacRadius = cellWidth / 3;
    
    // Gambar Pac-Man dengan lingkaran polar
    lingkaran_polar(imageDataA, dummyPacman.pixelX, dummyPacman.pixelY, 
                   pacRadius, 255, 255, 0);
}

// Draw legend untuk visualisasi algoritma
function drawLegend() {
    // Legend di pojok kanan atas
    const startX = cnv.width - 200;
    const startY = 10;
    const boxSize = 20;
    const spacing = 25;
    
    // Background legend
    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
    ctx.fillRect(startX - 10, startY - 5, 195, 115);
    ctx.strokeStyle = 'black';
    ctx.strokeRect(startX - 10, startY - 5, 195, 115);
    
    // Title
    ctx.fillStyle = 'black';
    ctx.font = 'bold 14px Arial';
    ctx.textAlign = 'left';
    ctx.fillText('BFS Visualization', startX, startY + 12);
    
    // Visited (biru)
    ctx.fillStyle = 'rgb(173, 216, 230)';
    ctx.fillRect(startX, startY + 25, boxSize, boxSize);
    ctx.strokeRect(startX, startY + 25, boxSize, boxSize);
    ctx.fillStyle = 'black';
    ctx.font = '12px Arial';
    ctx.fillText('Visited', startX + boxSize + 5, startY + 40);
    
    // Queue (kuning)
    ctx.fillStyle = 'rgb(255, 255, 150)';
    ctx.fillRect(startX, startY + 25 + spacing, boxSize, boxSize);
    ctx.strokeRect(startX, startY + 25 + spacing, boxSize, boxSize);
    ctx.fillStyle = 'black';
    ctx.fillText('In Queue', startX + boxSize + 5, startY + 40 + spacing);
    
    // Current path (hijau)
    ctx.fillStyle = 'rgb(144, 238, 144)';
    ctx.fillRect(startX, startY + 25 + spacing * 2, boxSize, boxSize);
    ctx.strokeRect(startX, startY + 25 + spacing * 2, boxSize, boxSize);
    ctx.fillStyle = 'black';
    ctx.fillText('Exploring', startX + boxSize + 5, startY + 40 + spacing * 2);
    
    // Final path (merah)
    ctx.fillStyle = 'rgb(255, 100, 100)';
    ctx.fillRect(startX, startY + 25 + spacing * 3, boxSize, boxSize);
    ctx.strokeRect(startX, startY + 25 + spacing * 3, boxSize, boxSize);
    ctx.fillStyle = 'black';
    ctx.fillText('Final Path', startX + boxSize + 5, startY + 40 + spacing * 3);
}

// Keyboard control untuk Pac-Man
document.addEventListener('keydown', function(e) {
    if (!gameLoopRunning) return;
    
    const cellWidth = 35;
    const gridData = getGridFromMaze();
    if (!gridData) return;
    
    let newGridX = dummyPacman.gridX;
    let newGridY = dummyPacman.gridY;
    
    switch(e.key) {
        case 'ArrowUp':
            newGridY--;
            break;
        case 'ArrowDown':
            newGridY++;
            break;
        case 'ArrowLeft':
            newGridX--;
            break;
        case 'ArrowRight':
            newGridX++;
            break;
        default:
            return;
    }
    
    // Cek apakah bisa bergerak
    if (canMove(dummyPacman.gridX, dummyPacman.gridY, newGridX, newGridY, gridData)) {
        dummyPacman.gridX = newGridX;
        dummyPacman.gridY = newGridY;
        console.log("Pac-Man moved to:", newGridX, newGridY);
    } else {
        console.log("Can't move - wall detected!");
    }
    
    e.preventDefault();
});

// Cek apakah bisa bergerak ke posisi tertentu
function canMove(fromX, fromY, toX, toY, gridData) {
    const cols = Math.floor(cnv.width / 35);
    const rows = Math.floor(cnv.height / 35);
    
    if (toX < 0 || toX >= cols || toY < 0 || toY >= rows) {
        return false;
    }
    
    const fromIndex = fromX + fromY * cols;
    const fromCell = gridData[fromIndex];
    
    if (!fromCell) return false;
    
    const dx = toX - fromX;
    const dy = toY - fromY;
    
    // walls = [top, right, bottom, left]
    if (dx === 1 && fromCell.walls[1]) return false;  // Ke kanan
    if (dx === -1 && fromCell.walls[3]) return false; // Ke kiri
    if (dy === 1 && fromCell.walls[2]) return false;  // Ke bawah
    if (dy === -1 && fromCell.walls[0]) return false; // Ke atas
    
    return true;
}

// Hook ke maze completion
// Tunggu hingga maze selesai dibuat
var checkMazeInterval = setInterval(function() {
    const gridData = getGridFromMaze();
    if (gridData && gridData.length > 0 && !gameLoopRunning) {
        console.log("Maze detected! Grid length:", gridData.length);
        clearInterval(checkMazeInterval);
        
        // Tunggu sebentar untuk memastikan maze benar-benar selesai
        setTimeout(function() {
            console.log("Initializing ghost (ONLY 1)...");
            initializeGhostsAfterMaze();
        }, 2000);
    }
}, 500);
>>>>>>> Stashed changes
