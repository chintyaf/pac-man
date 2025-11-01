
class Ghost {
    constructor(x, y, color, tileSize) {
        this.gridX = x; // Posisi di grid maze
        this.gridY = y;
        this.color = color;
        this.tileSize = tileSize;
        this.mode = 'CHASE'; // Mode: 'RANDOM' atau 'CHASE' 

        // Posisi pixel nyata di canvas
        this.pixelX = (this.gridX * this.tileSize) + (this.tileSize / 2);
        this.pixelY = (this.gridY * this.tileSize) + (this.tileSize / 2);
        
        this.currentDir = { x: 0, y: 0 };
        this.speed = 1;
    }

    /**
     * TUGAS 1: Menggambar Ghost
     */
    draw(imageDataA) {
        const radius = (this.tileSize / 2) - 4;
        const headY = this.pixelY - (radius / 3);
        
        // Gambar kepala
        lingkaran_polar(imageDataA, this.pixelX, headY, radius, 
                       this.color.r, this.color.g, this.color.b);

        // Gambar badan
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
     * TUGAS 2: Logika Pergerakan Ghost
     * FIXED: Sekarang menggunakan grid dari maze.js langsung
     */
    update(pacman, mazeGrid) {
        // Tentukan arah berikutnya
        if (this.mode === 'CHASE') {
            this.currentDir = this._findNextMoveBFS(pacman, mazeGrid);
        } else {
            this.currentDir = this._findNextMoveRandom(mazeGrid);
        }

        // Update posisi grid berdasarkan arah
        if (this.currentDir && (this.currentDir.x !== 0 || this.currentDir.y !== 0)) {
            this.gridX += this.currentDir.x;
            this.gridY += this.currentDir.y;
        }

        // Update posisi pixel
        this.pixelX = (this.gridX * this.tileSize) + (this.tileSize / 2);
        this.pixelY = (this.gridY * this.tileSize) + (this.tileSize / 2);
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
        const end = { x: pacman.gridX, y: pacman.gridY };

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
            { x: 0, y: -1 },  // Atas
            { x: 0, y: 1 },   // Bawah
            { x: -1, y: 0 },  // Kiri
            { x: 1, y: 0 }    // Kanan
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
            
            if (dir.y === -1) { // Atas
                hasWall = currentCell.walls[0];
            } else if (dir.y === 1) { // Bawah
                hasWall = currentCell.walls[2];
            } else if (dir.x === -1) { // Kiri
                hasWall = currentCell.walls[3];
            } else if (dir.x === 1) { // Kanan
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
        return this.gridX === pacman.gridX && this.gridY === pacman.gridY;
    }
}