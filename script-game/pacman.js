// Instansi global untuk Pac-Man
var pacman;

// == KELAS PAC-MAN ==
class Pacman {
    constructor(i, j, radius) {
        this.i = i; // Posisi grid (indeks)
        this.j = j; // Posisi grid (indeks)
        this.w = w; // <-- Ini akan membaca 'w' global dari maze.js
        this.radius = radius;

        // Posisi pixel (tengah sel)
        this.x = this.i * this.w + this.w / 2;
        this.y = this.j * this.w + this.w / 2;

        this.speed = 2; // Kecepatan gerak (pixel per frame)

        this.direction = { x: 0, y: 0 };
        this.nextDirection = { x: 0, y: 0 }; // Buffer input
        this.lastValidDirection = { x: 1, y: 0 }; // Untuk mulut saat diam

        // Animasi mulut
        this.mouthAngle = 0.1; // Sudut mulut (dalam radian)
        this.mouthOpening = true;
        this.mouthRate = 0.07;
        this.mouthMax = 0.7; // 40 derajat
        this.mouthMin = 0.1; // 5 derajat
    }

    /**
     * Menggambar Pac-Man ke imageDataA menggunakan gbr_titik (via dda_line).
     */
    draw(imageDataA) {
        const r = 255,
            g = 255,
            b = 0; // Warna kuning

        // Tentukan arah hadap mulut
        let facingAngle = Math.atan2(this.lastValidDirection.y, this.lastValidDirection.x);

        // Hitung sudut awal dan akhir untuk "irisan" mulut
        let startAngle = facingAngle + this.mouthAngle;
        let endAngle = facingAngle - this.mouthAngle + Math.PI * 2; // +2PI untuk loop

        // Gambar lingkaran "penuh" dikurangi irisan mulut
        for (let theta = startAngle; theta < endAngle; theta += 0.04) {
            // Asumsi dda_line() sudah global
            dda_line(
                imageDataA,
                Math.round(this.x),
                Math.round(this.y),
                Math.round(this.x + this.radius * Math.cos(theta)),
                Math.round(this.y + this.radius * Math.sin(theta)),
                r,
                g,
                b
            );
        }
    }

    /**
     * Memperbarui posisi dan status Pac-Man.
     */
    update() {
        // 1. Animasi mulut (hanya jika bergerak)
        if (this.direction.x !== 0 || this.direction.y !== 0) {
            this.lastValidDirection = this.direction; // Simpan arah terakhir
            if (this.mouthOpening) {
                this.mouthAngle += this.mouthRate;
                if (this.mouthAngle > this.mouthMax) this.mouthOpening = false;
            } else {
                this.mouthAngle -= this.mouthRate;
                if (this.mouthAngle < this.mouthMin) this.mouthOpening = true;
            }
        }

        // 2. Logika Gerakan dan Tabrakan
        const isCenteredX = Math.abs(this.x - (this.i * this.w + this.w / 2)) < this.speed;
        const isCenteredY = Math.abs(this.y - (this.j * this.w + this.w / 2)) < this.speed;

        if (isCenteredX && isCenteredY) {
            this.x = this.i * this.w + this.w / 2;
            this.y = this.j * this.w + this.w / 2;

            // Ambil sel saat ini dari grid global
            // Ini akan membaca 'grid' dan 'index' global dari maze.js
            let currentCell = grid[index(this.i, this.j)];            
            if (!currentCell) return; // Keluar jika di luar batas

            // Coba terapkan input (nextDirection)
            let canTurn = false;
            if (this.nextDirection.x === 1 && !currentCell.walls[1]) canTurn = true;
            else if (this.nextDirection.x === -1 && !currentCell.walls[3]) canTurn = true;
            else if (this.nextDirection.y === -1 && !currentCell.walls[0]) canTurn = true;
            else if (this.nextDirection.y === 1 && !currentCell.walls[2]) canTurn = true;

            if (this.nextDirection.x !== 0 || this.nextDirection.y !== 0) {
                if (canTurn) {
                    this.direction = { ...this.nextDirection };
                    this.nextDirection = { x: 0, y: 0 }; // Kosongkan buffer
                }
            }

            // Cek apakah arah saat ini menabrak tembok
            if (this.direction.x === 1 && currentCell.walls[1]) this.direction = { x: 0, y: 0 };
            else if (this.direction.x === -1 && currentCell.walls[3]) this.direction = { x: 0, y: 0 };
            else if (this.direction.y === -1 && currentCell.walls[0]) this.direction = { x: 0, y: 0 };
            else if (this.direction.y === 1 && currentCell.walls[2]) this.direction = { x: 0, y: 0 };
        }

        // 3. Gerakkan Pac-Man
        this.x += this.direction.x * this.speed;
        this.y += this.direction.y * this.speed;

        // 4. Perbarui posisi grid (i, j)
        this.i = Math.floor(this.x / this.w);
        this.j = Math.floor(this.y / this.w);
    }

    /**
     * Menyimpan input dari keyboard.
     */
    setDirection(e) {
        if (!["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.key)) {
            return;
        }
        e.preventDefault(); 

        switch (e.key) {
            case "ArrowUp":
                if (this.direction.y !== 1) this.nextDirection = { x: 0, y: -1 };
                break;
            case "ArrowDown":
                if (this.direction.y !== -1) this.nextDirection = { x: 0, y: 1 };
                break;
            case "ArrowLeft":
                if (this.direction.x !== 1) this.nextDirection = { x: -1, y: 0 };
                break;
            case "ArrowRight":
                if (this.direction.x !== -1) this.nextDirection = { x: 1, y: 0 };
                break;
        }
    }

    stopDirection(e) {
        if (!["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.key)) {
            return;
        }
        e.preventDefault();

        // Logika ini menghentikan gerakan HANYA JIKA
        // tombol yang dilepas sesuai dengan arah gerak saat ini.
        switch (e.key) {
            case "ArrowUp":
                // Jika ini adalah arah TERTUNDA, batalkan
                if (this.nextDirection.y === -1) this.nextDirection = { x: 0, y: 0 };
                // Jika ini adalah arah SEKARANG, berhenti
                if (this.direction.y === -1) this.direction = { x: 0, y: 0 };
                break;
            case "ArrowDown":
                if (this.nextDirection.y === 1) this.nextDirection = { x: 0, y: 0 };
                if (this.direction.y === 1) this.direction = { x: 0, y: 0 };
                break;
            case "ArrowLeft":
                if (this.nextDirection.x === -1) this.nextDirection = { x: 0, y: 0 };
                if (this.direction.x === -1) this.direction = { x: 0, y: 0 };
                break;
            case "ArrowRight":
                if (this.nextDirection.x === 1) this.nextDirection = { x: 0, y: 0 };
                if (this.direction.x === 1) this.direction = { x: 0, y: 0 };
                break;
        }
    }
}

// == PENGATURAN GAME LOOP ==

/**
 * Dipanggil oleh maze.js setelah labirin selesai.
 */
function startGameLoop() {
    // Buat instansi Pac-Man
    // Ini akan membaca 'w' global
    pacman = new Pacman(0, 0, w / 2 - 4); 
    
    window.addEventListener("keydown", (e) => pacman.setDirection(e));
    gameLoop();
}

/**
 * Game loop utama yang berjalan setiap frame.
 */
function gameLoop() {
    // 1. PERBARUI LOGIKA
    pacman.update();

    // 2. GAMBAR ULANG
    // Aturan 3: Hapus jejak pakai clearRect
    ctx.clearRect(0, 0, cnv.width, cnv.height);

    // Aturan 1: Ambil buffer KOSONG BARU
    imageDataA = ctx.getImageData(0, 0, cnv.width, cnv.height);

    // Panggil drawGrid() global dari maze.js
    drawGrid();

    // Gambar Pac-Man di atas labirin
    pacman.draw(imageDataA);

    // 3. RENDER KE LAYAR
    // Aturan 1: Tampilkan hasil akhir
    ctx.putImageData(imageDataA, 0, 0);

    // Minta frame berikutnya
    requestAnimationFrame(gameLoop);
}