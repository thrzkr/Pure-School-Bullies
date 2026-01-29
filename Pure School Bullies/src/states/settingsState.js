import { soundMenuId } from '../constants/sounds.js';

// Settings state for audio preferences

export const settingsState = {
	musicEnabled: true,
	soundEnabled: true,
};

export const toggleMusic = () => {
	settingsState.musicEnabled = !settingsState.musicEnabled;
	// Mute/unmute all music audio elements
	const musicIds = ['kensTheme', soundMenuId];
	musicIds.forEach((id) => {
		const audio = document.getElementById(id);
		if (audio) audio.muted = !settingsState.musicEnabled;
	});
};

export const toggleSound = () => {
	settingsState.soundEnabled = !settingsState.soundEnabled;
	// All sound effect audio elements
	const soundIds = [
		'sound-fighter-land',
		'sound-fighter-light-kick-hit',
		'sound-fighter-medium-kick-hit',
		'sound-fighter-heavy-kick-hit',
		'sound-fighter-light-attack',
		'sound-fighter-medium-attack',
		'sound-fighter-heavy-attack',
		'sound-fighter-light-punch-hit',
		'sound-fighter-medium-punch-hit',
		'sound-fighter-heavy-punch-hit',
		'sound-ken-hadouken',
		'sound-ryu-hadouken',
	];
	soundIds.forEach((id) => {
		const audio = document.getElementById(id);
		if (audio) {
			audio.muted = !settingsState.soundEnabled;
		}
	});
};

export const initAudioSettings = () => {
	const musicIds = ['kensTheme', soundMenuId];
	musicIds.forEach((id) => {
		const audio = document.getElementById(id);
		if (audio) audio.muted = !settingsState.musicEnabled;
	});

	const soundIds = [
		'sound-fighter-land',
		'sound-fighter-light-kick-hit',
		'sound-fighter-medium-kick-hit',
		'sound-fighter-heavy-kick-hit',
		'sound-fighter-light-attack',
		'sound-fighter-medium-attack',
		'sound-fighter-heavy-attack',
		'sound-fighter-light-punch-hit',
		'sound-fighter-medium-punch-hit',
		'sound-fighter-heavy-punch-hit',
		'sound-ken-hadouken',
		'sound-ryu-hadouken',
	];
	soundIds.forEach((id) => {
		const audio = document.getElementById(id);
		if (audio) {
			audio.muted = !settingsState.soundEnabled;
		}
	});
};
