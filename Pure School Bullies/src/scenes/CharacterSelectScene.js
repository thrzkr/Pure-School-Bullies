import { BattleScene } from './BattleScene.js';
import { FighterId } from '../constants/fighter.js';
import { setPlayer1, setPlayer2, getSelection } from '../states/selectionState.js';
import { gameState } from '../states/gameState.js';

export class CharacterSelectScene {
	logoImg = document.getElementById('Logo');
	ryuImg = document.getElementById('RyuImage');
	kenImg = document.getElementById('KenImage');
	
	characters = [
		{ id: FighterId.RYU, name: 'RYU', x: 50, y: 80 },
		{ id: FighterId.KEN, name: 'KEN', x: 250, y: 80 },
	];
	
	player1Selected = FighterId.RYU;
	player2Selected = FighterId.KEN;
	selectingPlayer = 1; // 1 for player 1, 2 for player 2
	hoveredIndex = -1;
	
	// Store bound functions for proper removal
	boundHandleClick = null;
	boundHandleMouseMove = null;
	boundHandleKeyDown = null;
	
	constructor(changeScene) {
		this.changeScene = changeScene;
		
		// Get game mode from selection state
		const selection = getSelection();
		this.gameMode = selection.gameMode; // 'single' or 'multi'
		this.player1Selected = FighterId.RYU;
		this.player2Selected = FighterId.KEN;
		this.selectingPlayer = 1; // 1 for player 1, 2 for player 2 (only used in multi mode)
		
		// Create bound functions and store references
		this.boundHandleClick = this.handleClick.bind(this);
		this.boundHandleMouseMove = this.handleMouseMove.bind(this);
		this.boundHandleKeyDown = this.handleKeyDown.bind(this);
		
		// Add click listeners
		window.removeEventListener('click', this.boundHandleClick);
		window.addEventListener('click', this.boundHandleClick);
		
		// Add mouse move for hover
		window.removeEventListener('mousemove', this.boundHandleMouseMove);
		window.addEventListener('mousemove', this.boundHandleMouseMove);
		
		// Add keyboard input
		window.removeEventListener('keydown', this.boundHandleKeyDown);
		window.addEventListener('keydown', this.boundHandleKeyDown);
	}
	
	handleMouseMove = (e) => {
		const rect = document.querySelector('canvas').getBoundingClientRect();
		const x = (e.clientX - rect.left) * (382 / rect.width);
		const y = (e.clientY - rect.top) * (224 / rect.height);
		
		this.hoveredIndex = this.characters.findIndex(char =>
			x >= char.x && x <= char.x + 80 &&
			y >= char.y && y <= char.y + 80
		);
	};
	
	handleClick = (e) => {
		const rect = document.querySelector('canvas').getBoundingClientRect();
		const x = (e.clientX - rect.left) * (382 / rect.width);
		const y = (e.clientY - rect.top) * (224 / rect.height);
		
		const clickedChar = this.characters.find(char =>
			x >= char.x && x <= char.x + 80 &&
			y >= char.y && y <= char.y + 80
		);
		
		if (clickedChar) {
			this.selectCharacter(clickedChar.id);
		}
	};
	
	handleKeyDown = (e) => {
		if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
			this.selectCharacter(FighterId.RYU);
		} else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
			this.selectCharacter(FighterId.KEN);
		} else if (e.key === 'Enter') {
			this.confirmSelection();
		}
	};
	
	selectCharacter = (characterId) => {
		if (this.selectingPlayer === 1) {
			this.player1Selected = characterId;
		} else {
			this.player2Selected = characterId;
		}
	};
	
	confirmSelection = () => {
		if (this.gameMode === 'single') {
			// Single player mode - only select P1 character, AI gets a random opponent
			setPlayer1(this.player1Selected);
			// In single player, player 2 is AI - randomly select between Ryu and Ken
			const aiCharacter = Math.random() > 0.5 ? FighterId.KEN : FighterId.RYU;
			// Make sure AI character is different from player if possible
			const aiFinal = aiCharacter === this.player1Selected && FighterId.KEN === this.player1Selected ? FighterId.RYU : aiCharacter;
			setPlayer2(aiCharacter);
			
			// Update gameState with selected fighters
			gameState.fighters[0].id = this.player1Selected;
			gameState.fighters[1].id = aiCharacter;
			
			// Clean up event listeners using stored references
			window.removeEventListener('click', this.boundHandleClick);
			window.removeEventListener('mousemove', this.boundHandleMouseMove);
			window.removeEventListener('keydown', this.boundHandleKeyDown);
			
			this.changeScene(BattleScene);
		} else {
			// Two player mode - original behavior
			if (this.selectingPlayer === 1) {
				this.selectingPlayer = 2;
			} else {
				// Both players selected, start game
				setPlayer1(this.player1Selected);
				setPlayer2(this.player2Selected);
				
				// Update gameState with selected fighters
				gameState.fighters[0].id = this.player1Selected;
				gameState.fighters[1].id = this.player2Selected;
				
				// Clean up event listeners using stored references
				window.removeEventListener('click', this.boundHandleClick);
				window.removeEventListener('mousemove', this.boundHandleMouseMove);
				window.removeEventListener('keydown', this.boundHandleKeyDown);
				
				this.changeScene(BattleScene);
			}
		}
	};
	
	update = (time) => {
		// Nothing to update
	};
	
	drawCharacterBox = (context, character, isSelected) => {
		const boxSize = 80;
		const spacing = 20;
		
		// Draw box background
		context.fillStyle = isSelected ? '#FFD700' : '#444444';
		context.fillRect(character.x - spacing / 2, character.y - spacing / 2, boxSize + spacing, boxSize + spacing);
		
		// Draw border
		context.strokeStyle = isSelected ? '#FFFFFF' : '#AAAAAA';
		context.lineWidth = isSelected ? 3 : 2;
		context.strokeRect(character.x - spacing / 2, character.y - spacing / 2, boxSize + spacing, boxSize + spacing);
		
		// Draw character image or placeholder
		context.fillStyle = '#333333';
		context.fillRect(character.x, character.y, boxSize, boxSize);
		
		// Draw character name
		context.fillStyle = isSelected ? '#000000' : '#FFFFFF';
		context.font = isSelected ? 'bold 14px Arial' : '14px Arial';
		context.textAlign = 'center';
		context.textBaseline = 'top';
		context.fillText(character.name, character.x + boxSize / 2, character.y + boxSize / 2 - 8);
	};
	
	drawSelectionScreen = (context) => {
		// Background
		context.fillStyle = '#1a1a2e';
		context.fillRect(0, 0, 382, 224);
		
		// Title
		context.fillStyle = '#FFD700';
		context.font = 'bold 20px Arial';
		context.textAlign = 'center';
		const title = this.gameMode === 'single' ? 'SELECT YOUR CHARACTER' : (this.selectingPlayer === 1 ? 'SELECT PLAYER 1' : 'SELECT PLAYER 2');
		context.fillText(title, 191, 20);
		
		// Draw current selections
		context.fillStyle = '#FFFFFF';
		context.font = '10px Arial';
		context.textAlign = 'left';
		context.fillText(`P1: ${this.player1Selected === FighterId.RYU ? 'RYU' : 'KEN'}`, 10, 40);
		if (this.gameMode === 'multi') {
			context.fillText(`P2: ${this.player2Selected === FighterId.RYU ? 'RYU' : 'KEN'}`, 10, 52);
		} else {
			context.fillText('P2: AI', 10, 52);
		}
		
		// Draw characters
		this.characters.forEach((character, index) => {
			const isSelected = character.id === this.player1Selected;
			const isHovered = index === this.hoveredIndex;
			
			this.drawCharacterBox(context, character, isSelected || isHovered);
		});
		
		// Instructions
		context.fillStyle = '#AAAAAA';
		context.font = '10px Arial';
		context.textAlign = 'center';
		context.fillText('Use Arrow Keys or A/D to select', 191, 185);
		context.fillText('Press Enter to confirm', 191, 197);
	};
	
	draw = (context) => {
		this.drawSelectionScreen(context);
	};
}
