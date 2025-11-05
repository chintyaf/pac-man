function generateMaze() {
    return new Promise(async (resolve) => {
        // STEP 2  : Shuffle Walls
        let walls = [];
        async function daftarWall() {
            console.log("daftar");
            var counter = 1;

            for (let i = 0; i < cols; i++) {
                for (let j = 0; j < rows; j++) {
                    setStatus(`Input Wall #${counter}`);
                    let a = index(i, j);
                    grid[a].color = [100 + +j * 4, 70, 80 + i * 5];

                    // ---- VERTICAL WALL ----
                    if (i < cols - 1) {
                        let b = index(i + 1, j);
                        walls.push([a, b, "V"]);

                        grid[a].sedangDicek = true;
                        grid[b].sedangDicek = true;

                        setMessage(
                            `Cell [${i}, ${j}]  --> Cell [${i + 1}, ${j}]
                            (Vertical wall)`
                        );

                        counter += 1;
                        await animate();

                        grid[a].sedangDicek = false;
                        grid[b].sedangDicek = false;
                    }

                    // ---- HORIZONTAL WALL ----
                    if (j < rows - 1) {
                        let b = index(i, j + 1);
                        walls.push([a, b, "H"]);

                        grid[a].sedangDicek = true;
                        grid[b].sedangDicek = true;
                        setMessage(
                            `Cell [${i}, ${j}]  --> Cell [${i}, ${j + 1}]
                            (Horizontal wall)`
                        );

                        counter += 1;
                        await animate();

                        grid[a].sedangDicek = false;
                        grid[b].sedangDicek = false;
                    }
                }
            }
            skip = false;
        }

        // Shuffle Walls
        async function acakWall() {
            setStatus("Shuffle Walls");
            for (let i = 0; i <= walls.length - 1; i++) {
                let j = Math.floor(Math.random() * (i + 1));
                setMessage(`Switch wall #${i} <--> #${j}`);

                // wall 1  = i
                w1_a = grid[walls[i][0]]; // a
                w1_b = grid[walls[i][1]]; // b
                // wall 2  = j
                w2_a = grid[walls[j][0]]; // a
                w2_b = grid[walls[j][1]]; // b

                [walls[i], walls[j]] = [walls[j], walls[i]];

                [w1_a.color, w1_b.color, w2_a.color, w1_b.color] = [
                    w2_a.color,
                    w1_b.color,
                    w1_a.color,
                    w1_b.color,
                ];

                w1_a.sedangDicek = true;
                w1_b.sedangDicek = true;
                w2_a.sedangDicek = true;
                w2_b.sedangDicek = true;

                await animate();

                w1_a.sedangDicek = false;
                w1_b.sedangDicek = false;
                w2_a.sedangDicek = false;
                w2_b.sedangDicek = false;
            }
            if (skip) {
                skip = false;
                await animate();
            }
        }

        // ==========================
        // Buka Path
        // ==========================
        async function openPath(removeCount = 10) {
            setStatus("Smart Maze Modification");
            setMessage(`Maze (${removeCount} adjustments)`);

            // Helper to check if removing a wall disconnects regions too much
            function isCriticalWall(a, b) {
                // Simple heuristic: avoid removing if cells have < 2 open walls
                const openA = a.walls.filter((w) => !w).length;
                const openB = b.walls.filter((w) => !w).length;
                return openA < 1 || openB < 1;
            }

            // Get all possible "walls" (edges) between adjacent cells
            const allEdges = [];
            for (let j = 0; j < rows; j++) {
                for (let i = 0; i < cols; i++) {
                    const a = grid[index(i, j)];
                    if (i < cols - 1) allEdges.push([a, grid[index(i + 1, j)]]);
                    if (j < rows - 1) allEdges.push([a, grid[index(i, j + 1)]]);
                }
            }

            // Collect walls that are still CLOSED (potential candidates to open)
            const closedEdges = allEdges.filter(([a, b]) => {
                const dx = a.i - b.i,
                    dy = a.j - b.j;
                if (dx === 1 && a.walls[3] && b.walls[1]) return true;
                if (dx === -1 && a.walls[1] && b.walls[3]) return true;
                if (dy === 1 && a.walls[0] && b.walls[2]) return true;
                if (dy === -1 && a.walls[2] && b.walls[0]) return true;
                return false;
            });

            // Randomly shuffle candidate edges
            for (let i = closedEdges.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [closedEdges[i], closedEdges[j]] = [
                    closedEdges[j],
                    closedEdges[i],
                ];
            }

            // Modify the maze by opening selected walls
            let modified = 0;
            for (let [a, b] of closedEdges) {
                if (modified >= removeCount) break;
                if (isCriticalWall(a, b)) continue;

                // Visual highlight
                a.merah = true;
                b.merah = true;
                await animate();

                removeWall(a, b);
                modified++;

                setMessage(
                    `Removed wall between [${a.i},${a.j}] and [${b.i},${b.j}]`
                );
                a.merah = false;
                b.merah = false;
                await animate();
            }

            setStatus(`Smart modification done (${modified} walls removed).`);
            drawGrid();
        }

        // async function langsung() {
        //     setMessage("Daftarkan wall");
        //     for (let i = 0; i < cols; i++) {
        //         for (let j = 0; j < rows; j++) {
        //             let a = index(i, j);

        //             let cell = grid[index(i, j)];
        //             cell.color = [220 - j * 4, 96, 245 + i * 3];

        //             if (i < cols - 1) {
        //                 let b = index(i + 1, j);
        //                 walls.push([a, b, "V"]);
        //                 visual_walls.push(cell);
        //                 cell.highlight = 1; // exampl
        //             }

        //             if (j < rows - 1) {
        //                 let b = index(i, j + 1);
        //                 walls.push([a, b, "H"]);
        //                 cell.highlight = 1;
        //                 visual_walls.push(cell);
        //             }
        //         }
        //     }
        //     setMessage("Acak wall");
        //     for (let i = walls.length - 1; i > 0; i--) {
        //         let j = Math.floor(Math.random() * (i + 1));
        //         [walls[i], walls[j]] = [walls[j], walls[i]];
        //         [visual_walls[i].color, visual_walls[j].color] = [
        //             visual_walls[j].color,
        //             visual_walls[i].color,
        //         ];
        //         drawGrid();
        //     }
        // }

        // STEP 2 :
        await daftarWall();
        await acakWall();

        // await langsung();

        //
        class DisjointSet {
            constructor(n) {
                this.parent = Array.from({ length: n }, (_, i) => i);
                this.rank = Array(n).fill(0);
            }

            // async animate() {
            //     drawGrid();
            //     await sleep(delay / 0.5);
            // }

            // Mencari parent/root dengan visualisasi path rekursif
            async find(x, pathFromStart = []) {
                const cell = grid[x];
                pathFromStart.push(x);

                cell.sedangDicek = true;

                const pathStr = pathFromStart.join(" → ");
                setMessage(`🔍 Path: ${pathStr}`);
                await animate();

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
                await animate();

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
                    setMessage(
                        `Node ${x} dan ${y} sudah dalam satu set (root: ${rx})`
                    );

                    await animate();
                    // drawGrid();
                    // await sleep(delay * 15);

                    return false;
                }

                // Visualisasi keputusan union (warna kuning)
                // grid[rx].unionDecision = true;
                // grid[ry].unionDecision = true;
                // grid[rx].showIndex = true;
                // grid[ry].showIndex = true;
                // drawGrid();

                // Union by rank
                ////// INII APPAAAA??????!!!!!
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

                await animate();
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
                await animate();

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
                await animate();
            }

            if (wallIndex < walls.length) {
                await animate();
                // await sleep(delay);
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
                skip = false;
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
        // await langsungKruskal();
    });
}
