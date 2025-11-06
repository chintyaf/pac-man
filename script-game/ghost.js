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
        this.speed = 1;
        
        // ===== TAMBAHAN: VISUALISASI BFS =====
        this.isAnimatingBFS = false;
        this.bfsQueue = [];
        this.bfsVisited = new Set();
        this.bfsCurrentNode = null;
        this.bfsExploring = [];
        this.bfsFinalPath = [];
        this.bfsStep = 0;

        this.bfsPathToFollow = [];
        // ===== AKHIR TAMBAHAN =====
    }

    draw() {
        const radius = this.tileSize / 2 - 15;
        const headY = this.pixelY - radius / 3;

        lingkaran_polar(imageDataA, this.pixelX, headY, radius,
            this.color.r, this.color.g, this.color.b);

        const bodyShape = [
            { x: -radius, y: -radius / 3 },
            { x: -radius, y: radius },
            { x: -radius + radius / 2, y: radius - radius / 3 },
            { x: 0, y: radius },
            { x: radius - radius / 2, y: radius - radius / 3 },
            { x: radius, y: radius },
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


        if (this.isAnimatingBFS) {
            // Asumsi Anda punya fungsi ini (sesuai kode di _findPathBFS_Visualized)
            this.drawBFSVisualization(); 
        }

        const fillColor = { r: this.color.r, g: this.color.g, b: this.color.b };

        function getColorAt(x, y) {
            const i = (Math.floor(y) * imageDataA.width + Math.floor(x)) * 4;
            return {
                r: imageDataA.data[i],
                g: imageDataA.data[i + 1],
                b: imageDataA.data[i + 2],
            };
        }

        function colorsMatch(c1, c2, tol = 2) {
            return (
                Math.abs(c1.r - c2.r) <= tol &&
                Math.abs(c1.g - c2.g) <= tol &&
                Math.abs(c1.b - c2.b) <= tol
            );
        }

        function safeFill(x, y) {
            const target = getColorAt(x, y);
            const start = { x: Math.floor(x), y: Math.floor(y) };
            const stack = [start];
            while (stack.length > 0) {
                const { x, y } = stack.pop();
                if (x < 0 || y < 0 || x >= cnv.width || y >= cnv.height) continue;
                const i = (y * imageDataA.width + x) * 4;
                const c = {
                    r: imageDataA.data[i],
                    g: imageDataA.data[i + 1],
                    b: imageDataA.data[i + 2],
                };
                if (colorsMatch(c, target)) {
                    imageDataA.data[i] = fillColor.r;
                    imageDataA.data[i + 1] = fillColor.g;
                    imageDataA.data[i + 2] = fillColor.b;
                    imageDataA.data[i + 3] = 255;
                    stack.push({ x: x + 1, y });
                    stack.push({ x: x - 1, y });
                    stack.push({ x, y: y + 1 });
                    stack.push({ x, y: y - 1 });
                }
            }
        }

        safeFill(this.pixelX, this.pixelY - radius / 3);
        safeFill(this.pixelX, this.pixelY + radius / 3);
        safeFill(this.pixelX, this.pixelY + radius - 5);

        ctx.putImageData(imageDataA, 0, 0);
    }

    // ===== TAMBAHAN: VISUALISASI BFS =====
    drawBFSVisualization() {
        var w = this.tileSize;
        
        // 1. Visited (biru muda)
        this.bfsVisited.forEach(function(key) {
            var coords = key.split(',');
            var gx = parseInt(coords[0]);
            var gy = parseInt(coords[1]);
            var cell = window.grid[index(gx, gy)];
            if (cell) {
                cell.color = [200, 230, 255];
            }
        });
        
        // 2. Queue (kuning)
        for (var i = 0; i < this.bfsQueue.length; i++) {
            var node = this.bfsQueue[i];
            var cell = window.grid[index(node.x, node.y)];  
            // var cell = window.grid[index(this.bfsCurrentNode.x, this.bfsCurrentNode.y)]
            // var cell = window.grid[index(node.x, node.y)];
            if (cell) {
                cell.color = [255, 255, 150];
            }
        }
        
        // 3. Current node (hijau terang)
        if (this.bfsCurrentNode) {
            var cell = window.grid[index(this.bfsCurrentNode.x, this.bfsCurrentNode.y)];
            // var cell = window.grid[index(node.x, node.y)];
            // var cell = grid[index(this.bfsCurrentNode.x, this.bfsCurrentNode.y)];
            if (cell) {
                cell.color = [50, 255, 50];
                cell.sedangDicek = true;
            }
        }
        
        // 4. Exploring (orange)
        for (var i = 0; i < this.bfsExploring.length; i++) {
            var node = this.bfsExploring[i];
            var cell = window.grid[index(node.x, node.y)];
            if (cell) {
                cell.color = [255, 200, 100];
            }
        }
        
        // 5. Final path (merah)
        if (this.bfsFinalPath.length > 0) {
            for (var i = 0; i < this.bfsFinalPath.length; i++) {
                var pos = this.bfsFinalPath[i];
                var cell = window.grid[index(pos.x, pos.y)];
                if (cell) {
                    cell.color = [255, 50, 50];
                }
            }
        }
    }
    
    // Fungsi BFS dengan animasi step-by-step (async)
    // async animateBFS(pacman) {
    //     // if (this.isAnimatingBFS) return;
        
    //     this.isAnimatingBFS = true;
    //     this.bfsStep = 0;
        
    //     const start = { x: this.gridX, y: this.gridY };
    //     const end = { x: pacman.i, y: pacman.j };
        
    //     const queue = [[start]];
    //     const visited = new Set();
    //     visited.add(`${start.x},${start.y}`);
        
    //     this.bfsQueue = [start];
    //     this.bfsVisited = visited;
    //     this.bfsFinalPath = [];
        
    //     setStatus("🔍 BFS: Pencarian Jalur Ghost → Pac-Man");
    //     setMessage(`Start: (${start.x},${start.y}) → Target: (${end.x},${end.y})`);
    //     await animate();
        
    //     var foundPath = null;
        
    //     while (queue.length > 0) {
    //         this.bfsStep++;
    //         const path = queue.shift();
    //         const pos = path[path.length - 1];
            
    //         // Update visualisasi
    //         this.bfsCurrentNode = pos;
    //         this.bfsQueue = queue.map(p => p[p.length - 1]);
    //         this.bfsExploring = [];
            
    //         setStatus(`📦 BFS Step ${this.bfsStep}: DEQUEUE`);
    //         setMessage(`Mengambil node (${pos.x}, ${pos.y}) dari queue`);
            
    //         drawGrid();
    //         this.drawBFSVisualization();
    //         ctx.putImageData(imageDataA, 0, 0);
    //         await animate();
            
    //         // Cek goal
    //         if (pos.x === end.x && pos.y === end.y) {
    //             setStatus(`🎉 BFS: PATH DITEMUKAN!`);
    //             setMessage(`Panjang jalur: ${path.length} langkah`);
    //             foundPath = path;
    //             this.bfsFinalPath = path;
                
    //             drawGrid();
    //             this.drawBFSVisualization();
    //             ctx.putImageData(imageDataA, 0, 0);
    //             await animate();
    //             break;
    //         }
            
    //         // Explore neighbors
    //         const validMoves = this._getValidMovesFromGrid(pos.x, pos.y);
            
    //         setStatus(`🔍 BFS Step ${this.bfsStep}: EXPLORE NEIGHBORS`);
    //         setMessage(`Node (${pos.x}, ${pos.y}) memiliki ${validMoves.length} tetangga valid`);
            
    //         for (const move of validMoves) {
    //             const nextX = pos.x + move.x;
    //             const nextY = pos.y + move.y;
    //             const nextPosKey = `${nextX},${nextY}`;
                
    //             this.bfsExploring.push({ x: nextX, y: nextY });
                
    //             drawGrid();
    //             this.drawBFSVisualization();
    //             ctx.putImageData(imageDataA, 0, 0);
    //             await animate();
                
    //             if (!visited.has(nextPosKey)) {
    //                 visited.add(nextPosKey);
    //                 const newPath = [...path, { x: nextX, y: nextY }];
    //                 queue.push(newPath);
                    
    //                 this.bfsVisited = new Set(visited);
    //                 this.bfsQueue = queue.map(p => p[p.length - 1]);
                    
    //                 setMessage(`✅ (${nextX}, ${nextY}) ditambahkan ke queue`);
    //             } else {
    //                 setMessage(`❌ (${nextX}, ${nextY}) sudah visited`);
    //             }
                
    //             drawGrid();
    //             this.drawBFSVisualization();
    //             ctx.putImageData(imageDataA, 0, 0);
    //             await animate();
    //         }
            
    //         this.bfsExploring = [];
    //     }
        
    //     // Move ghost
    //     // if (foundPath && foundPath.length > 1) {
    //     //     const nextStep = foundPath[1];
    //     //     this.gridX = nextStep.x;
    //     //     this.gridY = nextStep.y;
    //     //     this.pixelX = this.gridX * this.tileSize + this.tileSize / 2;
    //     //     this.pixelY = this.gridY * this.tileSize + this.tileSize / 2;
    //     //     this.currentDir = { 
    //     //         x: nextStep.x - foundPath[0].x, 
    //     //         y: nextStep.y - foundPath[0].y 
    //     //     };
    //     // }
    //     // TAMBAHKAN BARIS INI: Simpan path untuk diikuti nanti
    //     this.bfsPathToFollow = foundPath || [];

    //     // Reset visualisasi
    //     this.bfsCurrentNode = null;
    //     this.bfsQueue = [];
    //     this.bfsVisited = new Set();
    //     this.bfsExploring = [];
        
    //     // Reset warna grid
    //     for (var c of grid) {
    //         c.color = [40, 30, 40];
    //         c.sedangDicek = false;
    //     }
        
    //     this.isAnimatingBFS = false;
    // }
    // ===== AKHIR TAMBAHAN =====


    // Di dalam file: ghost.js
// GANTI SELURUH FUNGSI INI

    async animateBFS(pacman) {
        // 1. SETUP
        this.isAnimatingBFS = true; 
        this.bfsStep = 0;
        
        const start = { x: this.gridX, y: this.gridY };
        const end = { x: pacman.i, y: pacman.j };
        
        const queue = [[start]];
        const visited = new Set();
        visited.add(`${start.x},${start.y}`);
        
        // Set state awal untuk visualisasi
        this.bfsQueue = [start];
        this.bfsVisited = visited;
        this.bfsFinalPath = [];
        
        setStatus("🔍 BFS: Pencarian Jalur Ghost → Pac-Man");
        setMessage(`Start: (${start.x},${start.y}) → Target: (${end.x},${end.y})`);
        await animate(); // Tunggu 1 frame
        
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
            await animate(); // Tunggu 1 frame
            
            // Cek Goal
            if (pos.x === end.x && pos.y === end.y) {
                setStatus(`🎉 BFS: PATH DITEMUKAN!`);
                setMessage(`Panjang jalur: ${path.length} langkah`);
                foundPath = path;
                this.bfsFinalPath = path;
                await animate(); // Tunggu 1 frame
                break;
            }
            
            // Explore Neighbors
            const validMoves = this._getValidMovesFromGrid(pos.x, pos.y);
            setStatus(`🔍 BFS Step ${this.bfsStep}: EXPLORE NEIGHBORS`);
            setMessage(`Node (${pos.x}, ${pos.y}) memiliki ${validMoves.length} tetangga valid`);
            
            for (const move of validMoves) {
                const nextX = pos.x + move.x;
                const nextY = pos.y + move.y;
                const nextPosKey = `${nextX},${nextY}`;
                
                this.bfsExploring.push({ x: nextX, y: nextY });
                await animate(); // Tunggu 1 frame
                
                if (!visited.has(nextPosKey)) {
                    visited.add(nextPosKey);
                    const newPath = [...path, { x: nextX, y: nextY }];
                    queue.push(newPath);
                    
                    this.bfsVisited = new Set(visited);
                    this.bfsQueue = queue.map(p => p[p.length - 1]);
                    
                    setMessage(`✅ (${nextX}, ${nextY}) ditambahkan ke queue`);
                } else {
                    setMessage(`❌ (${nextX}, ${nextY}) sudah visited`);
                }
                await animate(); // Tunggu 1 frame
            }
            this.bfsExploring = [];
        }
        
        // 3. SELESAI & SIMPAN PATH
        this.bfsPathToFollow = foundPath || [];

        // Reset state visualisasi
        this.bfsCurrentNode = null;
        this.bfsQueue = [];
        this.bfsVisited = new Set();
        this.bfsExploring = [];
        
        // Reset warna grid
        // PASTIKAN MENGGUNAKAN "window.grid"
        for (var c of window.grid) {
            c.color = [40, 30, 40];
            c.sedangDicek = false;
        }
        
        // Jangan set isAnimatingBFS = false di sini, 
        // biarkan .then() di update() yang mengurusnya
    }

    // Di dalam file: ghost.js
// Di dalam: class Ghost

    /**
     * Memperbarui posisi dan logika Ghost setiap frame.
     * @param {Pacman} pacman - Objek Pacman yang akan dikejar.
     */
    // update(pacman) {
    //     // AMBIL GRID DARI WINDOW (DARI MAZE.JS)
    //     const grid = window.grid;
    //     if (!grid) {
    //         console.error("Grid not available on window object!");
    //         return;
    //     }

    //     // =======================================================
    //     // BAGIAN 1: LOGIKA VISUALISASI BFS (JIKA DIPICU)
    //     // =======================================================
        
    //     // Cek flag global dari after.js. Hanya picu jika animasi BELUM berjalan.
    //     if (window.bfsAnimationTriggered && !this.isAnimatingBFS) {
    //         console.log("👻 Memulai Visualisasi BFS...");
    //         this.isAnimatingBFS = true; // Tandai bahwa animasi visual sedang berjalan
    //         window.bfsAnimationTriggered = false; // Matikan trigger agar tidak dipanggil lagi

    //         // Panggil fungsi visualisasi ASINKRON.
    //         // Kita tidak 'await' di sini karena update() bukan async.
    //         // Kita pakai .then() untuk menangani hasilnya saat selesai.
    //         this.animateBFS(pacman)
    //             .then(path => {
    //                 console.log("✅ Visualisasi BFS Selesai.");
    //                 this.bfsFinalPath = path || []; // Simpan hasilnya (opsional)
                    
    //                 // Reset state setelah selesai
    //                 this.isAnimatingBFS = false;
    //             })
    //             .catch(e => {
    //                 console.error("Error saat visualisasi BFS:", e);
    //                 this.isAnimatingBFS = false; // Reset state jika terjadi error
    //             });
            
    //         // Hentikan eksekusi frame ini. Ghost "diam" menunggu animasi.
    //         return;
    //     }

    //     // Jika animasi visual SEDANG berjalan, jangan lakukan gerakan normal.
    //     if (this.isAnimatingBFS) {
    //         return;
    //     }

    //     // =======================================================
    //     // BAGIAN 2: LOGIKA GERAKAN NORMAL (NON-VISUAL)
    //     // =======================================================

    //     // Cek apakah ghost berada tepat di tengah tile
    //     const atTileCenter = 
    //         (this.pixelX - this.tileSize / 2) % this.tileSize === 0 &&
    //         (this.pixelY - this.tileSize / 2) % this.tileSize === 0;

    //     // Hanya cari arah baru jika kita tepat di tengah tile
    //     if (atTileCenter) {
    //         // Update posisi grid internal
    //         this.gridX = Math.floor(this.pixelX / this.tileSize);
    //         this.gridY = Math.floor(this.pixelY / this.tileSize);

    //         // Panggil BFS CEPAT (NON-VISUAL) untuk menentukan langkah berikutnya
    //         // _findNextMoveBFS akan mengembalikan {x, y} dari arah berikutnya
    //         const nextMoveDirection = this._findNextMoveBFS(pacman, grid);
            
    //         if (nextMoveDirection) {
    //             this.currentDir = nextMoveDirection;
    //         } else {
    //             // Jika tidak ada jalan (terjebak?), berhenti
    //             this.currentDir = { x: 0, y: 0 };
    //         }
    //     }

    //     // Terapkan pergerakan pixel berdasarkan arah saat ini
    //     this.pixelX += this.currentDir.x * this.speed;
    //     this.pixelY += this.currentDir.y * this.speed;
    // }

// ... (fungsi lainnya seperti _findNextMoveBFS, _findPathBFS_Visualized, dll.) ...

        
        // Skip update jika sedang animasi BFS
        // if (this.isAnimatingBFS) return;
        
        // Tentukan arah berikutnya
    //     if (this.mode === "CHASE") {
    //         this.currentDir = this._findNextMoveBFS(pacman, mazeGrid);
    //     } else {
    //         this.currentDir = this._findNextMoveRandom(mazeGrid);
    //     }

    //     if (this.currentDir && (this.currentDir.x !== 0 || this.currentDir.y !== 0)) {
    //         this.gridX += this.currentDir.x;
    //         this.gridY += this.currentDir.y;
    //     }

    //     this.pixelX = this.gridX * this.tileSize + this.tileSize / 2;
    //     this.pixelY = this.gridY * this.tileSize + this.tileSize / 2;
    // }

    update(pacman) {
        // AMBIL GRID DARI WINDOW (DARI MAZE.JS)
        const grid = window.grid;
        if (!grid) {
            console.error("Grid not available on window object!");
            return;
        }

        // =======================================================
        // BAGIAN 1: JALANKAN VISUALISASI AWAL (SATU KALI)
        // =======================================================
        
        // 'window.bfsAnimationTrigger_DO_ONCE' akan kita set di after.js
        if (window.bfsAnimationTrigger_DO_ONCE && !this.isAnimatingBFS) {
            console.log("👻 Memulai Visualisasi BFS Awal...");
            this.isAnimatingBFS = true; // Tandai bahwa animasi visual sedang berjalan
            window.bfsAnimationTrigger_DO_ONCE = false; // Matikan trigger agar tidak berulang

            // Panggil fungsi visualisasi ASINKRON.
            this.animateBFS(pacman)
                .then(path => {
                    console.log("✅ Visualisasi BFS Selesai. Ghost akan mulai bergerak.");
                    // Path sudah disimpan di this.bfsPathToFollow dari dalam animateBFS
                    this.isAnimatingBFS = false; // Animasi selesai
                })
                .catch(e => {
                    console.error("Error saat visualisasi BFS:", e);
                    this.isAnimatingBFS = false; // Reset state jika terjadi error
                });
            
            // Hentikan eksekusi frame ini. Ghost "diam" menunggu animasi.
            return;
        }

        // =======================================================
        // BAGIAN 2: JANGAN BERGERAK SELAMA ANIMASI
        // =======================================================
        if (this.isAnimatingBFS) {
            return;
        }

        // =======================================================
        // BAGIAN 3: LOGIKA GERAKAN STEP-BY-STEP (MENGIKUTI PATH)
        // =======================================================
        
        // Jika tidak ada path, jangan bergerak
        if (!this.bfsPathToFollow || this.bfsPathToFollow.length === 0) {
            this.currentDir = { x: 0, y: 0 };
            return;
        }
        
        // Cek apakah ghost berada tepat di tengah tile
        const atTileCenter = 
            (this.pixelX - this.tileSize / 2) % this.tileSize === 0 &&
            (this.pixelY - this.tileSize / 2) % this.tileSize === 0;

        // Hanya ambil langkah baru jika kita tepat di tengah tile
        if (atTileCenter) {
            // Update posisi grid internal
            this.gridX = Math.floor(this.pixelX / this.tileSize);
            this.gridY = Math.floor(this.pixelY / this.tileSize);

            // Cek apakah posisi kita saat ini adalah langkah pertama di path
            const currentPathStep = this.bfsPathToFollow[0];
            
            if (this.gridX === currentPathStep.x && this.gridY === currentPathStep.y) {
                
                // Jika ya, ambil langkah BERIKUTNYA
                if (this.bfsPathToFollow.length > 1) {
                    const nextStep = this.bfsPathToFollow[1]; // Ambil langkah kedua
                    
                    // Tentukan arah
                    this.currentDir = {
                        x: nextStep.x - this.gridX,
                        y: nextStep.y - this.gridY
                    };
                    
                    // Hapus langkah yang sudah kita ambil dari path
                    this.bfsPathToFollow.shift(); 
                } else {
                    // Kita sudah sampai di akhir path
                    this.currentDir = { x: 0, y: 0 };
                    this.bfsPathToFollow = []; // Kosongkan path
                }
            } else {
                // Kita "tersesat" atau tidak berada di awal path
                // (Ini bisa terjadi jika path-nya salah)
                // Untuk amannya, kita berhenti.
                this.currentDir = { x: 0, y: 0 };
                this.bfsPathToFollow = []; // Hapus path
            }
        }

        // Terapkan pergerakan pixel berdasarkan arah saat ini
        this.pixelX += this.currentDir.x * this.speed;
        this.pixelY += this.currentDir.y * this.speed;
    }

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

    _getValidMovesFromGrid(x, y) {
        const directions = [
            { x: 0, y: -1 },
            { x: 0, y: 1 },
            { x: -1, y: 0 },
            { x: 1, y: 0 },
        ];
        const validMoves = [];

        const mazeGrid = window.grid || [];
        const cols = Math.floor(cnv.width / this.tileSize);
        const rows = Math.floor(cnv.height / this.tileSize);

        const currentIndex = x + y * cols;
        const currentCell = mazeGrid[currentIndex];

        if (!currentCell) return validMoves;

        for (let i = 0; i < directions.length; i++) {
            const dir = directions[i];
            const nextX = x + dir.x;
            const nextY = y + dir.y;

            if (nextX < 0 || nextX >= cols || nextY < 0 || nextY >= rows) {
                continue;
            }

            let hasWall = false;

            if (dir.y === -1) {
                hasWall = currentCell.walls[0];
            } else if (dir.y === 1) {
                hasWall = currentCell.walls[2];
            } else if (dir.x === -1) {
                hasWall = currentCell.walls[3];
            } else if (dir.x === 1) {
                hasWall = currentCell.walls[1];
            }

            if (!hasWall) {
                validMoves.push(dir);
            }
        }

        return validMoves;
    }

    checkCollision(pacman) {
        return this.gridX === pacman.i && this.gridY === pacman.j;
    }
}

var ghosts = [];
var gameLoopRunning = false;
var frameCount = 0;

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

    if (dx === 1 && fromCell.walls[1]) return false;
    if (dx === -1 && fromCell.walls[3]) return false;
    if (dy === 1 && fromCell.walls[2]) return false;
    if (dy === -1 && fromCell.walls[0]) return false;

    return true;
}

// ===== TAMBAHAN: FUNGSI TRIGGER ANIMASI BFS =====
async function startGhostBFSAnimation() {
    if (typeof ghosts !== "undefined" && ghosts.length > 0 && typeof pacman !== "undefined") {
        for (var i = 0; i < ghosts.length; i++) {
            await ghosts[i].animateBFS(pacman);
        }
    }
}
// ===== AKHIR TAMBAHAN =====