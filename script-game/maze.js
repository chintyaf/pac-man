// Global variable untuk grid
window.grid = [];

function generateMaze(imageDataA, ctx, cnv, cell_width) {
    return new Promise((resolve) => {

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
                console.log(
                    "Maze complete! Grid available:",
                    window.grid.length
                );

                drawGrid();

                setTimeout(() => {
                    // Lalu ubah semua warna biru (sudahTerhubung) jadi putih
                    let fadeSteps = 30; // jumlah langkah fading
                    let currentStep = 0;

                    function fadeToWhite() {
                        for (let c of grid) {
                            if (c.sudahTerhubung) {
                                // setiap langkah, kurangi birunya pelan-pelan
                                c.highlight = 0;
                                c.sedangDicek = false;
                                // kurangi warna biru (misal simulasi memutih)
                                // tapi karena warnanya diatur lewat sudahTerhubung,
                                // kita pakai cara ini: ubah statusnya pelan-pelan
                                if (currentStep === fadeSteps) {
                                    c.sudahTerhubung = false; // putih penuh di akhir
                                }
                            }
                        }

                        drawGrid();

                        if (currentStep < fadeSteps) {
                            currentStep++;
                            requestAnimationFrame(fadeToWhite);
                        } else {
                            console.log("Maze siap dimainkan!");
                            resolve();
                        }
                    }

                    fadeToWhite();
                }, 500); // diam 1 detik sebelum mulai fade
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
    });
}
