boot-state.js:
//
let BootState = {

    //
    init: function()
    {
        game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
        game.scale.fullScreenScaleMode = Phaser.ScaleManager.SHOW_ALL;       
        game.scale.pageAlignHorizontally = true;
        game.scale.pageAlignVertically = false;

        if(!game.device.desktop)
        {            
            game.scale.forceOrientation(false, true);
            game.scale.enterIncorrectOrientation.add(this.onEnterIncorrectOrientation, this);
            game.scale.leaveIncorrectOrientation.add(this.onLeaveIncorrectOrientation, this);           
        }

        game.scale.onSizeChange.add(this.onSizeChange, this);
        game.scale.setResizeCallback(this.onResize, this);

        game.input.maxPointers = 1;
        game.stage.disableVisibilityChange = true;

        //
        R.canAudio = game.device.canPlayAudio('ogg') || game.device.canPlayAudio('mp3');

        //
        this.additionalAudioCheck();
    },

    //
    onResize: function()
    {
        let ww = window.innerWidth;
        let wh = window.innerHeight;
        if(R.prevWindowHeight != wh) this.onSizeChange();

        let gameContainer = document.getElementById(game.parent);
        gameContainer.style.width = ww + 'px';
        gameContainer.style.height = wh + 'px';        
    },

    //
    onSizeChange: function()
    {
        this.resizeGame();
        game.state.resize(R.BASE_GAME_WIDTH, R.gameHeight);        
    },

    //
    resizeGame: function()
    {        
        let wh = window.innerHeight;      
        R.prevWindowHeight = wh;        

        let s = (R.BASE_GAME_HEIGHT + R.BANNER_HEIGHT) / parseInt(game.canvas.style.height);       

        R.gameHeight = R.BASE_GAME_HEIGHT + parseInt(R.BANNER_HEIGHT * s + 0.5);       

        game.scale.setGameSize(R.BASE_GAME_WIDTH, R.gameHeight);        
    },

    //
    preload: function()
    {
        game.load.atlas('loading', 'assets/loading.png', 'assets/loading.json');
    },

    //
    create: function()
    {
        game.state.add('load', LoadState);
        game.state.add('menu', MenuState);
        game.state.add('play', PlayState);

        let fontFaceObserver = new FontFaceObserver(R.fontName);
        fontFaceObserver.load(null, 200).then(function() { game.state.start('load'); }, this.fontLoadFailed);
    },

    fontLoadFailed: function()
    {
        R.fontName = 'Arial';
        game.state.start('load');
    },

    onEnterIncorrectOrientation: function()
    {
        if(game.scale.incorrectOrientation)
        {
            game.paused = true;
        }
    },

    onLeaveIncorrectOrientation: function()
    {
        game.paused = false;
    },

    additionalAudioCheck: function()
    {
        //second check sound
        /*
            Sharp = SH-01F
            Fujitsu = F-01F
            Xperia A = SO-04E
            Sharp Mini = SHL24
            */

        function isStock()
        {
            let matches = window.navigator.userAgent.match(/Android.*AppleWebKit\/([\d.]+)/);
            return matches && matches[1] < 537;
        }

        let ua = navigator.userAgent; // Returns a string which tells you what device you're using
        let isSharpStock = ((/SHL24|SH-01F/i).test(ua)) && isStock(); // Checks if device is, Sharp(SH-01F) or Sharp Mini(SHL24)
        let isXperiaAStock = ((/SO-04E/i).test(ua)) && isStock(); // Checks if device is, Xperia A(SO-04E)
        let isFujitsuStock = ((/F-01F/i).test(ua)) && isStock(); // Checks if device is, Fujitsu(F-01F)

        if(isSharpStock || isXperiaAStock || isFujitsuStock) R.canAudio = false;
    }    
};
load-state.js
//
let LoadState = {
    
    loadingBarFull: null,
    loadText: null,
    sfx_key: null,

    //
    init: function()
    {
        game.load.onFileComplete.add(this.fileComplete, this);
        game.load.onLoadComplete.add(this.loadComplete, this);
    },

    //
    create: function()
    {      
        game.load.image('transparent', 'assets/transparent.png');
        //game.load.image('bg_home_1', 'assets/bg_home_1.jpg');

        game.load.image('trone', 'assets/trone.png');
        game.load.image('parrot', 'assets/parrot.png');

        game.load.image('bg_play_0', 'assets/bg_play_0.jpg');
        game.load.image('bg_play_1', 'assets/bg_play_1.jpg');
		
        game.load.image('selector_0', 'assets/selector_0.jpg');
        game.load.image('selector_1', 'assets/selector_1.png');
		
        game.load.image('score_0', 'assets/score_0.png');
        game.load.image('score_1', 'assets/score_1.png');
		
        game.load.image('grid_0', 'assets/grid_0.png');
        game.load.image('grid_1', 'assets/grid_1.png');

        game.load.image('quad_0', 'assets/quad_0.png');
        game.load.image('quad_1', 'assets/quad_1.png');

        game.load.image('quad_shadow', 'assets/quad_shadow.png');

        game.load.atlas('gui', 'assets/gui.png', 'assets/gui.json');
        game.load.json('strings', 'text/en.json');             

        //sfx
        if(R.canAudio)
        {
            let sfx = ['error', 'new_shapes', 'new_game', 'put_stone', 'row_removed', 'button'];
            for(var i in sfx) game.load.audio(sfx[i], ['assets/sfx/' + sfx[i] + '.ogg', 'assets/sfx/' + sfx[i] + '.mp3']);
            this.sfx_key = sfx;
        }
        
		game.load.audio('music_bg', ['assets/sfx/bg.ogg', 'assets/sfx/bg.mp3'])

		gradle.music = new Phaser.Sound(game,'music_bg',1,true);
		
        //
        this.createEnvironment();

        //
        game.load.start();
    },  

    shutdown: function()
    {        
        this.loadingBarFull = null;
        this.loadText = null;
        this.sfx_key = null;
    },

    createEnvironment: function()
    {
        game.stage.backgroundColor = game.canvas.parentElement.style.backgroundColor = '#0c0c26';

        let cx = game.world.centerX;

        let logo = game.add.image(320, 700, 'loading', 'logo');
        logo.anchor.set(0.5);

        this.loadingBarFull = game.add.image(cx - 149, 506, 'loading', 'bar_full');
        let cropRect = new Phaser.Rectangle(0, 0, 0, 53);
        this.loadingBarFull.crop(cropRect);

        let loadingBar = game.add.image(cx - 156, 500, 'loading', 'bar_empty');

        this.loadText = R.createText(cx - 4, loadingBar.y + 32, 40, '', '#ffffff', true, 4);
    },

    //
    fileComplete: function(progress, cacheKey, success, totalLoaded, totalFiles)
    {
        this.loadingBarFull.cropRect.width = 315 * progress * 0.01;
        this.loadingBarFull.updateCrop();

        this.loadText.setText(progress + "%");
    },

    //
    loadComplete: function()
    {        
        //sfx
        if(R.canAudio) for(let i in this.sfx_key) R.sfx[this.sfx_key[i]] = game.add.audio(this.sfx_key[i]);
        
        // 
        R.strings = game.cache.getJSON('strings');

        //
        R.loadGame();

        //
        //game.renderer.clearBeforeRender = false;
        game.state.start('menu');
    }
};

//
R.saveGame = function()
{
    if(R.playerData.score < R.score)
    {
        R.playerData.score = R.score;
        if(game.device.localStorage) localStorage.setItem('MonkeyCreative_WoodBlocks_PlayerData', JSON.stringify(R.playerData));
    }
};

//
R.loadGame = function()
{
    if(game.device.localStorage)
    {
        let saveData = localStorage.getItem('MonkeyCreative_WoodBlocks_PlayerData');        
        if(saveData) R.playerData = JSON.parse(saveData);
    }
};
main.js
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
menu-state.js
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
play-state.js
//
let PlayState = {

    bg: null,
    shapeStates: null,
    placeX: [],
    placeY: 950,
    shapes: [],
    selectedShape: null,
    inputPointOffset: null,
    tweenDragOffset: null,
    existsShapes: 0,
    well: null,
    isPostFindPlaces: false,
    labelScore: null,
    labelTotalScore: null,
    displayScore: 0,
    buttonPause: null,
    pauseGroup: null,
    gameoverGroup: null,
    continueGroup: null,
    tutorial: null,
    curtain: null,

    //
    shutdown: function()
    {
        this.bg = null;
        this.shapeStates = null;
        this.placeX.length = 0;
        this.shapes.length = 0;
        this.selectedShape = null;
        this.inputPointOffset = null;
        this.tweenDragOffset = null;
        this.existsShapes = 0;
        this.well = null;
        this.isPostFindPlaces = false;
        this.labelScore = null;
        this.labelTotalScore = null;
        this.displayScore = 0;
        this.buttonPause = null;
        this.pauseGroup = null;
        this.gameoverGroup = null;
        this.continueGroup = null;
        this.tutorial = null;
        this.curtain = null;
        
        //
        R.shadowCaster.clear();
    },

    //
    create: function()
    {        
        gradle.event('button_play');  
		gradle.music.play();
		
		var rewardedVideoAd = true;
        //
        this.bg = game.add.image(21, 115, 'grid_' + R.playerData.theme);
        this.bg = game.add.image(21, 815, 'selector_' + R.playerData.theme);
        
		this.bg = game.add.image(113, 20, 'score_' + R.playerData.theme);
        this.bg = game.add.image(367, 20, 'score_' + R.playerData.theme);
        
		this.bg = game.add.image(263, 10, 'trone');
		this.bg = game.add.image(0, 1000, 'parrot');

        this.well = new Well(29, 125, 10, 10, quadPadding, this, rewardedVideoAd);

        this.shapeStates = new ShapeStates();        

        this.placeX[0] = 115;
        this.placeX[1] = game.width / 2;
        this.placeX[2] = game.width - this.placeX[0];

        for(let i = 0; i < 3; i++)
        {            
            this.shapes.push(new Shape(9, this.placeX[i], this.placeY));
            this.shapes[i].setState(this.shapeStates.getRnd());
        }

        this.existsShapes = 3;

        //
        this.inputPointOffset = new Phaser.Point(0, 0);        

        //score
        this.displayScore = R.score = 0;
        this.labelTotalScore = R.createText(432, 45, 40, R.playerData.score.toString(), '#e0b45b');        
        this.labelScore = R.createText(176, 45, 40, R.score.toString(), '#e0b45b');

        //GUI
        //pause
        let group = game.add.group();

        let panel = game.add.image(R.BASE_GAME_WIDTH * 0.5, R.BASE_GAME_HEIGHT * 0.390, 'gui', 'panel');
        panel.anchor.set(0.5);
        group.add(panel);

        R.ui.createHomeButton(327, 430, group);
        R.ui.createThemeButton(327, 505, group, false);        
        R.ui.createSoundButton(327, 581, group);
		R.ui.createSmallPlayButton(327, 355, group, this.onPlayPause, this);

        this.pauseGroup = group;
        this.pauseGroup.visible = false;
        R.ui.buttonsEnabled(this.pauseGroup, false);

        //
        let btn = game.add.button(576, 47, 'gui', this.showPauseMenu, this, 'btn_pause', 'btn_pause', 'btn_pause_pressed', 'btn_pause');
        btn.anchor.set(0.5);
        this.buttonPause = btn;

        //game over
        group = game.add.group();
        panel = game.add.image(R.BASE_GAME_WIDTH * 0.5, 400, 'gui', 'panel');
        panel.anchor.set(0.5);
        group.add(panel);
       
        label = R.createText(320, 200, 50, R.strings.no_moves_left);
        group.add(label);
       
        R.ui.createBigPlayButton(322, 395, group, this.onPlayButton, this);
        R.ui.createHomeButton(322, 580, group);

        this.gameoverGroup = group;
        this.gameoverGroup.visible = false;
        R.ui.buttonsEnabled(this.gameoverGroup, false);

        //continue group
        group = game.add.group();
        panel = game.add.image(R.BASE_GAME_WIDTH * 0.5, 400, 'gui', 'REWARD');
        panel.anchor.set(0.5);
        group.add(panel);

        // label = R.createText(320, 200, 50, R.strings.no_moves_left);
        // group.add(label);

        // label = R.createText(320, 270, 50, R.strings.remove_3_moves, '#ffffff', false, 0, true);        
        // label.anchor.set(0.5, 0);
        // group.add(label);

        R.ui.createTextButton(320, 480, group, this.onWatchVideoButton, this, R.strings.watch_video);
        R.ui.createCancelButton(320, 565, group, this.onCancelButton, this, R.strings.cancel);

        this.continueGroup = group;
        this.continueGroup.visible = false;
        R.ui.buttonsEnabled(this.continueGroup, false);

        //
        this.curtain = game.add.image(-4, -4, 'gui', 'curtain');
        this.curtain.scale.set(10.1);
        this.curtain.visible = false;

        //
        game.input.onDown.add(this.inputOnDown, this);
        game.input.onUp.add(this.inputOnUp, this);

        //
        game.time.events.loop(75, this.updateLabelScore, this);

        //
        if(R.sfx.new_game) R.sfx.new_game.play();

        //
        if(!R.playerData.tutorialCompleted)
        {
            this.tutorial = new R.Tutorial(this.well, this.shapes);
            for(let i = 0; i < 3; ++i) this.shapes[i].setState(this.shapeStates.state[this.tutorial.states[i].shapeIdx]);
            this.tutorial.start();
        }
    },

    inputOnDown: function(e)
    {        
        if(this.pauseGroup.visible || this.gameoverGroup.visible || this.continueGroup.visible) return;

        let input = game.input.activePointer;

        if(input.y > R.BASE_GAME_HEIGHT || input.y < 740) return;

        //
        if(input.x < 214 && (this.tutorial == null || this.tutorial.step === 0))
        {
            if(this.shapes[0].readyForDrag) this.selectedShape = this.shapes[0];
        }
        else if(input.x < 428 && (this.tutorial == null || this.tutorial.step === 1))
        {
            if(this.shapes[1].readyForDrag) this.selectedShape = this.shapes[1];
        }
        else if(this.tutorial == null || this.tutorial.step === 2)
        {
            if(this.shapes[2].readyForDrag) this.selectedShape = this.shapes[2];
        }

        //
        if(this.selectedShape)
        {
            if(this.tutorial != null) this.tutorial.stop();

            this.inputPointOffset.x = this.selectedShape.parent.x - input.x;
            this.inputPointOffset.y = this.selectedShape.parent.y - input.y;            
            this.selectedShape.startDrag();

            if(!game.device.desktop)
            {
                this.tweenDragOffset = game.add.tween(this.inputPointOffset).to({ y: -this.selectedShape.hh }, 100, Phaser.Easing.Linear.None, true);
                this.tweenDragOffset.onComplete.add(function() { this.tweenDragOffset = null; }, this);
            }

            game.world.bringToTop(this.selectedShape.parent);
        }
    },

    inputOnUp: function(e)
    {
        if(!this.selectedShape) return;

        if(this.tweenDragOffset && this.tweenDragOffset.isRunning) this.tweenDragOffset.stop(true);        

        if(this.well.tryAddShape(this.selectedShape))
        {
            --this.existsShapes;
            if(R.sfx.put_stone) R.sfx.put_stone.play();
        }
        else
        {
            this.selectedShape.endDrag();
            if(R.sfx.error) R.sfx.error.play();
            if(this.tutorial != null) this.tutorial.start();
        }
        
        this.selectedShape = null;        
    },

    generateNextShapes: function()
    {
        for(let i = 0; i < 3; ++i) this.shapes[i].reset(this.shapeStates.getRnd());

        this.existsShapes = 3;

        if(this.well.bodies.length === 0) this.findPlaces();
        else this.isPostFindPlaces = true;

        if(R.sfx.new_shapes) R.sfx.new_shapes.play();
    },

    onCompleteAddingShapeToWell: function()
    {
        if(this.existsShapes === 0) this.generateNextShapes();
        else
        {
            if(this.well.bodies.length === 0) this.findPlaces();
            else this.isPostFindPlaces = true;
        }
    },

    onComleteRemoveLines: function()
    {
        if(this.tutorial != null)
        {
            if(++this.tutorial.step < 3) this.tutorial.start();
            else
            {                
                R.playerData.tutorialCompleted = true;
                R.saveGame();
                this.tutorial.destroy();
                this.tutorial = null;
                this.well.reset();
                R.score = this.displayScore = 0;
                this.labelScore.text = this.displayScore.toString();
            }

        }

        if(this.isPostFindPlaces)
        {
            this.isPostFindPlaces = false;
            if(this.existsShapes > 0) this.findPlaces();
        }
    },

    findPlaces: function()
    {
        let n = 0;

        for(let i = 0; i < 3; ++i)
        {
            if(this.shapes[i].isExists())
            {
                if(this.well.findShapePlace(this.shapes[i].state)) break;
                ++n;
            }
        }

        if(n > 0 && n === this.existsShapes)
        {
            if(gradle.rewardedVideoAd) this.showContinueMenu();
            else this.showGameoverMenu();
        }
    },

    update: function()
    {
        if(this.selectedShape)
        {
            var input = game.input.activePointer;
            this.selectedShape.setPosition(this.inputPointOffset.x + input.x, this.inputPointOffset.y + input.y);            
        }
        R.shadowCaster.update();
        this.well.update();
    },

    updateLabelScore: function()
    {        
        if(this.displayScore < R.score)
        {
            ++this.displayScore;            
            this.labelScore.text = this.displayScore.toString();
        }
    },

    setTheme: function()
    {
        this.bg.loadTexture('bg_play_' + R.playerData.theme);
        game.stage.backgroundColor = game.canvas.parentElement.style.backgroundColor = (R.playerData.theme === 1 ? '#382237' : '#3e271f');
		R.quad = (R.quad=='quad_0') ? 'quad_1' : 'quad_0';
		R.saveGame();
		game.state.start('menu');
		game.state.start('play');
    },

    showPauseMenu: function()
    {
        if(R.sfx.button) R.sfx.button.play();
        this.buttonPause.inputEnabled = false;

        game.world.bringToTop(this.curtain);
        game.world.bringToTop(this.pauseGroup);

        this.curtain.visible = true;
        this.pauseGroup.visible = true;

        this.curtain.alpha = 0.0;
        game.add.tween(this.curtain).to({ alpha: 1.0 }, 200, Phaser.Easing.Linear.None, true);

        this.pauseGroup.y = 600;
        game.add.tween(this.pauseGroup).to({ y: 0 }, 400, Phaser.Easing.Back.Out, true).onComplete.add(function(pauseGroup) { R.ui.buttonsEnabled(pauseGroup, true); }, this);
    },

    onPlayPause: function(button)
    {
        R.ui.buttonsEnabled(button.parent, false);

        game.add.tween(this.curtain).to({ alpha: 0.0 }, 200, Phaser.Easing.Linear.None, true);
        game.add.tween(this.pauseGroup).to({ y: 600 }, 400, Phaser.Easing.Back.In, true).onComplete.add(this.onHidePauseMenu, this);        
    },

    onHidePauseMenu: function()
    {
        this.curtain.visible = false;
        this.pauseGroup.visible = false;
        this.buttonPause.inputEnabled = true;
    },

    showGameoverMenu: function()
    {
        R.saveGame();

        game.world.bringToTop(this.curtain);
        game.world.bringToTop(this.gameoverGroup);

        this.curtain.visible = true;
        this.gameoverGroup.visible = true;

        this.curtain.alpha = 0.0;
        game.add.tween(this.curtain).to({ alpha: 1.0 }, 200, Phaser.Easing.Linear.None, true);

        this.gameoverGroup.y = 800;
        game.add.tween(this.gameoverGroup).to({ y: 0 }, 600, Phaser.Easing.Back.Out, true).onComplete.add(function(gameoverGroup) { R.ui.buttonsEnabled(gameoverGroup, true); }, this);

        if(R.sfx.new_game) R.sfx.new_game.play();
        
        //gradle.submitScore(R.playerData.score);       
        
    },

    showContinueMenu: function()
    {        
        game.world.bringToTop(this.curtain);
        game.world.bringToTop(this.continueGroup);

        this.curtain.visible = true;
        this.continueGroup.visible = true;

        this.curtain.alpha = 0.0;
        game.add.tween(this.curtain).to({ alpha: 1.0 }, 200, Phaser.Easing.Linear.None, true);

        this.continueGroup.y = 800;
        game.add.tween(this.continueGroup).to({ y: 0 }, 600, Phaser.Easing.Back.Out, true).onComplete.add(function(continueGroup) { R.ui.buttonsEnabled(continueGroup, true); }, this);

        if(R.sfx.new_game) R.sfx.new_game.play();
    },

    onPlayButton: function(button)
    {        
        game.add.tween(this.curtain).to({ alpha: 0.0 }, 200, Phaser.Easing.Linear.None, true);
        game.add.tween(this.gameoverGroup).to({ y: 800 }, 600, Phaser.Easing.Back.In, true).onComplete.add(this.onHideGameoverMenu, this);
    },

    onHideGameoverMenu: function()
    {        
        game.state.start('play');
    },

    onWatchVideoButton: function(button)
    {
        R.ui.buttonsEnabled(this.continueGroup, false);
        //game.paused = true;
		gradle.playVideo(this.onCompleteAdVideo, this);
    },

    onCancelButton: function(button)
    {
        console.log('>>>>>>>>>Button cancel');
		game.state.start('menu');  
        // R.ui.buttonsEnabled(this.continueGroup, false);

        // game.add.tween(this.curtain).to({ alpha: 0.0 }, 200, Phaser.Easing.Linear.None, true);
        // game.add.tween(this.continueGroup).to({ y: 600 }, 400, Phaser.Easing.Back.In, true).onComplete.add(this.onHideContinueMenuCancel, this);
    },

    onCompleteAdVideo: function()
    {        
        game.paused = false;

        game.add.tween(this.curtain).to({ alpha: 0.0 }, 200, Phaser.Easing.Linear.None, true);
		console.log('>>>>>>>>>> cancredit : ' + canCredit);
		if(canCredit==true){
		    console.log('>>>>>>>>>>>>>>>>>>>>>>remove last 3 moves');
		    R.saveGame();
			game.add.tween(this.continueGroup).to({ y: 600 }, 400, Phaser.Easing.Back.In, true).onComplete.add(this.onHideContinueMenu, this);
		}
		else{
		    console.log('>>>>>>>>>>>>>>>>>>>>>>return to menu');
		    game.state.start('menu');
			//game.add.tween(this.continueGroup).to({ y: 600 }, 400, Phaser.Easing.Back.In, true).onComplete.add(this.onHideContinueMenuCancel, this);
		}
    },

    onHideContinueMenu: function()
    {
        this.curtain.visible = false;
        this.continueGroup.visible = false;

        this.well.remove3PastMoves();
        this.generateNextShapes();
    },

    onHideContinueMenuCancel: function()
    {
        this.curtain.visible = false;
        this.continueGroup.visible = false;

        this.showGameoverMenu();
    }
};
rui.js
//
R.createText = function(x, y, size, text, fill, isStroke, strokeThicknes, isWrap)
{
    if(!fill) fill = '#ffffff';
    let label = game.add.text(x, y, text);
    label.font = R.fontName;
    label.anchor.set(0.5);
    label.align = 'center';
    label.fontSize = size;
    label.fill = fill;

    if(isStroke)
    {
        label.stroke = '#000000';
        label.strokeThickness = strokeThicknes;
    }
    if(isWrap)
    {
        label.wordWrap = true;
        label.wordWrapWidth = game.width - 10;
    }
    return label;
};

//GUI
R.ui = {

    btnTheme: null,
    btnSound: null,

    buttonsEnabled: function(group, enabled)
    {
        let i = group.total;
        while(i--) if(group.children[i].type === Phaser.BUTTON) group.children[i].inputEnabled = enabled;
        
    },

    //
    createHomeButton: function(x, y, group)
    {
        let btn = game.add.button(x, y, 'gui', this.onHomeButton, this, 'btn_home', 'btn_home', 'btn_home_pressed', 'btn_home');
        btn.anchor.set(0.5);
        if(R.sfx.button) btn.setDownSound(R.sfx.button);
        if(group) group.add(btn);        
    },

    onHomeButton: function()
    {
        R.saveGame();

        gradle.event('button_home');

        game.state.start('menu');        
    },

    createThemeButton: function(x, y, group, big)
    {
        let frameNormal = R.playerData.theme === 0 ? 'btn_lamp_on' : 'btn_lamp_off';
        let framePressed = R.playerData.theme === 0 ? 'btn_lamp_on_pressed' : 'btn_lamp_off_pressed';

        if(big)
        {
            frameNormal += '_big';
            framePressed += '_big';
        }

        let btn = game.add.button(x, y, 'gui', this.onThemeButton, this, frameNormal, frameNormal, framePressed, frameNormal);
        btn.anchor.set(0.5);
        if(R.sfx.button) btn.setDownSound(R.sfx.button);
        if(group) group.add(btn);
        this.btnTheme = btn;
        this.btnTheme.big = big;
    },

    onThemeButton: function()
    {
		R.playerData.theme = 1 - R.playerData.theme;
        if(game.device.localStorage) localStorage.setItem('MonkeyCreative_WoodBlocks_PlayerData', JSON.stringify(R.playerData));

        let frameNormal = R.playerData.theme === 0 ? 'btn_lamp_on' : 'btn_lamp_off';
        let framePressed = R.playerData.theme === 0 ? 'btn_lamp_on_pressed' : 'btn_lamp_off_pressed';

        if(this.btnTheme.big)
        {
            frameNormal += '_big';
            framePressed += '_big';
        }

        this.btnTheme.setFrames(frameNormal, frameNormal, framePressed, frameNormal);

        let state = game.state.getCurrentState();
        if(state.setTheme) state.setTheme();
    },

    createSoundButton: function(x, y, group)
    {
        let frameNormal = game.sound.mute ? 'btn_sound_off' : 'btn_sound_on';
        let framePressed = game.sound.mute ? 'btn_sound_off_pressed' : 'btn_sound_on_pressed';

		if(game.sound.mute){
			gradle.music.stop();
		}
		else{
			gradle.music.play();
		}

        let btn = game.add.button(x, y, 'gui', this.onSoundButton, this, frameNormal, frameNormal, framePressed, frameNormal);
        btn.anchor.set(0.5);
        if(R.sfx.button) btn.setDownSound(R.sfx.button);
        if(group) group.add(btn);
        this.btnSound = btn;

        btn.visible = R.canAudio;
    },

    onSoundButton: function()
    {
        game.sound.mute = !game.sound.mute;

        let frameNormal = game.sound.mute ? 'btn_sound_off' : 'btn_sound_on';
        let framePressed = game.sound.mute ? 'btn_sound_off_pressed' : 'btn_sound_on_pressed';

        this.btnSound.setFrames(frameNormal, frameNormal, framePressed, frameNormal);
    },

    createSmallPlayButton: function(x, y, group, callback, context)
    {
        let btn = game.add.button(x, y, 'gui', callback, context, 'btn_small_play', 'btn_small_play', 'btn_small_play_pressed', 'btn_small_play');
        btn.anchor.set(0.5);
        if(R.sfx.button) btn.setDownSound(R.sfx.button);
        if(group) group.add(btn);
    },

    createBigPlayButton: function(x, y, group, callback, context)
    {
        let btn = game.add.button(x, y, 'gui', callback, context, 'btn_big_play', 'btn_big_play', 'btn_big_play_pressed', 'btn_big_play');
        btn.anchor.set(0.5);
        if(R.sfx.button) btn.setDownSound(R.sfx.button);
        if(group) group.add(btn);
    },

    createTextButton: function(x, y, group, callback, context, string)
    {
        let btn = game.add.button(x, y, 'gui', callback, context, 'button', 'button', 'button_pressed', 'button');
        btn.anchor.set(0.5);
        if(R.sfx.button) btn.setDownSound(R.sfx.button);
        if(group) group.add(btn);

        if(string)
        {
            let label = R.createText(0, -10, 45, string, '#ffffff', true, 4);
            label.stroke = '#000000';
            btn.addChild(label);
        }
    },
	
	createCancelButton: function(x, y, group, callback, context)
    {
        let btn = game.add.button(x, y, 'gui', callback, context, 'button_cancel', 'button_cancel', 'button_cancel_pressed', 'button_cancel');
        btn.anchor.set(0.5);
        if(R.sfx.button) btn.setDownSound(R.sfx.button);
        if(group) group.add(btn);
    }
};
shapes.js
//ShapeStates
let ShapeStates = function()
{    
    this.state = [];
    
    //
    //1
    this.state[0] = [[1]];

    //2
    this.state[1] = [[1, 1]];

    this.state[2] = [[1],
                     [1]];

    //3
    this.state[3] = [[1, 1, 1]];

    this.state[4] = [[1],
                     [1],
                     [1]];
    
    this.state[5] = [[1, 1],
                     [0, 1]];

    this.state[6] = [[1, 1],
                     [1, 0]];

    this.state[7] = [[1, 0],
                     [1, 1]];

    this.state[8] = [[0, 1],
                     [1, 1]];

    //4
    this.state[9] = [[1, 1, 1, 1]];

    this.state[10] = [[1],
                      [1],
                      [1],
                      [1]];

    this.state[11] = [[1, 1],
                      [1, 1]];

    //5
    this.state[12] = [[1, 1, 1, 1, 1]];

    this.state[13] = [[1],
                      [1],
                      [1],
                      [1],
                      [1]];
   
    this.state[14] = [[1, 0, 0],
                      [1, 0, 0],
                      [1, 1, 1]];

    this.state[15] = [[1, 1, 1],
                      [1, 0, 0],
                      [1, 0, 0]];

    this.state[16] = [[0, 0, 1],
                      [0, 0, 1],
                      [1, 1, 1]];

    this.state[17] = [[1, 1, 1],
                      [0, 0, 1],
                      [0, 0, 1]];
    //9
    this.state[18] = [[1, 1, 1],
                      [1, 1, 1],
                      [1, 1, 1]];

};

//
ShapeStates.prototype = {

    getRnd: function()
    {
        return game.rnd.pick(this.state);
    }
};

//
ShapeStates.prototype.constructor = ShapeStates;

//QuadShadow
R.shd = 8;

//
R.shadowCaster = {

    shadows: [],

    update: function()
    {
        let i = this.shadows.length;
        let sh = null;
        
        while(i--)
        {
            sh = this.shadows[i];
            if(sh.exists = (sh.quad.exists && sh.shape.padding.x >= quadPadding)) this.updateShadow(sh);
        }
    },

    updateShadow: function(sh)
    {
        let shd = R.shd;//R.shd * (sh.shape.padding.x / quadPaddingDrag);
        if(sh.shape.addingToWell) shd *= sh.shape.padding.x / quadPaddingDrag;

        sh.x = sh.quad.x + shd;
        sh.y = sh.quad.y + shd;
    },

    clear: function()
    {
        this.shadows.length = 0;
    },

    add: function(sh)
    {
        this.shadows.push(sh);
    }
};

//
R.QuadShadow = function(quad, shape)
{
    Phaser.Image.call(this, game, 0, 0, 'quad_shadow');
    this.anchor.set(0.5);
    this.quad = quad;
    this.shape = shape;
    this.exists = false;   
    R.shadowCaster.add(this);
};

R.QuadShadow.prototype = Object.create(Phaser.Image.prototype);
R.QuadShadow.prototype.constructor = R.QuadShadow;

//Shape
R.quad = 'quad_0';
const quadSize = 58;
const quadPadding = 0;
const quadScaleMin = 0.6;
const quadScaleDrag = 0.85;
const quadPaddingDrag = (quadSize + quadPadding) / quadScaleDrag - quadSize;//10.235294117647063;

//
let Shape = function(nQuads, startX, startY)
{    
    this.state = null;
    this.startX = startX;
    this.startY = startY;
    this.padding = new Phaser.Point(0, 0);
    this.hh = 0;
    this.addingToWell = false;

    this.parent = game.add.image(startX, startY, null);

    this.quads = new Array(nQuads);

    for(let i = 0; i < nQuads; i++)
    {        
        this.quads[i] = game.add.image(0, 0, R.quad);
        this.quads[i].anchor.set(0.5);
        this.parent.addChild(new R.QuadShadow(this.quads[i], this));
        this.parent.addChild(this.quads[i]);
    }

    this.existsQuads = nQuads;   
    this.well = null;

    //
    this.tweenDragScale = null;
    this.tweenDragPadding = null;
    this.tweenEndDragPosition = null;
    this.tweenEndDragScale = null;

    //
    this.readyForDrag = true;
};

//
Shape.prototype = {
    
    isExists: function()
    {
        return this.parent.exists;
    },

    setState: function(state)
    {
        this.state = state;        

        let i = this.quads.length;
        while(i--) this.quads[i].exists = false;
        
        this.buildShape(quadPadding);      

        this.parent.scale.set(quadScaleMin);
        this.parent.exists = true;
        this.padding.x = quadPadding;
    },

    setPosition: function(x, y)
    {
        this.parent.x = x;
        this.parent.y = y;
    },

    buildShape: function(padding)
    {
        let row = null;
        let i = 0;
        let idxQuad = 0;
        let size = quadSize + padding;
        let x = 0;
        let y = 0;
        let q = null;
        let maxX = 0;
        let maxY = 0;

        this.existsQuads = 0;

        for(let j = 0; j < this.state.length; ++j)
        {
            row = this.state[j];
            x = 0;
            for(i = 0; i < row.length; ++i)
            {
                if(row[i] === 1)
                {
                    q = this.quads[idxQuad];
                    q.x = x;
                    q.y = y;
                    q.exists = true;
                    if(maxX < x) maxX = x;
                    if(maxY < y) maxY = y;
                    ++idxQuad;
                }                
                x += size;
            }
            y += size;
        }

        this.existsQuads = idxQuad;

        //
        maxX *= 0.5;
        maxY *= 0.5;
        i = this.quads.length;

        while(i--)
        {
            if(this.quads[i].exists)
            {
                this.quads[i].x -= maxX;
                this.quads[i].y -= maxY;
            }
        }

        this.hh = maxY + size + 70;
    },

    updatePadding: function()
    {
        this.buildShape(this.padding.x);
    },

    startDrag: function()
    {
        this.readyForDrag = false;

        if(this.tweenEndDragPosition && this.tweenEndDragPosition.isRunning) this.tweenEndDragPosition.stop(true);
        if(this.tweenEndDragScale && this.tweenEndDragScale.isRunning) this.tweenEndDragScale.stop(true);

        this.tweenDragScale = game.add.tween(this.parent.scale).to({ x: quadScaleDrag, y: quadScaleDrag }, 100, Phaser.Easing.Linear.None, true);
        this.tweenDragScale.onComplete.add(function() { this.tweenDragScale = null; }, this);

        this.tweenDragPadding = game.add.tween(this.padding).to({ x: quadPaddingDrag }, 100, Phaser.Easing.Linear.None, true);
        this.tweenDragPadding.onUpdateCallback(this.updatePadding, this);        
        this.tweenDragPadding.onComplete.add(function() { this.updatePadding(); this.tweenDragPadding = null; }, this);
    },

    isNotReadyForAdding: function()
    {
        return (this.tweenDragScale && this.tweenDragScale.isRunning) || (this.tweenDragPadding && this.tweenDragPadding.isRunning);        
    },

    endDrag: function()
    {
        if(this.tweenDragScale && this.tweenDragScale.isRunning) this.tweenDragScale.stop(true);
        if(this.tweenDragPadding && this.tweenDragPadding.isRunning) this.tweenDragPadding.stop(true); 

        this.tweenDragPadding = game.add.tween(this.padding).to({ x: quadPadding }, 160, Phaser.Easing.Linear.None, true);
        this.tweenDragPadding.onUpdateCallback(this.updatePadding, this);
        this.tweenDragPadding.onComplete.add(function() { this.updatePadding(); this.tweenDragPadding = null; }, this);

        this.tweenEndDragPosition = game.add.tween(this.parent).to({ x: this.startX, y: this.startY }, 160, Phaser.Easing.Linear.None, true);
        this.tweenEndDragPosition.onComplete.add(function() { this.onReadyForDrag(); this.tweenEndDragPosition = null; }, this);

        this.tweenEndDragScale = game.add.tween(this.parent.scale).to({ x: quadScaleMin, y: quadScaleMin }, 160, Phaser.Easing.Linear.None, true);
        this.tweenEndDragScale.onComplete.add(function() { this.tweenEndDragScale = null; }, this);
    },

    getQuadWorldX: function(i)
    {
        return this.parent.x + this.quads[i].x * this.parent.scale.x;
    },

    getQuadWorldY: function(i)
    {
        return this.parent.y + this.quads[i].y * this.parent.scale.x;
    },

    beginAddingToWell: function(well, firstAddingCell)
    {
        if(this.tweenDragScale && this.tweenDragScale.isRunning) this.tweenDragScale.stop(true);
        if(this.tweenDragPadding && this.tweenDragPadding.isRunning) this.tweenDragPadding.stop(true);

        let tx = firstAddingCell.x - this.getQuadWorldX(0) + this.parent.x + well.grid.x;
        let ty = firstAddingCell.y - this.getQuadWorldY(0) + this.parent.y + well.grid.y;
        this.well = well;

        let tween = game.add.tween(this.padding).to({ x: quadPadding }, 100, Phaser.Easing.Linear.None, true);
        tween.onUpdateCallback(this.updatePadding, this);
        tween.onComplete.add(this.updatePadding, this);

        this.tweenDragScale = game.add.tween(this.parent.scale).to({ x: 1.0, y: 1.0 }, 100, Phaser.Easing.Linear.None, true);
        this.tweenDragScale.onComplete.add(function() { this.tweenDragScale = null; }, this);

        tween = game.add.tween(this.parent).to({ x: tx, y: ty }, 100, Phaser.Easing.Linear.None, true);
        tween.onComplete.add(this.onCompleteAddingToWell, this);

        //
        this.addingToWell = true;
    },

    onCompleteAddingToWell: function()
    {
        if(this.tweenDragScale && this.tweenDragScale.isRunning) this.tweenDragScale.stop(true);
        this.parent.exists = false;
        R.score += this.existsQuads;
        this.well.onCompliteAddingShape(this.frame);

        //
        this.addingToWell = false;
    },

    reset: function(state)
    {        
        this.setPosition(this.startX + game.width, this.startY);
        this.setState(state);

        let tween = game.add.tween(this.parent).to({ x: this.startX }, 300, Phaser.Easing.Quadratic.Out, true);
        tween.onComplete.add(this.onReadyForDrag, this);
    },

    onReadyForDrag: function()
    {
        this.readyForDrag = true;
    }
};

//
Shape.prototype.constructor = Shape;
tutorial.js
//
R.TutState = function()
{
    this.well = [];
    this.shapeIdx = 0;
    this.point1 = new Phaser.Point(0, 0);
    this.point2 = new Phaser.Point(0, 0);
}

R.TutState.prototype.constructor = R.TutState;

//
R.Tutorial = function(well, shapes)
{
    this.well = well;
    this.shapes = shapes;
    this.step = 0;

    this.circle = game.add.image(0, 0, 'gui', 'tut_circle');
    this.circle.anchor.set(0.5);

    this.finger = game.add.image(0, 0, 'gui', 'finger');
    
    this.states = [];

    let state = new R.TutState();

    //1
    state.well = [1, 1, 1, 2, 2, 2, 1, 1, 1, 1,
                  1, 1, 1, 2, 2, 2, 1, 1, 1, 1,
                  1, 1, 1, 2, 2, 2, 1, 1, 1, 1,
                  1, 1, 1, 2, 2, 2, 1, 1, 1, 1,
                  1, 1, 1, 2, 2, 2, 1, 1, 1, 1,
                  1, 1, 1, 0, 0, 0, 1, 1, 1, 1,
                  1, 1, 1, 2, 2, 2, 1, 1, 1, 1,
                  1, 1, 1, 2, 2, 2, 1, 1, 1, 1,
                  1, 1, 1, 2, 2, 2, 1, 1, 1, 1,
                  1, 1, 1, 2, 2, 2, 1, 1, 1, 1];

    state.shapeIdx = 3;

    state.point1.set(115, 850);
    state.point2.set(290, 444);

    this.states.push(state);

    //2
    state = new R.TutState();
    state.well = [1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
                  1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
                  1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
                  2, 2, 2, 2, 0, 2, 2, 2, 2, 2,
                  2, 2, 2, 2, 0, 2, 2, 2, 2, 2,
                  2, 2, 2, 2, 0, 2, 2, 2, 2, 2,
                  1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
                  1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
                  1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
                  1, 1, 1, 1, 1, 1, 1, 1, 1, 1];

    state.shapeIdx = 4;

    state.point1.set(320, 850);
    state.point2.set(290, 386);

    this.states.push(state);

    //3
    state = new R.TutState();
    state.well = [1, 1, 1, 2, 2, 2, 1, 1, 1, 1,
                  1, 1, 1, 2, 2, 2, 1, 1, 1, 1,
                  1, 1, 1, 2, 2, 2, 1, 1, 1, 1,
                  2, 2, 2, 0, 0, 0, 2, 2, 2, 2,
                  2, 2, 2, 0, 0, 0, 2, 2, 2, 2,
                  2, 2, 2, 0, 0, 0, 2, 2, 2, 2,
                  1, 1, 1, 2, 2, 2, 1, 1, 1, 1,
                  1, 1, 1, 2, 2, 2, 1, 1, 1, 1,
                  1, 1, 1, 2, 2, 2, 1, 1, 1, 1,
                  1, 1, 1, 2, 2, 2, 1, 1, 1, 1];

    state.shapeIdx = 18;

    state.point1.set(525, 850);
    state.point2.set(290, 386);    

    this.states.push(state);

};

R.Tutorial.prototype = {

    start: function()
    {        
        this.well.setState(this.states[this.step].well);
        this.finger.visible = this.circle.visible = true;
        this.tweenStep1();        
       
        game.world.bringToTop(this.circle);
        game.world.bringToTop(this.finger);
    },

    tweenStep1: function()
    {        
        let p1 = this.states[this.step].point1;
        this.finger.scale.set(1.1);
        this.finger.position.set(p1.x + 30, p1.y + 30);

        game.add.tween(this.finger).to(p1, 500, Phaser.Easing.Linear.None, true);
        game.add.tween(this.finger.scale).to({ x: 1, y: 1 }, 500, Phaser.Easing.Linear.None, true);

        //       
        this.circle.scale.set(0);
        this.circle.position.set(p1.x, p1.y);

        game.add.tween(this.circle.scale).to({ x: 1, y: 1 }, 500, Phaser.Easing.Linear.None, true).onComplete.add(this.tweenStep2, this);
    },

    tweenStep2: function()
    {        
        let p2 = this.states[this.step].point2;
        game.add.tween(this.circle).to(p2, 1000, Phaser.Easing.Linear.None, true, 500);
        game.add.tween(this.finger).to(p2, 1000, Phaser.Easing.Linear.None, true, 500).onComplete.add(this.tweenStep3, this);
    },

    tweenStep3: function()
    {
        game.add.tween(this.circle.scale).to({ x: 0, y: 0 }, 250, Phaser.Easing.Linear.None, true);
        game.add.tween(this.finger.scale).to({ x: 1.1, y: 1.1 }, 250, Phaser.Easing.Linear.None, true).onComplete.add(this.tweenStep4, this);
    },

    tweenStep4: function()
    {
        let p1 = this.states[this.step].point1;
        game.add.tween(this.finger).to({ x: p1.x + 30, y: p1.y + 30 }, 500, Phaser.Easing.Linear.None, true, 500).onComplete.add(this.tweenStep1, this);
    },

    stop: function()
    {
        game.tweens.removeAll();
        this.finger.visible = this.circle.visible = false;
    },

    destroy: function()
    {
        game.tweens.removeAll();     
        this.circle.destroy();
        this.finger.destroy();
    }
};

R.Tutorial.prototype.constructor = R.Tutorial;
well.js
//Well
var Well = function(left, top, rows, cols, padding, parentState, saveLast3Moves)
{
    this.left = left;
    this.top = top;    
    this.rows = rows;
    this.cols = cols;

    this.n = rows * cols;

    //
    let grid = game.add.group();
    for(var i = 0; i < this.n; ++i)
    {
        var quad = game.add.image(0, 0, R.quad);
        quad.exists = false;        
        grid.add(quad);        
    }

    let cells = new Array(rows);

    let size = quadSize + quadPadding;

    let x = 0;
    let y = top + quadSize * 0.5;
    let c = 0;

    for(let j = 0; j < rows; j++)
    {
        x = left + quadSize * 0.5;
        cells[j] = new Array(cols);
        let cj = cells[j];
        for(let i = 0; i < cols; i++)
        {
            let q = grid.getAt(c++);
            q.anchor.setTo(0.5, 0.5);
            q.x = x;
            q.y = y;
            q.qBody = new R.Body(q);
            cj[i] = q;
            x += size;
        }
        y += size;
    }

    this.grid = grid;
    this.cells = cells;        

    this.invSizeW = 1.0 / size;
    this.invSizeH = 1.0 / size;

    this.addingCells = [];

    this.parentState = parentState;

    //
    this.saveLast3Moves = saveLast3Moves;
    this.savedRowCells = [];

    //
    this.bodies = [];
};

//
Well.prototype = {

    tryAddShape: function(shape)
    {
        if(this.addingCells.length > 0 || shape.isNotReadyForAdding()) return false;        

        let n = shape.existsQuads;
        let wx = 0;
        let wy = 0;

        for(let i = 0; i < n; ++i)
        {
            wx = Math.floor((shape.getQuadWorldX(i) - this.left) * this.invSizeW);
            wy = Math.floor((shape.getQuadWorldY(i) - this.top) * this.invSizeH);
            
            if(wx < 0 || wx >= this.cols || wy < 0 || wy >= this.rows || this.cells[wy][wx].exists) break;            
            
            this.addingCells.push(this.cells[wy][wx]);            
        }      

        if(this.addingCells.length === n)
        {            
            shape.beginAddingToWell(this, this.addingCells[0]);
            return true;
        }
        this.addingCells.length = 0;
        return false;
    },

    onCompliteAddingShape: function(frame)
    {
        if(this.saveLast3Moves)
        {            
            if(this.savedRowCells.length > 2) this.savedRowCells.shift();
            this.savedRowCells.push(this.getRowCells());
        }
        
        //
        let i = this.addingCells.length;
        while(i--) this.addingCells[i].exists = true;
        
        this.addingCells.length = 0;
        this.checkLines();
        this.parentState.onCompleteAddingShapeToWell();        
    },

    checkLines: function()
    {
        let i = 0;
        let j = this.rows;
        let row = null;

        while(j--)
        {
            row = this.cells[j];
            i = this.cols;
            while(i--) if(!row[i].exists) break;
            if(i === -1) this.removeRow(j);
        }

        j = this.cols;
        while(j--)
        {
            i = this.rows;
            while(i--) if(!this.cells[i][j].exists) break;
            if(i === -1) this.removeCol(j);
        }

    },

    removeRow: function(j)
    {
        let row = this.cells[j];
        let i = this.rows;        
        while(i--)
        {
            row[i].qBody.launch();
            this.bodies.push(row[i].qBody);            
        }
        game.world.bringToTop(this.grid);
        R.score += this.cols;
        if(R.sfx.row_removed) R.sfx.row_removed.play();
    },

    removeCol: function(j)
    {     
        let i = this.cols;        
        while(i--)
        {
            this.cells[i][j].qBody.launch();
            this.bodies.push(this.cells[i][j].qBody);            
        }
        game.world.bringToTop(this.grid);
        R.score += this.rows;
        if(R.sfx.row_removed) R.sfx.row_removed.play();
    },

    findShapePlace: function(state)
    {   
        let ci = 0;
        let si = 0;
        let sj = 0;
        let ci2 = 0;
        let cj2 = 0;

        let lj = this.cols - state.length + 1;
        let li = this.rows - state[0].length + 1;

        let isNextCells = false;

        for(let cj = 0; cj < lj; ++cj)
        {            
            for(ci = 0; ci < li; ++ci)
            {                                
                for(sj = 0, cj2 = cj; sj < state.length; ++sj, ++cj2)
                {                    
                    for(si = 0, ci2 = ci; si < state[sj].length; ++si, ++ci2)
                    {
                        if(state[sj][si] === 1 && this.cells[cj2][ci2].exists)
                        {
                            isNextCells = true;
                            break;
                        }                        
                    }
                    if(isNextCells) break;
                }
                if(isNextCells) isNextCells = false;
                else return true;
            }
        }

        return false;
    },

    getRowCells: function()
    {
        let c = 0;
        let rowCells = [];
        for(let r = 0; r < 10; ++r)
        {
            let row = [];
            for(c = 0; c < 10; ++c) row.push(this.cells[r][c].exists ? this.cells[r][c].frame : -1);            
            rowCells.push(row);
        }        
        return rowCells;
    },

    remove3PastMoves: function()
    {
        let rowCells = this.savedRowCells[0];
        console.log(JSON.stringify(rowCells));
        let r = rowCells.length;
        let c = 0;
        while(r--)
        {
            c = rowCells[r].length;
            while(c--)
            {
                if(this.cells[r][c].exists = (rowCells[r][c] !== -1)) this.cells[r][c].frame = rowCells[r][c];
            }
        }

        //this.savedRowCells.length = 0;
        //this.saveLast3Moves = false;
    },

    update: function()
    {
        let removingQuads = this.bodies.length > 0;
        if(removingQuads)
        {
            let i = 0;
            while(i < this.bodies.length)
            {
                if(this.bodies[i].update()) ++i;
                else this.bodies.splice(i, 1);
            }

            if(this.bodies.length === 0) this.parentState.onComleteRemoveLines();            
        }
    },

    setState: function(array)
    {
        for(let r = 0; r < this.rows; ++r)
        {
            for(let c = 0; c < this.cols; ++c)
            {
                let s = array[r * this.cols + c];
                this.cells[r][c].exists = s !== 0;
                this.cells[r][c].visible = s === 2;
            }
        }
    },

    reset: function()
    {
        for(let r = 0; r < this.rows; ++r)
        {
            for(let c = 0; c < this.cols; ++c)
            {                                
                this.cells[r][c].visible = true;
                this.cells[r][c].exists = false;
            }
        }
    }
};

//
Well.prototype.constructor = Well;

//Body
R.Body = function(quad)
{
    this.quad = quad;
    this.wellPosition = { x: quad.position.x, y: quad.position.y };
    this.velocity = new Phaser.Point(0, 0);    
    this.torque = 0;
};

R.Body.prototype = {

    launch: function()
    {
        this.quad.parent.bringToTop(this.quad);
        this.quad.scale.set(1.2);
        this.velocity.x = game.rnd.realInRange(-2, 2);
        this.velocity.y = -game.rnd.realInRange(6, 10);
        this.torque = game.rnd.realInRange(-0.2, 0.2);
    },

    update: function()
    {
        if(this.quad.position.y < R.BASE_GAME_HEIGHT + quadSize)
        {
            this.quad.position.x += this.velocity.x;
            this.quad.position.y += this.velocity.y;
            this.quad.rotation += this.torque;
            if(this.quad.scale.x > 0.02) this.quad.scale.set(this.quad.scale.x - 0.015);            
            this.velocity.y += 0.6;
            return true;
        }

        this.quad.position.x = this.wellPosition.x;
        this.quad.position.y = this.wellPosition.y;
        this.quad.rotation = 0;
        this.quad.scale.set(1);
        this.quad.exists = false;

        return false;
    }
};

R.Body.prototype.constructor = R.Body;
