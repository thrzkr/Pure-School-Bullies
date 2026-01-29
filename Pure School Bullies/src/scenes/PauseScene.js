import { MenuScene } from './MenuScene.js';
import { resetMatchState } from '../states/matchState.js';

export class PauseScene {
	isPaused = true;
	selectedOption = 0; // 0 = Resume, 1 = Restart, 2 = Exit to Menu
	options = ['RESUME', 'RESTART', 'EXIT TO MENU'];
	
	// Store bound functions for proper removal
	boundHandleKeyDown = null;
	boundHandleMouseClick = null;
	boundHandleMouseMove = null;
	
	constructor(battleScene) {
		this.battleScene = battleScene;
		this.changeScene = battleScene.changeScene;
		
		// Create bound functions and store references
		this.boundHandleKeyDown = this.handleKeyDown.bind(this);
		this.boundHandleMouseClick = this.handleMouseClick.bind(this);
		this.boundHandleMouseMove = this.handleMouseMove.bind(this);
		
		// Add keyboard input for pause menu
		window.addEventListener('keydown', this.boundHandleKeyDown);
		
		// Add mouse input for pause menu
		window.addEventListener('click', this.boundHandleMouseClick);
		window.addEventListener('mousemove', this.boundHandleMouseMove);
	}
	
	handleKeyDown = (e) => {
		if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') {
			this.selectedOption = (this.selectedOption - 1 + this.options.length) % this.options.length;
		} else if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') {
			this.selectedOption = (this.selectedOption + 1) % this.options.length;
		} else if (e.key === 'Enter') {
			this.selectOption();
		} else if (e.key === 'Escape') {
			this.resume();
		}
	};
	
	selectOption = () => {
		switch (this.selectedOption) {
			case 0:
				this.resume();
				break;
			case 1:
				this.restart();
				break;
			case 2:
				this.exitToMenu();
				break;
		}
	};

	handleMouseClick = (e) => {
		const rect = document.querySelector('canvas').getBoundingClientRect();
		const x = (e.clientX - rect.left) * (382 / rect.width);
		const y = (e.clientY - rect.top) * (224 / rect.height);
		
		// Define button positions for click detection
		const buttons = [
			{ y: 95, height: 16 }, // Resume
			{ y: 117, height: 16 }, // Restart
			{ y: 139, height: 16 }, // Exit to Menu
		];
		
		// Check which button was clicked
		buttons.forEach((btn, index) => {
			if (x >= 90 && x <= 290 && y >= btn.y - 8 && y <= btn.y + 8) {
				this.selectedOption = index;
				this.selectOption();
			}
		});
	};

	handleMouseMove = (e) => {
		const rect = document.querySelector('canvas').getBoundingClientRect();
		const x = (e.clientX - rect.left) * (382 / rect.width);
		const y = (e.clientY - rect.top) * (224 / rect.height);
		
		// Define button positions for hover detection
		const buttons = [
			{ y: 95, height: 16 }, // Resume
			{ y: 117, height: 16 }, // Restart
			{ y: 139, height: 16 }, // Exit to Menu
		];
		
		// Check which button is being hovered
		let hoveredIndex = -1;
		buttons.forEach((btn, index) => {
			if (x >= 90 && x <= 290 && y >= btn.y - 8 && y <= btn.y + 8) {
				hoveredIndex = index;
			}
		});
		
		if (hoveredIndex >= 0) {
			this.selectedOption = hoveredIndex;
		}
	};

	resume = () => {
		// Clean up pause menu listeners
		window.removeEventListener('keydown', this.boundHandleKeyDown);
		window.removeEventListener('click', this.boundHandleMouseClick);
		window.removeEventListener('mousemove', this.boundHandleMouseMove);
		this.battleScene.isPaused = false;
	};
	
	restart = () => {
		// Clean up pause menu listeners
		window.removeEventListener('keydown', this.boundHandleKeyDown);
		window.removeEventListener('click', this.boundHandleMouseClick);
		window.removeEventListener('mousemove', this.boundHandleMouseMove);
		this.battleScene.changeScene(this.battleScene.constructor);
	};
	
	exitToMenu = () => {
		// Clean up pause menu listeners
		window.removeEventListener('keydown', this.boundHandleKeyDown);
		window.removeEventListener('click', this.boundHandleMouseClick);
		window.removeEventListener('mousemove', this.boundHandleMouseMove);
		resetMatchState();
		this.changeScene(MenuScene);
	};
	
	update = (time) => {
		// Pause menu doesn't update game state
	};
	
	drawPauseMenu = (context) => {
		// Semi-transparent overlay
		context.fillStyle = 'rgba(0, 0, 0, 0.8)';
		context.fillRect(0, 0, 382, 224);
		
		// Modal box
		context.fillStyle = '#1a1a2e';
		context.fillRect(80, 50, 220, 130);
		context.strokeStyle = '#FFD700';
		context.lineWidth = 3;
		context.strokeRect(80, 50, 220, 130);
		
		// Title
		context.fillStyle = '#FFD700';
		context.font = 'bold 20px Arial';
		context.textAlign = 'center';
		context.fillText('PAUSED', 190, 75);
		
		// Options
		let y = 105;
		this.options.forEach((option, index) => {
			const isSelected = index === this.selectedOption;
			
			if (isSelected) {
				// Draw selection background
				context.fillStyle = '#FFD700';
				context.fillRect(90, y - 10, 200, 16);
				context.fillStyle = '#000000';
			} else {
				context.fillStyle = '#FFFFFF';
			}
			
			context.font = isSelected ? 'bold 14px Arial' : '14px Arial';
			context.textAlign = 'center';
			context.fillText(option, 190, y + 2);
			
			y += 22;
		});
		
		// Instructions
		context.fillStyle = '#AAAAAA';
		context.font = '10px Arial';
		context.textAlign = 'center';
		context.fillText('Use Arrow Keys or WASD to navigate', 190, 195);
		context.fillText('Press Enter to select or ESC to resume', 190, 207);
	};
	
	draw = (context) => {
		this.drawPauseMenu(context);
	};
}
