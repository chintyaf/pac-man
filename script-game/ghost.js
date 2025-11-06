function createGhost(x, y, color) {
    // state dasar
    var ghost = {};
    ghost.gridX = x;
    ghost.gridY = y;
    ghost.color = color || { r: 255, g: 0, b: 0 };
    ghost.tileSize = window.cellWidth;
    ghost.mode = "CHASE";

    // posisi pixel (tengah tile)
    ghost.pixelX = ghost.gridX * ghost.tileSize + ghost.tileSize / 2;
    ghost.pixelY = ghost.gridY * ghost.tileSize + ghost.tileSize / 2;

    ghost.currentDir = { x: 0, y: 0 };
    ghost.speed = 2;

    // state machine simple
    ghost.state = "IDLE"; // IDLE, VISUALIZING_BFS, MOVING_ALONG_PATH

    // BFS visual / path following state
    ghost.bfsPathToFollow = [];
    ghost.isAnimatingBFS = false;
    ghost.bfsQueue = [];
    ghost.bfsVisited = new Set();
    ghost.bfsCurrentNode = null;
    ghost.bfsExploring = [];
    ghost.bfsFinalPath = [];
    ghost.bfsStep = 0;
    ghost.bfsTargetNode = null;

    // update dipanggil setiap frame dari loop utama
    ghost.update = function(pacman) {
        if (window.sedangMenang || window.sedangGameOver) return;

        if (ghost.state === "VISUALIZING_BFS") {
            // jika sedang visualisasi BFS, kita tidak menggerakkan ghost
            return;
        }

        if (ghost.state === "IDLE") {
            // set posisi grid berdasarkan pixel (mis: setelah berhenti)
            ghost.gridX = Math.floor(ghost.pixelX / ghost.tileSize);
            ghost.gridY = Math.floor(ghost.pixelY / ghost.tileSize);

            ghost.state = "VISUALIZING_BFS";
            ghost.isAnimatingBFS = true;
            ghost.runBfsCycle(pacman);
            return;
        }

        if (ghost.state === "MOVING_ALONG_PATH") {
            ghost.followPathLogic();
        }
    };

    // memulai proses BFS
    ghost.runBfsCycle = async function(pacman) {
        if (window.setupAnimationControls && window.setupAnimationControls.state) {
            window.setupAnimationControls.state.shouldSkip = false;
        }

        var path = await ghost.animateBFS(pacman);
        ghost.bfsPathToFollow = path || [];
        ghost.state = "MOVING_ALONG_PATH";
        ghost.isAnimatingBFS = false;
    };

    // logika mengikuti path (dipanggil tiap frame saat MOVING_ALONG_PATH)
    ghost.followPathLogic = function() {
        if (window.sedangMenang || window.sedangGameOver) {
            ghost.currentDir = { x: 0, y: 0 };
            ghost.bfsPathToFollow = [];
            ghost.state = "IDLE";
            return;
        }

        if (!ghost.bfsPathToFollow || ghost.bfsPathToFollow.length === 0) {
            ghost.state = "IDLE";
            ghost.currentDir = { x: 0, y: 0 };
            return;
        }

        var atTileCenter = ghost.isAtTileCenter();

        if (atTileCenter) {
            ghost.gridX = Math.floor(ghost.pixelX / ghost.tileSize);
            ghost.gridY = Math.floor(ghost.pixelY / ghost.tileSize);

            var currentPathStep = ghost.bfsPathToFollow[0];

            if (ghost.gridX === currentPathStep.x && ghost.gridY === currentPathStep.y) {
                if (ghost.bfsPathToFollow.length > 1) {
                    var nextStep = ghost.bfsPathToFollow[1];
                    ghost.currentDir = {
                        x: nextStep.x - ghost.gridX,
                        y: nextStep.y - ghost.gridY
                    };
                    // pindah ke langkah selanjutnya
                    ghost.bfsPathToFollow.shift();
                } else {
                    // sampai tujuan
                    ghost.currentDir = { x: 0, y: 0 };
                    ghost.bfsPathToFollow = [];
                    ghost.state = "IDLE";
                }
            } else {
                // path invalid / berubah → reset
                ghost.currentDir = { x: 0, y: 0 };
                ghost.bfsPathToFollow = [];
                ghost.state = "IDLE";
            }
        }

        // update posisi pixel berdasarkan currentDir dan speed
        ghost.pixelX += ghost.currentDir.x * ghost.speed;
        ghost.pixelY += ghost.currentDir.y * ghost.speed;
    };

    // mengecek apakah ghost berada di tengah tile (untuk menghitung perpindahan arah)
    ghost.isAtTileCenter = function() {
        var tolerance = ghost.speed > 0 ? ghost.speed : 1;
        var centerOffset = ghost.tileSize / 2;
        var xDist = Math.abs((ghost.pixelX - centerOffset) % ghost.tileSize);
        var yDist = Math.abs((ghost.pixelY - centerOffset) % ghost.tileSize);
        var xInCenter = xDist < tolerance || xDist > (ghost.tileSize - tolerance);
        var yInCenter = yDist < tolerance || yDist > (ghost.tileSize - tolerance);
        return xInCenter && yInCenter;
    };

    // Gambar ghost ke imageDataA
    ghost.draw = function(imageDataA) {
        var radius = ghost.tileSize / 2 - 15;
        var headY = ghost.pixelY - radius / 3;

        // head
        lingkaran_polar(imageDataA, ghost.pixelX, headY, radius,
            ghost.color.r, ghost.color.g, ghost.color.b);

        // body (simple polygon)
        var bodyShape = [
            { x: -radius, y: -radius / 3 }, { x: -radius, y: radius },
            { x: -radius + radius / 2, y: radius - radius / 3 }, { x: 0, y: radius },
            { x: radius - radius / 2, y: radius - radius / 3 }, { x: radius, y: radius },
            { x: radius, y: -radius / 3 },
        ];
        var T = { x: ghost.pixelX, y: ghost.pixelY };
        var translatedShape = translasi_array(bodyShape, T);
        polygon(imageDataA, translatedShape, ghost.color.r, ghost.color.g, ghost.color.b);

        // mata
        var eyeRadius = radius / 5;
        var eyeOffsetX = radius / 2.5;
        var eyeOffsetY = -(radius / 3);
        lingkaran_polar(imageDataA, ghost.pixelX - eyeOffsetX, ghost.pixelY + eyeOffsetY, eyeRadius, 255, 255, 255);
        lingkaran_polar(imageDataA, ghost.pixelX + eyeOffsetX, ghost.pixelY + eyeOffsetY, eyeRadius, 255, 255, 255);

        // safe fill helper (mirip flood fill sederhana)
        var fillColor = { r: ghost.color.r, g: ghost.color.g, b: ghost.color.b };

        function getColorAt(x, y) {
            var i = (Math.floor(y) * imageDataA.width + Math.floor(x)) * 4;
            return {
                r: imageDataA.data[i],
                g: imageDataA.data[i + 1],
                b: imageDataA.data[i + 2],
            };
        }
        function colorsMatch(c1, c2, tol) {
            tol = tol || 2;
            return (
                Math.abs(c1.r - c2.r) <= tol &&
                Math.abs(c1.g - c2.g) <= tol &&
                Math.abs(c1.b - c2.b) <= tol
            );
        }
        function safeFill(x, y) {
            var target = getColorAt(x, y);
            if (colorsMatch(target, fillColor)) return;

            var start = { x: Math.floor(x), y: Math.floor(y) };
            var stack = [start];
            while (stack.length > 0) {
                var p = stack.pop();
                var px = p.x, py = p.y;
                if (px < 0 || py < 0 || px >= cnv.width || py >= cnv.height) continue;

                var i = (py * imageDataA.width + px) * 4;
                var c = {
                    r: imageDataA.data[i],
                    g: imageDataA.data[i + 1],
                    b: imageDataA.data[i + 2],
                };
                if (colorsMatch(c, target)) {
                    imageDataA.data[i] = fillColor.r;
                    imageDataA.data[i + 1] = fillColor.g;
                    imageDataA.data[i + 2] = fillColor.b;
                    imageDataA.data[i + 3] = 255;
                    stack.push({ x: px + 1, y: py });
                    stack.push({ x: px - 1, y: py });
                    stack.push({ x: px, y: py + 1 });
                    stack.push({ x: px, y: py - 1 });
                }
            }
        }

        safeFill(ghost.pixelX, ghost.pixelY - radius / 3);
        safeFill(ghost.pixelX, ghost.pixelY + radius / 3);
        safeFill(ghost.pixelX, ghost.pixelY + radius - 5);

        // visual BFS 
        if (ghost.state === "VISUALIZING_BFS") {
            ghost.drawBFSVisualization();
        }
        if (ghost.state === "MOVING_ALONG_PATH") {
            ghost.drawCurrentPath();
        }
    };

    // warnai jalan saat mengikuti path (mengubah warna cell)
    ghost.drawCurrentPath = function() {
        var gridLocal = window.grid;
        if (!gridLocal) return;
        ghost.bfsPathToFollow.forEach(function(pos) {
            var cell = gridLocal[index(pos.x, pos.y)];
            if (cell) cell.color = [255, 50, 50];
        });
    };

    // animate BFS 
    ghost.animateBFS = async function(pacman) {
        ghost.bfsStep = 0;
        var gridLocal = window.grid || [];

        var start = { x: ghost.gridX, y: ghost.gridY };
        var end = { x: pacman.i, y: pacman.j };

        ghost.bfsTargetNode = end;

        var queue = [[start]];
        var visited = new Set();
        visited.add(start.x + "," + start.y);

        ghost.bfsQueue = [start];
        ghost.bfsVisited = visited;
        ghost.bfsFinalPath = [];

        setStatus("🔍 BFS: Mencari Pac-Man");
        setMessage("Start: (" + start.x + "," + start.y + ") → Target: (" + end.x + "," + end.y + ")");

        await sleep();

        var foundPath = null;

        while (queue.length > 0) {
            if (window.sedangMenang || window.sedangGameOver) {
                console.log("⛔ BFS dihentikan karena game selesai");
                return null;
            }
            // if (window.setupAnimationControls && window.setupAnimationControls.state.shouldSkip) {
            //     foundPath = ghost._findPathBFS_Fast(start, end, gridLocal, queue, visited);
            //     break;
            // }

            ghost.bfsStep++;
            var path = queue.shift();
            var pos = path[path.length - 1];

            ghost.bfsCurrentNode = pos;
            ghost.bfsQueue = queue.map(function(p) { return p[p.length - 1]; });
            ghost.bfsExploring = [];
            ghost.bfsTargetNode = null;

            setStatus("📦 BFS Step " + ghost.bfsStep + ": DEQUEUE");
            setMessage("Mengambil node (" + pos.x + ", " + pos.y + ") dari queue");
            await sleep();

            if (pos.x === end.x && pos.y === end.y) {
                setStatus("🎉 BFS: PATH DITEMUKAN!");
                setMessage("Panjang jalur: " + path.length + " langkah");
                foundPath = path;
                ghost.bfsFinalPath = path;
                await sleep();
                break;
            }

            var validMoves = ghost._getValidMovesFromGrid(pos.x, pos.y);

            for (var k = 0; k < validMoves.length; k++) {
                var move = validMoves[k];
                var nextX = pos.x + move.x;
                var nextY = pos.y + move.y;
                var nextPosKey = nextX + "," + nextY;

                ghost.bfsExploring.push({ x: nextX, y: nextY });
                if (!(window.setupAnimationControls && window.setupAnimationControls.state.shouldSkip)) await sleep();

                if (!visited.has(nextPosKey)) {
                    visited.add(nextPosKey);
                    var newPath = path.concat([{ x: nextX, y: nextY }]);
                    queue.push(newPath);

                    ghost.bfsVisited = new Set(visited);
                    ghost.bfsQueue = queue.map(function(p) { return p[p.length - 1]; });

                    setMessage("✅ (" + nextX + ", " + nextY + ") ditambahkan ke queue");
                } else {
                    setMessage("❌ (" + nextX + ", " + nextY + ") sudah visited");
                }

                if (!(window.setupAnimationControls && window.setupAnimationControls.state.shouldSkip)) await sleep();
            }

            ghost.bfsExploring = [];
        }

        // reset visual state
        ghost.bfsCurrentNode = null;
        ghost.bfsQueue = [];
        ghost.bfsVisited = new Set();
        ghost.bfsExploring = [];

        // reset warna grid
        var g = window.grid || [];
        for (var ci = 0; ci < g.length; ci++) {
            var c = g[ci];
            c.color = [40, 30, 40];
            c.sedangDicek = false;
        }

        return foundPath;
    };

    // visualisasi BFS (visited, queue, current, exploring, final path)
    ghost.drawBFSVisualization = function() {
        var gridLocal = window.grid;
        if (!gridLocal) return;

        // visited warna biru
        ghost.bfsVisited.forEach(function(key) {
            var coords = key.split(',');
            var cell = gridLocal[index(parseInt(coords[0], 10), parseInt(coords[1], 10))];
            if (cell) cell.color = [23, 79, 140];
        });

        // queue warna kuning
        ghost.bfsQueue.forEach(function(node) {
            var cell = gridLocal[index(node.x, node.y)];
            if (cell) cell.color = [255, 251, 172];
        });

        // current node warna ijo
        if (ghost.bfsCurrentNode) {
            var cellCur = gridLocal[index(ghost.bfsCurrentNode.x, ghost.bfsCurrentNode.y)];
            if (cellCur) cellCur.color = [44, 120, 45];
        }

        // exploring warna oren
        ghost.bfsExploring.forEach(function(node) {
            var cell = gridLocal[index(node.x, node.y)];
            if (cell) cell.color = [255, 200, 100];
        });

        // final path jalan menuju pacman warna merah
        ghost.bfsFinalPath.forEach(function(pos) {
            var cell = gridLocal[index(pos.x, pos.y)];
            if (cell) cell.color = [255, 50, 50];
        });

        // target si posisi pacman trakhir warna pink
        if (ghost.bfsTargetNode) {
            var cT = gridLocal[index(ghost.bfsTargetNode.x, ghost.bfsTargetNode.y)];
            if (cT) cT.color = [255, 105, 180];
        }
    };

    // mendapatkan gerakan valid dari grid (cek dinding)
    ghost._getValidMovesFromGrid = function(x, y) {
        var directions = [ { x: 0, y: -1 }, { x: 0, y: 1 }, { x: -1, y: 0 }, { x: 1, y: 0 } ];
        var validMoves = [];
        var mazeGrid = window.grid || [];
        var cols = Math.floor(cnv.width / ghost.tileSize);
        var rows = Math.floor(cnv.height / ghost.tileSize);

        var currentIndex = index(x, y);
        if (!mazeGrid[currentIndex]) return validMoves;
        var currentCell = mazeGrid[currentIndex];

        for (var i = 0; i < directions.length; i++) {
            var dir = directions[i];
            var hasWall = false;
            if (dir.y === -1) hasWall = currentCell.walls[0];
            else if (dir.y === 1) hasWall = currentCell.walls[2];
            else if (dir.x === -1) hasWall = currentCell.walls[3];
            else if (dir.x === 1) hasWall = currentCell.walls[1];

            if (!hasWall) validMoves.push(dir);
        }
        return validMoves;
    };

    // cek tabrakan sama pacman (pake jarak)
    ghost.checkCollision = function(pacman) {
        var dx = ghost.pixelX - pacman.x;
        var dy = ghost.pixelY - pacman.y;
        var distance = Math.sqrt(dx * dx + dy * dy);
        return distance < (ghost.tileSize / 2 - 10) + pacman.radius;
    };

    // BFS CEPATT
    ghost._findPathBFS_Fast = function(start, end, mazeGrid, queue, visited) {
        while (queue.length > 0) {
            var path = queue.shift();
            var pos = path[path.length - 1];

            if (pos.x === end.x && pos.y === end.y) {
                return path;
            }

            var validMoves = ghost._getValidMovesFromGrid(pos.x, pos.y);
            for (var i = 0; i < validMoves.length; i++) {
                var mv = validMoves[i];
                var nextX = pos.x + mv.x;
                var nextY = pos.y + mv.y;
                var nextPosKey = nextX + "," + nextY;
                if (!visited.has(nextPosKey)) {
                    visited.add(nextPosKey);
                    var newPath = path.concat([{ x: nextX, y: nextY }]);
                    queue.push(newPath);
                }
            }
        }
        return null;
    };

    return ghost;
}

var ghosts = [];
var gameLoopRunning = false;

function getGridFromMaze() {
    return window.grid || [];
}

function initializeGhostsAfterMaze() {
    var cols = Math.floor(cnv.width / cell_width);
    var rows = Math.floor(cnv.height / cell_width);
    ghosts = [];

    var startX = 1;
    var startY = 1;
    if (cols > 10) {
        startX = cols - 2;
        startY = rows - 2;
    }

    var ghost1 = createGhost(startX, startY, { r: 255, g: 0, b: 0 });
    ghost1.mode = "CHASE";
    ghosts.push(ghost1);

    console.log("👻 Ghost initialized at (" + startX + ", " + startY + ")");
}

// fungsi untuk cek pergerakan
// function canMove(fromX, fromY, toX, toY, gridData) {
//     var cols = Math.floor(cnv.width / (window.cellWidth || 35));
//     var rows = Math.floor(cnv.height / (window.cellWidth || 35));

//     if (toX < 0 || toX >= cols || toY < 0 || toY >= rows) {
//         return false;
//     }

//     var fromIndex = fromX + fromY * cols;
//     var fromCell = gridData[fromIndex];
//     if (!fromCell) return false;

//     var dx = toX - fromX;
//     var dy = toY - fromY;

//     if (dx === 1 && fromCell.walls[1]) return false;
//     if (dx === -1 && fromCell.walls[3]) return false;
//     if (dy === 1 && fromCell.walls[2]) return false;
//     if (dy === -1 && fromCell.walls[0]) return false;

//     return true;
// }
