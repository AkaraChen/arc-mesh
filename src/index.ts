import {type ColorCycleOptions, type Color, type GradientOptions, type Point} from './types/interface';

export class ColorCycle {
	base: Color;
	cycle: number;
	color: Color;

	constructor(opts: ColorCycleOptions) {
		this.base = opts.color ?? {
			r: 255,
			g: 0,
			b: 0,
		};
		this.color = this.base;
		this.cycle = 0;
	}

	colorCycle() {
		this.cycle += 0.1;
		if (this.cycle > 255) {
			this.cycle = 0;
		}

		this.color.r = ~~(Math.sin(0.3 * this.cycle + 0) * 127 + 128);
		this.color.g = ~~(Math.sin(0.3 * this.cycle + 2) * 127 + 128);
		this.color.b = ~~(Math.sin(0.3 * this.cycle + 4) * 127 + 128);
	}
}

export class Mesh {
	private canvas!: HTMLCanvasElement;
	private ctx!: CanvasRenderingContext2D;
	private tempCanvas!: HTMLCanvasElement;
	private tempCtx!: CanvasRenderingContext2D;
	private width!: number;
	private height!: number;
	private threshold!: number;
	private cr!: ColorCycle;

	private points!: Point[];
	private timer!: number | undefined;

	constructor(opts: GradientOptions) {
		this.init(opts);
	}

	start() {
		if (!this.timer) {
			this.timer = window.setInterval(this.update.bind(this), 1000 / 30);
		}
	}

	stop() {
		if (this.timer) {
			window.clearInterval(this.timer);
			this.timer = undefined;
		}
	}

	toggle() {
		if (this.timer) {
			this.stop();
		} else {
			this.start();
		}
	}

	private init(opts: GradientOptions) {
		this.canvas = typeof opts.canvas === 'string'
			? (document.getElementById(opts.canvas) as HTMLCanvasElement)
			: opts.canvas;
		this.ctx = this.canvas.getContext('2d', {
			willReadFrequently: true,
		})!;
		this.tempCanvas = document.createElement('canvas');
		this.tempCtx = this.tempCanvas.getContext('2d', {
			willReadFrequently: true,
		})!;
		this.width = opts.width ?? 512;
		this.height = opts.height ?? 512;
		this.threshold = opts.threshold ?? 210;
		this.cr = new ColorCycle({
			color: opts.colors ?? {
				r: 255,
				g: 0,
				b: 0,
			},
			cycle: 0,
		});
		this.points = opts.points
			?? new Array(50).fill(0).map(this.getPoint.bind(this));
		this.canvas.width = this.width;
		this.canvas.height = this.height;
		this.tempCanvas.width = this.width;
		this.tempCanvas.height = this.height;
	}

	private getPoint() {
		return {
			x: Math.random() * this.width,
			y: Math.random() * this.height,
			vx: (Math.random() * 8) - 4,
			vy: (Math.random() * 8) - 4,
			size: Math.floor(Math.random() * 120) + 120,
		};
	}

	private update() {
		let len = this.points.length;
		this.tempCtx.clearRect(0, 0, this.width, this.height);
		while (len--) {
			const point = this.points[len];
			point.x += point.vx;
			point.y += point.vy;

			if (point.x > this.width + point.size) {
				point.x = 0 - point.size;
			}

			if (point.x < 0 - point.size) {
				point.x = this.width + point.size;
			}

			if (point.y > this.height + point.size) {
				point.y = 0 - point.size;
			}

			if (point.y < 0 - point.size) {
				point.y = this.height + point.size;
			}

			this.tempCtx.beginPath();
			const grad = this.tempCtx.createRadialGradient(
				point.x,
				point.y,
				1,
				point.x,
				point.y,
				point.size,
			);
			grad.addColorStop(0, `rgba(${this.cr.color.r},${this.cr.color.g},${this.cr.color.b},1)`);
			grad.addColorStop(1, `rgba(${this.cr.color.r},${this.cr.color.g},${this.cr.color.b},0)`);
			this.tempCtx.fillStyle = grad;
			this.tempCtx.arc(point.x, point.y, point.size, 0, Math.PI * 2);
			this.tempCtx.fill();
		}

		this.metabalize();
		this.cr.colorCycle();
	}

	private metabalize() {
		const imageData = this.tempCtx.getImageData(0, 0, this.width, this.height);
		const pix = imageData.data;

		for (let i = 0, n = pix.length; i < n; i += 4) {
			// Checks threshold
			if (pix[i + 3] < this.threshold) {
				pix[i + 3] /= 6;
				if (pix[i + 3] > this.threshold / 4) {
					pix[i + 3] = 0;
				}
			}
		}

		this.ctx.putImageData(imageData, 0, 0);
	}
}
