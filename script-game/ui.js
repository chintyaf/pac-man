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
    B: ["11110", "10001", "11110", "10001", "10001", "11110"],
    C: ["01110", "10001", "10000", "10000", "10001", "01110"],
    D: ["11100", "10010", "10001", "10001", "10010", "11100"],
    E: ["11111", "10000", "11110", "10000", "10000", "11111"],
    F: ["11111", "10000", "11110", "10000", "10000", "10000"],
    G: ["01110", "10000", "10000", "10011", "10001", "01110"],
    H: ["10001", "10001", "11111", "10001", "10001", "10001"],
    I: ["01110", "00100", "00100", "00100", "00100", "01110"],
    J: ["00111", "00010", "00010", "00010", "10010", "01100"],
    K: ["10001", "10010", "11100", "10010", "10001", "10001"],
    L: ["10000", "10000", "10000", "10000", "10000", "11111"],
    M: ["10001", "11011", "10101", "10001", "10001", "10001"],
    N: ["10001", "11001", "10101", "10011", "10001", "10001"],
    O: ["01110", "10001", "10001", "10001", "10001", "01110"],
    P: ["11110", "10001", "11110", "10000", "10000", "10000"],
    Q: ["01110", "10001", "10001", "10101", "10010", "01101"],
    R: ["11110", "10001", "11110", "10100", "10010", "10001"],
    S: ["01111", "10000", "01110", "00001", "00001", "11110"],
    T: ["11111", "00100", "00100", "00100", "00100", "00100"],
    U: ["10001", "10001", "10001", "10001", "10001", "01110"],
    V: ["10001", "10001", "01010", "01010", "00100", "00100"],
    W: ["10001", "10001", "10101", "10101", "11011", "10001"],
    X: ["10001", "01010", "00100", "00100", "01010", "10001"],
    Y: ["10001", "01010", "00100", "00100", "00100", "00100"],
    Z: ["11111", "00010", "00100", "01000", "10000", "11111"],

    ":": ["00", "11", "00", "00", "11", "00"],
    " ": ["00000", "00000", "00000", "00000", "00000", "00000"],
    "-": ["00000", "00000", "11111", "00000", "00000", "00000"],
    "!": ["00100", "00100", "00100", "00100", "00000", "00100"],

    0: ["01110", "10011", "10101", "11001", "10001", "01110"],
    1: ["00100", "01100", "00100", "00100", "00100", "01110"],
    2: ["01110", "10001", "00010", "00100", "01000", "11111"],
    3: ["11111", "00010", "00100", "00010", "10001", "01110"],
    4: ["00010", "00110", "01010", "11111", "00010", "00010"],
    5: ["11111", "10000", "11110", "00001", "00001", "11110"],
    6: ["00110", "01000", "10000", "11110", "10001", "01110"],
    7: ["11111", "00001", "00010", "00100", "01000", "01000"],
    8: ["01110", "10001", "01110", "10001", "10001", "01110"],
    9: ["01110", "10001", "10001", "01111", "00001", "01110"],
};

function getCharPattern(ch) {
    return pixelFont[ch] || pixelFont[" "];
}

// function gbr_titik(img, x, y, r, g, b) {
//     if (x < 0 || y < 0 || x >= img.width || y >= img.height) return;
//     let i = 4 * (Math.floor(x) + Math.floor(y) * img.width);
//     img.data[i] = r;
//     img.data[i + 1] = g;
//     img.data[i + 2] = b;
//     img.data[i + 3] = 255;
// }

function gambarHuruf(img, ch, x, y, scale, color) {
    let pat = getCharPattern(ch);
    for (let row = 0; row < pat.length; row++) {
        for (let col = 0; col < pat[row].length; col++) {
            if (pat[row][col] === "1") {
                for (let sy = 0; sy < scale; sy++) {
                    for (let sx = 0; sx < scale; sx++) {
                        gbr_titik(
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

    ctx.clearRect(0, 0, cnv.width, cnv.height);
    let img = ctx.getImageData(0, 0, cnv.width, cnv.height);

    gambarTeks(img, "PACMAN", mid_x - 135, 125, 8, {
        r: 255,
        g: 120,
        b: 180,
    });
    gambarTeks(img, "PRESS SPACE", mid_x - 100, 250, 3, {
        r: 255,
        g: 180,
        b: 210,
    });
    gambarTeks(img, "TO START", mid_x - 70, 280, 3, {
        r: 255,
        g: 180,
        b: 210,
    });
    ctx.putImageData(img, 0, 0);
}

function tampilkanGameOver(score) {
    sedangGameOver = true;
    ctx.clearRect(0, 0, cnv.width, cnv.height);
    let img = ctx.getImageData(0, 0, cnv.width, cnv.height);

    gambarTeks(img, "GAME OVER", mid_x - 180, 160, 7, { r: 220, g: 10, b: 40 });
    gambarTeks(img, "SCORE :" + score, mid_x - 75, 225, 3, {
        r: 220,
        g: 220,
        b: 220,
    });
    ctx.putImageData(img, 0, 0);
}

function tampilkanYouWin(score) {
    sedangMenang = true;
    ctx.clearRect(0, 0, cnv.width, cnv.height);
    let img = ctx.getImageData(0, 0, cnv.width, cnv.height);

    gambarTeks(img, "YOU WIN!", mid_x - 160, 160, 7, {
        r: 255,
        g: 150,
        b: 200,
    });
    gambarTeks(img, "SCORE:" + score, mid_x - 75, 225, 3, {
        r: 220,
        g: 220,
        b: 220,
    });
    ctx.putImageData(img, 0, 0);
}

// const mazeGrid = [
//     [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
//     [0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0],
//     [0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0],
//     [0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0],
//     [0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0],
//     [0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0],
//     [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
// ];

// function drawMaze(img) {
//     for (let r = 0; r < mazeGrid.length; r++) {
//         for (let c = 0; c < mazeGrid[r].length; c++) {
//             let color =
//                 mazeGrid[r][c] === 0
//                     ? { r: 30, g: 70, b: 150 }
//                     : { r: 0, g: 0, b: 0 };
//             for (let y = 0; y < cellSize; y++) {
//                 for (let x = 0; x < cellSize; x++) {
//                     gbr_titik(
//                         img,
//                         c * cellSize + x,
//                         r * cellSize + y,
//                         color.r,
//                         color.g,
//                         color.b
//                     );
//                 }
//             }
//         }
//     }
// }

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
            gbr_titik(img, cx, cy, 255, 255, 200);
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
    let img = ctx.getImageData(0, 0, cnv.width, cnv.height);

    updatePacman();
    drawMaze(img);
    drawDots(img);

    // tampilkan skor
    renderScore(img);

    // gambar pacman sebagai titik putih
    gbr_titik(img, pacmanX, pacmanY, 255, 255, 255);

    ctx.putImageData(img, 0, 0);
}

// function gameLoop() {
//     if (sedangDiStartScreen || sedangGameOver || sedangMenang) return;

//     renderFrame();
//     requestAnimationFrame(gameLoop);
// }

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
    // gameLoop();
}

// document.addEventListener("keydown", function (e) {
//     if (e.code !== "Space") return;

//     if (sedangDiStartScreen) mulaiGame();
//     else if (sedangGameOver || sedangMenang) tampilkanStartScreen();
// });
