import { writable } from 'svelte/store';
import type { DrumInstrument } from '$lib/audio/drums808.js';

export type DrumVolumes = Record<DrumInstrument, number>;

export const drumVolumes = writable<DrumVolumes>({
	kick: 0.9,
	snare: 0.8,
	clap: 0.7,
	closedHH: 0.75,
	openHH: 0.7,
	tom: 0.75
});
