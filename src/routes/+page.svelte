<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import Transport from '$lib/components/Transport.svelte';
	import Synth303Panel from '$lib/components/Synth303Panel.svelte';
	import DrumPanel from '$lib/components/DrumPanel.svelte';
	import EffectsPanel from '$lib/components/EffectsPanel.svelte';
	import Visualizer from '$lib/components/Visualizer.svelte';
	import PatternSelector from '$lib/components/PatternSelector.svelte';

	import { initAudio } from '$lib/audio/engine.js';
	import { Synth303 } from '$lib/audio/synth303.js';
	import { Drums808 } from '$lib/audio/drums808.js';
	import { EffectsChain } from '$lib/audio/effects.js';
	import { Sequencer } from '$lib/audio/sequencer.js';

	import { steps303, drumPattern, currentStep, bpm, swing, isPlaying } from '$lib/stores/sequencerStore.js';
	import { synthParams, effectsParams } from '$lib/stores/synthStore.js';
	import { drumVolumes } from '$lib/stores/drumStore.js';
	import type { DrumInstrument } from '$lib/audio/drums808.js';
	import type { EffectsState } from '$lib/stores/synthStore.js';
	import type { Synth303Params } from '$lib/audio/synth303.js';

	let audioReady = $state(false);
	let synth: Synth303 | null = null;
	let drums: Drums808 | null = null;
	let effects: EffectsChain | null = null;
	let sequencer: Sequencer | null = null;

	async function ensureAudio() {
		if (audioReady) return;
		await initAudio();

		synth = new Synth303($synthParams);
		drums = new Drums808();
		effects = new EffectsChain($effectsParams);

		sequencer = new Sequencer({
			onStep: (step) => {
				currentStep.set(step);
			}
		});

		sequencer.setSynth(synth);
		sequencer.setDrums(drums);
		sequencer.setSteps303($steps303);
		sequencer.setDrumPattern($drumPattern);
		sequencer.setBPM($bpm);
		sequencer.setSwing($swing);

		// Apply initial drum volumes
		const vols = $drumVolumes;
		for (const [inst, vol] of Object.entries(vols)) {
			drums.setVolume(inst as DrumInstrument, vol);
		}

		audioReady = true;
	}

	async function handlePlay() {
		await ensureAudio();
		if (!sequencer) return;
		sequencer.setSteps303($steps303);
		sequencer.setDrumPattern($drumPattern);
		sequencer.play();
	}

	function handleStop() {
		sequencer?.stop();
		currentStep.set(-1);
	}

	// Sync BPM
	$effect(() => {
		sequencer?.setBPM($bpm);
	});

	// Sync swing
	$effect(() => {
		sequencer?.setSwing($swing);
	});

	// Sync 303 steps live
	$effect(() => {
		sequencer?.setSteps303($steps303);
	});

	// Sync drum pattern live
	$effect(() => {
		sequencer?.setDrumPattern($drumPattern);
	});

	function handleSynthParamChange(params: Synth303Params) {
		synth?.updateParams(params);
	}

	function handleEffectsParamChange(params: EffectsState) {
		effects?.updateParams(params);
	}

	function handleDrumVolumeChange(inst: DrumInstrument, vol: number) {
		drums?.setVolume(inst, vol);
	}

	onDestroy(() => {
		sequencer?.dispose();
		synth?.dispose();
		drums?.dispose();
		effects?.dispose();
	});
</script>

<svelte:head>
	<title>WEB-303 Acid Step Sequencer</title>
	<meta name="description" content="Browser-based TB-303 acid bass synthesizer and TR-808 drum machine" />
	<link rel="manifest" href="/manifest.json" />
</svelte:head>

<!-- svelte-ignore a11y_click_events_have_key_events -->
<!-- svelte-ignore a11y_no_static_element_interactions -->
<div class="app" onclick={ensureAudio}>
	<!-- Header -->
	<header class="app-header">
		<div class="logo">
			<span class="logo-main">WEB-303</span>
			<span class="logo-sub">ACID STEP SEQUENCER</span>
		</div>
		<div class="header-right">
			{#if !audioReady}
				<span class="audio-hint">▶ Click anywhere to enable audio</span>
			{:else}
				<span class="audio-active">◉ AUDIO ACTIVE</span>
			{/if}
		</div>
	</header>

	<!-- Visualizer -->
	<section class="viz-section">
		<Visualizer />
	</section>

	<!-- Transport -->
	<section class="transport-section">
		<Transport onPlay={handlePlay} onStop={handleStop} />
	</section>

	<!-- Main panels -->
	<section class="panels-section">
		<div class="panel-303-wrapper">
			<Synth303Panel
				onParamChange={handleSynthParamChange}
			/>
		</div>
		<div class="panel-fx-wrapper">
			<EffectsPanel
				onParamChange={handleEffectsParamChange}
			/>
		</div>
	</section>

	<!-- Drum machine -->
	<section class="drum-section">
		<DrumPanel
			onVolumeChange={handleDrumVolumeChange}
		/>
	</section>

	<!-- Pattern selector footer -->
	<footer class="footer">
		<PatternSelector />
	</footer>
</div>

<style>
	.app {
		min-height: 100vh;
		background: #0a0a0a;
		display: flex;
		flex-direction: column;
		gap: 12px;
		padding: 12px;
		max-width: 1400px;
		margin: 0 auto;
	}

	.app-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 8px 0;
		border-bottom: 1px solid #1a1a1a;
	}

	.logo {
		display: flex;
		flex-direction: column;
	}

	.logo-main {
		font-family: 'Orbitron', monospace;
		font-size: 28px;
		font-weight: 700;
		color: #ff6600;
		line-height: 1;
		text-shadow: 0 0 20px rgba(255, 102, 0, 0.5);
	}

	.logo-sub {
		font-family: 'Share Tech Mono', monospace;
		font-size: 9px;
		color: #444;
		letter-spacing: 0.2em;
	}

	.audio-hint {
		font-family: 'Share Tech Mono', monospace;
		font-size: 11px;
		color: #555;
		animation: pulse 2s infinite;
	}

	.audio-active {
		font-family: 'Share Tech Mono', monospace;
		font-size: 11px;
		color: #00aa44;
	}

	@keyframes pulse {
		0%, 100% { opacity: 1; }
		50% { opacity: 0.4; }
	}

	.viz-section {
		width: 100%;
	}

	.transport-section {
		width: 100%;
	}

	.panels-section {
		display: flex;
		gap: 12px;
		align-items: flex-start;
	}

	.panel-303-wrapper {
		flex: 1;
		min-width: 0;
	}

	.panel-fx-wrapper {
		flex-shrink: 0;
	}

	.drum-section {
		width: 100%;
	}

	.footer {
		padding: 8px 0;
		border-top: 1px solid #1a1a1a;
	}
</style>
