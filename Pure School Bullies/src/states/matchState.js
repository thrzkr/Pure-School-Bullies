// Best-of-three match state

export const matchState = {
	roundsWon: [0, 0], // [Ryu wins, Ken wins]
	currentRound: 1,
	matchEnded: false,
	matchWinnerId: undefined,
};

export const resetMatchState = () => {
	matchState.roundsWon = [0, 0];
	matchState.currentRound = 1;
	matchState.matchEnded = false;
	matchState.matchWinnerId = undefined;
};

export const recordRoundWin = (winnerId) => {
	matchState.roundsWon[winnerId]++;
	
	// Check if match is over (first to 2 rounds wins)
	if (matchState.roundsWon[winnerId] >= 2) {
		matchState.matchEnded = true;
		matchState.matchWinnerId = winnerId;
	} else {
		matchState.currentRound++;
	}
};

export const isMatchOver = () => {
	return matchState.matchEnded;
};

export const getMatchWinnerId = () => {
	return matchState.matchWinnerId;
};
