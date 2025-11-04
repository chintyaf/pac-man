/**
 * ========================================
 * GHOST CLASS - VISUALISASI ALGORITMA BFS
 * ========================================
 * 
 * File ini berisi implementasi Ghost yang menggunakan
 * algoritma BFS (Breadth-First Search) untuk pathfinding
 * dengan visualisasi step-by-step
 */

class Ghost {
    constructor(x, y, color, tileSize) {
        this.gridX = x;
        this.gridY = y;
        this.color = color;
        this.tileSize = tileSize;
        this.mode = 'CHASE';

        this.pixelX = (this.gridX * this.tileSize) + (this.tileSize / 2);
        this.pixelY = (this.gridY * this.tileSize) + (this.tileSize / 2);
        
        this.currentDir = { x: 0, y: 0 };
        
        // ===== PENGATURAN VISUALISASI =====
        this.visualMode = true;
        this.stepDelay = 800;      // DELAY ANTAR STEP (frame) - UBAH INI UNTUK MEMPERCEPAT/MEMPERLAMBAT
                                   // Nilai lebih besar = lebih lambat
                                   // Nilai lebih kecil = lebih cepat
        
        // ===== DATA STRUKTUR BFS =====
        this.bfsQueue = [];       // Queue: Antrian path yang akan dieksplorasi
        this.visited = new Set(); // Visited: Set node yang sudah dikunjungi
        this.currentPath = [];    // Current Path: Path yang sedang dieksplorasi
        this.finalPath = [];      // Final Path: Jalur terpendek yang ditemukan
        
        // ===== STATUS PENCARIAN =====
        this.isSearching = false; // Apakah sedang dalam proses pencarian
        this.searchStep = 0;      // Nomor step saat ini
        this.frameCounter = 0;    // Counter untuk delay
    }

    /**
     * ========================================
     * FUNGSI 1: MENGGAMBAR GHOST
     * ========================================
     */
    draw(imageDataA) {
        const radius = (this.tileSize / 2) - 4;
        const headY = this.pixelY - (radius / 3);
        
        // Gambar kepala (lingkaran)
        lingkaran_polar(imageDataA, this.pixelX, headY, radius, 
                       this.color.r, this.color.g, this.color.b);

        // Gambar badan (polygon bergelombang)
        const bodyShape = [
            { x: -radius, y: -radius / 3 },
            { x: -radius, y: radius },
            { x: -radius + (radius/2), y: radius - (radius/3) },
            { x: 0, y: radius },
            { x: radius - (radius/2), y: radius - (radius/3) },
            { x: radius, y: radius },
            { x: radius, y: -radius / 3 }
        ];

        const T = { x: this.pixelX, y: this.pixelY };
        const translatedShape = translasi_array(bodyShape, T);
        polygon(imageDataA, translatedShape, this.color.r, this.color.g, this.color.b);

        // Gambar mata
        const eyeRadius = radius / 5;
        const eyeOffsetX = radius / 2.5;
        const eyeOffsetY = - (radius / 3);

        lingkaran_polar(imageDataA, this.pixelX - eyeOffsetX, this.pixelY + eyeOffsetY, 
                       eyeRadius, 255, 255, 255);
        lingkaran_polar(imageDataA, this.pixelX + eyeOffsetX, this.pixelY + eyeOffsetY, 
                       eyeRadius, 255, 255, 255);
    }

    /**
     * ========================================
     * FUNGSI 2: VISUALISASI ALGORITMA BFS
     * ========================================
     * Menggambar warna-warna yang merepresentasikan
     * berbagai tahap algoritma BFS
     */
    drawVisualization(imageDataA) {
        if (!this.visualMode) return;
        
        const cellWidth = this.tileSize;
        
        // === STEP 1: GAMBAR VISITED NODES (Biru) ===
        // Node yang sudah pernah dikunjungi dalam proses BFS
        this.visited.forEach(key => {
            const [x, y] = key.split(',').map(Number);
            
            // Fill cell dengan warna biru
            for (let px = 2; px < cellWidth - 2; px++) {
                for (let py = 2; py < cellWidth - 2; py++) {
                    gbr_titik(imageDataA, x * cellWidth + px, y * cellWidth + py, 
                             173, 216, 230); // Light Blue
                }
            }
        });
        
        // === STEP 2: GAMBAR QUEUE NODES (Kuning) ===
        // Node yang ada dalam antrian BFS (akan dieksplorasi)
        this.bfsQueue.forEach(pathArray => {
            const pos = pathArray[pathArray.length - 1];
            
            for (let px = 2; px < cellWidth - 2; px++) {
                for (let py = 2; py < cellWidth - 2; py++) {
                    gbr_titik(imageDataA, pos.x * cellWidth + px, pos.y * cellWidth + py, 
                             255, 255, 150); // Light Yellow
                }
            }
        });
        
        // === STEP 3: GAMBAR CURRENT PATH (Hijau) ===
        // Path yang sedang dieksplorasi saat ini
        if (this.currentPath.length > 0) {
            this.currentPath.forEach(pos => {
                for (let px = 2; px < cellWidth - 2; px++) {
                    for (let py = 2; py < cellWidth - 2; py++) {
                        gbr_titik(imageDataA, pos.x * cellWidth + px, pos.y * cellWidth + py, 
                                 144, 238, 144); // Light Green
                    }
                }
            });
        }
        
        // === STEP 4: GAMBAR FINAL PATH (Merah) ===
        // Jalur terpendek yang sudah ditemukan
        if (this.finalPath.length > 0) {
            // Fill cells
            this.finalPath.forEach(pos => {
                for (let px = 2; px < cellWidth - 2; px++) {
                    for (let py = 2; py < cellWidth - 2; py++) {
                        gbr_titik(imageDataA, pos.x * cellWidth + px, pos.y * cellWidth + py, 
                                 255, 100, 100); // Red
                    }
                }
            });
            
            // Gambar garis menghubungkan path
            for (let i = 0; i < this.finalPath.length - 1; i++) {
                const from = this.finalPath[i];
                const to = this.finalPath[i + 1];
                dda_line(imageDataA, 
                        from.x * cellWidth + cellWidth/2, 
                        from.y * cellWidth + cellWidth/2,
                        to.x * cellWidth + cellWidth/2, 
                        to.y * cellWidth + cellWidth/2,
                        255, 0, 0);
            }
        }
    }

    /**
     * ========================================
     * FUNGSI 3: UPDATE GHOST (Main Loop)
     * ========================================
     * Dipanggil setiap frame untuk update posisi ghost
     */
    update(pacman, mazeGrid) {
        // Increment frame counter untuk delay
        this.frameCounter++;
        
        // Cek apakah sudah waktunya untuk step berikutnya
        if (this.frameCounter < this.stepDelay) {
            return; // Belum waktunya, skip
        }
        
        // Reset frame counter
        this.frameCounter = 0;
        
        // Jika tidak sedang mencari, mulai pencarian baru
        if (!this.isSearching) {
            this.initializeBFS(pacman);
            this.isSearching = true;
        }
        
        // Lakukan satu step BFS
        const result = this.executeBFSStep(pacman);
        
        if (result === 'found') {
            // === PATH DITEMUKAN ===
            console.log("✓ BFS Complete! Path found with length:", this.finalPath.length);
            
            // Gerakkan ghost satu langkah ke arah target
            if (this.finalPath.length > 1) {
                const nextStep = this.finalPath[1];
                this.gridX = nextStep.x;
                this.gridY = nextStep.y;
                this.pixelX = (this.gridX * this.tileSize) + (this.tileSize / 2);
                this.pixelY = (this.gridY * this.tileSize) + (this.tileSize / 2);
            }
            
            // Reset untuk pencarian berikutnya
            this.resetBFS();
            
        } else if (result === 'not_found') {
            // === PATH TIDAK DITEMUKAN ===
            console.log("✗ BFS Complete! No path found");
            this.resetBFS();
        }
        // Jika 'searching', lanjutkan di frame berikutnya
    }

    /**
     * ========================================
     * FUNGSI 4: INISIALISASI BFS
     * ========================================
     * Memulai pencarian BFS baru
     */
    initializeBFS(pacman) {
        const start = { x: this.gridX, y: this.gridY };
        
        // Reset semua data struktur
        this.bfsQueue = [[start]];           // Queue dimulai dengan path awal [start]
        this.visited = new Set();            // Set kosong
        this.visited.add(`${start.x},${start.y}`); // Tambahkan start ke visited
        this.currentPath = [];
        this.finalPath = [];
        this.searchStep = 0;
        
        console.log("\n========================================");
        console.log("🔍 STARTING BFS SEARCH");
        console.log("========================================");
        console.log(`Start: (${start.x}, ${start.y})`);
        console.log(`Target: (${pacman.gridX}, ${pacman.gridY})`);
        console.log(`Step Delay: ${this.stepDelay} frames`);
        console.log("========================================\n");
    }

    /**
     * ========================================
     * FUNGSI 5: EXECUTE SATU STEP BFS
     * ========================================
     * INI ADALAH INTI DARI ALGORITMA BFS!
     * 
     * Algoritma BFS:
     * 1. Ambil path pertama dari queue
     * 2. Ambil node terakhir dari path tersebut
     * 3. Cek apakah node ini adalah target
     * 4. Jika ya, return path
     * 5. Jika tidak, explore tetangga yang belum dikunjungi
     * 6. Tambahkan tetangga ke queue dengan path baru
     */
    executeBFSStep(pacman) {
        // === STEP 1: CEK APAKAH QUEUE KOSONG ===
        if (this.bfsQueue.length === 0) {
            return 'not_found';
        }
        
        // === STEP 2: DEQUEUE - Ambil path pertama dari queue ===
        const path = this.bfsQueue.shift();
        const currentNode = path[path.length - 1]; // Node terakhir dari path
        
        // Update current path untuk visualisasi
        this.currentPath = path;
        this.searchStep++;
        
        // Log detail step
        console.log(`📍 Step ${this.searchStep}:`);
        console.log(`   Current Node: (${currentNode.x}, ${currentNode.y})`);
        console.log(`   Path Length: ${path.length}`);
        console.log(`   Queue Size: ${this.bfsQueue.length}`);
        console.log(`   Visited Size: ${this.visited.size}`);
        
        // === STEP 3: CEK APAKAH INI TARGET ===
        if (currentNode.x === pacman.gridX && currentNode.y === pacman.gridY) {
            this.finalPath = path;
            return 'found';
        }
        
        // === STEP 4: EXPLORE TETANGGA ===
        const neighbors = this.getValidNeighbors(currentNode.x, currentNode.y);
        console.log(`   Valid Neighbors: ${neighbors.length}`);
        
        let addedToQueue = 0;
        
        // === STEP 5: UNTUK SETIAP TETANGGA YANG VALID ===
        for (const neighbor of neighbors) {
            const nextX = currentNode.x + neighbor.x;
            const nextY = currentNode.y + neighbor.y;
            const nextKey = `${nextX},${nextY}`;
            
            // === STEP 6: CEK APAKAH SUDAH DIKUNJUNGI ===
            if (!this.visited.has(nextKey)) {
                // Belum dikunjungi, tambahkan ke visited
                this.visited.add(nextKey);
                
                // Buat path baru: path lama + node baru
                const newPath = [...path, { x: nextX, y: nextY }];
                
                // Tambahkan path baru ke queue
                this.bfsQueue.push(newPath);
                addedToQueue++;
            }
        }
        
        console.log(`   Added to Queue: ${addedToQueue}`);
        console.log(`   ---`);
        
        // === STEP 7: LANJUTKAN PENCARIAN ===
        return 'searching';
    }

    /**
     * ========================================
     * FUNGSI 6: GET VALID NEIGHBORS
     * ========================================
     * Mendapatkan tetangga yang valid (tidak ada dinding)
     */
    getValidNeighbors(x, y) {
        const directions = [
            { x: 0, y: -1 },  // Atas
            { x: 0, y: 1 },   // Bawah
            { x: -1, y: 0 },  // Kiri
            { x: 1, y: 0 }    // Kanan
        ];
        const validMoves = [];
        
        const mazeGrid = window.grid || [];
        const cols = Math.floor(cnv.width / this.tileSize);
        const rows = Math.floor(cnv.height / this.tileSize);
        
        const currentIndex = x + y * cols;
        const currentCell = mazeGrid[currentIndex];
        
        if (!currentCell) return validMoves;

        // Cek setiap arah
        for (let i = 0; i < directions.length; i++) {
            const dir = directions[i];
            const nextX = x + dir.x;
            const nextY = y + dir.y;

            // Cek batas
            if (nextX < 0 || nextX >= cols || nextY < 0 || nextY >= rows) {
                continue;
            }

            // Cek dinding
            // walls[0] = top, walls[1] = right, walls[2] = bottom, walls[3] = left
            let hasWall = false;
            
            if (dir.y === -1) {        // Atas
                hasWall = currentCell.walls[0];
            } else if (dir.y === 1) {  // Bawah
                hasWall = currentCell.walls[2];
            } else if (dir.x === -1) { // Kiri
                hasWall = currentCell.walls[3];
            } else if (dir.x === 1) {  // Kanan
                hasWall = currentCell.walls[1];
            }

            // Jika tidak ada dinding, tambahkan ke valid moves
            if (!hasWall) {
                validMoves.push(dir);
            }
        }

        return validMoves;
    }

    /**
     * ========================================
     * FUNGSI 7: RESET BFS
     * ========================================
     * Reset semua data untuk pencarian berikutnya
     */
    resetBFS() {
        this.isSearching = false;
        this.bfsQueue = [];
        this.visited.clear();
        this.currentPath = [];
        // finalPath tetap disimpan untuk visualisasi
    }

    /**
     * ========================================
     * FUNGSI 8: CHECK COLLISION
     * ========================================
     */
    checkCollision(pacman) {
        return this.gridX === pacman.gridX && this.gridY === pacman.gridY;
    }
}