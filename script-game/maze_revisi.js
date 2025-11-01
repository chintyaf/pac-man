// Global variable untuk grid
window.grid = [];

function generateMaze(imageDataA, ctx, cnv, cell_width) {
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

    class DisjointSet {
        constructor(n) {
            this.parent = Array.from({ length: n }, (_, i) => i);
            this.rank = Array(n).fill(0);
        }
        find(x) {
            if (this.parent[x] !== x)
                this.parent[x] = this.find(this.parent[x]);
            return this.parent[x];
        }

        union(x, y) {
            let rx = this.find(x);
            let ry = this.find(y);

            // sudah di dalma grup yang sama
            if (rx === ry) {
                return false;
            }

            if (this.rank[rx] < this.rank[ry]) {
                this.parent[rx] = ry;
            } else if (this.rank[rx] > this.rank[ry]) {
                this.parent[ry] = rx;
            } else {
                this.parent[ry] = rx;
                this.rank[rx]++;
            }

            return true;
        }
    }

    window.grid = [];
    const grid = window.grid;

    function index(i, j) {
        if (i < 0 || j < 0 || i >= cols || j >= rows) return -1;
        return i + j * cols;
    }

    const w = cell_width;
    const cols = Math.floor(cnv.width / w);
    const rows = Math.floor(cnv.height / w);
    // const cols = 10;
    // const rows = 5;

    // inisiasi grid cell
    for (let j = 0; j < rows; j++) {
        for (let i = 0; i < cols; i++) {
            grid.push(new Cell(i, j));
        }
    }

    // Set
    let walls = [];
    for (let i = 0; i < cols; i++) {
        for (let j = 0; j < rows; j++) {
            let a = index(i, j);
            if (i < cols - 1) {
                walls.push([a, index(i + 1, j), "V"]);
            }
            if (j < rows - 1) {
                walls.push([a, index(i, j + 1), "H"]);
            }
        }
    }
    walls.sort(() => Math.random() - 0.5);

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

    const ds = new DisjointSet(grid.length);
    let wallIndex = 0;
    let batchSize = 1;

    function animateKruskal() {
        for (let c of grid) {
            c.sedangDicek = false;
        }

        for (
            let n = 0;
            n < batchSize && wallIndex < walls.length;
            n++, wallIndex++
        ) {
            const [aIdx, bIdx] = walls[wallIndex];
            const a = grid[aIdx];
            const b = grid[bIdx];

            a.sedangDicek = true;
            b.sedangDicek = true;

            // Cari grup masing-masing
            const grupA = ds.find(aIdx);
            const grupB = ds.find(bIdx);
            // console.log(`Kotak [${a.i},${a.j}] ada di grup #${grupA}`);
            // console.log(`Kotak [${b.i},${b.j}] ada di grup #${grupB}`);

            // cek apakah kedua kotak ini sudah terhubung?
            // klo belum
            if (ds.union(aIdx, bIdx)) {
                removeWall(a, b);
                a.highlight = 1;
                b.highlight = 1;
                a.sedangDicek = false;
                b.sedangDicek = false;
            }
        }

        drawGrid();

        if (wallIndex < walls.length) {
            setTimeout(() => {
                requestAnimationFrame(animateKruskal);
            }, delay);
        } else {
            for (let c of grid) {
                c.sedangDicek = false;
            }
            console.log("Maze complete! Grid available:", window.grid.length);
            drawGrid();
        }
    }

    // function animateDraw() {
    //     drawGrid();
    //     requestAnimationFrame(animateDraw);
    // }

    drawGrid();
    setTimeout(() => {
        animateKruskal();
    }, delay); // Jeda 1 detik sebelum mulai
}
