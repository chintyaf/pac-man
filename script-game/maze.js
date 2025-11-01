function generateMaze() {
    return new Promise(async (resolve) => {
        class DisjointSet {
            constructor(n) {
                this.parent = Array.from({ length: n }, (_, i) => i);
                this.rank = Array(n).fill(0);
            }

            // mencari parent/root
            find(x) {
                // kalau bukan parent akan mencari sampai ketemu parent
                if (this.parent[x] !== x) {
                    this.parent[x] = this.find(this.parent[x]);
                }
                return this.parent[x];
            }

            union(x, y) {
                let rx = this.find(x);
                let ry = this.find(y);

                // jika sudah di dalam grup yang sama
                if (rx === ry) {
                    return false;
                }

                // rank = perkiraan tinggi pohon
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

        // STEP 2  : Shuffle Walls
        let walls = [];
        let visual_walls = []; // visualisasi
        async function daftarWall() {
            setMessage("Daftarkan wall");
            for (let i = 0; i < cols; i++) {
                for (let j = 0; j < rows; j++) {
                    let a = index(i, j);

                    let cell = grid[index(i, j)];
                    cell.color = [255, 180 + j * 4, 180 + i * 2];

                    if (i < cols - 1) {
                        let b = index(i + 1, j);
                        walls.push([a, b, "V"]);
                        visual_walls.push(cell);
                        cell.highlight = 1; // example
                        setMessage(
                            `Cell [${i}, ${j}]  → Cell [${i + 1}, ${j}]
                            )} (Vertical wall)`
                        );
                    }

                    if (j < rows - 1) {
                        let b = index(i, j + 1);
                        walls.push([a, b, "H"]);
                        cell.highlight = 1;
                        visual_walls.push(cell);
                        setMessage(
                            `Cell [${i}, ${j}]  → Cell [${i}, ${
                                j + 1
                            }] - (Horizontal wall)`
                        );
                    }
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
        await daftarWall();

        // Shuffle Walls
        async function acakWall() {
            setMessage("Acak wall");
            for (let i = walls.length - 1; i > 0; i--) {
                let j = Math.floor(Math.random() * (i + 1));
                [walls[i], walls[j]] = [walls[j], walls[i]];
                [visual_walls[i].color, visual_walls[j].color] = [
                    visual_walls[j].color,
                    visual_walls[i].color,
                ];
                drawGrid();

                await new Promise((resolve) =>
                    setTimeout(resolve, document.getElementById("speed").value)
                );
            }
        }
        await acakWall();

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

        async function animateKruskal() {
            setMessage("Kruskal");
            let batchWalls = [];
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
                drawGrid();

                // batchWalls.push([a, b]);

                // drawGrid();

                // jika kedua kotak ini belum terhubung
                if (ds.union(aIdx, bIdx)) {
                    removeWall(a, b);
                    a.visitted = true;
                    b.visitted = true;

                    // a.highlight = 1;
                    // b.highlight = 1;
                }

                // hapus kembali
                a.sedangDicek = false;
                b.sedangDicek = false;

                // setTimeout(() => {
                //     for (let [a, b] of batchWalls) {
                //         a.sedangDicek = false;
                //         b.sedangDicek = false;
                //     }

                //     if (wallIndex < walls.length) {
                //         requestAnimationFrame(animateKruskal);
                //     } else {
                //         console.log(
                //             "Maze complete! Grid available:",
                //             grid.length
                //         );
                //         drawGrid();
                //         resolve();
                //     }
                // }, delay);
                // drawGrid();
            }

            // drawGrid();

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
                resolve();
            }
        }

        await animateKruskal();

        // // drawGrid();
        // setTimeout(() => {
        //     animateKruskal();
        // }, delay);
    });
}
