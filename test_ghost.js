// Test Ghost - Logic untuk menghubungkan Ghost dengan Maze
// File ini akan dipanggil setelah semua library dimuat

var ghosts = [];
var dummyPacman = {
    gridX: 0,
    gridY: 0,
    pixelX: 0,
    pixelY: 0
};

var gameLoopRunning = false;
var frameCount = 0;

// Fungsi untuk mengambil grid dari maze.js
function getGridFromMaze() {
    // Grid global dari maze.js
    return window.grid || [];
}

// Fungsi untuk inisialisasi ghost setelah maze selesai
function initializeGhostsAfterMaze() {
    const cellWidth = 35;
    const cols = Math.floor(cnv.width / cellWidth);
    const rows = Math.floor(cnv.height / cellWidth);
    
    ghosts = [];
    
    // Buat 4 ghost dengan mode CHASE
    let ghost1 = new Ghost(1, 1, { r: 255, g: 0, b: 0 }, cellWidth);
    ghost1.mode = 'CHASE';
    ghosts.push(ghost1);
    
    let ghost2 = new Ghost(cols - 2, 1, { r: 255, g: 184, b: 255 }, cellWidth);
    ghost2.mode = 'CHASE';
    ghosts.push(ghost2);
    
    let ghost3 = new Ghost(1, rows - 2, { r: 0, g: 255, b: 255 }, cellWidth);
    ghost3.mode = 'CHASE';
    ghosts.push(ghost3);
    
    let ghost4 = new Ghost(cols - 2, rows - 2, { r: 255, g: 184, b: 82 }, cellWidth);
    ghost4.mode = 'CHASE';
    ghosts.push(ghost4);
    
    // Inisialisasi Pac-Man di tengah
    dummyPacman.gridX = Math.floor(cols / 2);
    dummyPacman.gridY = Math.floor(rows / 2);
    updatePacmanPixelPosition(cellWidth);
    
    console.log("Ghosts initialized:", ghosts.length);
    console.log("Pac-Man at:", dummyPacman.gridX, dummyPacman.gridY);
    
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

// Cek apakah bisa bergerak ke posisi tertentu
function canMove(fromX, fromY, toX, toY, gridData) {
    const cols = Math.floor(cnv.width / 35);
    const rows = Math.floor(cnv.height / 35);
    
    // Cek batas
    if (toX < 0 || toX >= cols || toY < 0 || toY >= rows) {
        return false;
    }
    
    // Ambil cell dari posisi sekarang
    const fromIndex = fromX + fromY * cols;
    const fromCell = gridData[fromIndex];
    
    if (!fromCell) return false;
    
    // Cek arah perpindahan dan dinding
    const dx = toX - fromX;
    const dy = toY - fromY;
    
    // Cek dinding berdasarkan arah
    // walls = [top, right, bottom, left]
    if (dx === 1 && fromCell.walls[1]) return false;  // Ke kanan
    if (dx === -1 && fromCell.walls[3]) return false; // Ke kiri
    if (dy === 1 && fromCell.walls[2]) return false;  // Ke bawah
    if (dy === -1 && fromCell.walls[0]) return false; // Ke atas
    
    return true;
}

// Game loop utama
function startGameLoop() {
    function loop() {
        if (!gameLoopRunning) return;
        
        frameCount++;
        const cellWidth = 35;
        const gridData = getGridFromMaze();
        
        // Update ghost setiap 20 frame
        if (frameCount % 20 === 0 && gridData) {
            ghosts.forEach(ghost => {
                // Konversi grid ke format yang dibutuhkan ghost (array 2D)
                const cols = Math.floor(cnv.width / cellWidth);
                const rows = Math.floor(cnv.height / cellWidth);
                const mazeGrid2D = [];
                
                for (let j = 0; j < rows; j++) {
                    mazeGrid2D[j] = [];
                    for (let i = 0; i < cols; i++) {
                        const cell = gridData[i + j * cols];
                        // Cell adalah jalan (0) jika bisa diakses
                        mazeGrid2D[j][i] = 0;
                    }
                }
                
                ghost.update(dummyPacman, mazeGrid2D);
                
                // Cek collision
                if (ghost.checkCollision(dummyPacman)) {
                    console.log("COLLISION!");
                    alert("Game Over! Ghost menangkap Pac-Man!");
                    // Reset Pac-Man
                    dummyPacman.gridX = Math.floor(cols / 2);
                    dummyPacman.gridY = Math.floor(rows / 2);
                    updatePacmanPixelPosition(cellWidth);
                }
            });
        }
        
        // Redraw
        if (gridData) {
            clearCanvas(255, 255, 255);
            
            // Draw maze
            for (let cell of gridData) {
                if (cell && cell.show) {
                    cell.show();
                }
            }
            
            // Draw ghosts
            ghosts.forEach(ghost => {
                ghost.draw(imageDataA);
            });
            
            // Draw Pac-Man
            updatePacmanPixelPosition(cellWidth);
            drawPacman();
            
            ctx.putImageData(imageDataA, 0, 0);
        }
        
        requestAnimationFrame(loop);
    }
    
    loop();
}

// Draw Pac-Man
function drawPacman() {
    const cellWidth = 35;
    const pacRadius = cellWidth / 3;
    
    // Gambar Pac-Man dengan lingkaran polar
    lingkaran_polar(imageDataA, dummyPacman.pixelX, dummyPacman.pixelY, 
                   pacRadius, 255, 255, 0);
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

// Hook ke maze completion
// Kita perlu modify maze.js atau panggil manual setelah maze selesai
// Untuk sekarang, kita akan polling untuk cek maze selesai
var checkMazeInterval = setInterval(function() {
    const gridData = getGridFromMaze();
    if (gridData && gridData.length > 0 && !gameLoopRunning) {
        console.log("Maze detected! Initializing ghosts...");
        clearInterval(checkMazeInterval);
        
        // Tunggu sebentar untuk memastikan maze benar-benar selesai
        setTimeout(initializeGhostsAfterMaze, 1000);
    }
}, 500);