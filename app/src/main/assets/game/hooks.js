var gradle = { log: function(val){val && console.log( gradle.isMobile && (typeof val === 'object') ? JSON.stringify(val) : val );},
/**
	GRADLE - KNOWLEDGE IS POWER
	***** JACOB SERVICES LLC ***
    ***** PROPRIETARY CODE *****
    @author : gradle (gradlecode@outlook.com)
	@date: 05/01/2022 14:43:00
	@version: 7.0.0
	copyright @2022
*/
	
	intervalAds    : 1,     //Ads each interval for example each 3 times
	
	//Events manager :
	//================
    event: function(ev, msg){
		if(gradle.process(ev,msg))
        switch(ev){

		case 'first_start':   //First start
			//gradle.showInter();
			break;
		
		case 'button_play':
                gradle.showInter();
                break;
				
		case 'button_home':
			gradle.checkInterval() && gradle.showInter(); // <-- we check the interval if ok we show interstitial
			break;
						
		case 'reward':
			gradle.showReward();
			break;
			
		case 'test':
			//gradle.checkInterval() && gradle.showInter();
			break;
			
			
		//Backgrounds :
		case 'page_menu':
			gradle.change_background('assets/bg_home_0.jpg');
			break;
		case 'page_levels':
			gradle.change_background('images/bg2.png');
			break;
		case 'page_game':
			gradle.change_background('images/bg2.png');
			break;
		case 'page_levelend':
			gradle.change_background('images/bg2.png');
			break;

		case 'button_play':
			gradle.change_background('assets/bg_play_'+R.playerData.theme+'.jpg');
			break;
		
        }
    },
	
	change_background : function(background_image){
        document.getElementById("gameContainer").style.backgroundImage='url('+background_image+')';
        document.getElementById("gameContainer").style.backgroundSize='100% 100%';
    },



	

    //Ready : /!\ DO NOT CHANGE, ONLY IF YOU ARE AN EXPERT.
    //=========================
	start: function(){
		setTimeout(function(){gradle.event_ext('hide_splash');},10);
		setTimeout(function(){gradle.event_ext('hide_splash');startGame();}, 200);
    },	
	
	pause: function(){
		console.log('gradle pause ...');
		gradle.mute = game.sound.mute;
		game.sound.mute = true;
		gradle.music.stop();
    },
	resume: function(){
		console.log('gradle resume ...');
		game.sound.mute = false;gradle.mute;
		setTimeout(function(){
			gradle.music.play();
		}, 2000);
        
    },
	
	rewardedVideoAd : true,
    playVideo : function(callback, context){
        /*if(!gradle.rewardedVideoAd){
            callback.call(context);
        }*/
		gradle.mute = game.sound.mute;
        game.sound.mute = true;
        gradle.context  = context;
        gradle.callback = callback;
        gradle.event('reward');
    },
    context  : null,
    callback : null,
    earnedReward : function(){
		canCredit = true;
        gradle.callback.call(gradle.context);
		gradle.resume();
    },
	closedReward : function(){
		if(canCredit==false){
            game.state.start('menu');

		}
		canCredit=false;
		game.state.start('menu');
		gradle.resume();
	},

    run: function() {
        gradle.event('first_start');
		gradle.isMobile = ( /(ipad|iphone|ipod|android|windows phone)/i.test(navigator.userAgent) );
        document.addEventListener("visibilitychange", gradle.onVisibilityChanged, false);
		gradle.start();
    },
	
	loadJS: function(compressed) {
		/*if(compressed){
			GameLevels.splice(0,1);
			return;
		}*/
		var element = document.createElement("script");
		var src_file = 'game/'+file_num.zeroFill(3)+'.js';
		element.src = src_file;
		element.onload = function(){
			if(file_num<MAX_LEVELS){
				file_num++;
				gradle.loadJS();
			}
			else{
				GameLevels.splice(0,1);
			}
		};
		document.body.appendChild(element);
	},
	
	mute: false,
    event_ext: function(val){
		if(this.isMobile && typeof jacob!='undefined'){
			jacob.do_event(val);
		}
	},

	old_ev: null,
    process: function(ev, msg){
		if(gradle.old_ev ==ev){
			if(ev=='button_share' || ev=='button_play'){
				console.log('repeat');
				//return false;
			}
		}
        if(ev=='state_game_create'){
			null != game && (game.sound.mute = !1, game.paused = !1);
		}
		switch(ev){
            case 'btn_more':
                gradle.event_ext('show_more');
                break;
            case 'btn_privacy':
                gradle.event_ext('show_privacy');
                break;
            case 'btn_share':
                gradle.event_ext('show_share');
                break;
            case 'btn_profile':
                gradle.event_ext('show_profile');
                break;
            case 'btn_exit_game':
                gradle.event_ext('exit_game');
                break;
        }
		gradle.old_ev = ev;
		gradle.log(ev,msg);
		return true;
    },

    showInter: function(){
        if(!gradle.isMobile) return;
        gradle.log('jacob|show_inter');
    },
    showReward: function(){
        if(!gradle.isMobile) return;
        gradle.log('jacob|show_reward');
    },

    is_reward:false,
    reward_callback: function(){
        gradle.log('reward callback.... org');
		gradle.earnedReward();
    },
	reward: function(state){
        gradle.log('>>>>>>>>>>>>>>>>>>> reward granted : '+ state);
        is_reward = (state=='yes');
		if(is_reward){
			gradle.reward_callback();
		}
		else{
			gradle.closedReward();
		}
		//document.dispatchEvent(new CustomEvent('awesome', { bubbles: true, detail: { text: () => 'rewarded' } }));
    },

	score : 0,
    save_score(score, level){
        gradle.event_ext('save_score|'+score+'|'+level);
    },

	onVisibilityChanged : function(){
	    if (document.hidden || document.mozHidden || document.webkitHidden || document.msHidden){
			gradle.pause();
		}else{
			gradle.resume();
		}
	},

	currentInterval : 0,
	checkInterval: function(){
		return (++gradle.currentInterval==gradle.intervalAds) ? !(gradle.currentInterval=0) : !1;
	}
};

canCredit=false;
gradle.run();
