// == PENGATURAN GAME LOOP ==
var pacman;
/**
 * Dipanggil oleh maze.js setelah labirin selesai.
 */

// var w = 35;
async function startGame() {
    await generateMaze(imageDataA, ctx, cnv, 35);
    console.log("Maze done — starting game loop!");
    startGameLoop();
    // try {
    // } catch (err) {
    //     console.error("Maze generation failed:", err);
    // }
}
window.onload = () => startGame();
// startGame();

// ctx.putImageData(imageDataA, 0, 0);
