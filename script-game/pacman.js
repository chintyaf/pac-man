var pacman = {
    x: 50, // posisi X awal
    y: 50, // posisi Y awal
    radius: 20,
    speed: 3,
    direction: 0, // 0: Kanan, 1: Bawah, 2: Kiri, 3: Atas (untuk rotasi)
    mouthOpen: 0.2,
    mouthSpeed: 0.08,
    moving: false,
    dx: 0, // perubahan X per frame
    dy: 0 // perubahan Y per frame
};

var ctx;
var canvasElement;
var maze;
var imageDataA;

function initializePacman(mazeData) { 
    maze = mazeData;
    
    if (maze) {
        const TILE_SIZE = maze.w;
        pacman.x = TILE_SIZE / 2;
        pacman.y = TILE_SIZE / 2;
        const PADDING = 4;
        pacman.radius = TILE_SIZE / 2 - PADDING;
        pacman.speed = TILE_SIZE / 10;
    }
    
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);
}

function getGridIndex(i, j) {
    if (!maze || i < 0 || j < 0 || i >= maze.cols || j >= maze.rows) return -1;
    return i + j * maze.cols;
}

function checkGridCollision(x, y) {
    if (!maze) return false;

    const TILE_SIZE = maze.w;
    const radius = pacman.radius;

    const currentI = Math.floor(pacman.x / TILE_SIZE);
    const currentJ = Math.floor(pacman.y / TILE_SIZE);
    const currentCell = maze.grid[getGridIndex(currentI, currentJ)];
    
    // jika cell tidak ditemukan
    if (!currentCell) return true;

    // kanan
    if (pacman.dx > 0 && currentCell.walls[1]) {
        if (x + radius > (currentI + 1) * TILE_SIZE) return true;
    }
    
    // kiri
    if (pacman.dx < 0 && currentCell.walls[3]) {
        if (x - radius < currentI * TILE_SIZE) return true;
    }

    // bawah
    if (pacman.dy > 0 && currentCell.walls[2]) {
        if (y + radius > (currentJ + 1) * TILE_SIZE) return true;
    }

    // atas     
    if (pacman.dy < 0 && currentCell.walls[0]) {
        if (y - radius < currentJ * TILE_SIZE) return true;
    }
    return false;
}

function updatePosition() {
    let nextX = pacman.x + pacman.dx;
    let nextY = pacman.y + pacman.dy;

    pacman.moving = (pacman.dx !== 0 || pacman.dy !== 0);

    // cek tabrakan gak
    if (checkGridCollision(nextX, nextY)) {
        pacman.dx = 0;
        pacman.dy = 0;
    } else {
        // kalau aman, pindah posisi
        pacman.x = nextX;
        pacman.y = nextY;
    }

    updateMouth();
}

// mulut bergerak kalau Pac-Man jalan
function updateMouth() {
    if (pacman.moving) {
        if (pacman.mouthOpen > 0.4 || pacman.mouthOpen < 0.05) {
            pacman.mouthSpeed = -pacman.mouthSpeed;
        }
        pacman.mouthOpen += pacman.mouthSpeed;
    } else {
        pacman.mouthOpen = 0.2;
        pacman.mouthSpeed = Math.abs(pacman.mouthSpeed);
    }
}

function handleKeyDown(event) {
    if ([37, 38, 39, 40].includes(event.keyCode)) {
        event.preventDefault();
    }

    switch (event.keyCode) {
        case 37: pacman.dx = -pacman.speed; pacman.dy = 0; pacman.direction = 2; break;
        case 38: pacman.dx = 0; pacman.dy = -pacman.speed; pacman.direction = 3; break;
        case 39: pacman.dx = pacman.speed; pacman.dy = 0; pacman.direction = 0; break;
        case 40: pacman.dx = 0; pacman.dy = pacman.speed; pacman.direction = 1; break;
    }
}

function handleKeyUp(event) {
    if ([37, 38, 39, 40].includes(event.keyCode)) {
        pacman.dx = 0;
        pacman.dy = 0;
    }
}