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