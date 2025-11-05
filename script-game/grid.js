class Cell {
    constructor(i, j) {
        this.i = i;
        this.j = j;
        this.walls = [true, true, true, true];
        this.color = [40, 30, 40];
        // this.color = [0, 0, 0];
        this.line_color = [173, 59, 100];
        this.checked = 0;

        // STATE
        this.sedangDicek = false; // Hijau muda - sedang cek node
        this.isParent = false; // Merah - node adalah root
        this.isSet = false;
        // this.terhubungKeParent = false; // Biru - sudah terhubung ke root
        this.unionDecision = false; // Kuning - sedang union
        this.merah = false; // Kuning - sedang union
        // this.visitted = false;
    }

    drawWall(x, y, r, g, b, stroke) {
        for (let s = 0; s < stroke; s++) {
            if (this.walls[0]) {
                dda_line(imageDataA, x, y + s, x + w, y + s, r, g, b);
            }
            if (this.walls[1]) {
                dda_line(imageDataA, x + w - s, y, x + w - s, y + w, r, g, b);
            }
            if (this.walls[2]) {
                dda_line(imageDataA, x, y + w - s, x + w, y + w - s, r, g, b);
            }
            if (this.walls[3]) {
                dda_line(imageDataA, x + s, y, x + s, y + w, r, g, b);
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

        let current_color = [this.color[0], this.color[1], this.color[2]];
        let current_line = [
            this.line_color[0],
            this.line_color[1],
            this.line_color[2],
        ];

        // Wall Yellow -- wall being considered for removal
        // Cell Blue -- cell belong to current merged set
        // Wall Green -- cell successfully removed
        // Wall Red -- Wall discarded because cells already connected
        // Cell Orange --

        // Prioritas visualisasi (dari paling penting)
        if (this.adalahParent || this.merah) {
            current_color = [255, 100, 100]; // Merah - root/parent
        } else if (this.menujuParent) {
            current_color = [255, 180, 100]; // Oranye - path traversal
            current_line = [255, 140, 0];
            // } else if (this.unionDecision) {
            // current_color = [255, 230, 100]; // Kuning - keputusan union
        } else if (this.sedangDicek) {
            current_color = [169, 240, 149]; // Hijau muda - sedang dicek
            current_line = [11, 194, 63];
            // } else if (this.terhubungKeParent) {
            // current_color = [150, 200, 255]; // Biru muda - terhubung ke parent
        } else if (this.checked) {
            current_color = [
                // 255 + this.checked * 10,
                // 130 + this.checked * 20,
                // 130 + this.checked * 20,
                210 + this.checked * 10,
                200 + this.checked * 20,
                220 + this.checked * 20,
            ]; // Biru muda - terhubung ke parent
        } else if (this.visitted) {
            // current_color = [225, 235, 242]; // gray mode
            current_color = [225, 235, 242]; // gray mode
        }

        // 255 - this.checked * 20,
        // 210 - this.checked * 20,
        // 210 - this.checked * 20,

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
            4
        );
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
    clearCanvas(0, 0, 0);

    for (let c of grid) {
        c.show();
    }
    ctx.putImageData(imageDataA, 0, 0);
}

function removeWall(a, b) {
    let dx = a.i - b.i;
    let dy = a.j - b.j;
    if (dx === 1) {
        a.walls[3] = false;
        b.walls[1] = false;
    } else if (dx === -1) {
        a.walls[1] = false;
        b.walls[3] = false;
    }
    if (dy === 1) {
        a.walls[0] = false;
        b.walls[2] = false;
    } else if (dy === -1) {
        a.walls[2] = false;
        b.walls[0] = false;
    }
}

// STEP 1  : Initialization GRID
async function buatGrid() {
    setStatus("Initialize Gird");
    // inisiasi grid cell
    for (let j = 0; j < rows; j++) {
        for (let i = 0; i < cols; i++) {
            grid.push(new Cell(i, j));
            setMessage(`Menambahkan objek Cell(${i}, ${j})`);

            await animate();
        }
    }
    skip = false;
}

async function langsung_grid() {
    for (let j = 0; j < rows; j++) {
        for (let i = 0; i < cols; i++) {
            grid.push(new Cell(i, j));
        }
    }
    drawGrid();
    await new Promise((resolve) => setTimeout(resolve, delay));
}

window.grid = grid;

function resetState() {
    for (let c of grid) {
        c.sedangDicek = false; // Hijau muda - sedang cek node
        c.adalahParent = false; // Merah - node adalah root
        c.terhubungKeParent = false; // Biru - sudah terhubung ke root
        c.unionDecision = false; // Kuning - sedang union
        // c.showIndex = false;
        // c.menujuParent = false;
    }
}
