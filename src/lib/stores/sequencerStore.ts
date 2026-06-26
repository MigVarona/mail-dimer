import { writable } from 'svelte/store';
import type { Step303, DrumPattern } from '$lib/audio/sequencer.js';
import type { DrumInstrument } from '$lib/audio/drums808.js';

const DRUM_INSTRUMENTS: DrumInstrument[] = ['kick', 'snare', 'clap', 'closedHH', 'openHH', 'tom'];

function makeDefault303Steps(): Step303[] {
	return Array.from({ length: 16 }, () => ({
		note: 'A',
		octave: 2,
		on: false,
		accent: false,
		slide: false
	}));
}

function makeDefaultDrumPattern(): DrumPattern {
	const pattern: Partial<DrumPattern> = {};
	for (const inst of DRUM_INSTRUMENTS) {
		pattern[inst] = Array.from({ length: 16 }, () => ({ on: false }));
	}
	return pattern as DrumPattern;
}

export const steps303 = writable<Step303[]>(makeDefault303Steps());
export const drumPattern = writable<DrumPattern>(makeDefaultDrumPattern());
export const currentStep = writable<number>(-1);
export const isPlaying = writable<boolean>(false);
export const bpm = writable<number>(120);
export const swing = writable<number>(0);

export { DRUM_INSTRUMENTS };
export type { Step303, DrumPattern };
