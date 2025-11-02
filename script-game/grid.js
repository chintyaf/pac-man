// cell_width = 40;

class Cell {
    constructor(i, j) {
        this.i = i;
        this.j = j;
        this.walls = [true, true, true, true];
        this.color = [255, 255, 255];
        this.line_color = [173, 59, 100];
        this.sudahTerhubung = false;
        this.sedangDicek = false;
        this.menujuParent = false;
        this.adalahParent = false;
        this.visitted = false;
        this.highlight = 0; // maze cek 2x horizontal & vertikal
    }

    drawWall(x, y, r, g, b, stroke) {
        for (let s = 0; s < stroke; s++) {
            if (this.walls[0]) {
                dda_line(imageDataA, x, y + s, x + w, y + s, r, g, b); // top
            }
            if (this.walls[1]) {
                dda_line(imageDataA, x + w - s, y, x + w - s, y + w, r, g, b); // right
            }
            if (this.walls[2]) {
                dda_line(imageDataA, x, y + w - s, x + w, y + w - s, r, g, b); // bottom
            }
            if (this.walls[3]) {
                dda_line(imageDataA, x + s, y, x + s, y + w, r, g, b); // left
            }
        }
    }

    colorCell(x, y, r, g, b) {
        for (let px = 0; px < w; px++) {
            for (let py = 0; py < w; py++) {
                gbr_titik(imageDataA, x + px, y + py, r, g, b);
            }
        }
    }

    show() {
        const x = this.i * w;
        const y = this.j * w;

        // State
        // Belum dikunjungi -- merah
        // Sedang -- kuning
        // sudah -- hijau
        var current_color, current_line;

        current_color = [this.color[0], this.color[1], this.color[2]];
        current_line = [
            this.line_color[0],
            this.line_color[1],
            this.line_color[2],
        ];

        if (this.adalahParent) {
            console.log("parent");
            current_color = [255, 0, 0];
        }

        if (this.sedangDicek) {
            // hijau
            // console.log("sedang dicek");
            current_color = [169, 230, 159];
            current_line = [10, 200, 63];
        }
        // if (this.highlight < 1 && this.highlight > 0) {
        //     current_color = [225, 235, 240];
        //     // console.log("cek 1x");
        // }
        if (this.terhubungKeParent) {
            console.log("menuju parent");
            current_color = [255, 0, 0];
        }

        // } else if (this.sudahTerhubung) {
        //     r = 255;
        //     g = 255;
        //     b = 255;
        // }
        // else if (this.visitted) {
        //     console.log("lupa :D");
        //     current_color = [252, 242, 252];
        //     // current_line = [0, 0, 0];
        // }
        // else {
        //     console.log("else");
        //     current_color = [this.color[0], this.color[1], this.color[2]];
        //     current_line = [
        //         this.line_color[0],
        //         this.line_color[1],
        //         this.line_color[2],
        //     ];
        // }

        this.colorCell(
            x,
            y,
            current_color[0],
            current_color[1],
            current_color[2]
        );
        this.drawWall(
            x,
            y,
            current_line[0],
            current_line[1],
            current_line[2],
            2
        );
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
}

async function langsung_grid() {
    for (let j = 0; j < rows; j++) {
        for (let i = 0; i < cols; i++) {
            grid.push(new Cell(i, j));
        }
    }
    drawGrid();
    await new Promise((resolve) =>
        setTimeout(resolve, document.getElementById("speed").value - 250)
    );
}
