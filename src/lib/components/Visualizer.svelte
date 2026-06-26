<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { getAnalyser, getFFTAnalyser, isInitialized } from '$lib/audio/engine.js';

	let waveCanvas: HTMLCanvasElement;
	let fftCanvas: HTMLCanvasElement;
	let animId: number;
	let running = true;

	onMount(() => {
		animId = requestAnimationFrame(draw);
	});

	onDestroy(() => {
		running = false;
		cancelAnimationFrame(animId);
	});

	function draw() {
		if (!running) return;
		animId = requestAnimationFrame(draw);

		drawWaveform();
		drawFFT();
	}

	function drawWaveform() {
		if (!waveCanvas) return;
		const ctx = waveCanvas.getContext('2d');
		if (!ctx) return;

		const w = waveCanvas.width;
		const h = waveCanvas.height;

		ctx.fillStyle = '#080808';
		ctx.fillRect(0, 0, w, h);

		// Grid lines
		ctx.strokeStyle = '#1a1a1a';
		ctx.lineWidth = 1;
		for (let y = 0; y < h; y += h / 4) {
			ctx.beginPath();
			ctx.moveTo(0, y);
			ctx.lineTo(w, y);
			ctx.stroke();
		}
		ctx.beginPath();
		ctx.moveTo(0, h / 2);
		ctx.lineTo(w, h / 2);
		ctx.strokeStyle = '#252525';
		ctx.stroke();

		if (!isInitialized()) {
			// Draw idle line
			ctx.strokeStyle = '#1a3a1a';
			ctx.lineWidth = 1;
			ctx.beginPath();
			ctx.moveTo(0, h / 2);
			ctx.lineTo(w, h / 2);
			ctx.stroke();
			return;
		}

		let analyser: ReturnType<typeof getAnalyser>;
		try {
			analyser = getAnalyser();
		} catch {
			return;
		}

		const data = analyser.getValue() as Float32Array;
		const sliceWidth = w / data.length;

		ctx.strokeStyle = '#00ff44';
		ctx.lineWidth = 1.5;
		ctx.shadowColor = '#00ff44';
		ctx.shadowBlur = 4;
		ctx.beginPath();

		for (let i = 0; i < data.length; i++) {
			const x = i * sliceWidth;
			const y = (1 - (data[i] + 1) / 2) * h;
			if (i === 0) ctx.moveTo(x, y);
			else ctx.lineTo(x, y);
		}
		ctx.stroke();
		ctx.shadowBlur = 0;
	}

	function drawFFT() {
		if (!fftCanvas) return;
		const ctx = fftCanvas.getContext('2d');
		if (!ctx) return;

		const w = fftCanvas.width;
		const h = fftCanvas.height;

		ctx.fillStyle = '#080808';
		ctx.fillRect(0, 0, w, h);

		if (!isInitialized()) return;

		let fft: ReturnType<typeof getFFTAnalyser>;
		try {
			fft = getFFTAnalyser();
		} catch {
			return;
		}

		const data = fft.getValue() as Float32Array;
		const barWidth = w / data.length;

		for (let i = 0; i < data.length; i++) {
			const db = data[i] as number;
			const norm = Math.max(0, (db + 100) / 100);
			const barH = norm * h;

			const gradient = ctx.createLinearGradient(0, h - barH, 0, h);
			gradient.addColorStop(0, '#ff6600');
			gradient.addColorStop(0.5, '#cc3300');
			gradient.addColorStop(1, '#330000');

			ctx.fillStyle = gradient;
			ctx.fillRect(i * barWidth, h - barH, barWidth - 1, barH);
		}
	}
</script>

<div class="visualizer">
	<canvas bind:this={waveCanvas} width="800" height="80" class="viz-canvas"></canvas>
	<canvas bind:this={fftCanvas} width="800" height="60" class="viz-canvas"></canvas>
</div>

<style>
	.visualizer {
		display: flex;
		flex-direction: column;
		gap: 2px;
		background: #080808;
		border: 1px solid #1a1a1a;
		border-radius: 4px;
		overflow: hidden;
	}

	.viz-canvas {
		width: 100%;
		height: auto;
		display: block;
	}
</style>
