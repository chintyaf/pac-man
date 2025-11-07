class Ghost {
    constructor(x, y, color) {
        this.gridX = x;
        this.gridY = y;
        this.color = color;
        this.tileSize = window.cellWidth;

        this.state = "SEARCHING"; // SEARCHING, CALCULATING, MOVING_ON_PATH, IDLE
        this.path = [];

        this.pixelX = this.gridX * this.tileSize + this.tileSize / 2;
        this.pixelY = this.gridY * this.tileSize + this.tileSize / 2;

        this.targetPixelX = this.pixelX;
        this.targetPixelY = this.pixelY;
        this.moveSpeed = 4;
    }

    draw() {
        const radius = this.tileSize / 2 - 15;
        const headY = this.pixelY - radius / 3;

        // === Outline Kepala ===
        lingkaran_polar(
            imageDataA,
            this.pixelX,
            headY,
            radius,
            this.color.r,
            this.color.g,
            this.color.b
        );

        // === Outline Badan ===
        const bodyShape = [
            { x: -radius, y: -radius / 3 },
            { x: -radius, y: radius },
            { x: -radius + radius / 2, y: radius - radius / 3 },
            { x: 0, y: radius },
            { x: radius - radius / 2, y: radius - radius / 3 },
            { x: radius, y: radius },
            { x: radius, y: -radius / 3 },
        ];
        const T = { x: this.pixelX, y: this.pixelY };
        const translatedShape = translasi_array(bodyShape, T);
        polygon(
            imageDataA,
            translatedShape,
            this.color.r,
            this.color.g,
            this.color.b
        );

        // === Mata ===
        const eyeRadius = radius / 5;
        const eyeOffsetX = radius / 2.5;
        const eyeOffsetY = -(radius / 3);
        lingkaran_polar(
            imageDataA,
            this.pixelX - eyeOffsetX,
            this.pixelY + eyeOffsetY,
            eyeRadius,
            255,
            255,
            255
        );
        lingkaran_polar(
            imageDataA,
            this.pixelX + eyeOffsetX,
            this.pixelY + eyeOffsetY,
            eyeRadius,
            255,
            255,
            255
        );

        const fillColor = { r: this.color.r, g: this.color.g, b: this.color.b };
        function getColorAt(x, y) {
            const i = (Math.floor(y) * imageDataA.width + Math.floor(x)) * 4;
            return {
                r: imageDataA.data[i],
                g: imageDataA.data[i + 1],
                b: imageDataA.data[i + 2],
            };
        }
        function colorsMatch(c1, c2, tol = 2) {
            return (
                Math.abs(c1.r - c2.r) <= tol &&
                Math.abs(c1.g - c2.g) <= tol &&
                Math.abs(c1.b - c2.b) <= tol
            );
        }
        function safeFill(x, y) {
            const target = getColorAt(x, y);
            const start = { x: Math.floor(x), y: Math.floor(y) };
            const stack = [start];
            while (stack.length > 0) {
                const { x, y } = stack.pop();
                if (x < 0 || y < 0 || x >= cnv.width || y >= cnv.height)
                    continue;
                const i = (y * imageDataA.width + x) * 4;
                const c = {
                    r: imageDataA.data[i],
                    g: imageDataA.data[i + 1],
                    b: imageDataA.data[i + 2],
                };
                if (colorsMatch(c, target)) {
                    imageDataA.data[i] = fillColor.r;
                    imageDataA.data[i + 1] = fillColor.g;
                    imageDataA.data[i + 2] = fillColor.b;
                    imageDataA.data[i + 3] = 255;
                    stack.push({ x: x + 1, y });
                    stack.push({ x: x - 1, y });
                    stack.push({ x, y: y + 1 });
                    stack.push({ x, y: y - 1 });
                }
            }
        }
        safeFill(this.pixelX, this.pixelY - radius / 3); // kepala
        safeFill(this.pixelX, this.pixelY + radius / 3); // badan tengah
        safeFill(this.pixelX, this.pixelY + radius - 5); // kaki
        ctx.putImageData(imageDataA, 0, 0);
    }

    update(pacman) {
        if (window.sedangGameOver || window.sedangMenang) {
            this.state = "IDLE"; // Tetapkan Ghost ke status diam
            return;
        }

        if (this.state === "SEARCHING") {
            this.state = "CALCULATING";
            this._visualizedBFS(pacman);
        }

        // biar ga patah"
        let dx = this.targetPixelX - this.pixelX;
        let dy = this.targetPixelY - this.pixelY;
        let dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < this.moveSpeed) {
            this.pixelX = this.targetPixelX;
            this.pixelY = this.targetPixelY;

            if (this.state === "MOVING_ON_PATH") {
                if (this.checkCollision(pacman)) {
                    this.state = "IDLE";
                } else {
                    this._setNextPathTarget();
                }
            }
        } else {
            this.pixelX += (dx / dist) * this.moveSpeed;
            this.pixelY += (dy / dist) * this.moveSpeed;
        }
    }

    _setNextPathTarget() {
        if (this.path.length > 0) {
            const nextStep = this.path.shift();
            this.gridX = nextStep.x;
            this.gridY = nextStep.y;
            this.targetPixelX = nextStep.x * this.tileSize + this.tileSize / 2;
            this.targetPixelY = nextStep.y * this.tileSize + this.tileSize / 2;
            return true;
        } else {
            this.state = "SEARCHING";
            return false;
        }
    }

    _findNextMoveRandom() {
        const validMoves = this._getValidMovesFromGrid(this.gridX, this.gridY);
        if (validMoves.length > 0) {
            const randomIndex = Math.floor(Math.random() * validMoves.length);
            return validMoves[randomIndex];
        }
        return { x: 0, y: 0 };
    }

    async _visualizedBFS(pacman) {
        if (window.sedangGameOver || window.sedangMenang) {
            return;
        }
        const mazeGrid = window.grid || [];
        if (mazeGrid.length === 0) {
            this.state = "SEARCHING";
            return;
        }

        const index = window.index;
        const drawGrid = window.drawGrid;
        const drawDots = window.drawDots;
        const animate = window.animate;

        // Fungsi lokal untuk merender frame penuh
        const renderFullFrame = () => {
            if (window.sedangGameOver || window.sedangMenang) {
                return;
            }
            ctx.clearRect(0, 0, cnv.width, cnv.height);
            drawGrid();
            imageDataA = ctx.getImageData(0, 0, cnv.width, cnv.height);
            pacman.draw();
            ghosts.forEach((ghost) => ghost.draw());
            drawDots();
            ctx.putImageData(imageDataA, 0, 0);
        };

        const cleanupAndExit = () => {
            for (const c of mazeGrid) {
                c.sedangDicek = false;
                c.adalahParent = false;
                c.menujuParent = false;
                c.visitted = false;
            }
            renderFullFrame();
            this.state = "IDLE";
        };

        if (window.sedangGameOver || window.sedangMenang) {
            cleanupAndExit();
            return;
        }

        const start = { x: this.gridX, y: this.gridY };
        const end = { x: pacman.i, y: pacman.j };
        const queue = [];
        const parentMap = new Map();
        const visited = new Set();
        const startKey = `${start.x},${start.y}`;
        queue.push(start);
        visited.add(startKey);
        parentMap.set(startKey, null);
        let pathFound = false;

        // Reset semua status visualisasi di grid
        for (const cell of mazeGrid) {
            cell.sedangDicek = false;
            cell.adalahParent = false;
            cell.menujuParent = false;
            cell.visitted = false;
        }

        setStatus("BFS: Memulai Pencarian Jalur...");
        setMessage(`Memulai dari Node awal: (${start.x}, ${start.y}).`);
        renderFullFrame();
        await animate();

        if (window.sedangGameOver || window.sedangMenang) {
            cleanupAndExit();
            return;
        }

        // cari
        while (queue.length > 0) {
            const pos = queue.shift();
            const cell = mazeGrid[index(pos.x, pos.y)];

            if (cell) {
                cell.menujuParent = false;
                cell.sedangDicek = true;
            }
            setStatus("BFS: Menganalisis Node Aktif");
            setMessage(
                `Mengambil & Memproses Node (${pos.x}, ${pos.y}) dari antrian.`
            );

            renderFullFrame();
            await animate();

            // Cek 2: Setelah visualisasi node sedang diproses
            if (window.sedangGameOver || window.sedangMenang) {
                cleanupAndExit();
                return;
            }

            // cek tujuan
            if (pos.x === end.x && pos.y === end.y) {
                pathFound = true;
                if (cell) cell.adalahParent = true;
                setStatus("BFS: Tujuan Ditemukan!");
                setMessage(
                    `Tujuan ditemukan di Node (${pos.x}, ${pos.y})! Menghentikan pencarian.`
                );
                renderFullFrame();
                await animate();
                // Cek 3 (Opsional tapi aman): Setelah animasi tujuan ditemukan
                if (window.sedangGameOver || window.sedangMenang) {
                    cleanupAndExit();
                    return;
                }
                await animate();
                // Cek 4 (Opsional tapi aman): Setelah jeda kedua
                if (window.sedangGameOver || window.sedangMenang) {
                    cleanupAndExit();
                    return;
                }
                break;
            }

            // cek tetangga
            setMessage(`Node (${pos.x}, ${pos.y}): Mengecek tetangga...`);
            renderFullFrame();
            await animate();

            // Cek 5: Setelah visualisasi pengecekan tetangga
            if (window.sedangGameOver || window.sedangMenang) {
                cleanupAndExit();
                return;
            }

            const validMoves = this._getValidMovesFromGrid(pos.x, pos.y);
            let neighborsFound = 0;
            for (const move of validMoves) {
                const nextX = pos.x + move.x;
                const nextY = pos.y + move.y;
                const nextPosKey = `${nextX},${nextY}`;

                if (!visited.has(nextPosKey)) {
                    visited.add(nextPosKey);
                    parentMap.set(nextPosKey, pos);
                    queue.push({ x: nextX, y: nextY });
                    neighborsFound++;

                    // SET STATE: "In Queue" (Oranye)
                    const nextCell = mazeGrid[index(nextX, nextY)];
                    if (nextCell) {
                        nextCell.menujuParent = true;
                    }

                    setMessage(
                        `Menemukan tetangga baru: (${nextX}, ${nextY}). Memasukkannya ke antrian.`
                    );
                    renderFullFrame();
                    await animate();

                    // Cek 6: Setelah visualisasi tetangga baru
                    if (window.sedangGameOver || window.sedangMenang) {
                        cleanupAndExit();
                        return;
                    }
                }
            }

            // 5. SET STATE: "Visited" (Abu-abu)
            if (cell) {
                cell.sedangDicek = false;
                cell.visitted = true;
            }
            setStatus("BFS: Node Selesai Diproses");
            setMessage(
                `Selesai memproses (${pos.x}, ${pos.y}). Node ditandai 'Visited'.`
            );

            renderFullFrame();
            await animate(); // Animate status akhir node

            // Cek 7: Setelah visualisasi node selesai diproses
            if (window.sedangGameOver || window.sedangMenang) {
                cleanupAndExit();
                return;
            }
        }

        // Final check sebelum rekonstruksi
        renderFullFrame();
        await animate();
        if (window.sedangGameOver || window.sedangMenang) {
            cleanupAndExit();
            return;
        }

        // bikin ulang path
        this.path = [];
        if (pathFound) {
            setStatus("BFS: Path Ditemukan!");
            setMessage("Merekam jalur terpendek dari tujuan ke titik awal...");
            await animate(); // Animate header
            if (window.sedangGameOver || window.sedangMenang) {
                cleanupAndExit();
                return;
            }

            let current = end;
            while (
                current &&
                (current.x !== start.x || current.y !== start.y)
            ) {
                this.path.push(current);
                const currentKey = `${current.x},${current.y}`;
                const cell = mazeGrid[index(current.x, current.y)];

                // SET STATE: "Final Path" (Merah)
                if (cell) {
                    cell.adalahParent = true;
                    cell.visitted = false;
                    cell.menujuParent = false;
                }
                setMessage(
                    `Merekam jalur: Node (${current.x}, ${current.y}) adalah bagian dari jalur terpendek.`
                );
                renderFullFrame();
                await animate();

                // Cek 8: Setelah visualisasi penandaan path langkah 1
                if (window.sedangGameOver || window.sedangMenang) {
                    cleanupAndExit();
                    return;
                }
                await animate();
                // Cek 9: Setelah visualisasi penandaan path langkah 2
                if (window.sedangGameOver || window.sedangMenang) {
                    cleanupAndExit();
                    return;
                }

                current = parentMap.get(currentKey);
            }
            this.path.reverse();
        }

        // reset visualisasi
        cleanupAndExit(); // Melakukan reset visualisasi dan state = IDLE

        if (pathFound && this.path.length > 0) {
            this.state = "MOVING_ON_PATH";
            this._setNextPathTarget();
            setStatus("Ghost: Mengejar Pac-Man!");
            setMessage(
                `Jalur ${this.path.length} langkah akan dieksekusi. Gerakan Ghost dimulai.`
            );
        } else {
            this.state = "SEARCHING";
            setStatus("Ghost: Tidak ada jalur!");
            setMessage(
                `Tidak bisa menemukan jalur ke Pac-Man. Mencari ulang...`
            );
        }
    }

    _getValidMovesFromGrid(x, y) {
        const directions = [
            { x: 0, y: -1 }, // Atas
            { x: 0, y: 1 }, // Bawah
            { x: -1, y: 0 }, // Kiri
            { x: 1, y: 0 }, // Kanan
        ];
        const validMoves = [];
        const mazeGrid = window.grid || [];
        const cols = Math.floor(cnv.width / this.tileSize);
        const rows = Math.floor(cnv.height / this.tileSize);
        const currentIndex = x + y * cols;
        const currentCell = mazeGrid[currentIndex];

        if (!currentCell) return validMoves;

        for (let i = 0; i < directions.length; i++) {
            const dir = directions[i];
            const nextX = x + dir.x;
            const nextY = y + dir.y;
            if (nextX < 0 || nextX >= cols || nextY < 0 || nextY >= rows) {
                continue;
            }
            let hasWall = false;
            if (dir.y === -1) hasWall = currentCell.walls[0];
            else if (dir.y === 1) hasWall = currentCell.walls[2];
            else if (dir.x === -1) hasWall = currentCell.walls[3];
            else if (dir.x === 1) hasWall = currentCell.walls[1];

            if (!hasWall) validMoves.push(dir);
        }
        return validMoves;
    }

    checkCollision(pacman) {
        return this.gridX === pacman.i && this.gridY === pacman.j;
    }
}

var ghosts = [];
var gameLoopRunning = false;

function getGridFromMaze() {
    return window.grid || [];
}

function initializeGhostsAfterMaze() {
    const cols = Math.floor(cnv.width / cell_width);
    const rows = Math.floor(cnv.height / cell_width);
    ghosts = [];

    let ghost1 = new Ghost(0, 0, { r: 255, g: 0, b: 0 }, cellWidth);
    ghost1.state = "SEARCHING";
    ghosts.push(ghost1);

    // let ghost2 = new Ghost(cols - 1, 0, { r: 255, g: 184, b: 255 }, cellWidth);
    // ghost2.state = "SEARCHING";
    // ghosts.push(ghost2);

    // console.log("Ghosts initialized:", ghosts.length);
}

function canMove(fromX, fromY, toX, toY, gridData) {
    const cols = Math.floor(cnv.width / 35);
    const rows = Math.floor(cnv.height / 35);

    if (toX < 0 || toX >= cols || toY < 0 || toY >= rows) {
        return false;
    }
    const fromIndex = fromX + fromY * cols;
    const fromCell = gridData[fromIndex];

    if (!fromCell) return false;

    const dx = toX - fromX;
    const dy = toY - fromY;

    if (dx === 1 && fromCell.walls[1]) return false; // Ke kanan
    if (dx === -1 && fromCell.walls[3]) return false; // Ke kiri
    if (dy === 1 && fromCell.walls[2]) return false; // Ke bawah
    if (dy === -1 && fromCell.walls[0]) return false; // Ke atas

    return true;
}
