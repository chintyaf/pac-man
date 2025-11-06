// ===================================
// GHOST.JS (Versi Final Bersih)
// ===================================

class Ghost {
    constructor(x, y, color) {
        this.gridX = x;
        this.gridY = y;
        this.color = color;
        this.tileSize = window.cellWidth;
        this.mode = "CHASE";

        this.pixelX = this.gridX * this.tileSize + this.tileSize / 2;
        this.pixelY = this.gridY * this.tileSize + this.tileSize / 2;

        this.currentDir = { x: 0, y: 0 };
        this.speed = 2; // Kecepatan gerak (pixel per frame)

        // --- State Machine untuk Siklus BFS ---
        // "IDLE": Diam di tengah tile, siap mencari
        // "VISUALIZING_BFS": Menjalankan animateBFS (lambat/cepat)
        // "MOVING_ONE_STEP": Bergerak (pixel-per-pixel) ke tile berikutnya
        this.state = "IDLE"; 
        
        // --- Variabel Visualisasi BFS (dari kode Anda) ---
        this.isAnimatingBFS = false; // Akan dikontrol oleh state
        this.bfsQueue = [];
        this.bfsVisited = new Set();
        this.bfsCurrentNode = null;
        this.bfsExploring = [];
        this.bfsFinalPath = [];
        this.bfsStep = 0;
    }

    // ===============================================================
    // FUNGSI UTAMA: UPDATE (State Machine)
    // ===============================================================
    /**
     * Memperbarui posisi dan logika Ghost setiap frame.
     * @param {Pacman} pacman - Objek Pacman yang akan dikejar.
     */
    update(pacman) {
        // State 1: Jika sedang bergerak, lanjutkan sampai selesai
        if (this.state === "MOVING_ONE_STEP") {
            this.movePixelByPixel();
            return; // Jangan lakukan apa-apa lagi frame ini
        }

        // Cek apakah kita di tengah tile
        const atTileCenter = this.isAtTileCenter();

        // State 2: Jika IDLE dan di tengah tile, mulai siklus pencarian
        if (this.state === "IDLE" && atTileCenter) {
            // Update posisi grid internal kita
            this.gridX = Math.floor(this.pixelX / this.tileSize);
            this.gridY = Math.floor(this.pixelY / this.tileSize);

            // Mulai siklus BFS
            this.state = "VISUALIZING_BFS";
            this.isAnimatingBFS = true; // Untuk memicu visualisasi di .draw()
            this.runBfsCycle(pacman);
        }
    }

    /**
     * Memulai siklus: (1) Visualisasi BFS -> (2) Bergerak
     */
    async runBfsCycle(pacman) {
        // 1. MENCARI (Visualisasi BFS)
        
        // Reset 'skip' setiap kali siklus baru dimulai
        // 'animationState' adalah variabel global dari animation-controls.js
        if (window.animationState) {
            window.animationState.shouldSkip = false;
        }
        
        // Panggil animateBFS, yang MENGGUNAKAN "await sleep()"
        const path = await this.animateBFS(pacman);

        // 2. BERGERAK (Maju Satu Langkah)
        if (path && path.length > 1) {
            const nextStep = path[1]; // Ambil langkah kedua (langkah pertama adalah posisi kita)
            this.currentDir = {
                x: nextStep.x - this.gridX,
                y: nextStep.y - this.gridY
            };
        } else {
            // Tidak ada path / terjebak / Pac-Man di atas kita
            this.currentDir = { x: 0, y: 0 };
        }
        
        // Ubah state
        this.state = "MOVING_ONE_STEP";
        this.isAnimatingBFS = false; // Selesai visualisasi
    }

    /**
     * Helper: Memindahkan ghost (pixel-per-pixel)
     */
    movePixelByPixel() {
        if (!this.currentDir || (this.currentDir.x === 0 && this.currentDir.y === 0)) {
            this.state = "IDLE";
            return;
        }

        // Terapkan pergerakan pixel
        this.pixelX += this.currentDir.x * this.speed;
        this.pixelY += this.currentDir.y * this.speed;

        // Cek apakah sudah sampai (atau melewati) tile berikutnya
        if (this.isAtTileCenter()) {
            // Snap (paskan) posisi ke tengah grid
            const nextGridX = this.gridX + this.currentDir.x;
            const nextGridY = this.gridY + this.currentDir.y;
            this.pixelX = nextGridX * this.tileSize + this.tileSize / 2;
            this.pixelY = nextGridY * this.tileSize + this.tileSize / 2;
            
            // Selesai bergerak, kembali IDLE untuk siklus berikutnya
            this.state = "IDLE"; 
        }
    }

    /**
     * Helper: Cek apakah ghost tepat di tengah tile
     */
    isAtTileCenter() {
        // Gunakan toleransi berdasarkan kecepatan
        const tolerance = this.speed > 0 ? this.speed : 1; 
        const centerOffset = this.tileSize / 2;

        const xDist = Math.abs((this.pixelX - centerOffset) % this.tileSize);
        const yDist = Math.abs((this.pixelY - centerOffset) % this.tileSize);

        // Cek jika jarak ke tengah tile (offset) lebih kecil dari toleransi
        const xInCenter = xDist < tolerance || xDist > (this.tileSize - tolerance);
        const yInCenter = yDist < tolerance || yDist > (this.tileSize - tolerance);
        
        return xInCenter && yInCenter;
    }

    // ===============================================================
    // GAMBAR (DRAW)
    // ===============================================================
    draw(imageDataA) {
        // 1. Gambar Ghost (Salin kode draw() Anda yang lama)
        const radius = this.tileSize / 2 - 15;
        const headY = this.pixelY - radius / 3;

        lingkaran_polar(imageDataA, this.pixelX, headY, radius,
            this.color.r, this.color.g, this.color.b);

        const bodyShape = [
            { x: -radius, y: -radius / 3 }, { x: -radius, y: radius },
            { x: -radius + radius / 2, y: radius - radius / 3 }, { x: 0, y: radius },
            { x: radius - radius / 2, y: radius - radius / 3 }, { x: radius, y: radius },
            { x: radius, y: -radius / 3 },
        ];
        const T = { x: this.pixelX, y: this.pixelY };
        const translatedShape = translasi_array(bodyShape, T);
        polygon(imageDataA, translatedShape, this.color.r, this.color.g, this.color.b);

        const eyeRadius = radius / 5;
        const eyeOffsetX = radius / 2.5;
        const eyeOffsetY = -(radius / 3);
        lingkaran_polar(imageDataA, this.pixelX - eyeOffsetX, this.pixelY + eyeOffsetY, eyeRadius, 255, 255, 255);
        lingkaran_polar(imageDataA, this.pixelX + eyeOffsetX, this.pixelY + eyeOffsetY, eyeRadius, 255, 255, 255);

        // (Anda mungkin punya kode safeFill di sini, biarkan saja)
        
        // 2. Gambar Visualisasi BFS (HANYA jika state-nya pas)
        if (this.state === "VISUALIZING_BFS") {
            this.drawBFSVisualization(); 
        }
    }

    // ===============================================================
    // LOGIKA INTI: VISUALISASI BFS
    // ===============================================================

    /**
     * Menjalankan BFS step-by-step.
     * PENTING: Memanggil 'await sleep()' dari animation-controls.js
     */
    async animateBFS(pacman) {
        // 1. SETUP
        this.bfsStep = 0;
        const grid = window.grid;
        
        const start = { x: this.gridX, y: this.gridY };
        const end = { x: pacman.i, y: pacman.j }; // Target adalah posisi Pac-Man
        
        const queue = [[start]]; // Simpan path, bukan cuma node
        const visited = new Set();
        visited.add(`${start.x},${start.y}`);
        
        // Set state awal untuk visualisasi
        this.bfsQueue = [start];
        this.bfsVisited = visited;
        this.bfsFinalPath = [];
        
        setStatus("🔍 BFS: Mencari Pac-Man");
        setMessage(`Start: (${start.x},${start.y}) → Target: (${end.x},${end.y})`);
        
        // INI KUNCINYA: Memanggil sleep() dari animation-controls.js
        // Ini akan otomatis pause/skip/delay sesuai slider
        await sleep(); 
        
        var foundPath = null;
        
        // 2. BFS LOOP
        while (queue.length > 0) {
            this.bfsStep++;
            const path = queue.shift();
            const pos = path[path.length - 1];
            
            // Update state visualisasi
            this.bfsCurrentNode = pos;
            this.bfsQueue = queue.map(p => p[p.length - 1]);
            this.bfsExploring = [];
            
            setStatus(`📦 BFS Step ${this.bfsStep}: DEQUEUE`);
            setMessage(`Mengambil node (${pos.x}, ${pos.y}) dari queue`);
            await sleep(); // <-- KONTROL ANIMASI
            
            // Cek Goal
            if (pos.x === end.x && pos.y === end.y) {
                setStatus(`🎉 BFS: PATH DITEMUKAN!`);
                setMessage(`Panjang jalur: ${path.length} langkah`);
                foundPath = path;
                this.bfsFinalPath = path;
                await sleep(); // <-- KONTROL ANIMASI
                break;
            }
            
            // Explore Neighbors
            const validMoves = this._getValidMovesFromGrid(pos.x, pos.y);
            
            for (const move of validMoves) {
                const nextX = pos.x + move.x;
                const nextY = pos.y + move.y;
                const nextPosKey = `${nextX},${nextY}`;
                
                this.bfsExploring.push({ x: nextX, y: nextY });
                await sleep(); // <-- KONTROL ANIMASI
                
                if (!visited.has(nextPosKey)) {
                    visited.add(nextPosKey);
                    const newPath = [...path, { x: nextX, y: nextY }];
                    queue.push(newPath);
                    
                    this.bfsVisited = new Set(visited); // Update set
                    this.bfsQueue = queue.map(p => p[p.length - 1]);
                    
                    setMessage(`✅ (${nextX}, ${nextY}) ditambahkan ke queue`);
                } else {
                    setMessage(`❌ (${nextX}, ${nextY}) sudah visited`);
                }
                await sleep(); // <-- KONTROL ANIMASI
            }
            this.bfsExploring = [];
        }
        
        // 3. SELESAI & CLEANUP
        // Reset state visualisasi
        this.bfsCurrentNode = null;
        this.bfsQueue = [];
        this.bfsVisited = new Set();
        this.bfsExploring = [];
        
        // Reset warna grid
        for (var c of grid) {
            c.color = [40, 30, 40];
            c.sedangDicek = false;
        }
        
        return foundPath; // Kembalikan path
    }

    /**
     * Menggambar state BFS saat ini (dipanggil dari draw())
     * (Salin dari kode Anda, pastikan 'grid' menjadi 'window.grid')
     */
    drawBFSVisualization() {
        const grid = window.grid; // Pastikan menggunakan window.grid
        if (!grid) return;

        // 1. Visited (biru muda)
        this.bfsVisited.forEach(function(key) {
            var coords = key.split(',');
            var cell = grid[index(parseInt(coords[0]), parseInt(coords[1]))];
            if (cell) cell.color = [200, 230, 255];
        });
        
        // 2. Queue (kuning)
        this.bfsQueue.forEach(node => {
            var cell = grid[index(node.x, node.y)];
            if (cell) cell.color = [255, 255, 150];
        });
        
        // 3. Current node (hijau terang)
        if (this.bfsCurrentNode) {
            var cell = grid[index(this.bfsCurrentNode.x, this.bfsCurrentNode.y)];
            if (cell) cell.color = [50, 255, 50];
        }
        
        // 4. Exploring (orange)
        this.bfsExploring.forEach(node => {
            var cell = grid[index(node.x, node.y)];
            if (cell) cell.color = [255, 200, 100];
        });
        
        // 5. Final path (merah)
        this.bfsFinalPath.forEach(pos => {
            var cell = grid[index(pos.x, pos.y)];
            if (cell) cell.color = [255, 50, 50];
        });
    }

    // --- FUNGSI BAWAAN ANDA ---

    _getValidMovesFromGrid(x, y) {
        const directions = [ { x: 0, y: -1 }, { x: 0, y: 1 }, { x: -1, y: 0 }, { x: 1, y: 0 } ];
        const validMoves = [];
        const mazeGrid = window.grid || [];
        const cols = Math.floor(cnv.width / this.tileSize);
        const rows = Math.floor(cnv.height / this.tileSize);
        
        // Asumsi 'index' adalah fungsi global dari 'grid.js'
        const currentIndex = index(x, y); 
        if (!mazeGrid[currentIndex]) return validMoves;
        const currentCell = mazeGrid[currentIndex];

        for (let i = 0; i < directions.length; i++) {
            const dir = directions[i];
            let hasWall = false;
            
            // Cek dinding berdasarkan 'currentCell.walls'
            if (dir.y === -1) hasWall = currentCell.walls[0]; // Top
            else if (dir.y === 1) hasWall = currentCell.walls[2]; // Bottom
            else if (dir.x === -1) hasWall = currentCell.walls[3]; // Left
            else if (dir.x === 1) hasWall = currentCell.walls[1]; // Right
            
            if (!hasWall) {
                validMoves.push(dir);
            }
        }
        return validMoves;
    }

    checkCollision(pacman) {
        // Cek tabrakan berdasarkan pixel
        const dx = this.pixelX - pacman.x;
        const dy = this.pixelY - pacman.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        // Cek jika jarak lebih kecil dari radius gabungan
        return distance < (this.tileSize / 2 - 10) + pacman.radius;
    }

    // --- FUNGSI LAMA (TIDAK DIPAKAI OLEH STATE MACHINE) ---
    // Anda bisa menghapus ini, tapi saya biarkan di sini
    // untuk jaga-jaga jika Anda membutuhkannya lagi

    _findNextMoveRandom(mazeGrid) {
        const validMoves = this._getValidMovesFromGrid(this.gridX, this.gridY);
        if (validMoves.length > 0) {
            const randomIndex = Math.floor(Math.random() * validMoves.length);
            return validMoves[randomIndex];
        }
        return { x: 0, y: 0 };
    }

    _findNextMoveBFS(pacman, mazeGrid) {
        const start = { x: this.gridX, y: this.gridY };
        const end = { x: pacman.i, y: pacman.j };

        const queue = [[start]];
        const visited = new Set();
        visited.add(`${start.x},${start.y}`);

        while (queue.length > 0) {
            const path = queue.shift();
            const pos = path[path.length - 1];

            if (pos.x === end.x && pos.y === end.y) {
                if (path.length > 1) {
                    const nextStep = path[1];
                    return { x: nextStep.x - start.x, y: nextStep.y - start.y };
                }
                return { x: 0, y: 0 };
            }

            const validMoves = this._getValidMovesFromGrid(pos.x, pos.y);
            for (const move of validMoves) {
                const nextX = pos.x + move.x;
                const nextY = pos.y + move.y;
                const nextPosKey = `${nextX},${nextY}`;

                if (!visited.has(nextPosKey)) {
                    visited.add(nextPosKey);
                    const newPath = [...path, { x: nextX, y: nextY }];
                    queue.push(newPath);
                }
            }
        }
        return this._findNextMoveRandom(mazeGrid);
    }
}

// ===============================================================
// INISIALISASI GHOST (Kode lama Anda)
// ===============================================================

var ghosts = [];
var gameLoopRunning = false;
// var frameCount = 0; // Sebaiknya 'frameCount' ada di 'after.js'

function getGridFromMaze() {
    return window.grid || [];
}

function initializeGhostsAfterMaze() {
    const cols = Math.floor(cnv.width / cell_width);
    const rows = Math.floor(cnv.height / cell_width);
    ghosts = [];

    let ghost1 = new Ghost(0, 0, { r: 255, g: 0, b: 0 });
    ghost1.mode = "CHASE";
    ghosts.push(ghost1);

    console.log("👻 Ghost initialized with BFS animation");
}

function canMove(fromX, fromY, toX, toY, gridData) {
    const cols = Math.floor(cnv.width / 35); // Hati-hati, ini hardcoded 35
    const rows = Math.floor(cnv.height / 35); // Sebaiknya gunakan cell_width

    if (toX < 0 || toX >= cols || toY < 0 || toY >= rows) {
        return false;
    }

    const fromIndex = fromX + fromY * cols;
    const fromCell = gridData[fromIndex];
    if (!fromCell) return false;

    const dx = toX - fromX;
    const dy = toY - fromY;

    if (dx === 1 && fromCell.walls[1]) return false;
    if (dx === -1 && fromCell.walls[3]) return false;
    if (dy === 1 && fromCell.walls[2]) return false;
    if (dy === -1 && fromCell.walls[0]) return false;

    return true;
} 