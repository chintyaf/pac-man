function generateMaze() {
    return new Promise(async (resolve) => {
        // STEP 2  : Shuffle Walls
        let walls = [];
        async function daftarWall() {
            var counter = 1;

            for (let i = 0; i < cols; i++) {
                for (let j = 0; j < rows; j++) {
                    setStatus(`Input Wall #${counter}`);
                    let a = index(i, j);
                    grid[a].color = [255, 150 + j * 15, 150 + i * 15];

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
            setStatus("Maze Modification");
            setMessage(`Maze (${removeCount} adjustments)`);

            await animate();
            // Simple heuristic: avoid removing if cells have < 2 open walls
            function isCriticalWall(a, b) {
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
                if (dx === 1 && a.walls[3] && b.walls[1]) {
                    return true;
                }
                if (dx === -1 && a.walls[1] && b.walls[3]) {
                    return true;
                }
                if (dy === 1 && a.walls[0] && b.walls[2]) {
                    return true;
                }
                if (dy === -1 && a.walls[2] && b.walls[0]) {
                    return true;
                }
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
                if (modified >= removeCount) {
                    break;
                }
                if (isCriticalWall(a, b)) {
                    continue;
                }

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

            // setStatus(`Smazt modification done (${modified} walls removed).`);
            drawGrid();
            skip = false;
        }

        // STEP 2 :
        await daftarWall();
        await acakWall();

        class DisjointSet {
            constructor(n) {
                this.parent = Array.from({ length: n }, (_, i) => i);
                this.rank = Array(n).fill(0);
            }

            // Cari root dengan path compression + visualisasi aman
            async find(x) {
                // Base case: jika x adalah root (parent[x] == x)
                if (this.parent[x] === x) {
                    // await animate();
                    grid[x].kuning = true;
                    setMessage(
                        `Root ditemukan di [${grid[x].i}, ${grid[x].j}] — tidak memiliki parent lain.`
                    );
                    await animate();
                    return x;
                }

                // Path compression — simpan root hasil rekursi
                const root = await this.find(this.parent[x]);
                this.parent[x] = root;
                return root;
            }

            async union(x, y) {
                drawGrid();

                setStatus(
                    `Union-Find (${x}, ${y}) : Menilai apakah jalur bisa dibuka`
                );

                // grid[x].sedangDicek = true;
                // setMessage();
                setMessage(
                    `Cell A : Mencari root [${grid[x].i}, ${grid[x].j}]`
                );
                await animate();
                const rx = await this.find(x);

                // grid[y].sedangDicek = true;
                setMessage(
                    `Cell B : Mencari root [${grid[y].i}, ${grid[y].j}]`
                );
                await animate();
                const ry = await this.find(y);

                if (rx === ry) {
                    setMessage(
                        `[${grid[x].i}, ${grid[x].j}] dan [${grid[y].i}, ${grid[y].j}] sudah dalam satu set`
                    );
                    await animate();

                    return false;
                }

                // Union by rank
                // Union by rank
                if (this.rank[rx] < this.rank[ry]) {
                    this.parent[rx] = ry;
                    setMessage(
                        `Root [${grid[rx].i},${grid[rx].j}] digabung ke root [${grid[ry].i},${grid[ry].j}] karena rank ${this.rank[rx]} < ${this.rank[ry]}`
                    );
                } else if (this.rank[rx] > this.rank[ry]) {
                    this.parent[ry] = rx;
                    setMessage(
                        `Root [${grid[ry].i},${grid[ry].j}] digabung ke root [${grid[rx].i},${grid[rx].j}] karena rank ${this.rank[ry]} < ${this.rank[rx]}`
                    );
                } else {
                    this.parent[ry] = rx;
                    this.rank[rx]++;
                    setMessage(
                        `Kedua root memiliki rank yang sama. Root [${grid[ry].i},${grid[ry].j}] digabung ke root [${grid[rx].i},${grid[rx].j}] dan rank [${grid[rx].i},${grid[rx].j}] naik menjadi ${this.rank[rx]}`
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

                setStatus(`Union Find -- Wall #${wallIndex}`);
                setMessage(`Cell [${a.i}, ${a.j}] - [${b.i}, ${b.j}]`);
                await animate();

                const connected = await ds.union(aIdx, bIdx);
                if (connected) {
                    removeWall(a, b);

                    setMessage(
                        `Wall #${wallIndex} dihapus! Cell [${a.i}, ${a.j}] -- [${b.i}, ${b.j}]`
                    );

                    a.hijau = true;
                    b.hijau = true;
                } else {
                    setMessage(`Wall #${wallIndex} tidak dihapus`);
                    a.merah = true;
                    b.merah = true;
                }

                await animate();
                a.checked += 1;
                b.checked += 1;
                a.merah = false;
                b.merah = false;
                a.hijau = false;
                b.hijau = false;
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
                skip = false;
                await openPath();
                for (let c of grid) {
                    c.checked = 0;
                    c.color = [40, 30, 40];
                    await animate(-100);
                }
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
