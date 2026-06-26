import * as Tone from 'tone';
import { getMasterInput } from './engine.js';

export interface EffectsParams {
	delayTime: number;   // 0-1 mapped to tempo divisions
	delayFeedback: number; // 0-1
	delayMix: number;    // 0-1
	reverbSize: number;  // 0-1 mapped to 0.1-10s
	reverbMix: number;   // 0-1
}

export class EffectsChain {
	private delay: Tone.FeedbackDelay;
	private reverb: Tone.Reverb;
	private delayWet: Tone.CrossFade;
	private reverbWet: Tone.CrossFade;

	constructor(params: EffectsParams) {
		const master = getMasterInput();

		this.delay = new Tone.FeedbackDelay({
			delayTime: this.delayTimeValue(params.delayTime),
			feedback: params.delayFeedback * 0.8,
			wet: params.delayMix
		});

		this.reverb = new Tone.Reverb({
			decay: 0.1 + params.reverbSize * 9.9,
			wet: params.reverbMix
		});

		this.delayWet = new Tone.CrossFade(params.delayMix);
		this.reverbWet = new Tone.CrossFade(params.reverbMix);

		// Chain: delay and reverb in parallel feeding master
		this.delay.connect(master);
		this.reverb.connect(master);
	}

	private delayTimeValue(v: number): Tone.Unit.Time {
		const times: Tone.Unit.Time[] = ['16n', '8n', '8t', '4n', '4t', '2n'];
		const idx = Math.floor(v * (times.length - 1));
		return times[Math.min(idx, times.length - 1)];
	}

	getDelay(): Tone.FeedbackDelay {
		return this.delay;
	}

	getReverb(): Tone.Reverb {
		return this.reverb;
	}

	updateParams(params: Partial<EffectsParams>): void {
		if (params.delayTime !== undefined) {
			this.delay.delayTime.rampTo(
				Tone.Time(this.delayTimeValue(params.delayTime)).toSeconds(),
				0.1
			);
		}
		if (params.delayFeedback !== undefined) {
			this.delay.feedback.rampTo(params.delayFeedback * 0.8, 0.01);
		}
		if (params.delayMix !== undefined) {
			this.delay.wet.rampTo(params.delayMix, 0.01);
		}
		if (params.reverbSize !== undefined) {
			this.reverb.decay = 0.1 + params.reverbSize * 9.9;
		}
		if (params.reverbMix !== undefined) {
			this.reverb.wet.rampTo(params.reverbMix, 0.01);
		}
	}

	dispose(): void {
		this.delay.dispose();
		this.reverb.dispose();
		this.delayWet.dispose();
		this.reverbWet.dispose();
	}
}
