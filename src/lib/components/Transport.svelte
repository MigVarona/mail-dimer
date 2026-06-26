<script lang="ts">
	import { isPlaying, bpm, swing } from '$lib/stores/sequencerStore.js';

	interface Props {
		onPlay: () => void;
		onStop: () => void;
	}

	let { onPlay, onStop }: Props = $props();

	function handlePlay() {
		if ($isPlaying) {
			onStop();
			isPlaying.set(false);
		} else {
			onPlay();
			isPlaying.set(true);
		}
	}

	function handleStop() {
		onStop();
		isPlaying.set(false);
	}
</script>

<div class="transport">
	<div class="transport-buttons">
		<button class="btn-transport play" class:active={$isPlaying} onclick={handlePlay}>
			{#if $isPlaying}
				<span class="icon">⏸</span> PAUSE
			{:else}
				<span class="icon">▶</span> PLAY
			{/if}
		</button>
		<button class="btn-transport stop" onclick={handleStop}>
			<span class="icon">⏹</span> STOP
		</button>
	</div>

	<div class="transport-params">
		<div class="param-group">
			<label class="param-label" for="bpm-input">BPM</label>
			<input
				id="bpm-input"
				type="range"
				min="60"
				max="200"
				step="1"
				value={$bpm}
				oninput={(e) => bpm.set(parseInt((e.target as HTMLInputElement).value))}
				class="param-slider"
			/>
			<span class="param-value">{$bpm}</span>
		</div>

		<div class="param-group">
			<label class="param-label" for="swing-input">SWING</label>
			<input
				id="swing-input"
				type="range"
				min="0"
				max="1"
				step="0.01"
				value={$swing}
				oninput={(e) => swing.set(parseFloat((e.target as HTMLInputElement).value))}
				class="param-slider"
			/>
			<span class="param-value">{Math.round($swing * 100)}%</span>
		</div>
	</div>
</div>

<style>
	.transport {
		display: flex;
		align-items: center;
		gap: 24px;
		padding: 12px 16px;
		background: #111;
		border: 1px solid #333;
		border-radius: 8px;
	}

	.transport-buttons {
		display: flex;
		gap: 8px;
	}

	.btn-transport {
		display: flex;
		align-items: center;
		gap: 6px;
		padding: 8px 20px;
		border-radius: 4px;
		border: 2px solid #333;
		background: #1a1a1a;
		color: #888;
		font-family: 'Share Tech Mono', monospace;
		font-size: 12px;
		letter-spacing: 0.1em;
		cursor: pointer;
		transition: all 0.15s;
	}

	.btn-transport:hover {
		border-color: #555;
		color: #ccc;
	}

	.btn-transport.play.active {
		background: #331a00;
		border-color: #ff6600;
		color: #ff6600;
		box-shadow: 0 0 12px rgba(255, 102, 0, 0.3);
	}

	.btn-transport.play:not(.active):hover {
		border-color: #ff6600;
		color: #ff6600;
	}

	.btn-transport.stop:hover {
		border-color: #cc4400;
		color: #cc4400;
	}

	.icon {
		font-size: 14px;
	}

	.transport-params {
		display: flex;
		gap: 24px;
	}

	.param-group {
		display: flex;
		align-items: center;
		gap: 8px;
	}

	.param-label {
		font-family: 'Share Tech Mono', monospace;
		font-size: 10px;
		color: #666;
		letter-spacing: 0.1em;
		min-width: 40px;
	}

	.param-slider {
		-webkit-appearance: none;
		appearance: none;
		width: 120px;
		height: 4px;
		border-radius: 2px;
		background: #2a2a2a;
		outline: none;
		cursor: pointer;
	}

	.param-slider::-webkit-slider-thumb {
		-webkit-appearance: none;
		width: 14px;
		height: 14px;
		border-radius: 50%;
		background: #ff6600;
		cursor: pointer;
		box-shadow: 0 0 6px rgba(255, 102, 0, 0.5);
	}

	.param-value {
		font-family: 'Share Tech Mono', monospace;
		font-size: 12px;
		color: #ff6600;
		min-width: 36px;
	}
</style>
