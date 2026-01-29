import { SCENE_WIDTH } from '../constants/Stage.js';
import { BattleScene } from './BattleScene.js';
import { GameModeSelectScene } from './GameModeSelectScene.js';
import { settingsState, toggleMusic, toggleSound } from '../states/settingsState.js';
import { playSound, stopSound } from '../engine/SoundHandler.js';
import { soundMenuId } from '../constants/sounds.js';
import { resetMatchState } from '../states/matchState.js';

export class MenuScene {
	logoImg = document.getElementById('Logo');
	
	buttons = [
		{ label: 'PLAY', x: 0, y: 105, width: 100, height: 28, action: 'play' },
		{ label: 'SETTINGS', x: 0, y: 135, width: 100, height: 28, action: 'settings' },
		{ label: 'CONTROLS', x: 0, y: 165, width: 100, height: 28, action: 'controls' },
		{ label: 'EXIT', x: 0, y: 195, width: 100, height: 28, action: 'exit' },
	];
	
	hoveredButton = -1;
	activeModal = null; // 'settings' or 'controls'
	
	constructor(changeScene) {
		this.changeScene = changeScene;
		resetMatchState(); // Reset match state when entering menu
		
		// Center buttons horizontally
		const startX = (SCENE_WIDTH - 120) / 2;
		this.buttons.forEach(btn => {
			btn.x = startX;
		});
		
		// Add click listeners
		window.removeEventListener('click', this.handleClick);
		window.addEventListener('click', this.handleClick.bind(this));
		
		// Add mouse move for hover
		window.removeEventListener('mousemove', this.handleMouseMove);
		window.addEventListener('mousemove', this.handleMouseMove.bind(this));

		// Menu music element (fallback to kensTheme if not present)
		this.menuMusic = document.getElementById(soundMenuId) || document.getElementById('kensTheme');
		if (this.menuMusic && settingsState.musicEnabled) {
			try { playSound(this.menuMusic); } catch (e) { /* ignore play errors */ }
		}
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
		if (this.activeModal === 'settings') {
			// Check if clicking on Music or Sound toggle
			const rect = document.querySelector('canvas').getBoundingClientRect();
			const x = (e.clientX - rect.left) * (382 / rect.width);
			const y = (e.clientY - rect.top) * (224 / rect.height);
			
			// Music toggle button
			if (x >= 220 && x <= 260 && y >= 84 && y <= 98) {
					toggleMusic();
					// Play or stop menu music immediately based on new setting
					if (this.menuMusic) {
						if (settingsState.musicEnabled) playSound(this.menuMusic);
						else stopSound(this.menuMusic);
					}
				return;
			}
			
			// Sound toggle button
			if (x >= 220 && x <= 260 && y >= 109 && y <= 123) {
				toggleSound();
				return;
			}
			
			// Close modal on other click
			this.activeModal = null;
			return;
		}
		
		if (this.activeModal === 'controls') {
			this.activeModal = null;
			return;
		}
		
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
	
	handleButtonClick = (action) => {
		switch (action) {
			case 'play':
				window.removeEventListener('click', this.handleClick);
				window.removeEventListener('mousemove', this.handleMouseMove);

				this.changeScene(GameModeSelectScene);
				break;
			case 'settings':
				this.activeModal = 'settings';
				break;
			case 'controls':
				this.activeModal = 'controls';
				break;
			case 'exit':
				window.close();
				break;
		}
	};
	
	update = (time) => {
		// Nothing to update
	};
	
	drawButtons = (context) => {
		this.buttons.forEach((btn, index) => {
			const isHovered = index === this.hoveredButton;
			
			// Draw button background
			context.fillStyle = isHovered ? '#FFD700' : '#444444';
			context.fillRect(btn.x, btn.y, btn.width, btn.height);
			
			// Draw button border
			context.strokeStyle = '#FFFFFF';
			context.lineWidth = 2;
			context.strokeRect(btn.x, btn.y, btn.width, btn.height);
			
			// Draw button text
			context.fillStyle = isHovered ? '#000000' : '#FFFFFF';
			context.font = 'bold 14px Arial';
			context.textAlign = 'center';
			context.textBaseline = 'middle';
			context.fillText(btn.label, btn.x + btn.width / 2, btn.y + btn.height / 2);
		});
	};
	
	drawLogo = (context) => {
		if (this.logoImg && this.logoImg.width > 0) {
			context.drawImage(
				this.logoImg,
				0, 0,
				this.logoImg.width,
				this.logoImg.height,
				80, 10, 220, 80
			);
		}
	};
	
	drawSettingsModal = (context) => {
		// Semi-transparent overlay
		context.fillStyle = 'rgba(0, 0, 0, 0.7)';
		context.fillRect(0, 0, 382, 224);
		
		// Modal box
		context.fillStyle = '#333333';
		context.fillRect(60, 50, 260, 130);
		context.strokeStyle = '#FFD700';
		context.lineWidth = 3;
		context.strokeRect(60, 50, 260, 130);
		
		// Title
		context.fillStyle = '#FFD700';
		context.font = 'bold 16px Arial';
		context.textAlign = 'center';
		context.fillText('SETTINGS', 190, 70);
		
		// Music toggle
		context.fillStyle = '#FFFFFF';
		context.font = '12px Arial';
		context.textAlign = 'left';
		context.fillText('Music: ', 80, 95);
		context.fillStyle = settingsState.musicEnabled ? '#00FF00' : '#FF0000';
		context.fillText(settingsState.musicEnabled ? 'ON' : 'OFF', 150, 95);
		
		// Sound toggle
		context.fillStyle = '#FFFFFF';
		context.fillText('Sound: ', 80, 120);
		context.fillStyle = settingsState.soundEnabled ? '#00FF00' : '#FF0000';
		context.fillText(settingsState.soundEnabled ? 'ON' : 'OFF', 150, 120);
		
		// Instructions
		context.fillStyle = '#AAAAAA';
		context.font = '10px Arial';
		context.textAlign = 'center';
		context.fillText('Click Music/Sound to toggle', 190, 155);
		context.fillText('Click anywhere to close', 190, 170);
		
		// Music button
		this.drawToggleButton(context, 220, 90, settingsState.musicEnabled, () => toggleMusic());
		
		// Sound button
		this.drawToggleButton(context, 220, 115, settingsState.soundEnabled, () => toggleSound());
	};
	
	drawToggleButton = (context, x, y, isEnabled, action) => {
		const btnWidth = 40;
		const btnHeight = 14;
		context.fillStyle = isEnabled ? '#00AA00' : '#AA0000';
		context.fillRect(x, y - 6, btnWidth, btnHeight);
		context.strokeStyle = '#FFFFFF';
		context.lineWidth = 1;
		context.strokeRect(x, y - 6, btnWidth, btnHeight);
	};
	
	drawControlsModal = (context) => {
		// Semi-transparent overlay
		context.fillStyle = 'rgba(0, 0, 0, 0.7)';
		context.fillRect(0, 0, 382, 224);
		
		// Modal box
		context.fillStyle = '#333333';
		context.fillRect(40, 30, 300, 160);
		context.strokeStyle = '#FFD700';
		context.lineWidth = 3;
		context.strokeRect(40, 30, 300, 160);
		
		// Title
		context.fillStyle = '#FFD700';
		context.font = 'bold 16px Arial';
		context.textAlign = 'center';
		context.fillText('CONTROLS', 190, 50);
		
		// Control info
		context.fillStyle = '#FFFFFF';
		context.font = '11px Arial';
		context.textAlign = 'left';
		
		const controls = [
			'Arrow Keys / WASD: Move',
			'A / L Button: Light Attack',
			'S / X Button: Medium Attack',
			'D / Y Button: Heavy Attack',
			'Gamepad: Fully Supported',
		];
		
		let y = 70;
		controls.forEach(control => {
			context.fillText(control, 60, y);
			y += 15;
		});
		
		// Instructions
		context.fillStyle = '#AAAAAA';
		context.font = '10px Arial';
		context.textAlign = 'center';
		context.fillText('Click anywhere to close', 190, 195);
	};
	
	draw = (context) => {
		// Background
		context.fillStyle = '#1a1a2e';
		context.fillRect(0, 0, 382, 224);
		
		// Draw logo
		this.drawLogo(context);
		
		// Draw buttons
		this.drawButtons(context);
		
		// Draw modal if active
		if (this.activeModal === 'settings') {
			this.drawSettingsModal(context);
		} else if (this.activeModal === 'controls') {
			this.drawControlsModal(context);
		}
	};
}
