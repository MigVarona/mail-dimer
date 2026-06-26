<script lang="ts">
	import Knob from './Knob.svelte';
	import StepGrid from './StepGrid.svelte';
	import { synthParams } from '$lib/stores/synthStore.js';
	import { steps303, currentStep } from '$lib/stores/sequencerStore.js';
	import type { Waveform303 } from '$lib/audio/synth303.js';

	interface Props {
		onParamChange?: (params: typeof $synthParams) => void;
		onStepsChange?: (steps: typeof $steps303) => void;
	}

	let { onParamChange, onStepsChange }: Props = $props();

	function updateParam(key: keyof typeof $synthParams, value: number | string) {
		synthParams.update(p => {
			const updated = { ...p, [key]: value };
			onParamChange?.(updated);
			return updated;
		});
	}

	function toggleStep(idx: number) {
		steps303.update(steps => {
			const updated = [...steps];
			updated[idx] = { ...updated[idx], on: !updated[idx].on };
			onStepsChange?.(updated);
			return updated;
		});
	}

	function toggleAccent(idx: number) {
		steps303.update(steps => {
			const updated = [...steps];
			updated[idx] = { ...updated[idx], accent: !updated[idx].accent };
			onStepsChange?.(updated);
			return updated;
		});
	}

	function toggleSlide(idx: number) {
		steps303.update(steps => {
			const updated = [...steps];
			updated[idx] = { ...updated[idx], slide: !updated[idx].slide };
			onStepsChange?.(updated);
			return updated;
		});
	}

	function changeNote(idx: number, note: string) {
		steps303.update(steps => {
			const updated = [...steps];
			updated[idx] = { ...updated[idx], note };
			onStepsChange?.(updated);
			return updated;
		});
	}

	function changeOctave(idx: number, octave: number) {
		steps303.update(steps => {
			const updated = [...steps];
			updated[idx] = { ...updated[idx], octave };
			onStepsChange?.(updated);
			return updated;
		});
	}

	const waveforms: Waveform303[] = ['sawtooth', 'square', 'triangle'];
</script>

<div class="panel-303">
	<div class="panel-header">
		<span class="panel-title">TB-303</span>
		<span class="panel-subtitle">ACID BASS SYNTHESIZER</span>
	</div>

	<div class="panel-body">
		<div class="knobs-row">
			<Knob
				value={$synthParams.cutoff}
				label="CUTOFF"
				onChange={(v) => updateParam('cutoff', v)}
			/>
			<Knob
				value={$synthParams.resonance}
				label="RESO"
				onChange={(v) => updateParam('resonance', v)}
			/>
			<Knob
				value={$synthParams.envMod}
				label="ENV MOD"
				onChange={(v) => updateParam('envMod', v)}
			/>
			<Knob
				value={$synthParams.decay}
				label="DECAY"
				onChange={(v) => updateParam('decay', v)}
			/>
			<Knob
				value={$synthParams.accent}
				label="ACCENT"
				onChange={(v) => updateParam('accent', v)}
			/>
			<Knob
				value={$synthParams.distortion}
				label="DIST"
				onChange={(v) => updateParam('distortion', v)}
			/>
			<Knob
				value={$synthParams.volume}
				label="VOL"
				onChange={(v) => updateParam('volume', v)}
			/>

			<div class="waveform-selector">
				<div class="waveform-label">WAVE</div>
				{#each waveforms as wf}
					<button
						class="wf-btn"
						class:active={$synthParams.waveform === wf}
						onclick={() => updateParam('waveform', wf)}
					>
						{wf === 'sawtooth' ? 'SAW' : wf === 'square' ? 'SQR' : 'TRI'}
					</button>
				{/each}
			</div>
		</div>

		<div class="step-grid-wrapper">
			<StepGrid
				steps={$steps303}
				currentStep={$currentStep}
				onToggle={toggleStep}
				onAccent={toggleAccent}
				onSlide={toggleSlide}
				onNoteChange={changeNote}
				onOctaveChange={changeOctave}
				show303Controls={true}
			/>
		</div>
	</div>
</div>

<style>
	.panel-303 {
		background: #141414;
		border: 1px solid #333;
		border-radius: 8px;
		padding: 12px;
		min-width: 0;
	}

	.panel-header {
		display: flex;
		align-items: baseline;
		gap: 8px;
		margin-bottom: 12px;
		border-bottom: 1px solid #222;
		padding-bottom: 8px;
	}

	.panel-title {
		font-family: 'Orbitron', monospace;
		font-size: 18px;
		font-weight: 700;
		color: #ff6600;
	}

	.panel-subtitle {
		font-family: 'Share Tech Mono', monospace;
		font-size: 9px;
		color: #555;
		letter-spacing: 0.15em;
	}

	.panel-body {
		display: flex;
		flex-direction: column;
		gap: 16px;
	}

	.knobs-row {
		display: flex;
		gap: 12px;
		align-items: flex-start;
		flex-wrap: wrap;
	}

	.waveform-selector {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 3px;
	}

	.waveform-label {
		font-size: 9px;
		color: #888;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		font-family: 'Share Tech Mono', monospace;
	}

	.wf-btn {
		padding: 3px 6px;
		border-radius: 3px;
		border: 1px solid #333;
		background: #111;
		color: #555;
		font-size: 8px;
		cursor: pointer;
		font-family: 'Share Tech Mono', monospace;
		letter-spacing: 0.05em;
		width: 36px;
		transition: all 0.1s;
	}

	.wf-btn.active {
		background: #ff6600;
		color: #000;
		border-color: #ff8800;
	}

	.step-grid-wrapper {
		overflow-x: auto;
	}
</style>
