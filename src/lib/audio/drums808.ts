import * as Tone from 'tone';
import { getMasterInput } from './engine.js';

export type DrumInstrument = 'kick' | 'snare' | 'clap' | 'closedHH' | 'openHH' | 'tom';

interface DrumChannel {
	volume: Tone.Volume;
}

interface KickChannel extends DrumChannel {
	synth: Tone.MembraneSynth;
}

interface SnareChannel extends DrumChannel {
	noise: Tone.NoiseSynth;
	body: Tone.MembraneSynth;
}

interface ClapChannel extends DrumChannel {
	noises: Tone.NoiseSynth[];
}

interface HHChannel extends DrumChannel {
	synth: Tone.MetalSynth;
}

interface TomChannel extends DrumChannel {
	synth: Tone.MembraneSynth;
}

export class Drums808 {
	private kick: KickChannel;
	private snare: SnareChannel;
	private clap: ClapChannel;
	private closedHH: HHChannel;
	private openHH: HHChannel;
	private tom: TomChannel;

	constructor() {
		const master = getMasterInput();

		// Kick
		const kickVol = new Tone.Volume(0).connect(master);
		const kickSynth = new Tone.MembraneSynth({
			pitchDecay: 0.08,
			octaves: 6,
			envelope: { attack: 0.001, decay: 0.5, sustain: 0, release: 0.1 }
		}).connect(kickVol);
		this.kick = { synth: kickSynth, volume: kickVol };

		// Snare
		const snareVol = new Tone.Volume(0).connect(master);
		const snareNoise = new Tone.NoiseSynth({
			noise: { type: 'white' },
			envelope: { attack: 0.001, decay: 0.15, sustain: 0, release: 0.05 }
		}).connect(snareVol);
		const snareBody = new Tone.MembraneSynth({
			pitchDecay: 0.02,
			octaves: 3,
			envelope: { attack: 0.001, decay: 0.12, sustain: 0, release: 0.05 }
		}).connect(snareVol);
		this.snare = { noise: snareNoise, body: snareBody, volume: snareVol };

		// Clap
		const clapVol = new Tone.Volume(0).connect(master);
		const clapNoises: Tone.NoiseSynth[] = [];
		for (let i = 0; i < 3; i++) {
			const n = new Tone.NoiseSynth({
				noise: { type: 'pink' },
				envelope: { attack: 0.001, decay: 0.05 + i * 0.02, sustain: 0, release: 0.02 }
			}).connect(clapVol);
			clapNoises.push(n);
		}
		this.clap = { noises: clapNoises, volume: clapVol };

		// Closed HH
		const closedVol = new Tone.Volume(0).connect(master);
		const closedSynth = new Tone.MetalSynth({
			frequency: 400,
			envelope: { attack: 0.001, decay: 0.06, release: 0.01 },
			harmonicity: 5.1,
			modulationIndex: 32,
			resonance: 4000,
			octaves: 1.5
		}).connect(closedVol);
		this.closedHH = { synth: closedSynth, volume: closedVol };

		// Open HH
		const openVol = new Tone.Volume(0).connect(master);
		const openSynth = new Tone.MetalSynth({
			frequency: 400,
			envelope: { attack: 0.001, decay: 0.4, release: 0.1 },
			harmonicity: 5.1,
			modulationIndex: 32,
			resonance: 4000,
			octaves: 1.5
		}).connect(openVol);
		this.openHH = { synth: openSynth, volume: openVol };

		// Tom
		const tomVol = new Tone.Volume(0).connect(master);
		const tomSynth = new Tone.MembraneSynth({
			pitchDecay: 0.12,
			octaves: 4,
			envelope: { attack: 0.001, decay: 0.35, sustain: 0, release: 0.1 }
		}).connect(tomVol);
		this.tom = { synth: tomSynth, volume: tomVol };
	}

	trigger(instrument: DrumInstrument, time: number): void {
		switch (instrument) {
			case 'kick':
				this.kick.synth.triggerAttackRelease('C1', '8n', time);
				break;
			case 'snare':
				this.snare.noise.triggerAttackRelease('8n', time);
				this.snare.body.triggerAttackRelease('A2', '8n', time);
				break;
			case 'clap':
				this.clap.noises[0].triggerAttackRelease('16n', time);
				this.clap.noises[1].triggerAttackRelease('16n', time + 0.01);
				this.clap.noises[2].triggerAttackRelease('8n', time + 0.02);
				break;
			case 'closedHH':
				// Choke open HH
				this.openHH.synth.envelope.triggerRelease(time);
				this.closedHH.synth.triggerAttackRelease('16n', time);
				break;
			case 'openHH':
				this.openHH.synth.triggerAttackRelease('8n', time);
				break;
			case 'tom':
				this.tom.synth.triggerAttackRelease('G1', '8n', time);
				break;
		}
	}

	setVolume(instrument: DrumInstrument, value: number): void {
		const db = value === 0 ? -Infinity : -40 + value * 40;
		const channel = this.getChannel(instrument);
		channel.volume.volume.rampTo(db, 0.01);
	}

	private getChannel(instrument: DrumInstrument): DrumChannel {
		switch (instrument) {
			case 'kick': return this.kick;
			case 'snare': return this.snare;
			case 'clap': return this.clap;
			case 'closedHH': return this.closedHH;
			case 'openHH': return this.openHH;
			case 'tom': return this.tom;
		}
	}

	dispose(): void {
		this.kick.synth.dispose();
		this.kick.volume.dispose();
		this.snare.noise.dispose();
		this.snare.body.dispose();
		this.snare.volume.dispose();
		this.clap.noises.forEach(n => n.dispose());
		this.clap.volume.dispose();
		this.closedHH.synth.dispose();
		this.closedHH.volume.dispose();
		this.openHH.synth.dispose();
		this.openHH.volume.dispose();
		this.tom.synth.dispose();
		this.tom.volume.dispose();
	}
}
