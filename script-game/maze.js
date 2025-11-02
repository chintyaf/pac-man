function generateMaze() {
    return new Promise(async (resolve) => {
        // STEP 2  : Shuffle Walls
        let walls = [];
        let visual_walls = []; // visualisasi
        async function daftarWall() {
            setMessage("Daftarkan wall");
            for (let i = 0; i < cols; i++) {
                for (let j = 0; j < rows; j++) {
                    let a = index(i, j);

                    let cell = grid[index(i, j)];
                    cell.color = [255, 200 + j * 4, 180 + i * 3];

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
                    await sleep();
                }
            }
        }
        // await daftarWall();

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

                await sleep();
            }
        }
        // await acakWall();

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

        async function langsung() {
            setMessage("Daftarkan wall");
            for (let i = 0; i < cols; i++) {
                for (let j = 0; j < rows; j++) {
                    let a = index(i, j);

                    let cell = grid[index(i, j)];
                    cell.color = [255, 200 + j * 4, 180 + i * 3];

                    if (i < cols - 1) {
                        let b = index(i + 1, j);
                        walls.push([a, b, "V"]);
                        visual_walls.push(cell);
                        cell.highlight = 1; // exampl
                    }

                    if (j < rows - 1) {
                        let b = index(i, j + 1);
                        walls.push([a, b, "H"]);
                        cell.highlight = 1;
                        visual_walls.push(cell);
                    }
                }
            }
            setMessage("Acak wall");
            for (let i = walls.length - 1; i > 0; i--) {
                let j = Math.floor(Math.random() * (i + 1));
                [walls[i], walls[j]] = [walls[j], walls[i]];
                [visual_walls[i].color, visual_walls[j].color] = [
                    visual_walls[j].color,
                    visual_walls[i].color,
                ];
                drawGrid();
            }
        }
        await langsung();

        //
        //
        //
        //
        //
        //
        //
        //
        //
        //
        //
        //
        //
        //
        //
        //
        class DisjointSet {
            constructor(n) {
                this.parent = Array.from({ length: n }, (_, i) => i);
                this.rank = Array(n).fill(0);
            }

            // mencari parent/root
            // async find(x) {
            //     var cell = grid[x];
            //     cell.sedangDicek = true; // highlight cell yang lagi dicek
            //     setMessage(`Memeriksa node ${x}`);
            //     drawGrid();
            //     await sleep(delay * 10);

            //     // kalau bukan parent akan mencari sampai ketemu parent
            //     if (this.parent[x] !== x) {
            //         setMessage(
            //             `*** Node ${x} bukan parent, menuju node ${this.parent[x]}`
            //         );
            //         // highlight jalur menuju parent
            //         const nextIndex = this.parent[x];
            //         const nextCell = grid[nextIndex];
            //         nextCell.menujuParent = true;
            //         drawGrid();
            //         await sleep(delay * 10);
            //         // await sleep(delay);

            //         const root = await this.find(nextIndex); // <-- pakai await di sini

            //         // pas “balik” dari rekursi, spread warna balik ke bawah
            //         // cell.menujuParent = false;
            //         // cell.sedangDicek = false;
            //         // cell.terhubungKeParent = true;
            //         // drawGrid();
            //         // await sleep(delay * 10);;

            //         setMessage(`*** Node ${x} terhubung ke parent ${root}`);
            //         await sleep(delay * 10);

            //         return root;
            //     }

            //     // kalau sudah parent, bisa beri warna beda misalnya:
            //     cell.adalahParent = true;
            //     drawGrid();
            //     console.log(grid[this.parent[x]]);
            //     setMessage(`Node ${x} adalah parent/root`);
            //     await sleep(delay * 10);
            //     // cell.adalahParent = false;
            //     // cell.sedangDicek = false; // reset setelah tampil

            //     // cell.adalahParent = true;

            //     return this.parent[x];
            // }

            // mencari parent/root dengan animasi traversal penuh (C → B → A)
            async find(x) {
                const cell = grid[x];

                // 1️⃣ Tandai node sedang dicek
                cell.sedangDicek = true;
                setMessage(`Memeriksa node ${x}`);
                drawGrid();
                await sleep(delay * 10);

                // 2️⃣ Jika bukan parent, lanjut ke parent-nya
                if (this.parent[x] !== x) {
                    const nextIndex = this.parent[x];
                    const nextCell = grid[nextIndex];

                    setMessage(
                        `*** Node ${x} bukan parent, menuju node ${nextIndex}`
                    );
                    nextCell.menujuParent = true;
                    drawGrid();
                    await sleep(delay * 10);

                    // Rekursi ke parent (biar urutan ke atas kelihatan)
                    const root = await this.find(nextIndex);

                    // 3️⃣ Setelah balik dari rekursi
                    // cell.menujuParent = false;
                    // cell.sedangDicek = false;
                    cell.terhubungKeParent = true;
                    this.parent[x] = root;
                    setMessage(`*** Node ${x} terhubung ke parent ${root}`);
                    drawGrid();
                    await sleep(delay * 10);

                    return root;
                }

                // 4️⃣ Kalau sudah parent (root)
                cell.sedangDicek = false;
                cell.adalahParent = true;
                setMessage(`Node ${x} adalah parent/root`);
                drawGrid();
                await sleep(delay * 20); // biar kelihatan jelas

                // opsional: tetap nyala atau reset warna parent setelah beberapa saat
                // cell.adalahParent = false;
                // drawGrid();

                return this.parent[x];
            }

            async union(x, y) {
                setMessage(`Union (${x}, ${y}) - mencari root masing-masing`);
                let rx = await this.find(x);
                let ry = await this.find(y);

                // jika sudah di dalam grup yang sama
                if (rx === ry) {
                    setMessage(
                        `Node ${x} dan ${y} sudah dalam satu set (root: ${rx})`
                    );
                    return false;
                }

                // rank = perkiraan tinggi pohon
                if (this.rank[rx] < this.rank[ry]) {
                    this.parent[rx] = ry;
                    // setMessage(
                    //     `Root ${rx} bergabung ke ${ry} (rank ${this.rank[ry]} lebih tinggi)`
                    // );
                } else if (this.rank[rx] > this.rank[ry]) {
                    this.parent[ry] = rx;
                    // setMessage(
                    //     `Root ${ry} bergabung ke ${rx} (rank ${this.rank[rx]} lebih tinggi)`
                    // );
                } else {
                    this.parent[ry] = rx;
                    this.rank[rx]++;
                    // setMessage(
                    //     `Rank sama, ${ry} bergabung ke ${rx}, rank ${rx} bertambah menjadi ${this.rank[rx]}`
                    // );
                }
                await sleep(delay * 10);

                drawGrid();
                // await sleep(delay);
                await sleep(delay * 10);

                // for (let c of grid) {
                //     c.sedangDicek = false;
                // }

                return true;
            }
        }

        const ds = new DisjointSet(grid.length);
        let wallIndex = 0;
        let batchSize = 1;

        async function animateKruskal() {
            setMessage("Kruskal");
            for (let c of grid) {
                c.sedangDicek = false;
                c.adalahParent = false;
                c.menujuParent = false;
            }

            for (
                let n = 0;
                n < batchSize && wallIndex < walls.length;
                n++, wallIndex++
            ) {
                const [aIdx, bIdx] = walls[wallIndex];
                const a = grid[aIdx];
                const b = grid[bIdx];

                // STEP 1 : Cek 2 cell yang berhubungan denan wall
                a.sedangDicek = true;
                b.sedangDicek = true;
                drawGrid();

                // STEP 2 : FIND and UNION
                // jika kedua kotak ini belum terhubung
                if (ds.union(aIdx, bIdx)) {
                    removeWall(a, b);
                    a.visitted = true;
                    b.visitted = true;
                }

                // LAST STEP : hapus efek
                // hapus kembali
                a.highlight -= 0.5;
                b.highlight -= 0.5;
                a.sedangDicek = false;
                b.sedangDicek = false;
            }

            if (wallIndex < walls.length) {
                await sleep(delay + 100);
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

        // menyiapkan warna utk algoritma kruskal
        for (let c of grid) {
            c.sedangDicek = false;
            // c.color = [255, 171, 175];
            c.highlight = 1;
        }

        await animateKruskal();

        // // drawGrid();
        // setTimeout(() => {
        //     animateKruskal();
        // }, delay);
    });
}
