export type Point = {
	x: number;
	y: number;
	vx: number;
	vy: number;
	size: number;
};

export type GradientOptions = {
	canvas: HTMLCanvasElement | string;
	width?: number;
	height?: number;
	threshold?: number;
	colors?: {
		r: number;
		g: number;
		b: number;
	};
	cycle?: number;
	points?: Point[];
};

export type ColorCycleOptions = {
	color: Color;
	cycle: number;
};

export type Color = {
	r: number;
	g: number;
	b: number;
};
