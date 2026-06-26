<script lang="ts">
	import { steps303, drumPattern, DRUM_INSTRUMENTS } from '$lib/stores/sequencerStore.js';
	import type { Step303, DrumPattern } from '$lib/audio/sequencer.js';
	import { randomNote, randomOctave, SCALE_MINOR, SCALE_BLUES, SCALE_PENTATONIC_MINOR } from '$lib/utils/notes.js';

	interface Props {
		onLoad?: () => void;
	}

	let { onLoad }: Props = $props();

	interface Preset {
		name: string;
		steps303: Step303[];
		drumPattern: DrumPattern;
	}

	function makeEmptyDrumPattern(): DrumPattern {
		const p: Partial<DrumPattern> = {};
		for (const inst of DRUM_INSTRUMENTS) {
			p[inst] = Array.from({ length: 16 }, () => ({ on: false }));
		}
		return p as DrumPattern;
	}

	function on(idx: number[]): { on: boolean }[] {
		return Array.from({ length: 16 }, (_, i) => ({ on: idx.includes(i) }));
	}

	function note(n: string, oct: number, accent = false, slide = false): Step303 {
		return { note: n, octave: oct, on: true, accent, slide };
	}

	function off(): Step303 {
		return { note: 'A', octave: 2, on: false, accent: false, slide: false };
	}

	const PRESETS: Preset[] = [
		{
			name: 'ACID HOUSE',
			steps303: [
				note('A', 2, true), note('A', 2, false, true), note('D', 2), off(),
				note('A', 2, true), off(), note('E', 2, false, true), note('A', 2),
				note('A', 2, true), note('C', 3), note('A', 2, false, true), off(),
				note('G', 2, true), note('A', 2), off(), note('E', 2, true, false)
			],
			drumPattern: {
				kick: on([0, 4, 8, 12]),
				snare: on([4, 12]),
				clap: on([]),
				closedHH: on([2, 6, 10, 14]),
				openHH: on([3, 7, 11, 15]),
				tom: on([])
			}
		},
		{
			name: 'TECHNO',
			steps303: [
				note('A', 1, true), off(), note('A', 2), off(),
				note('A', 1, true), note('G', 2, false, true), off(), off(),
				note('A', 1, true), off(), note('E', 2), note('D', 2, true),
				note('A', 1, true), off(), note('C', 2, false, true), off()
			],
			drumPattern: {
				kick: on([0, 4, 8, 12]),
				snare: on([4, 12]),
				clap: on([4, 12]),
				closedHH: on([0, 2, 4, 6, 8, 10, 12, 14]),
				openHH: on([2, 10]),
				tom: on([14])
			}
		},
		{
			name: 'MINIMAL',
			steps303: [
				note('A', 2), off(), off(), off(),
				note('A', 2, true), off(), note('E', 2, false, true), off(),
				note('A', 2), off(), off(), note('G', 2),
				note('A', 2, true), off(), off(), off()
			],
			drumPattern: {
				kick: on([0, 8]),
				snare: on([4, 12]),
				clap: on([]),
				closedHH: on([4, 12]),
				openHH: on([]),
				tom: on([6])
			}
		},
		{
			name: 'ELECTRO',
			steps303: [
				note('A', 2, true), note('A', 3), note('G', 2, false, true), note('G', 2),
				note('F', 2, true), off(), note('E', 2), note('D', 2, false, true),
				note('A', 2, true), note('C', 3), off(), note('A', 2),
				note('G', 2, true), note('F', 2, false, true), note('E', 2), note('A', 1, true)
			],
			drumPattern: {
				kick: on([0, 3, 8, 11]),
				snare: on([4, 12]),
				clap: on([2, 6, 10, 14]),
				closedHH: on([1, 3, 5, 7, 9, 11, 13, 15]),
				openHH: on([7, 15]),
				tom: on([6, 14])
			}
		},
		{
			name: 'EXPERIMENTAL',
			steps303: [
				note('A', 2, true), note('C', 3, false, true), note('D#', 2), off(),
				note('F#', 2, true), note('A', 2, false, true), off(), note('G', 2),
				off(), note('A', 3, true), note('D', 2, false, true), note('E', 2),
				note('C', 2, true), off(), note('A#', 2, false, true), note('A', 2)
			],
			drumPattern: {
				kick: on([0, 5, 9, 13]),
				snare: on([3, 11]),
				clap: on([7, 15]),
				closedHH: on([1, 4, 6, 8, 12]),
				openHH: on([2, 10]),
				tom: on([4, 8, 14])
			}
		}
	];

	let activePreset = $state(-1);

	function loadPreset(idx: number) {
		activePreset = idx;
		steps303.set(PRESETS[idx].steps303);
		drumPattern.set(PRESETS[idx].drumPattern);
		onLoad?.();
	}

	function randomize() {
		activePreset = -1;
		const newSteps: Step303[] = Array.from({ length: 16 }, () => {
			const on = Math.random() > 0.45;
			if (!on) return { note: 'A', octave: 2, on: false, accent: false, slide: false };
			const scales = [SCALE_MINOR, SCALE_BLUES, SCALE_PENTATONIC_MINOR];
			const scale = scales[Math.floor(Math.random() * scales.length)];
			return {
				note: randomNote(scale),
				octave: randomOctave(1, 3),
				on: true,
				accent: Math.random() > 0.75,
				slide: Math.random() > 0.7
			};
		});

		const newDrum = makeEmptyDrumPattern();
		for (const inst of DRUM_INSTRUMENTS) {
			newDrum[inst] = Array.from({ length: 16 }, (_, i) => {
				let prob = 0.25;
				if (inst === 'kick') prob = i % 4 === 0 ? 0.8 : 0.2;
				if (inst === 'snare') prob = i % 8 === 4 ? 0.9 : 0.1;
				if (inst === 'closedHH') prob = 0.5;
				return { on: Math.random() < prob };
			});
		}

		steps303.set(newSteps);
		drumPattern.set(newDrum);
		onLoad?.();
	}
</script>

<div class="pattern-selector">
	<span class="label">PATTERNS:</span>
	<div class="presets">
		{#each PRESETS as preset, i}
			<button
				class="preset-btn"
				class:active={activePreset === i}
				onclick={() => loadPreset(i)}
			>
				{preset.name}
			</button>
		{/each}
	</div>
	<button class="randomize-btn" onclick={randomize}>
		⚄ RANDOM
	</button>
</div>

<style>
	.pattern-selector {
		display: flex;
		align-items: center;
		gap: 12px;
		flex-wrap: wrap;
	}

	.label {
		font-family: 'Share Tech Mono', monospace;
		font-size: 10px;
		color: #555;
		letter-spacing: 0.1em;
	}

	.presets {
		display: flex;
		gap: 6px;
		flex-wrap: wrap;
	}

	.preset-btn {
		padding: 5px 12px;
		border-radius: 3px;
		border: 1px solid #333;
		background: #111;
		color: #666;
		font-family: 'Share Tech Mono', monospace;
		font-size: 10px;
		letter-spacing: 0.08em;
		cursor: pointer;
		transition: all 0.15s;
	}

	.preset-btn:hover {
		border-color: #555;
		color: #999;
	}

	.preset-btn.active {
		background: #1a0800;
		border-color: #ff6600;
		color: #ff6600;
	}

	.randomize-btn {
		padding: 5px 14px;
		border-radius: 3px;
		border: 1px solid #444;
		background: #0a1a0a;
		color: #4a8;
		font-family: 'Share Tech Mono', monospace;
		font-size: 10px;
		letter-spacing: 0.08em;
		cursor: pointer;
		transition: all 0.15s;
	}

	.randomize-btn:hover {
		border-color: #6fc;
		color: #6fc;
	}
</style>
