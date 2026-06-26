<script lang="ts">
	import Knob from './Knob.svelte';
	import { drumPattern, currentStep, DRUM_INSTRUMENTS } from '$lib/stores/sequencerStore.js';
	import { drumVolumes } from '$lib/stores/drumStore.js';
	import type { DrumInstrument } from '$lib/audio/drums808.js';
	import type { Step303 } from '$lib/audio/sequencer.js';

	interface Props {
		onPatternChange?: (pattern: typeof $drumPattern) => void;
		onVolumeChange?: (inst: DrumInstrument, vol: number) => void;
	}

	let { onPatternChange, onVolumeChange }: Props = $props();

	const LABELS: Record<DrumInstrument, string> = {
		kick: 'KICK',
		snare: 'SNARE',
		clap: 'CLAP',
		closedHH: 'CL HH',
		openHH: 'OP HH',
		tom: 'TOM'
	};

	function toggleDrumStep(inst: DrumInstrument, idx: number) {
		drumPattern.update(p => {
			const updated = { ...p };
			updated[inst] = [...updated[inst]];
			updated[inst][idx] = { on: !updated[inst][idx].on };
			onPatternChange?.(updated);
			return updated;
		});
	}

	function updateVolume(inst: DrumInstrument, v: number) {
		drumVolumes.update(vols => {
			const updated = { ...vols, [inst]: v };
			onVolumeChange?.(inst, v);
			return updated;
		});
	}

	// Convert drum steps to Step303 format for StepGrid
	function drumStepsAs303(inst: DrumInstrument): Step303[] {
		return $drumPattern[inst].map(s => ({
			note: 'A',
			octave: 2,
			on: s.on,
			accent: false,
			slide: false
		}));
	}
</script>

<div class="drum-panel">
	<div class="panel-header">
		<span class="panel-title">TR-808</span>
		<span class="panel-subtitle">DRUM MACHINE</span>
	</div>

	<div class="drum-rows">
		{#each DRUM_INSTRUMENTS as inst}
			<div class="drum-row">
				<div class="drum-label">{LABELS[inst]}</div>
				<div class="drum-vol">
					<Knob
						value={$drumVolumes[inst]}
						label=""
						onChange={(v) => updateVolume(inst, v)}
					/>
				</div>
				<div class="drum-steps">
					{#each $drumPattern[inst] as step, i}
						<button
							class="drum-step"
							class:on={step.on}
							class:current={i === $currentStep}
							class:beat={i % 4 === 0}
							onclick={() => toggleDrumStep(inst, i)}
							aria-label="{inst} step {i + 1}"
						></button>
					{/each}
				</div>
			</div>
		{/each}
	</div>
</div>

<style>
	.drum-panel {
		background: #141414;
		border: 1px solid #333;
		border-radius: 8px;
		padding: 12px;
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

	.drum-rows {
		display: flex;
		flex-direction: column;
		gap: 6px;
	}

	.drum-row {
		display: flex;
		align-items: center;
		gap: 8px;
	}

	.drum-label {
		font-family: 'Share Tech Mono', monospace;
		font-size: 10px;
		color: #888;
		letter-spacing: 0.08em;
		width: 48px;
		flex-shrink: 0;
	}

	.drum-vol {
		flex-shrink: 0;
	}

	.drum-steps {
		display: flex;
		gap: 3px;
		flex-wrap: nowrap;
	}

	.drum-step {
		width: 28px;
		height: 28px;
		border-radius: 3px;
		border: 1px solid #2a2a2a;
		background: #141414;
		cursor: pointer;
		transition: all 0.08s;
		flex-shrink: 0;
	}

	.drum-step.beat {
		border-color: #333;
	}

	.drum-step.on {
		background: #ff6600;
		border-color: #ff8800;
		box-shadow: 0 0 6px rgba(255, 102, 0, 0.4);
	}

	.drum-step.current {
		border-color: #ffaa00;
		box-shadow: 0 0 10px rgba(255, 170, 0, 0.6);
	}

	.drum-step.on.current {
		background: #ffcc00;
		border-color: #ffdd00;
		box-shadow: 0 0 14px rgba(255, 200, 0, 0.8);
	}
</style>
