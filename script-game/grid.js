cell_width = 35;

let delay = document.getElementById("speed").value;

class Cell {
    constructor(i, j) {
        this.i = i;
        this.j = j;
        this.walls = [true, true, true, true]; // top, right, bottom, left
        this.highlight = 0; // 0 = normal, >0 = highlight intensity
        this.sudahTerhubung = false; // apakah sudah terhubung dengan kotak lain?
        this.sedangDicek = false; // sedang diperiksa sekarang?
    }

    show() {
        const x = this.i * w;
        const y = this.j * w;

        let r, g, b;

        if (this.sedangDicek) {
            // kuning
            r = 255;
            g = 255;
            b = 100;
        } else if (this.highlight > 0) {
            // hijau -- berhasil dihubungkan
            r = 150;
            g = 255;
            b = 150;
        } else if (this.sudahTerhubung) {
            // biru muda -- sudah jadi bagian dari labirin
            r = 150;
            g = 255;
            b = 250;
        } else {
            // putih -- belum dikunjungi
            r = 255;
            g = 255;
            b = 255;
        }

        // Draw pixels
        for (let px = 1; px < w - 1; px++) {
            for (let py = 1; py < w - 1; py++) {
                gbr_titik(imageDataA, x + px, y + py, r, g, b);
            }
        }

        // Walls line
        if (this.walls[0]) {
            dda_line(imageDataA, x, y, x + w, y, 0, 0, 0);
        }
        if (this.walls[1]) {
            dda_line(imageDataA, x + w, y, x + w, y + w, 0, 0, 0);
        }
        if (this.walls[2]) {
            dda_line(imageDataA, x + w, y + w, x, y + w, 0, 0, 0);
        }
        if (this.walls[3]) {
            dda_line(imageDataA, x, y + w, x, y, 0, 0, 0);
        }
    }
}

window.grid = [];
const grid = window.grid;

const w = cell_width;
window.cellWidth = w;
const cols = Math.floor(cnv.width / w);
const rows = Math.floor(cnv.height / w);
// const cols = 10;
// const rows = 5;

function index(i, j) {
    if (i < 0 || j < 0 || i >= cols || j >= rows) {
        return -1;
    }
    return i + j * cols;
}

// inisiasi grid cell
for (let j = 0; j < rows; j++) {
    for (let i = 0; i < cols; i++) {
        grid.push(new Cell(i, j));
    }
}

function drawGrid() {
    clearCanvas(255, 255, 255);

    // Kurangi highlight secara bertahap (efek fade)
    for (let c of grid) {
        if (c.highlight > 0) {
            c.highlight -= 0.1;
            if (c.highlight <= 0) {
                c.highlight = 0;
                c.sudahTerhubung = true;
            }
        }
    }

    // Gambar semua kotak
    for (let c of grid) {
        c.show();
    }
    ctx.putImageData(imageDataA, 0, 0);
}
