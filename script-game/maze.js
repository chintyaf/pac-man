function generateMaze() {
    return new Promise(async (resolve) => {
        // STEP 2  : Shuffle Walls
        let walls = [];
        let visual_walls = []; // visualisasi
        async function daftarWall() {
            // setMessage("Daftarkan wall");
            var counter = 1;
            for (let i = 0; i < cols; i++) {
                for (let j = 0; j < rows; j++) {
                    setStatus(`Input Wall #${counter}`);
                    let a = index(i, j);

                    grid[a].color = [100 + +j * 4, 70, 80 + i * 5];
                    // 40, 30, 40
                    // grid[a].color = [220 - j */ 4, 96, 245 + i * 3];
                    // grid[a].line_color = [0, 0, 0];

                    if (i < cols - 1) {
                        let b = index(i + 1, j);
                        walls.push([a, b, "V"]);
                        visual_walls.push(grid[a]);

                        grid[a].sedangDicek = true;
                        grid[b].sedangDicek = true;

                        setMessage(
                            `Cell [${i}, ${j}]  --> Cell [${i + 1}, ${j}]
                            (Vertical wall)`
                        );

                        counter += 1;
                        drawGrid();
                        await sleep();

                        grid[a].sedangDicek = false;
                        grid[b].sedangDicek = false;
                    }

                    if (j < rows - 1) {
                        let b = index(i, j + 1);
                        walls.push([a, b, "H"]);
                        visual_walls.push(grid[a]);

                        grid[a].sedangDicek = true;
                        grid[b].sedangDicek = true;
                        setMessage(
                            `Cell [${i}, ${j}]  --> Cell [${i}, ${j + 1}]
                            (Horizontal wall)`
                        );
                        counter += 1;
                        drawGrid();
                        await sleep();

                        grid[a].sedangDicek = false;
                        grid[b].sedangDicek = false;
                    }
                }
            }
        }

        // Shuffle Walls
        async function acakWall() {
            setStatus("Shuffle Walls");
            for (let i = 0; i <= walls.length - 1; i++) {
                let j = Math.floor(Math.random() * (i + 1));
                setMessage(`Switch wall #${i} <--> #${j}`);
                console.log(i, j);

                // wall 1  = i
                w1_a = grid[walls[i][0]]; // a
                w1_b = grid[walls[i][1]]; // b
                // wall 2  = j
                w2_a = grid[walls[j][0]]; // a
                w2_b = grid[walls[j][1]]; // b

                [walls[i], walls[j]] = [walls[j], walls[i]];
                // [visual_walls[i].color, visual_walls[j].color] = [
                //     visual_walls[j].color,
                //     visual_walls[i].color,
                // ];

                [w1_a.color, w1_b.color, w2_a.color, w1_b.color] = [
                    w2_a.color,
                    w1_b.color,
                    w1_a.color,
                    w1_b.color,
                ];

                // visual_walls[i].sedangDicek = true;
                // visual_walls[j].sedangDicek = true;
                w1_a.sedangDicek = true;
                w1_b.sedangDicek = true;
                w2_a.sedangDicek = true;
                w2_b.sedangDicek = true;

                drawGrid();
                await sleep();
                w1_a.sedangDicek = false;
                w1_b.sedangDicek = false;
                w2_a.sedangDicek = false;
                w2_b.sedangDicek = false;
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

        const open_probability = 0.3; // 30% chance to open a wall

        async function openPath() {
            for (let [aIdx, bIdx] of walls) {
                const a = grid[aIdx];
                const b = grid[bIdx];

                a.sedangDicek = true;
                b.sedangDicek = true;
                drawGrid();
                await sleep(delay);

                // generate random number between 0 and 1
                if (Math.random() < open_probability) {
                    // open the path between a and b
                    a.merah = true;
                    b.merah = true;
                    removeWall(a, b);
                    setMessage(
                        `Hapus wall di cell [${a.i}, ${a.j}] -- [${b.i}, ${b.j}]`
                    );
                    drawGrid();
                    await sleep(delay);

                    a.merah = false;
                    b.merah = false;
                }
                a.sedangDicek = false;
                b.sedangDicek = false;
            }
        }

        async function langsung() {
            setMessage("Daftarkan wall");
            for (let i = 0; i < cols; i++) {
                for (let j = 0; j < rows; j++) {
                    let a = index(i, j);

                    let cell = grid[index(i, j)];
                    cell.color = [220 - j * 4, 96, 245 + i * 3];

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
        await daftarWall();
        await acakWall();

        // await langsung();

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
                await sleep(delay / 0.5);
            }

            // Mencari parent/root dengan visualisasi path rekursif
            async find(x, pathFromStart = []) {
                const cell = grid[x];
                pathFromStart.push(x);

                cell.sedangDicek = true;

                const pathStr = pathFromStart.join(" → ");
                setMessage(`🔍 Path: ${pathStr}`);
                await this.animate();

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
                    // console.log("test 1");

                    return root;
                }

                cell.sedangDicek = false;
                cell.adalahParent = true;
                setMessage(`👑 ROOT! Path lengkap: ${pathStr}`);
                await this.animate();

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
                // drawGrid();

                setMessage(`Union (${x}, ${y}) - mencari root masing-masing`);

                // Highlight cell yang akan di-union
                // grid[x].sedangDicek = true;
                // grid[y].sedangDicek = true;
                // this.animate();

                // grid[x].sedangDicek = false;
                // grid[y].sedangDicek = false;
                // drawGrid();
                // this.animate();

                setMessage(`Mencari root dari node ${x}`);
                let rx = await this.find(x, []);

                // Reset visualisasi find sebelum cari root y
                // for (let c of grid) {
                //     c.sedangDicek = false;
                //     c.adalahParent = false;
                //     c.menujuParent = false;
                // }

                // drawGrid();
                // await sleep(delay * 5);

                // Cari root y
                // grid[y].sedangDicek = true;
                setMessage(`Mencari root dari node ${y}`);
                let ry = await this.find(y, []);

                // Reset visualisasi setelah find
                // for (let c of grid) {
                //     c.sedangDicek = false;
                //     c.adalahParent = false;
                //     c.menujuParent = false;
                // }
                // drawGrid();

                // Jika sudah dalam satu set
                if (rx === ry) {
                    // grid[rx].unionDecision = true;
                    drawGrid();
                    setMessage(
                        `Node ${x} dan ${y} sudah dalam satu set (root: ${rx})`
                    );
                    await sleep(delay * 15);

                    return false;
                }

                // Visualisasi keputusan union (warna kuning)
                // grid[rx].unionDecision = true;
                // grid[ry].unionDecision = true;
                // grid[rx].showIndex = true;
                // grid[ry].showIndex = true;
                // drawGrid();

                // Union by rank
                if (this.rank[rx] < this.rank[ry]) {
                    this.parent[rx] = ry;
                    setMessage(
                        `Root ${rx} bergabung ke ${ry} (rank: ${this.rank[ry]} < ${this.rank[rx]})`
                    );
                } else if (this.rank[rx] > this.rank[ry]) {
                    this.parent[ry] = rx;
                    setMessage(
                        `Root ${ry} bergabung ke ${rx} (rank: ${this.rank[rx]} > ${this.rank[ry]})`
                    );
                } else {
                    this.parent[ry] = rx;
                    this.rank[rx]++;
                    setMessage(
                        `Rank sama (${
                            this.rank[rx] - 1
                        }), ${ry} bergabung ke ${rx}, rank ${rx} → ${
                            this.rank[rx]
                        }`
                    );
                }

                await this.animate();
                return true;
            }
        }

        const ds = new DisjointSet(grid.length);
        let wallIndex = 0;
        let batchSize = 1;

        async function animateKruskal() {
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
                setStatus(`Memproses wall #${wallIndex}`);
                setMessage(`Cell [${a.i}, ${a.j}] - [${b.i}, ${b.j}]`);
                drawGrid();
                await sleep(delay * 3);

                const connected = await ds.union(aIdx, bIdx);
                if (connected) {
                    removeWall(a, b);

                    setMessage(
                        `Wall #${wallIndex} dihapus! Cell [${a.i}, ${a.j}] dan [${b.i}, ${b.j}] terhubung`
                    );
                } else {
                    setMessage(
                        `Wall #${wallIndex} tidak dihapus (sudah terhubung)`
                    );
                }

                a.checked += 1;
                b.checked += 1;
                drawGrid();
                await sleep(delay);
            }

            if (wallIndex < walls.length) {
                await sleep(delay);
                requestAnimationFrame(animateKruskal);
            } else {
                // Selesai
                resetState();
                setStatus("Maze selesai dibuat!");
                setMessage(
                    "Maze complete! Grid available:",
                    window.grid.length
                );
                drawGrid();
                await openPath();

                resolve();
            }
        }

        // menyiapkan warna utk algoritma kruskal
        for (let c of grid) {
            c.sedangDicek = false;
            c.color = [40, 30, 40];
            // c.color = [0, 0, 0];
            c.line_color = [218, 50, 100];
            c.highlight = 1;
        }

        await animateKruskal();
    });
}
