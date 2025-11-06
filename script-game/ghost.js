class Ghost {
    constructor(x, y, color) {
        this.gridX = x; // Posisi di grid maze
        this.gridY = y;
        this.color = color;
        this.tileSize = window.cellWidth;
        this.mode = "CHASE"; // Mode: 'RANDOM' atau 'CHASE'

        // Posisi pixel nyata di canvas
        this.pixelX = this.gridX * this.tileSize + this.tileSize / 2;
        this.pixelY = this.gridY * this.tileSize + this.tileSize / 2;

        this.currentDir = { x: 0, y: 0 };
        this.speed = 1;
        
        // ===== TAMBAHAN: VISUALISASI BFS =====
        this.bfsDelay = 2000; // 2 detik per step
        this.lastBFSTime = 0;
        this.bfsVisualization = {
            queue: [],
            visited: new Set(),
            currentNode: null,
            exploring: [],
            finalPath: [],
            isSearching: false
        };
        // ===== AKHIR TAMBAHAN =====
    }

    draw() {
        const radius = this.tileSize / 2 - 15;
        const headY = this.pixelY - radius / 3;

        // bagian kepala
        lingkaran_polar(
            imageDataA,
            this.pixelX,
            headY,
            radius,
            this.color.r,
            this.color.g,
            this.color.b
        );

        // bagian badan
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

        // buletan mata nya
        const eyeRadius = radius / 5;
        const eyeOffsetX = radius / 2.5;
        const eyeOffsetY = -(radius / 3);
        lingkaran_polar(imageDataA, this.pixelX - eyeOffsetX, this.pixelY + eyeOffsetY, eyeRadius, 255, 255, 255);
        lingkaran_polar(imageDataA, this.pixelX + eyeOffsetX, this.pixelY + eyeOffsetY, eyeRadius, 255, 255, 255);

        // isi hantu
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

        // tiga titik isi (kepala, badan, kaki)
        safeFill(this.pixelX, this.pixelY - radius / 3); // kepala
        safeFill(this.pixelX, this.pixelY + radius / 3); // badan tengah
        safeFill(this.pixelX, this.pixelY + radius - 5); // kaki

        ctx.putImageData(imageDataA, 0, 0);
    }

    // ===== TAMBAHAN: FUNGSI VISUALISASI BFS =====
    drawBFSVisualization() {
        var w = this.tileSize;
        var viz = this.bfsVisualization;
        
        // 1. Gambar visited nodes (biru muda)
        viz.visited.forEach(function(key) {
            var coords = key.split(',');
            var x = parseInt(coords[0]);
            var y = parseInt(coords[1]);
            fillCellViz(x, y, w, 200, 230, 255);
        });
        
        // 2. Gambar queue (kuning)
        for (var i = 0; i < viz.queue.length; i++) {
            var node = viz.queue[i];
            fillCellViz(node.x, node.y, w, 255, 255, 150);
        }
        
        // 3. Gambar current node (hijau terang)
        if (viz.currentNode) {
            fillCellViz(viz.currentNode.x, viz.currentNode.y, w, 50, 255, 50);
            drawBorderViz(viz.currentNode.x, viz.currentNode.y, w, 255, 0, 0, 3);
        }
        
        // 4. Gambar exploring neighbors (orange)
        for (var i = 0; i < viz.exploring.length; i++) {
            var node = viz.exploring[i];
            fillCellViz(node.x, node.y, w, 255, 200, 100);
        }
        
        // 5. Gambar final path (merah)
        if (viz.finalPath.length > 0) {
            for (var i = 0; i < viz.finalPath.length; i++) {
                var pos = viz.finalPath[i];
                fillCellViz(pos.x, pos.y, w, 255, 50, 50);
                
                if (i < viz.finalPath.length - 1) {
                    var next = viz.finalPath[i + 1];
                    dda_line(imageDataA,
                            pos.x * w + w/2, pos.y * w + w/2,
                            next.x * w + w/2, next.y * w + w/2,
                            255, 255, 0);
                }
            }
        }
    }
    
    _findNextMoveBFS_WithVisualization(pacman, mazeGrid) {
        var currentTime = Date.now();
        
        // Cek delay visualisasi
        if (currentTime - this.lastBFSTime < this.bfsDelay) {
            // Belum waktunya step berikutnya, return arah terakhir
            return this.currentDir;
        }
        this.lastBFSTime = currentTime;
        
        // Reset visualisasi jika baru mulai
        if (!this.bfsVisualization.isSearching) {
            this.bfsVisualization.queue = [];
            this.bfsVisualization.visited = new Set();
            this.bfsVisualization.currentNode = null;
            this.bfsVisualization.exploring = [];
            this.bfsVisualization.finalPath = [];
            this.bfsVisualization.isSearching = true;
        }
        
        const start = { x: this.gridX, y: this.gridY };
        const end = { x: pacman.i, y: pacman.j };

        const queue = [[start]];
        const visited = new Set();
        visited.add(`${start.x},${start.y}`);
        
        // Update visualisasi
        this.bfsVisualization.queue = queue.map(p => p[p.length - 1]);
        this.bfsVisualization.visited = visited;

        while (queue.length > 0) {
            const path = queue.shift();
            const pos = path[path.length - 1];
            
            // Update current node untuk visualisasi
            this.bfsVisualization.currentNode = pos;
            this.bfsVisualization.queue = queue.map(p => p[p.length - 1]);

            // Sampai di Pac-Man?
            if (pos.x === end.x && pos.y === end.y) {
                // Path ditemukan!
                this.bfsVisualization.finalPath = path;
                this.bfsVisualization.isSearching = false;
                
                if (path.length > 1) {
                    const nextStep = path[1];
                    return { x: nextStep.x - start.x, y: nextStep.y - start.y };
                }
                return { x: 0, y: 0 };
            }

            // Cek tetangga yang valid
            const validMoves = this._getValidMovesFromGrid(pos.x, pos.y);
            this.bfsVisualization.exploring = [];
            
            for (const move of validMoves) {
                const nextX = pos.x + move.x;
                const nextY = pos.y + move.y;
                const nextPosKey = `${nextX},${nextY}`;
                
                // Update exploring untuk visualisasi
                this.bfsVisualization.exploring.push({ x: nextX, y: nextY });

                if (!visited.has(nextPosKey)) {
                    visited.add(nextPosKey);
                    const newPath = [...path, { x: nextX, y: nextY }];
                    queue.push(newPath);
                }
            }
            
            // Update visited dan queue
            this.bfsVisualization.visited = new Set(visited);
            this.bfsVisualization.queue = queue.map(p => p[p.length - 1]);
            
            // Hanya jalankan 1 step per frame untuk visualisasi
            break;
        }

        // Tidak ada jalur, gerak acak
        return this._findNextMoveRandom(mazeGrid);
    }
    // ===== AKHIR TAMBAHAN =====

    update(pacman, mazeGrid) {
        // Tentukan arah berikutnya
        if (this.mode === "CHASE") {
            // MODIFIKASI: Gunakan BFS dengan visualisasi
            this.currentDir = this._findNextMoveBFS_WithVisualization(pacman, mazeGrid);
        } else {
            this.currentDir = this._findNextMoveRandom(mazeGrid);
        }

        // Update posisi grid berdasarkan arah
        if (
            this.currentDir &&
            (this.currentDir.x !== 0 || this.currentDir.y !== 0)
        ) {
            this.gridX += this.currentDir.x;
            this.gridY += this.currentDir.y;
        }

        // Update posisi pixel
        this.pixelX = this.gridX * this.tileSize + this.tileSize / 2;
        this.pixelY = this.gridY * this.tileSize + this.tileSize / 2;
    }

    _findNextMoveRandom(mazeGrid) {
        const validMoves = this._getValidMovesFromGrid(this.gridX, this.gridY);

        if (validMoves.length > 0) {
            const randomIndex = Math.floor(Math.random() * validMoves.length);
            return validMoves[randomIndex];
        }
        return { x: 0, y: 0 };
    }

    // algo bfs (ASLI - tidak diubah)
    _findNextMoveBFS(pacman, mazeGrid) {
        const start = { x: this.gridX, y: this.gridY };
        const end = { x: pacman.i, y: pacman.j };

        const queue = [[start]];
        const visited = new Set();
        visited.add(`${start.x},${start.y}`);

        while (queue.length > 0) {
            const path = queue.shift();
            const pos = path[path.length - 1];

            // Sampai di Pac-Man?
            if (pos.x === end.x && pos.y === end.y) {
                if (path.length > 1) {
                    const nextStep = path[1];
                    return { x: nextStep.x - start.x, y: nextStep.y - start.y };
                }
                return { x: 0, y: 0 };
            }

            // Cek tetangga yang valid
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

        // Tidak ada jalur, gerak acak
        return this._findNextMoveRandom(mazeGrid);
    }

    /**
     * Helper: Mendapatkan arah gerak yang valid berdasarkan GRID MAZE
     * FIXED: Menggunakan grid global dari maze.js untuk cek dinding
     */
    _getValidMovesFromGrid(x, y) {
        const directions = [
            { x: 0, y: -1 }, // Atas
            { x: 0, y: 1 }, // Bawah
            { x: -1, y: 0 }, // Kiri
            { x: 1, y: 0 }, // Kanan
        ];
        const validMoves = [];

        // Ambil grid dari window (global variable dari maze.js)
        const mazeGrid = window.grid || [];
        const cols = Math.floor(cnv.width / this.tileSize);
        const rows = Math.floor(cnv.height / this.tileSize);

        // Ambil cell sekarang
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

            // Cek dinding berdasarkan arah
            // walls[0] = top, walls[1] = right, walls[2] = bottom, walls[3] = left
            let hasWall = false;

            if (dir.y === -1) {
                // Atas
                hasWall = currentCell.walls[0];
            } else if (dir.y === 1) {
                // Bawah
                hasWall = currentCell.walls[2];
            } else if (dir.x === -1) {
                // Kiri
                hasWall = currentCell.walls[3];
            } else if (dir.x === 1) {
                // Kanan
                hasWall = currentCell.walls[1];
            }

            // Jika tidak ada dinding, arah ini valid
            if (!hasWall) {
                validMoves.push(dir);
            }
        }

        return validMoves;
    }

    /**
     * TUGAS 3: Deteksi Tabrakan
     */
    checkCollision(pacman) {
        return this.gridX === pacman.i && this.gridY === pacman.j;
    }
}

// ===== TAMBAHAN: HELPER FUNCTIONS UNTUK VISUALISASI =====
function fillCellViz(gridX, gridY, cellWidth, r, g, b) {
    for (var px = 3; px < cellWidth - 3; px++) {
        for (var py = 3; py < cellWidth - 3; py++) {
            gbr_titik(imageDataA, gridX * cellWidth + px, gridY * cellWidth + py, r, g, b);
        }
    }
}

function drawBorderViz(gridX, gridY, cellWidth, r, g, b, thickness) {
    var x = gridX * cellWidth;
    var y = gridY * cellWidth;
    for (var t = 0; t < thickness; t++) {
        dda_line(imageDataA, x+t, y+t, x+cellWidth-t, y+t, r, g, b);
        dda_line(imageDataA, x+cellWidth-t, y+t, x+cellWidth-t, y+cellWidth-t, r, g, b);
        dda_line(imageDataA, x+cellWidth-t, y+cellWidth-t, x+t, y+cellWidth-t, r, g, b);
        dda_line(imageDataA, x+t, y+cellWidth-t, x+t, y+t, r, g, b);
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

    let ghost1 = new Ghost(0, 0, { r: 255, g: 0, b: 0 }, cellWidth);
    ghost1.mode = "CHASE";
    ghost1.bfsDelay = 2000; 
    ghosts.push(ghost1);

    console.log("Ghosts initialized:", ghosts.length);
    console.log("BFS Delay:", ghost1.bfsDelay, "ms");
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

// Game loop utama
// function startGameLoopGhost() {
//     initializeGhostsAfterMaze();
//     function loop() {
//         if (!gameLoopRunning) return;

//         frameCount++;
//         const cellWidth = 35;
//         const gridData = getGridFromMaze();

//         console.log(gridData);
//         // Update ghost setiap 20 frame
//         if (frameCount % 20 === 0 && gridData) {
//             ghosts.forEach((ghost) => {
//                 // Konversi grid ke format yang dibutuhkan ghost (array 2D)
//                 const cols = Math.floor(cnv.width / cellWidth);
//                 const rows = Math.floor(cnv.height / cellWidth);
//                 const mazeGrid2D = [];

//                 for (let j = 0; j < rows; j++) {
//                     mazeGrid2D[j] = [];
//                     for (let i = 0; i < cols; i++) {
//                         const cell = gridData[i + j * cols];
//                         // Cell adalah jalan (0) jika bisa diakses
//                         mazeGrid2D[j][i] = 0;
//                     }
//                 }

//                 ghost.update(dummyPacman, mazeGrid2D);

//                 // Cek collision
//                 if (ghost.checkCollision(dummyPacman)) {
//                     console.log("COLLISION!");
//                     alert("Game Over! Ghost menangkap Pac-Man!");
//                     // Reset Pac-Man
//                     dummyPacman.gridX = Math.floor(cols / 2);
//                     dummyPacman.gridY = Math.floor(rows / 2);
//                     updatePacmanPixelPosition(cellWidth);
//                 }
//             });
//         }

//         // Redraw
//         if (gridData) {
//             clearCanvas(255, 255, 255);

//             // Draw maze
//             for (let cell of gridData) {
//                 if (cell && cell.show) {
//                     cell.show();
//                 }
//             }

//             // Draw ghosts
//             ghosts.forEach((ghost) => {
//                 ghost.draw(imageDataA);
//             });

//             // Draw Pac-Man
//             updatePacmanPixelPosition(cellWidth);
//             drawPacman();

//             ctx.putImageData(imageDataA, 0, 0);
//         }

//         requestAnimationFrame(loop);
//     }

//     loop();
// }

// Draw Pac-Man
// function drawPacman() {
//     const cellWidth = 35;
//     const pacRadius = cellWidth / 3;

//     // Gambar Pac-Man dengan lingkaran polar
//     lingkaran_polar(
//         imageDataA,
//         dummyPacman.pixelX,
//         dummyPacman.pixelY,
//         pacRadius,
//         255,
//         255,
//         0
//     );
// }

// Keyboard control untuk Pac-Man
// document.addEventListener("keydown", function (e) {
//     if (!gameLoopRunning) return;

//     const cellWidth = 35;
//     const gridData = getGridFromMaze();
//     if (!gridData) return;

//     let newGridX = dummyPacman.gridX;
//     let newGridY = dummyPacman.gridY;

//     switch (e.key) {
//         case "ArrowUp":
//             newGridY--;
//             break;
//         case "ArrowDown":
//             newGridY++;
//             break;
//         case "ArrowLeft":
//             newGridX--;
//             break;
//         case "ArrowRight":
//             newGridX++;
//             break;
//         default:
//             return;
//     }

//     // Cek apakah bisa bergerak
//     if (
//         canMove(
//             dummyPacman.gridX,
//             dummyPacman.gridY,
//             newGridX,
//             newGridY,
//             gridData
//         )
//     ) {
//         dummyPacman.gridX = newGridX;
//         dummyPacman.gridY = newGridY;
//         console.log("Pac-Man moved to:", newGridX, newGridY);
//     } else {
//         console.log("Can't move - wall detected!");
//     }

//     e.preventDefault();
// });

// Hook ke maze completion
// Kita perlu modify maze.js atau panggil manual setelah maze selesai
// Untuk sekarang, kita akan polling untuk cek maze selesai
// var checkMazeInterval = setInterval(function () {
//     const gridData = getGridFromMaze();
//     if (gridData && gridData.length > 0 && !gameLoopRunning) {
//         console.log("Maze detected! Initializing ghosts...");
//         clearInterval(checkMazeInterval);

//         // Tunggu sebentar untuk memastikan maze benar-benar selesai
//         setTimeout(initializeGhostsAfterMaze, 1000);
//     }
// }, 500);
