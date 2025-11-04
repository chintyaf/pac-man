// STEP 2  : Shuffle Walls
// STEP 3  : Algorithm Step Loop (Kruskal)
// STEP 4  : Maze Completed

async function startGame() {
    await buatGrid();
    // await langsung_grid();
    await generateMaze();
    console.log("Maze done — starting game loop!");
    startGameLoop();
    // console.log("test");
    // try {
    // } catch (err) {
    //     console.error("Maze generation failed:", err);
    // }
}

window.onload = () => {
    tampilkanStartScreen();
    sedangDiStartScreen = true;
    sedangGameOver = false;
    sedangMenang = false;
    // tampilkanGameOver(10);
    // tampilkanYouWin(10);
};

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
