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

    // 0: ["01110", "10011", "10101", "11001", "10001", "01110"],
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

    clearCanvas(0, 0, 0);
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

dotMap = [];
totalDots = 0;

// w = cell_width;
function generateDotsFromMaze() {
    dotMap = [];
    totalDots = 0;

    for (let j = 0; j < rows; j++) {
        dotMap[j] = [];
        for (let i = 0; i < cols; i++) {
            const cell = grid[index(i, j)];
            dotMap[j][i] = [];

            const half = cell_width / 2;
            const offset = cell_width * 0.3; // distance from center

            // Always put a center dot if the cell has any open space
            const hasOpenSpace = cell.walls.some((wall) => wall === false);
            if (hasOpenSpace) {
                dotMap[j][i].push({ x: i * w + half, y: j * w + half });
                totalDots++;
            }

            // Add dots depending on open walls
            if (!cell.walls[0]) {
                // top
                dotMap[j][i].push({
                    x: i * cell_width + half,
                    y: j * cell_width + half - offset,
                });
                totalDots++;
            }
            if (!cell.walls[1]) {
                // right
                dotMap[j][i].push({
                    x: i * cell_width + half + offset,
                    y: j * cell_width + half,
                });
                totalDots++;
            }
            if (!cell.walls[2]) {
                // bottom
                dotMap[j][i].push({
                    x: i * cell_width + half,
                    y: j * cell_width + half + offset,
                });
                totalDots++;
            }
            if (!cell.walls[3]) {
                // left
                dotMap[j][i].push({
                    x: i * cell_width + half - offset,
                    y: j * cell_width + half,
                });
                totalDots++;
            }
        }
    }
}

function drawDots() {
    for (let r = 0; r < dotMap.length; r++) {
        for (let c = 0; c < dotMap[r].length; c++) {
            const dots = dotMap[r][c];
            if (!dots || dots.length === 0) continue;

            for (let d of dots) {
                gbr_titik(imageDataA, d.x, d.y, 255, 255, 180); // yellowish dots
                gbr_titik(imageDataA, d.x - 1, d.y, 255, 255, 180); // yellowish dots
                gbr_titik(imageDataA, d.x, d.y - 1, 255, 255, 180); // yellowish dots
                gbr_titik(imageDataA, d.x + 1, d.y, 255, 255, 180); // yellowish dots
                gbr_titik(imageDataA, d.x, d.y + 1, 255, 255, 180); // yellowish dots
                // lingkaran_polar(imageDataA, d.x, d.y, 3, 255, 255, 180);
                // floodFillStack(
                //     imageDataA,
                //     cnv,
                //     d.x,
                //     d.y,
                //     {
                //         r: flood[0],
                //         g: flood[1],
                //         b: flood[2],
                //     }, // toflood
                //     { r: 255, g: 255, b: 180 }
                // );
            }
            // console.log(dots);
        }
    }
}

const final_score = 0;
function pacmanEatDot() {
    const i = pacman.i;
    const j = pacman.j;

    if (!dotMap[j] || !dotMap[j][i]) return;

    const dots = dotMap[j][i];
    if (dots.length === 0) return;

    // Radius jarak makan (toleransi pixel)
    const eatRadius = pacman.radius * 0.8;

    // Cek setiap dot di sel yang sama
    for (let k = dots.length - 1; k >= 0; k--) {
        const d = dots[k];
        const dx = pacman.x - d.x;
        const dy = pacman.y - d.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        // Jika jarak kecil (Pac-Man lewat dot)
        if (dist < eatRadius) {
            dots.splice(k, 1); // hapus dot dari sel
            totalDots--;
            score++;
            tampilkanScore();
            // Optional: efek suara atau skor bisa ditambah di sini
            // playEatSound();
        }
    }
}

function getScore() {
    if (totalDots == 0) {
        return score; // menang
    }
    return score;
}

var score_cnv = document.getElementById("score-canvas");
function tampilkanScore() {
    // clearCanvas(0, 0, 0);
    ctx2.clearRect(0, 0, score_cnv.width, score_cnv.height);
    imageData2 = ctx2.getImageData(0, 0, score_cnv.width, score_cnv.height);

    renderScore(imageData2);
    ctx2.putImageData(imageData2, 0, 0);
}

function renderScore(img) {
    gambarTeks(img, "SCORE:" + String(score), 10, 10, 2, {
        r: 255,
        g: 120,
        b: 180,
    });
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
