// cell_width = 40;

let delay = document.getElementById("speed").value;

class Cell {
    constructor(i, j) {
        this.i = i;
        this.j = j;
        this.walls = [true, true, true, true];
        this.color = [252, 230, 233]; // default color (RGB)
        this.highlight = 0;
        this.sudahTerhubung = false;
        this.sedangDicek = false;
        this.visitted = false;
    }

    show() {
        const x = this.i * w;
        const y = this.j * w;

        let r, g, b;

        // State
        // Belum dikunjungi -- merah
        // Sedang -- kuning
        // sudah -- hijau

        if (this.sedangDicek) {
            r = 255;
            g = 250;
            b = 210;
        }
        // else if (this.highlight > 0) {
        //     // idk
        //     r = 205;
        //     g = 252;
        //     b = 197;
        // } else if (this.sudahTerhubung) {
        //     r = 255;
        //     g = 255;
        //     b = 255;
        // }
        else if (this.visitted) {
            r = 255;
            g = 250;
            b = 250;
        } else {
            r = this.color[0];
            g = this.color[1];
            b = this.color[2];
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

    setColor(in_r, in_g, in_b) {
        this.color = [in_r, in_g, in_b];
    }
}

window.grid = [];
const grid = window.grid;

const w = cell_width;
window.cellWidth = w;
const cols = Math.floor(cnv.width / w);
const rows = Math.floor(cnv.height / w);

function index(i, j) {
    if (i < 0 || j < 0 || i >= cols || j >= rows) {
        return -1;
    }
    return i + j * cols;
}

function drawGrid() {
    clearCanvas(255, 255, 255);

    // console.log("draw");
    // Kurangi highlight secara bertahap (efek fade)
    // for (let c of grid) {
    //     if (c.highlight > 0) {
    //         c.highlight -= 0.1;
    //         if (c.highlight <= 0) {
    //             c.highlight = 0;
    //             c.sudahTerhubung = true;
    //         }
    //     }
    // }

    // Gambar semua kotak
    for (let c of grid) {
        c.show();
    }
    ctx.putImageData(imageDataA, 0, 0);
}

// STEP 1  : Initialization GRID
async function buatGrid() {
    setMessage("Inisiasi Grid, menambahkan cell");
    // inisiasi grid cell
    for (let j = 0; j < rows; j++) {
        for (let i = 0; i < cols; i++) {
            grid.push(new Cell(i, j));
            drawGrid();
            await new Promise((resolve) =>
                setTimeout(
                    resolve,
                    document.getElementById("speed").value - 250
                )
            );
        }
    }
    // resolve();
}
