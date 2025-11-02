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

            // Mencari parent/root dengan visualisasi step-by-step
            async find(x) {
                const cell = grid[x];

                // 1️Tandai node sedang dicek (warna hijau muda)
                cell.sedangDicek = true;
                cell.showIndex = true; // Tampilkan index
                setMessage(`🔍 testt Memeriksa node ${x}`);
                drawGrid();

                await sleep(delay * 10);

                // 2️⃣ Jika bukan parent, lanjut ke parent-nya
                if (this.parent[x] !== x) {
                    const nextIndex = this.parent[x];

                    setMessage(`📍 Node ${x} → menuju parent ${nextIndex}`);
                    await sleep(delay * 10);

                    // Rekursi ke parent (visualisasi naik ke atas)
                    const root = await this.find(nextIndex);

                    // 3️⃣ Setelah dapat root, hubungkan langsung (path compression)
                    this.parent[x] = root;
                    cell.sedangDicek = false;
                    cell.terhubungKeParent = true;
                    cell.showIndex = true; // Tetap tampilkan index

                    setMessage(`🔗 Node ${x} terhubung ke root ${root}`);
                    drawGrid();
                    await sleep(delay * 10);

                    return root;
                }

                // 4️⃣ Jika ini adalah root (warna merah)
                cell.sedangDicek = false;
                cell.adalahParent = true;
                cell.showIndex = true; // Tampilkan index root
                setMessage(`👑 Node ${x} adalah root/parent`);
                drawGrid();
                await sleep(delay * 15);

                return this.parent[x];
            }

            async union(x, y) {
                // Reset semua state visualisasi sebelum mulai
                for (let c of grid) {
                    c.sedangDicek = false;

                    c.adalahParent = false;
                    c.terhubungKeParent = false;
                    c.unionDecision = false;
                    c.showIndex = false;
                }
                drawGrid();

                setMessage(
                    `🔄 Union (${x}, ${y}) - mencari root masing-masing`
                );

                // Highlight cell yang akan di-union
                grid[x].sedangDicek = true;
                grid[y].sedangDicek = true;
                drawGrid();
                await sleep(delay * 3);

                grid[x].sedangDicek = false;
                grid[y].sedangDicek = false;
                drawGrid();

                // Cari root x
                grid[x].sedangDicek = true;
                drawGrid();

                setMessage(`🔍 Mencari root dari node ${x}...`);
                await sleep(delay * 5);
                let rx = await this.find(x);

                // Reset visualisasi find sebelum cari root y
                for (let c of grid) {
                    c.sedangDicek = false;
                    c.adalahParent = false;
                    c.terhubungKeParent = false;
                    c.showIndex = false;
                }
                drawGrid();
                await sleep(delay * 5);

                // Cari root y
                grid[y].sedangDicek = true;
                setMessage(`🔍 Mencari root dari node ${y}...`);
                await sleep(delay * 5);
                let ry = await this.find(y);

                // Reset visualisasi setelah find
                for (let c of grid) {
                    c.sedangDicek = false;
                    c.adalahParent = false;
                    c.terhubungKeParent = false;
                    c.showIndex = false;
                }
                drawGrid();

                // Jika sudah dalam satu set
                if (rx === ry) {
                    grid[rx].showIndex = true;
                    grid[rx].unionDecision = true;
                    drawGrid();
                    setMessage(
                        `✅ Node ${x} dan ${y} sudah dalam satu set (root: ${rx})`
                    );
                    await sleep(delay * 15);

                    grid[rx].showIndex = false;
                    grid[rx].unionDecision = false;
                    return false;
                }

                // Visualisasi keputusan union (warna kuning)
                grid[rx].unionDecision = true;
                grid[ry].unionDecision = true;
                grid[rx].showIndex = true;
                grid[ry].showIndex = true;
                drawGrid();

                // Union by rank
                if (this.rank[rx] < this.rank[ry]) {
                    this.parent[rx] = ry;
                    setMessage(
                        `⚡ Root ${rx} bergabung ke ${ry} (rank: ${this.rank[ry]} > ${this.rank[rx]})`
                    );
                } else if (this.rank[rx] > this.rank[ry]) {
                    this.parent[ry] = rx;
                    setMessage(
                        `⚡ Root ${ry} bergabung ke ${rx} (rank: ${this.rank[rx]} > ${this.rank[ry]})`
                    );
                } else {
                    this.parent[ry] = rx;
                    this.rank[rx]++;
                    setMessage(
                        `⚡ Rank sama (${
                            this.rank[rx] - 1
                        }), ${ry} bergabung ke ${rx}, rank ${rx} → ${
                            this.rank[rx]
                        }`
                    );
                }

                await sleep(delay * 15);

                // Reset state union decision
                grid[rx].unionDecision = false;
                grid[ry].unionDecision = false;
                grid[rx].showIndex = false;
                grid[ry].showIndex = false;
                drawGrid();

                return true;
            }
        }

        const ds = new DisjointSet(grid.length);
        let wallIndex = 0;
        let batchSize = 1;

        async function animateKruskal() {
            setMessage("Memulai Algoritma Kruskal");

            // Reset semua state
            for (let c of grid) {
                c.sedangDicek = false;
                c.adalahParent = false;
                c.terhubungKeParent = false;
                c.unionDecision = false;
                c.showIndex = false;
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
                setMessage(
                    `Memproses wall #${wallIndex}: cell ${aIdx} ↔ ${bIdx}`
                );
                drawGrid();
                await sleep(delay * 3);

                // Proses union (akan otomatis visualisasi find)
                const connected = await ds.union(aIdx, bIdx);

                if (connected) {
                    removeWall(a, b);

                    setMessage(
                        `✅ Wall #${wallIndex} dihapus! Cell ${aIdx} dan ${bIdx} terhubung`
                    );

                    a.sedangDicek = true;
                    b.sedangDicek = true;
                    drawGrid();

                    console.log(a.highlight, b.highlight);
                } else {
                    setMessage(
                        `❌ Wall #${wallIndex} tidak dihapus (sudah terhubung)`
                    );
                }

                await sleep(delay * 5);

                // Reset highlight
                drawGrid();
                // a.visitted = true;
                // b.visitted = true;
                a.highlight -= 0.5;
                b.highlight -= 0.5;
                await sleep(delay * 5);
            }

            if (wallIndex < walls.length) {
                await sleep(delay);
                setTimeout(() => {
                    requestAnimationFrame(animateKruskal);
                }, delay);
            } else {
                // Selesai
                for (let c of grid) {
                    c.sedangDicek = false;
                    c.adalahParent = false;
                    c.terhubungKeParent = false;
                    c.unionDecision = false;
                    c.showIndex = false;
                }

                setMessage("Maze selesai dibuat!");
                drawGrid();
                console.log(
                    "Maze complete! Grid available:",
                    window.grid.length
                );
                resolve();
            }
        }

        // menyiapkan warna utk algoritma kruskal
        for (let c of grid) {
            c.sedangDicek = false;
            c.color = [252, 210, 223];
            c.highlight = 1;
        }

        await animateKruskal();

        // // drawGrid();
        // setTimeout(() => {
        //     animateKruskal();
        // }, delay);
    });
}
