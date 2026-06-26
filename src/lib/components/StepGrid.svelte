<script lang="ts">
	import { NOTES } from '$lib/utils/notes.js';
	import type { Step303 } from '$lib/audio/sequencer.js';

	interface Props {
		steps: Step303[];
		currentStep?: number;
		onToggle: (idx: number) => void;
		onAccent?: (idx: number) => void;
		onSlide?: (idx: number) => void;
		onNoteChange?: (idx: number, note: string) => void;
		onOctaveChange?: (idx: number, octave: number) => void;
		show303Controls?: boolean;
	}

	let {
		steps,
		currentStep = -1,
		onToggle,
		onAccent,
		onSlide,
		onNoteChange,
		onOctaveChange,
		show303Controls = false
	}: Props = $props();
</script>

<div class="step-grid">
	{#each steps as step, i}
		<div class="step" class:active={step.on} class:current={i === currentStep} class:show303={show303Controls}>
			{#if show303Controls}
				<div class="step-note-row">
					<button
						class="step-btn"
						class:on={step.on}
						onclick={() => onToggle(i)}
						aria-label="step {i + 1}"
					>
						{i + 1}
					</button>
					{#if step.on}
						<select
							class="note-select"
							value={step.note}
							onchange={(e) => onNoteChange?.(i, (e.target as HTMLSelectElement).value)}
						>
							{#each NOTES as n}
								<option value={n}>{n}</option>
							{/each}
						</select>
						<select
							class="octave-select"
							value={step.octave}
							onchange={(e) => onOctaveChange?.(i, parseInt((e.target as HTMLSelectElement).value))}
						>
							{#each [1, 2, 3] as oct}
								<option value={oct}>{oct}</option>
							{/each}
						</select>
					{/if}
				</div>
				{#if step.on}
					<div class="step-modifiers">
						<button
							class="mod-btn accent"
							class:active={step.accent}
							onclick={() => onAccent?.(i)}
							title="Accent"
						>A</button>
						<button
							class="mod-btn slide"
							class:active={step.slide}
							onclick={() => onSlide?.(i)}
							title="Slide"
						>S</button>
					</div>
				{/if}
			{:else}
				<button
					class="step-drum-btn"
					class:on={step.on}
					class:current={i === currentStep}
					onclick={() => onToggle(i)}
					aria-label="step {i + 1}"
				></button>
			{/if}
		</div>
	{/each}
</div>

<style>
	.step-grid {
		display: flex;
		gap: 3px;
		flex-wrap: wrap;
	}

	.step {
		position: relative;
	}

	.step.show303 {
		display: flex;
		flex-direction: column;
		gap: 2px;
		width: 52px;
	}

	.step-note-row {
		display: flex;
		gap: 2px;
		align-items: center;
	}

	.step-btn {
		width: 30px;
		height: 30px;
		border-radius: 4px;
		border: 1px solid #333;
		background: #1a1a1a;
		color: #666;
		font-size: 9px;
		cursor: pointer;
		font-family: 'Share Tech Mono', monospace;
		transition: all 0.1s;
	}

	.step-btn.on {
		background: #ff6600;
		color: #000;
		border-color: #ff8800;
		box-shadow: 0 0 8px rgba(255, 102, 0, 0.5);
	}

	.note-select, .octave-select {
		background: #111;
		color: #ff6600;
		border: 1px solid #333;
		border-radius: 2px;
		font-size: 8px;
		padding: 0;
		cursor: pointer;
		height: 16px;
		font-family: 'Share Tech Mono', monospace;
	}

	.note-select {
		width: 32px;
	}

	.octave-select {
		width: 20px;
	}

	.step-modifiers {
		display: flex;
		gap: 2px;
	}

	.mod-btn {
		flex: 1;
		height: 14px;
		border-radius: 2px;
		border: 1px solid #333;
		background: #111;
		color: #444;
		font-size: 8px;
		cursor: pointer;
		font-family: 'Share Tech Mono', monospace;
		transition: all 0.1s;
	}

	.mod-btn.active.accent {
		background: #cc4400;
		color: #fff;
		border-color: #ff6600;
	}

	.mod-btn.active.slide {
		background: #004499;
		color: #fff;
		border-color: #0066ff;
	}

	.step-drum-btn {
		width: 30px;
		height: 30px;
		border-radius: 4px;
		border: 1px solid #2a2a2a;
		background: #141414;
		cursor: pointer;
		transition: all 0.1s;
		position: relative;
	}

	.step-drum-btn.on {
		background: #ff6600;
		border-color: #ff8800;
		box-shadow: 0 0 8px rgba(255, 102, 0, 0.5);
	}

	.step-drum-btn.current {
		border-color: #ffaa00;
		box-shadow: 0 0 12px rgba(255, 170, 0, 0.7);
	}

	.step-drum-btn.on.current {
		background: #ffaa00;
		box-shadow: 0 0 16px rgba(255, 170, 0, 0.9);
	}
</style>
