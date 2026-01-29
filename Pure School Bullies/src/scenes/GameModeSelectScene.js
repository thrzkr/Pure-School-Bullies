import { CharacterSelectScene } from './CharacterSelectScene.js';
import { setGameMode } from '../states/selectionState.js';

export class GameModeSelectScene {
	buttons = [
		{ label: 'SINGLE PLAYER', x: 0, y: 90, width: 150, height: 35, action: 'single' },
		{ label: 'TWO PLAYER', x: 0, y: 140, width: 150, height: 35, action: 'multi' },
		{ label: 'BACK', x: 0, y: 190, width: 150, height: 35, action: 'back' },
	];

	hoveredButton = -1;

	constructor(changeScene) {
		this.changeScene = changeScene;

		// Center buttons horizontally
		const startX = (382 - 150) / 2;
		this.buttons.forEach(btn => {
			btn.x = startX;
		});

		// Add click listeners
		this.boundHandleClick = this.handleClick.bind(this);
		this.boundHandleMouseMove = this.handleMouseMove.bind(this);
		this.boundHandleKeyDown = this.handleKeyDown.bind(this);

		window.removeEventListener('click', this.boundHandleClick);
		window.addEventListener('click', this.boundHandleClick);

		window.removeEventListener('mousemove', this.boundHandleMouseMove);
		window.addEventListener('mousemove', this.boundHandleMouseMove);

		window.removeEventListener('keydown', this.boundHandleKeyDown);
		window.addEventListener('keydown', this.boundHandleKeyDown);
	}

	handleMouseMove = (e) => {
		const rect = document.querySelector('canvas').getBoundingClientRect();
		const x = (e.clientX - rect.left) * (382 / rect.width);
		const y = (e.clientY - rect.top) * (224 / rect.height);

		this.hoveredButton = this.buttons.findIndex(btn =>
			x >= btn.x && x <= btn.x + btn.width &&
			y >= btn.y && y <= btn.y + btn.height
		);
	};

	handleClick = (e) => {
		const rect = document.querySelector('canvas').getBoundingClientRect();
		const x = (e.clientX - rect.left) * (382 / rect.width);
		const y = (e.clientY - rect.top) * (224 / rect.height);

		const clickedButton = this.buttons.find(btn =>
			x >= btn.x && x <= btn.x + btn.width &&
			y >= btn.y && y <= btn.y + btn.height
		);

		if (clickedButton) {
			this.handleButtonClick(clickedButton.action);
		}
	};

	handleKeyDown = (e) => {
		if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') {
			this.hoveredButton = Math.max(0, this.hoveredButton - 1);
		} else if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') {
			this.hoveredButton = Math.min(this.buttons.length - 1, this.hoveredButton + 1);
		} else if (e.key === 'Enter') {
			if (this.hoveredButton >= 0) {
				this.handleButtonClick(this.buttons[this.hoveredButton].action);
			}
		}
	};

	handleButtonClick = (action) => {
		// Clean up event listeners
		window.removeEventListener('click', this.boundHandleClick);
		window.removeEventListener('mousemove', this.boundHandleMouseMove);
		window.removeEventListener('keydown', this.boundHandleKeyDown);

		switch (action) {
			case 'single':
				setGameMode('single');
				this.changeScene(CharacterSelectScene);
				break;
			case 'multi':
				setGameMode('multi');
				this.changeScene(CharacterSelectScene);
				break;
			case 'back':
				const { MenuScene } = require('./MenuScene.js');
				this.changeScene(MenuScene);
				break;
		}
	};

	drawButton = (context, button, isHovered) => {
		const padding = 5;

		// Draw button background
		context.fillStyle = isHovered ? '#FFD700' : '#444444';
		context.fillRect(button.x - padding, button.y - padding, button.width + 2 * padding, button.height + 2 * padding);

		// Draw border
		context.strokeStyle = isHovered ? '#FFFFFF' : '#AAAAAA';
		context.lineWidth = isHovered ? 3 : 2;
		context.strokeRect(button.x - padding, button.y - padding, button.width + 2 * padding, button.height + 2 * padding);

		// Draw text
		context.fillStyle = isHovered ? '#000000' : '#FFFFFF';
		context.font = isHovered ? 'bold 14px Arial' : '14px Arial';
		context.textAlign = 'center';
		context.textBaseline = 'middle';
		context.fillText(button.label, button.x + button.width / 2, button.y + button.height / 2);
	};

	draw = (context) => {
		// Background
		context.fillStyle = '#1a1a2e';
		context.fillRect(0, 0, 382, 224);

		// Title
		context.fillStyle = '#FFD700';
		context.font = 'bold 20px Arial';
		context.textAlign = 'center';
		context.textBaseline = 'top';
		context.fillText('SELECT GAME MODE', 191, 30);

		// Draw buttons
		this.buttons.forEach((button, index) => {
			const isHovered = index === this.hoveredButton;
			this.drawButton(context, button, isHovered);
		});
	};

	update = (time) => {
		// Nothing to update
	};
}
