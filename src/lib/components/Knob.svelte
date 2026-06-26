<script lang="ts">
	interface Props {
		value: number;
		min?: number;
		max?: number;
		label: string;
		unit?: string;
		defaultValue?: number;
		onChange?: (v: number) => void;
	}

	let {
		value = $bindable(),
		min = 0,
		max = 1,
		label,
		unit = '',
		defaultValue,
		onChange
	}: Props = $props();

	const KNOB_RANGE = 280; // degrees total travel (-140 to +140)

	let defaultVal = $derived(defaultValue ?? (min + max) / 2);

	function valToAngle(v: number): number {
		const norm = (v - min) / (max - min);
		return -140 + norm * KNOB_RANGE;
	}

	function displayValue(v: number): string {
		if (max <= 1 && min >= 0) return (v * 100).toFixed(0);
		return v.toFixed(1);
	}

	let dragging = $state(false);
	let startY = 0;
	let startVal = 0;
	let knobEl: HTMLDivElement;

	function clamp(v: number): number {
		return Math.max(min, Math.min(max, v));
	}

	function onMouseDown(e: MouseEvent) {
		e.preventDefault();
		dragging = true;
		startY = e.clientY;
		startVal = value;
		window.addEventListener('mousemove', onMouseMove);
		window.addEventListener('mouseup', onMouseUp);
	}

	function onMouseMove(e: MouseEvent) {
		if (!dragging) return;
		const delta = (startY - e.clientY) / 150;
		const range = max - min;
		const newVal = clamp(startVal + delta * range);
		value = newVal;
		onChange?.(newVal);
	}

	function onMouseUp() {
		dragging = false;
		window.removeEventListener('mousemove', onMouseMove);
		window.removeEventListener('mouseup', onMouseUp);
	}

	function onTouchStart(e: TouchEvent) {
		e.preventDefault();
		dragging = true;
		startY = e.touches[0].clientY;
		startVal = value;
	}

	function onTouchMove(e: TouchEvent) {
		if (!dragging) return;
		e.preventDefault();
		const delta = (startY - e.touches[0].clientY) / 150;
		const range = max - min;
		const newVal = clamp(startVal + delta * range);
		value = newVal;
		onChange?.(newVal);
	}

	function onTouchEnd() {
		dragging = false;
	}

	function onDblClick() {
		value = defaultVal;
		onChange?.(defaultVal);
	}

	let angle = $derived(valToAngle(value));
</script>

<div class="knob-wrapper" bind:this={knobEl}>
	<div
		class="knob"
		class:dragging
		role="slider"
		aria-label={label}
		aria-valuenow={value}
		aria-valuemin={min}
		aria-valuemax={max}
		tabindex="0"
		onmousedown={onMouseDown}
		ontouchstart={onTouchStart}
		ontouchmove={onTouchMove}
		ontouchend={onTouchEnd}
		ondblclick={onDblClick}
	>
		<div class="knob-body">
			<div class="knob-indicator" style="transform: rotate({angle}deg)"></div>
		</div>
	</div>
	<div class="knob-label">{label}</div>
	<div class="knob-value">{displayValue(value)}{unit}</div>
</div>

<style>
	.knob-wrapper {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 4px;
		user-select: none;
	}

	.knob {
		width: 48px;
		height: 48px;
		cursor: ns-resize;
		position: relative;
	}

	.knob:focus {
		outline: none;
	}

	.knob-body {
		width: 48px;
		height: 48px;
		border-radius: 50%;
		background: radial-gradient(circle at 35% 35%, #3a3a3a, #111);
		border: 2px solid #444;
		box-shadow:
			0 2px 8px rgba(0, 0, 0, 0.8),
			inset 0 1px 2px rgba(255, 255, 255, 0.08);
		position: relative;
		display: flex;
		align-items: center;
		justify-content: center;
		transition: border-color 0.1s;
	}

	.dragging .knob-body,
	.knob:hover .knob-body {
		border-color: #ff6600;
	}

	.knob-indicator {
		position: absolute;
		width: 3px;
		height: 16px;
		background: #ff6600;
		border-radius: 2px;
		bottom: 50%;
		left: calc(50% - 1.5px);
		transform-origin: bottom center;
	}

	.knob-label {
		font-size: 9px;
		color: #888;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		font-family: 'Share Tech Mono', monospace;
	}

	.knob-value {
		font-size: 10px;
		color: #ff6600;
		font-family: 'Share Tech Mono', monospace;
	}
</style>
