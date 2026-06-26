export const NOTES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

export const SCALE_MINOR = [0, 2, 3, 5, 7, 8, 10]; // natural minor intervals
export const SCALE_MAJOR = [0, 2, 4, 5, 7, 9, 11];
export const SCALE_PENTATONIC_MINOR = [0, 3, 5, 7, 10];
export const SCALE_BLUES = [0, 3, 5, 6, 7, 10];

export function noteToFreq(note: string, octave: number): number {
	const idx = NOTES.indexOf(note);
	if (idx === -1) return 440;
	const midiNote = (octave + 1) * 12 + idx;
	return 440 * Math.pow(2, (midiNote - 69) / 12);
}

export function randomNote(scale = SCALE_MINOR, rootIdx = 9): string {
	const intervalIdx = Math.floor(Math.random() * scale.length);
	const noteIdx = (rootIdx + scale[intervalIdx]) % 12;
	return NOTES[noteIdx];
}

export function randomOctave(min = 1, max = 3): number {
	return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function midiToNote(midi: number): { note: string; octave: number } {
	const noteIdx = midi % 12;
	const octave = Math.floor(midi / 12) - 1;
	return { note: NOTES[noteIdx], octave };
}
