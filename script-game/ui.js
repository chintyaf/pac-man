// UI/Skor & Rendering untuk Pac-Man Game
// Felicia Jean Andrea Preta Moton

// Global variables untuk game state
var gameState = {
    score: 0,
    lives: 3,
    isGameOver: false,
    isGameStarted: false,
    dots: [], // Array untuk menyimpan posisi dot
    dotsCollected: 0
};

function initializeDots(grid, cellWidth) {
    gameState.dots = [];
    var cols = Math.floor(cnv.width / cellWidth);
    var rows = Math.floor(cnv.height / cellWidth);
    
    for (let j = 0; j < rows; j++) {
        for (let i = 0; i < cols; i++) {
            var cell = grid[i + j * cols];
            if (cell) {
                // Tempatkan dot di tengah setiap sel
                gameState.dots.push({
                    x: i * cellWidth + cellWidth / 2,
                    y: j * cellWidth + cellWidth / 2,
                    collected: false,
                    cell: { i, j }
                });
            }
        }
    }
}

// Render dot di canvas
function renderDots() {
    gameState.dots.forEach(dot => {
        if (!dot.collected) {
            // Gambar dot sebagai lingkaran kecil
            lingkaran_polar(imageDataA, dot.x, dot.y, 3, 255, 255, 0);
        }
    });
}

// Cek Pac-Man melewati dot
function checkDotCollision(pacmanX, pacmanY, pacmanRadius) {
    gameState.dots.forEach(dot => {
        if (!dot.collected) {
            var dx = pacmanX - dot.x;
            var dy = pacmanY - dot.y;
            var distance = Math.sqrt(dx * dx + dy * dy);
            
            // Jika Pac-Man cukup dekat dengan dot
            if (distance < pacmanRadius + 5) {
                dot.collected = true;
                gameState.score += 10;
                gameState.dotsCollected++;
                
                // Update tampilan score
                updateScoreDisplay();
            }
        }
    });
}

// Tampilkan UI Start Game
function renderStartScreen() {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(0, 0, cnv.width, cnv.height);
    
    ctx.fillStyle = '#FFD700';
    ctx.font = 'bold 48px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('PAC-MAN', cnv.width / 2, cnv.height / 2 - 60);
    
    ctx.fillStyle = '#FFFFFF';
    ctx.font = '24px Arial';
    ctx.fillText('Press SPACE to Start', cnv.width / 2, cnv.height / 2);
    
    ctx.font = '16px Arial';
    ctx.fillText('Use Arrow Keys to Move', cnv.width / 2, cnv.height / 2 + 40);
    ctx.fillText('Collect all dots to win!', cnv.width / 2, cnv.height / 2 + 70);
}

// Tampilkan UI Game Over
function renderGameOver() {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
    ctx.fillRect(0, 0, cnv.width, cnv.height);
    
    ctx.fillStyle = '#FF0000';
    ctx.font = 'bold 48px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('GAME OVER', cnv.width / 2, cnv.height / 2 - 60);
    
    ctx.fillStyle = '#FFFFFF';
    ctx.font = '24px Arial';
    ctx.fillText(`Final Score: ${gameState.score}`, cnv.width / 2, cnv.height / 2);
    
    ctx.font = '20px Arial';
    ctx.fillText('Press R to Restart', cnv.width / 2, cnv.height / 2 + 50);
}

// Update tampilan score di layar (pojok atas canvas)
function updateScoreDisplay() {
    // Background untuk score board
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(10, 10, 200, 80);
    
    // Score text
    ctx.fillStyle = '#FFD700';
    ctx.font = 'bold 20px Arial';
    ctx.textAlign = 'left';
    ctx.fillText(`Score: ${gameState.score}`, 20, 35);
    
    // Lives (nyawa)
    ctx.fillStyle = '#FFFFFF';
    ctx.fillText('Lives: ', 20, 60);
    for (let i = 0; i < gameState.lives; i++) {
        ctx.fillStyle = '#FFFF00';
        ctx.beginPath();
        ctx.arc(85 + i * 25, 55, 8, 0.2 * Math.PI, 1.8 * Math.PI);
        ctx.lineTo(85 + i * 25, 55);
        ctx.fill();
    }
    
    // Dots collected
    ctx.fillStyle = '#FFFFFF';
    ctx.font = '14px Arial';
    ctx.fillText(`Dots: ${gameState.dotsCollected}/${gameState.dots.length}`, 20, 80);
}

// Render tombol Start/Reset
function renderButtons() {
    var buttonY = cnv.height - 50;
    
    // Button Start
    ctx.fillStyle = '#4CAF50';
    ctx.fillRect(cnv.width / 2 - 120, buttonY, 100, 35);
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 16px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Start', cnv.width / 2 - 70, buttonY + 23);
    
    // Button Reset
    ctx.fillStyle = '#F44336';
    ctx.fillRect(cnv.width / 2 + 20, buttonY, 100, 35);
    ctx.fillStyle = '#FFFFFF';
    ctx.fillText('Reset', cnv.width / 2 + 70, buttonY + 23);
}

// Handle click pada tombol
function handleButtonClick(x, y) {
    var buttonY = cnv.height - 50;
    
    // Start button
    if (x >= cnv.width / 2 - 120 && x <= cnv.width / 2 - 20 &&
        y >= buttonY && y <= buttonY + 35) {
        startGame();
    }
    
    // Reset button
    if (x >= cnv.width / 2 + 20 && x <= cnv.width / 2 + 120 &&
        y >= buttonY && y <= buttonY + 35) {
        resetGame();
    }
}

// Start game function
function startGame() {
    if (!gameState.isGameStarted && !gameState.isGameOver) {
        gameState.isGameStarted = true;
        console.log('Game Started!');
    }
}

// Reset game function
function resetGame() {
    gameState.score = 0;
    gameState.lives = 3;
    gameState.isGameOver = false;
    gameState.isGameStarted = false;
    gameState.dotsCollected = 0;
    
    // Reset semua dots
    gameState.dots.forEach(dot => {
        dot.collected = false;
    });
    
    console.log('Game Reset!');
    
    // Regenerate maze
    imageDataA = ctx.getImageData(0, 0, cnv.width, cnv.height);
    generateMaze(imageDataA, ctx, cnv, 35);
}

// Handle keyboard untuk Start/Reset
document.addEventListener('keydown', function(event) {
    // Space untuk start
    if (event.key === ' ' && !gameState.isGameStarted) {
        event.preventDefault();
        startGame();
    }
    
    // R untuk reset
    if (event.key === 'r' || event.key === 'R') {
        event.preventDefault();
        resetGame();
    }
});

// Update canvas click handler untuk handle button clicks
cnv.addEventListener("click", function (event) {
    var rect = cnv.getBoundingClientRect();
    var x = event.clientX - rect.left;
    var y = event.clientY - rect.top;
    console.log("x: " + x + " y: " + y);
    
    handleButtonClick(x, y);
});

// Main render function yang dipanggil setiap frame
function renderUI() {
    // Render buttons selalu tampil
    renderButtons();
    
    // Render score board jika game sudah dimulai
    if (gameState.isGameStarted && !gameState.isGameOver) {
        updateScoreDisplay();
        renderDots();
    }
    
    // Render start screen
    if (!gameState.isGameStarted && !gameState.isGameOver) {
        renderStartScreen();
    }
    
    // Render game over screen
    if (gameState.isGameOver) {
        renderGameOver();
    }
}

// Function untuk set game over
function setGameOver() {
    gameState.isGameOver = true;
    gameState.isGameStarted = false;
    renderGameOver();
}

// Function untuk mengurangi lives
function loseLife() {
    gameState.lives--;
    if (gameState.lives <= 0) {
        setGameOver();
    }
    updateScoreDisplay();
}
