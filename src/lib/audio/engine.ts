import * as Tone from 'tone';

let initialized = false;
let analyser: Tone.Analyser | null = null;
let fftAnalyser: Tone.Analyser | null = null;
let masterCompressor: Tone.Compressor | null = null;
let masterLimiter: Tone.Limiter | null = null;

export async function initAudio(): Promise<void> {
	if (initialized) return;
	await Tone.start();

	masterCompressor = new Tone.Compressor({
		threshold: -24,
		ratio: 4,
		attack: 0.003,
		release: 0.25
	});

	masterLimiter = new Tone.Limiter(-3);

	analyser = new Tone.Analyser('waveform', 2048);
	fftAnalyser = new Tone.Analyser('fft', 1024);

	masterCompressor.chain(masterLimiter, Tone.getDestination());
	masterCompressor.connect(analyser);
	masterCompressor.connect(fftAnalyser);

	initialized = true;
}

export function getMasterInput(): Tone.Compressor {
	if (!masterCompressor) throw new Error('Audio not initialized');
	return masterCompressor;
}

export function getAnalyser(): Tone.Analyser {
	if (!analyser) throw new Error('Audio not initialized');
	return analyser;
}

export function getFFTAnalyser(): Tone.Analyser {
	if (!fftAnalyser) throw new Error('Audio not initialized');
	return fftAnalyser;
}

export function isInitialized(): boolean {
	return initialized;
}

export function setMasterVolume(db: number): void {
	Tone.getDestination().volume.rampTo(db, 0.01);
}
