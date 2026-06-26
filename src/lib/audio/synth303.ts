import * as Tone from 'tone';
import { getMasterInput } from './engine.js';

export type Waveform303 = 'sawtooth' | 'square' | 'triangle';

export interface Synth303Params {
	cutoff: number;       // 0-1 mapped to 100-8000 Hz
	resonance: number;   // 0-1 mapped to 0-20 Q
	envMod: number;      // 0-1 envelope modulation depth
	decay: number;       // 0-1 mapped to 50-2000ms
	accent: number;      // 0-1 accent level
	distortion: number;  // 0-1
	volume: number;      // 0-1
	waveform: Waveform303;
}

export class Synth303 {
	private synth: Tone.MonoSynth;
	private filter: Tone.Filter;
	private distortion: Tone.Distortion;
	private envelope: Tone.AmplitudeEnvelope;
	private filterEnv: Tone.FrequencyEnvelope;
	private volume: Tone.Volume;
	private params: Synth303Params;

	constructor(params: Synth303Params) {
		this.params = { ...params };

		this.filter = new Tone.Filter({
			type: 'lowpass',
			frequency: this.cutoffHz(params.cutoff),
			Q: this.resonanceQ(params.resonance),
			rolloff: -24
		});

		this.filterEnv = new Tone.FrequencyEnvelope({
			attack: 0.001,
			decay: this.decayMs(params.decay),
			sustain: 0,
			release: 0.1,
			baseFrequency: this.cutoffHz(params.cutoff),
			octaves: params.envMod * 4
		});
		this.filterEnv.connect(this.filter.frequency);

		this.synth = new Tone.MonoSynth({
			oscillator: { type: params.waveform },
			envelope: {
				attack: 0.001,
				decay: this.decayMs(params.decay),
				sustain: 0.3,
				release: 0.1
			},
			filter: { type: 'lowpass' },
			filterEnvelope: {
				attack: 0.001,
				decay: this.decayMs(params.decay),
				sustain: 0,
				release: 0.1,
				baseFrequency: this.cutoffHz(params.cutoff),
				octaves: params.envMod * 4
			}
		});

		this.distortion = new Tone.Distortion(params.distortion * 0.8);
		this.volume = new Tone.Volume(this.volDb(params.volume));

		this.synth.chain(this.distortion, this.volume, getMasterInput());
	}

	private cutoffHz(v: number): number {
		return 100 * Math.pow(80, v); // 100 to 8000 Hz
	}

	private resonanceQ(v: number): number {
		return v * 20;
	}

	private decayMs(v: number): number {
		return 0.05 + v * 1.95; // 50ms to 2000ms
	}

	private volDb(v: number): number {
		return v === 0 ? -Infinity : -40 + v * 40;
	}

	triggerNote(
		note: string,
		octave: number,
		duration: Tone.Unit.Time,
		isAccent: boolean,
		hasSlide: boolean,
		time: number
	): void {
		const fullNote = `${note}${octave}`;
		const velocity = isAccent ? 1 : 0.6;

		if (hasSlide) {
			this.synth.portamento = 0.05;
		} else {
			this.synth.portamento = 0;
		}

		if (isAccent) {
			const accentBoost = this.params.accent * 6;
			this.synth.volume.setValueAtTime(accentBoost, time);
		} else {
			this.synth.volume.setValueAtTime(0, time);
		}

		this.synth.triggerAttackRelease(fullNote, duration, time, velocity);
	}

	updateParams(params: Partial<Synth303Params>): void {
		this.params = { ...this.params, ...params };

		if (params.cutoff !== undefined) {
			this.synth.filterEnvelope.baseFrequency = this.cutoffHz(params.cutoff);
		}
		if (params.resonance !== undefined) {
			this.synth.filter.Q.rampTo(this.resonanceQ(params.resonance), 0.01);
		}
		if (params.envMod !== undefined) {
			this.synth.filterEnvelope.octaves = params.envMod * 4;
		}
		if (params.decay !== undefined) {
			const d = this.decayMs(params.decay);
			this.synth.envelope.decay = d;
			this.synth.filterEnvelope.decay = d;
		}
		if (params.distortion !== undefined) {
			this.distortion.distortion = params.distortion * 0.8;
		}
		if (params.volume !== undefined) {
			this.volume.volume.rampTo(this.volDb(params.volume), 0.01);
		}
		if (params.waveform !== undefined) {
			this.synth.oscillator.type = params.waveform;
		}
	}

	dispose(): void {
		this.synth.dispose();
		this.distortion.dispose();
		this.volume.dispose();
		this.filter.dispose();
		this.filterEnv.dispose();
	}
}
