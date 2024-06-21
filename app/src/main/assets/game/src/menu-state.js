//
let MenuState = {

    bg: null,    

    shutdown: function()
    {
        this.bg = null;
    },

    //
    create: function()
    {
        //this.bg = game.add.image(0, 0, 'transparent');

        // let label = R.createText(355, 45, 40, R.playerData.score.toString(), '#e0b45b');

        //
        R.ui.createBigPlayButton(320, 900, game.world, this.onPlayButton, this);        
        // R.ui.createThemeButton(320, 680, game.world, true);

        //
        this.setTheme();

        //
        gradle.event('page_menu');
    },

    onPlayButton: function()
    {
        game.state.start('play');
    },

    setTheme: function()
    {
        //this.bg.loadTexture('bg_home_' + R.playerData.theme);        
        game.stage.backgroundColor = game.canvas.parentElement.style.backgroundColor = 'rgba(255,110,110,0.8)';
    }
};