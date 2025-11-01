async function startGame() {
    try {
        await generateMaze(imageDataA, ctx, cnv, 35);
        console.log("Maze done — starting game loop!");
        startGameLoop();
    } catch (err) {
        console.error("Maze generation failed:", err);
    }
}

window.onload = () => {
    tampilkanStartScreen();
    sedangDiStartScreen = true;
    sedangGameOver = false;
    sedangMenang = false;
};

// startGame();

// ctx.putImageData(imageDataA, 0, 0);
document.addEventListener("keydown", function (e) {
    if (e.code !== "Space") {
        return;
    }

    if (sedangDiStartScreen) {
        // console.log("hallo", sedangDiStartScreen, sedangGameOver, sedangMenang);
        sedangDiStartScreen = false;
        startGame();
    } else if (sedangGameOver || sedangMenang) {
        tampilkanStartScreen();
    }
});
