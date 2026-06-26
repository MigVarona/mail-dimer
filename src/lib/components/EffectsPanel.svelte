<script lang="ts">
	import Knob from './Knob.svelte';
	import { effectsParams } from '$lib/stores/synthStore.js';
	import type { EffectsState } from '$lib/stores/synthStore.js';

	interface Props {
		onParamChange?: (params: EffectsState) => void;
	}

	let { onParamChange }: Props = $props();

	function updateParam(key: keyof EffectsState, value: number) {
		effectsParams.update(p => {
			const updated = { ...p, [key]: value };
			onParamChange?.(updated);
			return updated;
		});
	}
</script>

<div class="effects-panel">
	<div class="panel-header">
		<span class="panel-title">FX</span>
		<span class="panel-subtitle">EFFECTS</span>
	</div>

	<div class="effects-section">
		<div class="section-title">DELAY</div>
		<div class="knobs-row">
			<Knob
				value={$effectsParams.delayTime}
				label="TIME"
				onChange={(v) => updateParam('delayTime', v)}
			/>
			<Knob
				value={$effectsParams.delayFeedback}
				label="FDBK"
				onChange={(v) => updateParam('delayFeedback', v)}
			/>
			<Knob
				value={$effectsParams.delayMix}
				label="MIX"
				onChange={(v) => updateParam('delayMix', v)}
			/>
		</div>
	</div>

	<div class="effects-section">
		<div class="section-title">REVERB</div>
		<div class="knobs-row">
			<Knob
				value={$effectsParams.reverbSize}
				label="SIZE"
				onChange={(v) => updateParam('reverbSize', v)}
			/>
			<Knob
				value={$effectsParams.reverbMix}
				label="MIX"
				onChange={(v) => updateParam('reverbMix', v)}
			/>
		</div>
	</div>
</div>

<style>
	.effects-panel {
		background: #141414;
		border: 1px solid #333;
		border-radius: 8px;
		padding: 12px;
		min-width: 180px;
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

	.effects-section {
		margin-bottom: 16px;
	}

	.section-title {
		font-family: 'Share Tech Mono', monospace;
		font-size: 9px;
		color: #555;
		letter-spacing: 0.15em;
		margin-bottom: 8px;
	}

	.knobs-row {
		display: flex;
		gap: 12px;
	}
</style>
