import { FighterDirection } from '../constants/fighter.js';

/**
 * AIController handles automated inputs for the AI opponent in single player mode
 * Uses a simple decision-making system based on opponent distance and health
 */
export class AIController {
	fighterId = 1; // Always player 2 (index 1)
	gameState = null;
	updateInterval = 30; // Update AI decision every 30 frames
	frameCounter = 0;
	
	// Simulated input state for AI
	aiInputState = {
		up: false,
		down: false,
		forward: false,
		backward: false,
		lightPunch: false,
		mediumPunch: false,
		heavyPunch: false,
		lightKick: false,
		mediumKick: false,
		heavyKick: false,
	};
	
	// AI behavior parameters
	decisionCooldown = 0;
	currentAction = null;
	actionDuration = 0;
	
	constructor(gameState) {
		this.gameState = gameState;
	}
	
	/**
	 * Calculate distance between fighters
	 */
	getDistanceToOpponent = () => {
		const ai = this.gameState.fighters[1];
		const opponent = this.gameState.fighters[0];
		return Math.abs(ai.instance?.x - opponent.instance?.x) || 0;
	};
	
	/**
	 * Determine if AI should move toward opponent
	 */
	shouldMoveForward = () => {
		const distance = this.getDistanceToOpponent();
		return distance > 80; // Move forward if opponent is far away
	};
	
	/**
	 * Determine if AI should move away
	 */
	shouldMoveBackward = () => {
		const distance = this.getDistanceToOpponent();
		const aiHealth = this.gameState.fighters[1].hitPoints;
		const opponentHealth = this.gameState.fighters[0].hitPoints;
		
		// Move back if opponent is close and we're losing health
		return distance < 40 && aiHealth < opponentHealth;
	};
	
	/**
	 * Determine if AI should jump
	 */
	shouldJump = () => {
		const distance = this.getDistanceToOpponent();
		// Jump occasionally when at medium distance
		return distance > 40 && distance < 100 && Math.random() > 0.85;
	};
	
	/**
	 * Determine if AI should attack
	 */
	shouldAttack = () => {
		const distance = this.getDistanceToOpponent();
		// Attack if within range (less than 80 pixels)
		return distance < 80 && Math.random() > 0.5;
	};
	
	/**
	 * Choose an attack type based on situation
	 */
	chooseAttack = () => {
		const distance = this.getDistanceToOpponent();
		const random = Math.random();
		
		if (distance < 30) {
			// Close range: mix of punches and kicks
			if (random < 0.4) return 'heavyPunch';
			if (random < 0.7) return 'mediumPunch';
			return 'lightKick';
		} else if (distance < 70) {
			// Medium range: kicks and medium attacks
			if (random < 0.5) return 'mediumKick';
			if (random < 0.8) return 'mediumPunch';
			return 'heavyKick';
		} else {
			// Far range: light attacks
			return Math.random() > 0.5 ? 'lightPunch' : 'lightKick';
		}
	};
	
	/**
	 * Update AI decision logic
	 */
	update = (time) => {
		this.frameCounter++;
		
		// Update decision every updateInterval frames
		if (this.frameCounter >= this.updateInterval) {
			this.frameCounter = 0;
			this.makeDecision();
		}
		
		// Reduce action duration
		if (this.actionDuration > 0) {
			this.actionDuration--;
		}
		
		// Execute current action
		this.executeAction();
	};
	
	/**
	 * Make a decision based on game state
	 */
	makeDecision = () => {
		// Reset all inputs
		this.resetInputs();
		
		// Check if should jump
		if (this.shouldJump()) {
			this.aiInputState.up = true;
			this.currentAction = 'jumping';
			this.actionDuration = 20;
			return;
		}
		
		// Check if should move
		if (this.shouldMoveForward()) {
			this.aiInputState.forward = true;
			this.currentAction = 'moving_forward';
			this.actionDuration = 15;
			return;
		}
		
		if (this.shouldMoveBackward()) {
			this.aiInputState.backward = true;
			this.currentAction = 'moving_backward';
			this.actionDuration = 15;
			return;
		}
		
		// Check if should attack
		if (this.shouldAttack()) {
			const attackType = this.chooseAttack();
			this.aiInputState[attackType] = true;
			this.currentAction = 'attacking';
			this.actionDuration = 5;
			return;
		}
		
		// Default: idle
		this.resetInputs();
		this.currentAction = 'idle';
	};
	
	/**
	 * Execute the current action
	 */
	executeAction = () => {
		// Actions execute for a duration then reset
		if (this.actionDuration <= 0) {
			this.resetInputs();
		}
	};
	
	/**
	 * Reset all input states
	 */
	resetInputs = () => {
		Object.keys(this.aiInputState).forEach(key => {
			this.aiInputState[key] = false;
		});
	};
	
	/**
	 * Get whether a specific input is active
	 */
	isInputActive = (inputName) => {
		return this.aiInputState[inputName] || false;
	};
}
