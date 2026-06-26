import { writable } from 'svelte/store';
import type { Synth303Params } from '$lib/audio/synth303.js';

export interface EffectsState {
	delayTime: number;
	delayFeedback: number;
	delayMix: number;
	reverbSize: number;
	reverbMix: number;
}

export const synthParams = writable<Synth303Params>({
	cutoff: 0.4,
	resonance: 0.5,
	envMod: 0.5,
	decay: 0.3,
	accent: 0.7,
	distortion: 0.1,
	volume: 0.8,
	waveform: 'sawtooth'
});

export const effectsParams = writable<EffectsState>({
	delayTime: 0.33,
	delayFeedback: 0.3,
	delayMix: 0.15,
	reverbSize: 0.3,
	reverbMix: 0.1
});
