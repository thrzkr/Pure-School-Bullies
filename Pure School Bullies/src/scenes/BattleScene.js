import {
	SCENE_WIDTH,
	STAGE_MID_POINT,
	STAGE_PADDING,
} from '../constants/Stage.js';
import {
	FighterAttackBaseData,
	FighterAttackStrength,
	FighterId,
	FighterState,
	FighterStruckDelay,
} from '../constants/fighter.js';
import { FRAME_TIME, GAME_SPEED } from '../constants/game.js';
import { Camera } from '../engine/Camera.js';
import { EntityList } from '../engine/EntityList.js';
import { Ken, Ryu } from '../entitites/fighters/index.js';
import {
	HeavyHitSplash,
	LightHitSplash,
	MediumHitSplash,
	Shadow,
} from '../entitites/fighters/shared/index.js';
import { Fireball } from '../entitites/fighters/special/Fireball.js';
import { FpsCounter } from '../entitites/overlays/FpsCounter.js';
import { StatusBar } from '../entitites/overlays/StatusBar.js';
import { KenStage } from '../entitites/stage/KenStage.js';
import { gameState, resetGameState } from '../states/gameState.js';
import { matchState, recordRoundWin, isMatchOver, getMatchWinnerId } from '../states/matchState.js';
import { getSelection } from '../states/selectionState.js';
import { MenuScene } from './MenuScene.js';
import { PauseScene } from './PauseScene.js';
import { AIController } from '../engine/AIController.js';
import * as originalControl from '../engine/InputHandler.js';
import { stopSound } from '../engine/SoundHandler.js';
import { soundMenuId } from '../constants/sounds.js';

export class BattleScene {
	image = document.getElementById('Winner');
	fighters = [];
	camera = undefined;
	shadows = [];
	FighterDrawOrder = [0, 1];
	hurtTimer = 0;
	battleEnded = false;
	winnerId = undefined;
	isPaused = false;
	pauseScene = null;
	aiController = null;
	isSinglePlayer = false;
	control = {};

	constructor(changeScene) {
		this.changeScene = changeScene;
		this.stage = new KenStage();
		this.entities = new EntityList();
		this.overlays = [
			new StatusBar(this.fighters, this.onTimeEnd),
			new FpsCounter(),
		];
		resetGameState();
		
		// Apply character selections from CharacterSelectScene
		const selection = getSelection();
		gameState.fighters[0].id = selection.player1;
		gameState.fighters[1].id = selection.player2;
		
		// Setup single player mode if needed
		this.isSinglePlayer = selection.gameMode === 'single';
		if (this.isSinglePlayer) {
			this.aiController = new AIController(gameState);
			this.setupAIControlOverrides();
			// Set global control wrapper for AI
			window._battleSceneControl = this.control;
		} else {
			// Use original control functions for multiplayer
			this.control = originalControl;
		}
		
		// Stop menu music (if any) when entering battle
		const menuMusic = document.getElementById(soundMenuId) || document.getElementById('kensTheme');
		if (menuMusic) {
			try { stopSound(menuMusic); } catch (e) { /* ignore */ }
		}
		
		this.startRound();
		
		// Add pause input listener
		window.addEventListener('keydown', this.handlePauseInput.bind(this));
	}

	setupAIControlOverrides = () => {
		// Create wrapper functions that can be called by Fighter.js
		const controlFunctions = [
			'isUp',
			'isDown',
			'isForward',
			'isBackward',
			'isLightPunch',
			'isMediumPunch',
			'isHeavyPunch',
			'isLightKick',
			'isMediumKick',
			'isHeavyKick',
		];

		controlFunctions.forEach(funcName => {
			this.control[funcName] = (id, ...args) => {
				// If player 2 in single player mode, use AI
				if (id === 1 && this.isSinglePlayer) {
					return this.aiController.isInputActive(this.convertFunctionNameToInputName(funcName));
				}
				// Otherwise use original control function
				return originalControl[funcName](id, ...args);
			};
		});
	};

	convertFunctionNameToInputName = (funcName) => {
		// Convert isLightPunch -> lightPunch, etc.
		return funcName.charAt(2).toLowerCase() + funcName.slice(3);
	};

	getFighterClass = (id) => {
		switch (id) {
			case FighterId.KEN:
				return Ken;
			case FighterId.RYU:
				return Ryu;
			default:
				return new Error('Invalid Fighter Id');
		}
	};

	getFighterEntitiy = (id, index) => {
		const FighterClass = this.getFighterClass(id);
		return new FighterClass(index, this.handleAttackHit, this.entities);
	};

	getFighterEntities = () => {
		const fighterEntities = gameState.fighters.map(({ id }, index) => {
			const fighterEntity = this.getFighterEntitiy(id, index);
			gameState.fighters[index].instance = fighterEntity;
			return fighterEntity;
		});

		fighterEntities[0].opponent = fighterEntities[1];
		fighterEntities[1].opponent = fighterEntities[0];

		return fighterEntities;
	};

	updateFighters = (time, context) => {
		// Update AI if in single player mode
		if (this.isSinglePlayer && this.aiController) {
			this.aiController.update(time);
		}
		
		this.fighters.map((fighter) => {
			if (this.hurtTimer > time.previous) {
				fighter.updateHurtShake(time, this.hurtTimer);
			} else fighter.update(time, this.camera);
		});
	};

	getHitSplashClass = (strength) => {
		switch (strength) {
			case FighterAttackStrength.LIGHT:
				return LightHitSplash;
			case FighterAttackStrength.MEDIUM:
				return MediumHitSplash;
			case FighterAttackStrength.HEAVY:
				return HeavyHitSplash;
			default:
				return new Error('Invalid Strength Splash requested');
		}
	};

	handleAttackHit = (time, playerId, opponentId, position, strength) => {
		this.FighterDrawOrder = [opponentId, playerId];
		gameState.fighters[playerId].score += FighterAttackBaseData[strength].score;

		gameState.fighters[opponentId].hitPoints -=
			FighterAttackBaseData[strength].damage;

		const HitSplashClass = this.getHitSplashClass(strength);

		if (gameState.fighters[opponentId].hitPoints <= 0) {
			this.fighters[opponentId].changeState(FighterState.KO, time);
		}

		this.fighters[opponentId].direction =
			this.fighters[playerId].direction * -1;

		position &&
			this.entities.add(HitSplashClass, position.x, position.y, playerId);

		this.hurtTimer = time.previous + FighterStruckDelay * FRAME_TIME;
	};

	updateShadows = (time) => {
		this.shadows.map((shadow) => shadow.update(time));
	};

	startRound = () => {
		this.fighters = this.getFighterEntities();
		this.camera = new Camera(
			STAGE_PADDING + STAGE_MID_POINT - SCENE_WIDTH / 2,
			16,
			this.fighters
		);

		this.shadows = this.fighters.map((fighter) => new Shadow(fighter));
	};

	goToNextScene = () => {
		setTimeout(() => {
			// Record the round winner
			recordRoundWin(this.winnerId);
			
			// If match is over, go to MenuScene
			// Otherwise, restart battle for next round
			if (isMatchOver()) {
				this.changeScene(MenuScene);
			} else {
				this.changeScene(BattleScene);
			}
		}, 6000);
	};

	drawWinnerText = (context, id) => {
		context.drawImage(this.image, 0, 11 * id, 70, 9, 120, 60, 140, 30);
	};

	onTimeEnd = (time) => {
		if (gameState.fighters[0].hitPoints >= gameState.fighters[1].hitPoints) {
			this.fighters[0].victory = true;
			this.fighters[1].changeState(FighterState.KO, time);
			this.winnerId = 0;
		} else {
			this.fighters[1].victory = true;
			this.fighters[0].changeState(FighterState.KO, time);
			this.winnerId = 1;
		}
		this.goToNextScene();
	};

	updateOverlays = (time) => {
		this.overlays.map((overlay) => overlay.update(time));
	};

	handlePauseInput = (e) => {
		if (e.key === 'Escape' && !this.battleEnded) {
			this.isPaused = !this.isPaused;
			if (this.isPaused && !this.pauseScene) {
				this.pauseScene = new PauseScene(this);
			}
		}
	};

	updateFighterHP = (time) => {
		gameState.fighters.map((fighter, index) => {
			if (fighter.hitPoints <= 0 && !this.battleEnded) {
				this.fighters[index].opponent.victory = true;
				this.winnerId = 1 - index;
				this.battleEnded = true;
				this.goToNextScene();
			}
		});
	};

	update = (time) => {
		if (this.isPaused) return;
		
		this.updateFighters(time);
		this.updateShadows(time);
		this.stage.update(time);
		this.entities.update(time, this.camera);
		this.camera.update(time);
		this.updateOverlays(time);
		this.updateFighterHP(time);
	};

	drawFighters(context) {
		this.FighterDrawOrder.map((id) =>
			this.fighters[id].draw(context, this.camera)
		);
	}

	drawShadows(context) {
		this.shadows.map((shadow) => shadow.draw(context, this.camera));
	}

	drawOverlays(context) {
		this.overlays.map((overlay) => overlay.draw(context, this.camera));
		if (this.winnerId !== undefined) {
			this.drawWinnerText(context, this.winnerId);
		}
	}

	draw = (context) => {
		this.stage.drawBackground(context, this.camera);
		this.drawShadows(context);
		this.drawFighters(context);
		this.entities.draw(context, this.camera);
		
		// Draw pause menu if paused
		if (this.isPaused && this.pauseScene) {
			this.pauseScene.draw(context);
		}
		this.stage.drawForeground(context, this.camera);
		this.drawOverlays(context);
	};
}
