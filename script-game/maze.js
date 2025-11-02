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
                            `Cell [${i}, ${j}]  --> Cell [${i + 1}, ${j}]
                            )} (Vertical wall)`
                        );
                    }

                    if (j < rows - 1) {
                        let b = index(i, j + 1);
                        walls.push([a, b, "H"]);
                        cell.highlight = 1;
                        visual_walls.push(cell);
                        setMessage(
                            `Cell [${i}, ${j}]  --> Cell [${i}, ${
                                j + 1
                            }] - (Horizontal wall)`
                        );
                    }
                    drawGrid();
                    await sleep();
                }
            }
        }

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

        // STEP 2 :
        // await daftarWall();
        // await acakWall();

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
        class DisjointSet {
            constructor(n) {
                this.parent = Array.from({ length: n }, (_, i) => i);
                this.rank = Array(n).fill(0);
            }

            async animate() {
                drawGrid();
                await sleep(delay);
            }

            // Mencari parent/root dengan visualisasi path rekursif
            async find(x, pathFromStart = []) {
                const cell = grid[x];
                pathFromStart.push(x);

                cell.sedangDicek = true;

                const pathStr = pathFromStart.join(" → ");
                setMessage(`🔍 Path: ${pathStr}`);
                this.animate();

                // Jika bukan parent, lanjut ke parent-nya
                if (this.parent[x] !== x) {
                    const nextIndex = this.parent[x];

                    cell.menujuParent = true;
                    grid[nextIndex].showIndex = true;

                    setMessage(
                        `📍 ${x} → ${nextIndex} (Path: ${pathStr} -> ${nextIndex})`
                    );

                    const root = await this.find(nextIndex, pathFromStart);

                    // this.animate();
                    this.parent[x] = root;
                    cell.terhubungKeParent = true;

                    setMessage(`🔗 ${x} langsung ke root ${root}`);
                    // this.animate();
                    for (let c of grid) {
                        c.menujuParent = false;
                    }
                    return root;
                }

                cell.sedangDicek = false;
                cell.adalahParent = true;
                setMessage(`👑 ROOT! Path lengkap: ${pathStr}`);
                this.animate();

                return this.parent[x];
            }

            async union(x, y) {
                // Reset semua state visualisasi sebelum mulai
                // for (let c of grid) {
                //     c.sedangDicek = false;
                //     c.adalahParent = false;
                //     c.terhubungKeParent = false;
                //     c.unionDecision = false;
                //     c.showIndex = false;
                //     this.menujuParent = false;
                // }
                drawGrid();

                setMessage(`Union (${x}, ${y}) - mencari root masing-masing`);

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
                // let rx = await this.find(x);
                let rx = await this.find(x, []);

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
                // let ry = await this.find(y);
                let ry = await this.find(y, []);

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

            resetState();

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
                    `Memproses wall #${wallIndex}: cell ${aIdx} -- ${bIdx}`
                );
                drawGrid();
                await sleep(delay * 3);

                // Proses union (akan otomatis visualisasi find)
                const connected = await ds.union(aIdx, bIdx);

                if (connected) {
                    removeWall(a, b);

                    setMessage(
                        `Wall #${wallIndex} dihapus! Cell ${aIdx} dan ${bIdx} terhubung`
                    );

                    a.sedangDicek = true;
                    b.sedangDicek = true;
                    drawGrid();
                } else {
                    setMessage(
                        `Wall #${wallIndex} tidak dihapus (sudah terhubung)`
                    );
                }

                await sleep(delay * 5);

                // Reset highlight
                drawGrid();
                a.checked += 1;
                b.checked += 1;
                await sleep(delay * 5);
            }

            if (wallIndex < walls.length) {
                await sleep(delay);
                setTimeout(() => {
                    requestAnimationFrame(animateKruskal);
                }, delay);
            } else {
                // Selesai
                resetState();
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
            c.color = [230, 230, 230];
            c.highlight = 1;
        }

        await animateKruskal();
    });
}
