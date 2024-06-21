//
let R = {};
let game = null;

//
R.BASE_GAME_WIDTH = 640;
R.BASE_GAME_HEIGHT = 1060;

//
R.BANNER_HEIGHT = 62;

//
R.gameHeight = R.BASE_GAME_HEIGHT;
R.prevWindowHeight = 0;

//
R.fontName = 'YatraOne';
R.strings = null;

//
R.canAudio = false;
R.sfx = {};

//
R.score = 0;
R.sctoringEnabled = true;

R.playerData = {
    score: 0,
    theme: 0,
    tutorialCompleted: false
};

//
let startGame = function()
{
    game = new Phaser.Game(R.BASE_GAME_WIDTH, R.BASE_GAME_HEIGHT, Phaser.CANVAS, 'gameContainer', BootState, true);
};

//
window.onunload = function()
{
    R.saveGame();
};