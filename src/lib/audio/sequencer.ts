import * as Tone from 'tone';
import type { Synth303 } from './synth303.js';
import type { Drums808, DrumInstrument } from './drums808.js';

export interface Step303 {
	note: string;
	octave: number;
	on: boolean;
	accent: boolean;
	slide: boolean;
}

export interface StepDrum {
	on: boolean;
}

export type DrumPattern = Record<DrumInstrument, StepDrum[]>;

export interface SequencerCallbacks {
	onStep: (step: number) => void;
}

const DRUM_INSTRUMENTS: DrumInstrument[] = ['kick', 'snare', 'clap', 'closedHH', 'openHH', 'tom'];

export class Sequencer {
	private synth: Synth303 | null = null;
	private drums: Drums808 | null = null;
	private steps303: Step303[] = [];
	private drumPattern: DrumPattern;
	private sequence: Tone.Sequence | null = null;
	private currentStep = 0;
	private callbacks: SequencerCallbacks;
	private numSteps = 16;

	constructor(callbacks: SequencerCallbacks) {
		this.callbacks = callbacks;
		this.drumPattern = this.emptyDrumPattern();
	}

	private emptyDrumPattern(): DrumPattern {
		const pattern: Partial<DrumPattern> = {};
		for (const inst of DRUM_INSTRUMENTS) {
			pattern[inst] = Array.from({ length: this.numSteps }, () => ({ on: false }));
		}
		return pattern as DrumPattern;
	}

	setSynth(synth: Synth303): void {
		this.synth = synth;
	}

	setDrums(drums: Drums808): void {
		this.drums = drums;
	}

	setSteps303(steps: Step303[]): void {
		this.steps303 = steps;
	}

	setDrumPattern(pattern: DrumPattern): void {
		this.drumPattern = pattern;
	}

	setNumSteps(n: number): void {
		this.numSteps = n;
	}

	private buildSequence(): void {
		if (this.sequence) {
			this.sequence.dispose();
		}

		const indices = Array.from({ length: this.numSteps }, (_, i) => i);

		this.sequence = new Tone.Sequence(
			(time, step) => {
				const stepIdx = step as number;
				this.currentStep = stepIdx;

				// Schedule UI callback
				Tone.getDraw().schedule(() => {
					this.callbacks.onStep(stepIdx);
				}, time);

				// Trigger 303
				if (this.synth && this.steps303[stepIdx]?.on) {
					const s = this.steps303[stepIdx];
					this.synth.triggerNote(s.note, s.octave, '16n', s.accent, s.slide, time);
				}

				// Trigger drums
				if (this.drums) {
					for (const inst of DRUM_INSTRUMENTS) {
						if (this.drumPattern[inst][stepIdx]?.on) {
							this.drums.trigger(inst, time);
						}
					}
				}
			},
			indices,
			'16n'
		);
	}

	play(): void {
		this.buildSequence();
		this.sequence?.start(0);
		Tone.getTransport().start();
	}

	stop(): void {
		Tone.getTransport().stop();
		this.sequence?.stop();
		this.currentStep = 0;
		this.callbacks.onStep(-1);
	}

	pause(): void {
		Tone.getTransport().pause();
	}

	setBPM(bpm: number): void {
		Tone.getTransport().bpm.rampTo(bpm, 0.1);
	}

	setSwing(swing: number): void {
		Tone.getTransport().swing = swing;
		Tone.getTransport().swingSubdivision = '16n';
	}

	getCurrentStep(): number {
		return this.currentStep;
	}

	dispose(): void {
		this.sequence?.dispose();
	}
}
