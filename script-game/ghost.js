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
    }

    /**
     * TUGAS 1: Menggambar Ghost
     */
    draw() {
        const radius = this.tileSize / 2 - 15;
        const headY = this.pixelY - radius / 3;

        // === Outline Kepala ===
        lingkaran_polar(
            imageDataA,
            this.pixelX,
            headY,
            radius,
            this.color.r,
            this.color.g,
            this.color.b
        );

        // === Outline Badan ===
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
        polygon(
            imageDataA,
            translatedShape,
            this.color.r,
            this.color.g,
            this.color.b
        );

        // === Mata ===
        const eyeRadius = radius / 5;
        const eyeOffsetX = radius / 2.5;
        const eyeOffsetY = -(radius / 3);
        lingkaran_polar(
            imageDataA,
            this.pixelX - eyeOffsetX,
            this.pixelY + eyeOffsetY,
            eyeRadius,
            255,
            255,
            255
        );
        lingkaran_polar(
            imageDataA,
            this.pixelX + eyeOffsetX,
            this.pixelY + eyeOffsetY,
            eyeRadius,
            255,
            255,
            255
        );

        // === Fill otomatis 3 bagian ===
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
                if (x < 0 || y < 0 || x >= cnv.width || y >= cnv.height)
                    continue;
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

    /**
     * TUGAS 2: Logika Pergerakan Ghost
     * FIXED: Sekarang menggunakan grid dari maze.js langsung
     */
    update(pacman, mazeGrid) {
        // Tentukan arah berikutnya
        if (this.mode === "CHASE") {
            this.currentDir = this._findNextMoveBFS(pacman, mazeGrid);
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

    /**
     * Helper: Mencari pergerakan acak yang valid
     */
    _findNextMoveRandom(mazeGrid) {
        const validMoves = this._getValidMovesFromGrid(this.gridX, this.gridY);

        if (validMoves.length > 0) {
            const randomIndex = Math.floor(Math.random() * validMoves.length);
            return validMoves[randomIndex];
        }
        return { x: 0, y: 0 };
    }

    /**
     * Helper: Mencari pergerakan menggunakan BFS
     */
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

// Test Ghost - Logic untuk menghubungkan Ghost dengan Maze
// File ini akan dipanggil setelah semua library dimuat

var ghosts = [];

var gameLoopRunning = false;
var frameCount = 0;

// Fungsi untuk mengambil grid dari maze.js
function getGridFromMaze() {
    // Grid global dari maze.js
    return window.grid || [];
}

// Fungsi untuk inisialisasi ghost setelah maze selesai
function initializeGhostsAfterMaze() {
    // const cellWidth = 35;
    const cols = Math.floor(cnv.width / cell_width);
    const rows = Math.floor(cnv.height / cell_width);

    ghosts = [];

    // Buat 4 ghost dengan mode CHASE
    let ghost1 = new Ghost(0, 0, { r: 255, g: 0, b: 0 }, cellWidth);
    ghost1.mode = "CHASE";
    ghosts.push(ghost1);

    let ghost2 = new Ghost(cols - 1, 0, { r: 255, g: 184, b: 255 }, cellWidth);
    ghost2.mode = "CHASE";
    // ghosts.push(ghost2);

    let ghost3 = new Ghost(0, rows - 1, { r: 0, g: 255, b: 255 }, cellWidth);
    ghost3.mode = "CHASE";
    // ghosts.push(ghost3);

    let ghost4 = new Ghost(
        cols - 1,
        rows - 1,
        { r: 255, g: 184, b: 82 },
        cellWidth
    );
    ghost4.mode = "CHASE";
    // ghosts.push(ghost4);

    // Inisialisasi Pac-Man di tengah
    // dummyPacman.gridX = Math.floor(cols / 2);
    // dummyPacman.gridY = Math.floor(rows / 2);
    // updatePacmanPixelPosition(cellWidth);

    console.log("Ghosts initialized:", ghosts.length);
    // console.log("Pac-Man at:", dummyPacman.gridX, dummyPacman.gridY);

    // Mulai game loop
    // if (!gameLoopRunning) {
    //     gameLoopRunning = true;
    //     startGameLoop();
    // }
}

// Update posisi pixel Pac-Man
// function updatePacmanPixelPosition(cellWidth) {
//     dummyPacman.pixelX = dummyPacman.gridX * cellWidth + cellWidth / 2;
//     dummyPacman.pixelY = dummyPacman.gridY * cellWidth + cellWidth / 2;
// }

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
    if (dx === 1 && fromCell.walls[1]) return false; // Ke kanan
    if (dx === -1 && fromCell.walls[3]) return false; // Ke kiri
    if (dy === 1 && fromCell.walls[2]) return false; // Ke bawah
    if (dy === -1 && fromCell.walls[0]) return false; // Ke atas

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
