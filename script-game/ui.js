var canvas = document.getElementById("canvas");
var context = canvas.getContext("2d");

var sedangDiStartScreen = true;
var sedangGameOver = false;
var sedangMenang = false;

var score = 0;
var dotMap = [];
var totalDots = 0;

const cellSize = 24;
const dotRadius = 3;

// Pac-Man state
var pacmanRow = 1;
var pacmanCol = 1;
var pacmanX = pacmanCol * cellSize + cellSize / 2;
var pacmanY = pacmanRow * cellSize + cellSize / 2;
var pacmanSpeed = 2;
var pacmanDir = { x: 0, y: 0 };

const pixelFont = {
    A: ["01110", "10001", "10001", "11111", "10001", "10001"],
    C: ["01110", "10001", "10000", "10000", "10001", "01110"],
    E: ["11111", "10000", "11110", "10000", "10000", "11111"],
    G: ["01110", "10000", "10000", "10011", "10001", "01110"],
    M: ["10001", "11011", "10101", "10001", "10001", "10001"],
    N: ["10001", "11001", "10101", "10011", "10001", "10001"],
    O: ["01110", "10001", "10001", "10001", "10001", "01110"],
    P: ["11110", "10001", "11110", "10000", "10000", "10000"],
    R: ["11110", "10001", "11110", "10100", "10010", "10001"],
    S: ["01111", "10000", "01110", "00001", "00001", "11110"],
    T: ["11111", "00100", "00100", "00100", "00100", "00100"],
    U: ["10001", "10001", "10001", "10001", "10001", "01110"],
    V: ["10001", "10001", "01010", "01010", "00100", "00100"],
    W: ["10001", "10001", "10101", "10101", "11011", "10001"],
    Y: ["10001", "01010", "00100", "00100", "00100", "00100"],
    ":": ["00", "11", "00", "00", "11", "00"],
    " ": ["00000", "00000", "00000", "00000", "00000", "00000"],
};

function getCharPattern(ch) {
    return pixelFont[ch] || pixelFont[" "];
}

function gambar_titik(img, x, y, r, g, b) {
    if (x < 0 || y < 0 || x >= img.width || y >= img.height) return;
    let i = 4 * (Math.floor(x) + Math.floor(y) * img.width);
    img.data[i] = r;
    img.data[i + 1] = g;
    img.data[i + 2] = b;
    img.data[i + 3] = 255;
}

function gambarHuruf(img, ch, x, y, scale, color) {
    let pat = getCharPattern(ch);
    for (let row = 0; row < pat.length; row++) {
        for (let col = 0; col < pat[row].length; col++) {
            if (pat[row][col] === "1") {
                for (let sy = 0; sy < scale; sy++) {
                    for (let sx = 0; sx < scale; sx++) {
                        gambar_titik(
                            img,
                            x + col * scale + sx,
                            y + row * scale + sy,
                            color.r,
                            color.g,
                            color.b
                        );
                    }
                }
            }
        }
    }
}

function gambarTeks(img, text, x, y, scale, color) {
    let offset = 0;
    for (let ch of text) {
        gambarHuruf(img, ch, x + offset, y, scale, color);
        offset += 6 * scale;
    }
}

function tampilkanStartScreen() {
    sedangDiStartScreen = true;
    sedangGameOver = false;
    sedangMenang = false;

    context.clearRect(0, 0, canvas.width, canvas.height);
    let img = context.getImageData(0, 0, canvas.width, canvas.height);

    gambarTeks(img, "PACMAN", canvas.width / 2 - 135, 125, 8, {
        r: 255,
        g: 120,
        b: 180,
    });
    gambarTeks(img, "PRESS SPACE", canvas.width / 2 - 100, 300, 3, {
        r: 255,
        g: 120,
        b: 180,
    });
    gambarTeks(img, "TO START", canvas.width / 2 - 70, 330, 3, {
        r: 255,
        g: 180,
        b: 210,
    });
    context.putImageData(img, 0, 0);
}

function tampilkanGameOver(score) {
    sedangGameOver = true;
    context.clearRect(0, 0, canvas.width, canvas.height);
    let img = context.getImageData(0, 0, canvas.width, canvas.height);

    gambarTeks(img, "GAME OVER", 90, 150, 4, { r: 255, g: 100, b: 100 });
    gambarTeks(img, "SCORE:" + score, 120, 240, 2, { r: 255, g: 180, b: 180 });
    console.log(score);
    context.putImageData(img, 0, 0);
}

function tampilkanYouWin(score) {
    sedangMenang = true;
    context.clearRect(0, 0, canvas.width, canvas.height);
    let img = context.getImageData(0, 0, canvas.width, canvas.height);

    gambarTeks(img, "YOU WIN", 110, 150, 4, { r: 255, g: 150, b: 200 });
    gambarTeks(img, "SCORE:" + score, 120, 240, 2, { r: 255, g: 200, b: 220 });
    context.putImageData(img, 0, 0);
}

const mazeGrid = [
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0],
    [0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0],
    [0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0],
    [0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0],
    [0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
];

function drawMaze(img) {
    for (let r = 0; r < mazeGrid.length; r++) {
        for (let c = 0; c < mazeGrid[r].length; c++) {
            let color =
                mazeGrid[r][c] === 0
                    ? { r: 30, g: 70, b: 150 }
                    : { r: 0, g: 0, b: 0 };
            for (let y = 0; y < cellSize; y++) {
                for (let x = 0; x < cellSize; x++) {
                    gambar_titik(
                        img,
                        c * cellSize + x,
                        r * cellSize + y,
                        color.r,
                        color.g,
                        color.b
                    );
                }
            }
        }
    }
}

function generateDotsFromMaze(grid) {
    dotMap = [];
    totalDots = 0;

    for (let r = 0; r < grid.length; r++) {
        dotMap[r] = [];
        for (let c = 0; c < grid[r].length; c++) {
            dotMap[r][c] = grid[r][c] === 1;
            if (dotMap[r][c]) totalDots++;
        }
    }
}

function drawDots(img) {
    for (let r = 0; r < dotMap.length; r++) {
        for (let c = 0; c < dotMap[r].length; c++) {
            if (!dotMap[r][c]) continue;
            let cx = c * cellSize + cellSize / 2;
            let cy = r * cellSize + cellSize / 2;
            gambar_titik(img, cx, cy, 255, 255, 200);
        }
    }
}

function tryEatDotAt(row, col) {
    if (!dotMap[row] || dotMap[row][col] !== true) return;

    dotMap[row][col] = false;
    score += 10;
    totalDots--;

    if (totalDots === 0) {
        tampilkanYouWin(score);
    }
}

function updatePacman() {
    // Move pacman
    pacmanX += pacmanDir.x * pacmanSpeed;
    pacmanY += pacmanDir.y * pacmanSpeed;

    // Hitung row & col baru
    let newRow = Math.floor(pacmanY / cellSize);
    let newCol = Math.floor(pacmanX / cellSize);

    // Jika masuk cell baru makan dot
    if (newRow !== pacmanRow || newCol !== pacmanCol) {
        pacmanRow = newRow;
        pacmanCol = newCol;
        tryEatDotAt(pacmanRow, pacmanCol);
    }
}

document.addEventListener("keydown", function (e) {
    if (e.key === "ArrowUp") pacmanDir = { x: 0, y: -1 };
    if (e.key === "ArrowDown") pacmanDir = { x: 0, y: 1 };
    if (e.key === "ArrowLeft") pacmanDir = { x: -1, y: 0 };
    if (e.key === "ArrowRight") pacmanDir = { x: 1, y: 0 };
});

function renderScore(img) {
    gambarTeks(img, "SCORE:" + score, 10, 10, 2, { r: 255, g: 200, b: 200 });
}

function renderFrame() {
    let img = context.getImageData(0, 0, canvas.width, canvas.height);

    updatePacman();
    drawMaze(img);
    drawDots(img);

    // tampilkan skor
    renderScore(img);

    // gambar pacman sebagai titik putih
    gambar_titik(img, pacmanX, pacmanY, 255, 255, 255);

    context.putImageData(img, 0, 0);
}

function gameLoop() {
    if (sedangDiStartScreen || sedangGameOver || sedangMenang) return;

    renderFrame();
    requestAnimationFrame(gameLoop);
}

function mulaiGame() {
    sedangDiStartScreen = false;
    sedangGameOver = false;
    sedangMenang = false;

    score = 0;
    pacmanRow = 1;
    pacmanCol = 1;
    pacmanX = pacmanCol * cellSize + cellSize / 2;
    pacmanY = pacmanRow * cellSize + cellSize / 2;

    generateDotsFromMaze(mazeGrid);
    gameLoop();
}

document.addEventListener("keydown", function (e) {
    if (e.code !== "Space") return;

    if (sedangDiStartScreen) mulaiGame();
    else if (sedangGameOver || sedangMenang) tampilkanStartScreen();
});
