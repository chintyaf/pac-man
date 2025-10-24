// js/ghost.js

/**
 * Mewakili satu Ghost (musuh).
 * @param {number} x - Posisi awal grid x.
 * @param {number} y - Posisi awal grid y.
 * @param {object} color - Warna ghost (e.g., {r: 255, g: 0, b: 0}).
 * @param {number} tileSize - Ukuran satu petak maze dalam pixel.
 */
class Ghost {
    constructor(x, y, color, tileSize) {
        this.gridX = x; // Posisi di grid maze
        this.gridY = y;
        this.color = color;
        this.tileSize = tileSize;
        this.mode = 'RANDOM'; // Mode awal: 'RANDOM' atau 'CHASE' 

        // Posisi pixel nyata di canvas (untuk animasi/pergerakan halus)
        // Kita mulai dari tengah tile
        this.pixelX = (this.gridX * this.tileSize) + (this.tileSize / 2);
        this.pixelY = (this.gridY * this.tileSize) + (this.tileSize / 2);
        
        this.currentDir = { x: 0, y: 0 }; // Arah gerak sekarang
        this.speed = 1; // Kecepatan gerak (pixel per frame)
    }

    /**
     * TUGAS 1: Menggambar Ghost
     * Menggambar ghost di canvas menggunakan fungsi dari grafkom.js
     * "Gambar karakter ghost (lingkaran warna + bentuk khas)"
     */
    draw(imageDataA) {
        // Bentuk dasar ghost (seperti di gambar inspirasi)
        // Bagian atas bulat (lingkaran)
        // Bagian bawah bergelombang (polygon)

        // 1. Gambar kepala (lingkaran)
        // Ukuran radius ghost, sedikit lebih kecil dari tile
        const radius = (this.tileSize / 2) - 4;
        
        // Kita gambar kepala sedikit ke atas dari pusat pixel
        const headY = this.pixelY - (radius / 3);
        lingkaran_polar(imageDataA, this.pixelX, headY, radius, this.color.r, this.color.g, this.color.b);

        // 2. Gambar badan bawah (bergelombang/spiky)
        // Ini adalah array titik-titik (polygon) yang digambar relatif terhadap PUSAT GHOST (0, 0)
        // (0, 0) akan kita anggap sebagai this.pixelX dan this.pixelY
        const bodyShape = [
            { x: -radius, y: -radius / 3 },
            { x: -radius, y: radius },
            { x: -radius + (radius/2), y: radius - (radius/3) },
            { x: 0, y: radius },
            { x: radius - (radius/2), y: radius - (radius/3) },
            { x: radius, y: radius },
            { x: radius, y: -radius / 3 }
        ];

        // === INI BAGIAN YANG DIPERBAIKI ===
        // Kita tidak pakai matriks. Kita pakai fungsi 'translasi_array' dari 'transform.js'
        // 'translasi_array' butuh sebuah vektor T {x, y}
        const T = { x: this.pixelX, y: this.pixelY };
        
        // Pindahkan 'bodyShape' ke posisi ghost di canvas
        const translatedShape = translasi_array(bodyShape, T);

        // Gambar polygon untuk badan
        polygon(imageDataA, translatedShape, this.color.r, this.color.g, this.color.b);

        // 3. (Opsional) Gambar mata
        // Kita gambar 2 lingkaran putih
        const eyeRadius = radius / 5;
        const eyeOffsetX = radius / 2.5;
        const eyeOffsetY = - (radius / 3); // sama dengan pergeseran kepala

        // Mata Kiri
        const eyeLeftCenter = { x: this.pixelX - eyeOffsetX, y: this.pixelY + eyeOffsetY };
        lingkaran_polar(imageDataA, eyeLeftCenter.x, eyeLeftCenter.y, eyeRadius, 255, 255, 255);
        
        // Mata Kanan
        const eyeRightCenter = { x: this.pixelX + eyeOffsetX, y: this.pixelY + eyeOffsetY };
        lingkaran_polar(imageDataA, eyeRightCenter.x, eyeRightCenter.y, eyeRadius, 255, 255, 255);
    }


    /**
     * TUGAS 2: Logika Pergerakan Ghost
     * Update posisi ghost setiap frame.
     * @param {object} pacman - Objek Pac-Man (untuk tahu posisinya).
     * @param {Array<Array<number>>} mazeGrid - Grid maze (0 = jalan, 1 = tembok).
     */
    update(pacman, mazeGrid) {
        // Logika untuk pergerakan dari tile ke tile
        // (Ini contoh sederhana, bisa dibuat lebih halus)
        
       // Tentukan arah berikutnya
        if (this.mode === 'CHASE') {
            this.currentDir = this._findNextMoveBFS(pacman, mazeGrid);
        } else { // 'RANDOM'
            this.currentDir = this._findNextMoveRandom(mazeGrid);
        }

        // Update posisi grid berdasarkan arah
        if (this.currentDir) {
            this.gridX += this.currentDir.x;
            this.gridY += this.currentDir.y;
        }

        // Update posisi pixel (bisa dianimasikan nanti)
        this.pixelX = (this.gridX * this.tileSize) + (this.tileSize / 2);
        this.pixelY = (this.gridY * this.tileSize) + (this.tileSize / 2);
    }

    /**
     * Helper: Mencari pergerakan acak yang valid
     */
    _findNextMoveRandom(mazeGrid) {
        const validMoves = this._getValidMoves(this.gridX, this.gridY, mazeGrid);

        if (validMoves.length > 0) {
            // Pilih satu arah secara acak
            const randomIndex = Math.floor(Math.random() * validMoves.length);
            return validMoves[randomIndex];
        }
        return { x: 0, y: 0 }; // Diam jika terjebak
    }

    /**
     * Helper: Mencari pergerakan menggunakan BFS (Breadth-First Search)
     * [cite: 22, 23, 34]
     */
    _findNextMoveBFS(pacman, mazeGrid) {
        const start = { x: this.gridX, y: this.gridY };
        const end = { x: pacman.gridX, y: pacman.gridY };

        const queue = [[start]]; // Antrian berisi "jalur" (array of {x,y})
        const visited = new Set();
        visited.add(`${start.x},${start.y}`);

        while (queue.length > 0) {
            const path = queue.shift(); // Ambil jalur pertama
            const pos = path[path.length - 1]; // Posisi terakhir di jalur

            // Apakah kita sampai di Pac-Man?
            if (pos.x === end.x && pos.y === end.y) {
                // Ya! Kembalikan langkah *pertama* dari jalur ini
                if (path.length > 1) {
                    const nextStep = path[1];
                    return { x: nextStep.x - start.x, y: nextStep.y - start.y };
                }
                return { x: 0, y: 0 }; // Sudah di posisi yg sama
            }

            // Cek 4 arah tetangga
            const validMoves = this._getValidMoves(pos.x, pos.y, mazeGrid);
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

        // Jika tidak ada jalur (seharusnya jarang terjadi), gerak acak saja
        return this._findNextMoveRandom(mazeGrid);
    }

    /**
     * Helper: Mendapatkan arah gerak yang valid (bukan tembok)
     */
    _getValidMoves(x, y, mazeGrid) {
        const directions = [{ x: 0, y: -1 }, { x: 0, y: 1 }, { x: -1, y: 0 }, { x: 1, y: 0 }];
        const validMoves = [];
        const numRows = mazeGrid.length;
        const numCols = mazeGrid[0].length;

        for (const dir of directions) {
            const nextX = x + dir.x;
            const nextY = y + dir.y;

            // Cek batas grid
            if (nextX >= 0 && nextX < numCols && nextY >= 0 && nextY < numRows) {
                // Cek apakah bukan tembok (asumsi 0 = jalan) 
                if (mazeGrid[nextY][nextX] === 0) {
                    validMoves.push(dir);
                }
            }
        }
        return validMoves;
    }


    /**
     * TUGAS 3: Deteksi Tabrakan
     * Cek apakah ghost bertabrakan dengan Pac-Man.
     *  "Deteksi tabrakan ghost dengan Pac-Man"
     * @param {object} pacman - Objek Pac-Man.
     * @returns {boolean} - True jika tabrakan, false jika tidak.
     */
    checkCollision(pacman) {
        // Cek tabrakan sederhana berdasarkan posisi grid
        return this.gridX === pacman.gridX && this.gridY === pacman.gridY;
    }
}