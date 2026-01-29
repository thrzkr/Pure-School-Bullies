// Character selection state
import { FighterId } from '../constants/fighter.js';

export const selectionState = {
	gameMode: 'multi', // 'single' or 'multi'
	player1: FighterId.RYU,
	player2: FighterId.KEN,
};

export const setGameMode = (mode) => {
	selectionState.gameMode = mode;
};

export const setPlayer1 = (fighterId) => {
	selectionState.player1 = fighterId;
};

export const setPlayer2 = (fighterId) => {
	selectionState.player2 = fighterId;
};

export const getSelection = () => {
	return {
		gameMode: selectionState.gameMode,
		player1: selectionState.player1,
		player2: selectionState.player2,
	};
};
