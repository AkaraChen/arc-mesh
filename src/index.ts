import {type Color, type GradientOptions, type Point} from './interface';

export class Mesh {
	private readonly canvas: HTMLCanvasElement;
	private readonly ctx: CanvasRenderingContext2D;
	private readonly tempCanvas: HTMLCanvasElement;
	private readonly tempCtx: CanvasRenderingContext2D;
	private readonly width: number;
	private readonly height: number;
	private readonly threshold: number;
	private readonly colors: Color[];
	private readonly size: number;

	private readonly points: Point[];
	private timer?: number;

	constructor(opts: GradientOptions) {
		this.canvas = typeof opts.canvas === 'string'
			? document.querySelector<HTMLCanvasElement>(opts.canvas)!
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
		const colors = opts.colors ?? [
			{r: 235, g: 108, b: 219},
			{r: 235, g: 201, b: 61},
		];
		this.colors = colors;
		this.size = opts.size ?? 120;
		this.points = opts.points
			?? new Array(50).fill(0).map(this.getPoint.bind(this));
		this.canvas.width = this.width;
		this.canvas.height = this.height;
		this.tempCanvas.width = this.width;
		this.tempCanvas.height = this.height;
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

	private getPoint() {
		return {
			x: Math.random() * this.width,
			y: Math.random() * this.height,
			vx: (Math.random() * 8) - 4,
			vy: (Math.random() * 8) - 4,
			size: Math.floor(Math.random() * this.size) + this.size,
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
			const color = this.colors[len % 2 === 0 ? 0 : 1];
			grad.addColorStop(0, `rgba(${color.r},${color.g},${color.b},1)`);
			grad.addColorStop(1, `rgba(${color.r},${color.g},${color.b},0)`);
			this.tempCtx.fillStyle = grad;
			this.tempCtx.arc(point.x, point.y, point.size, 0, Math.PI * 2);
			this.tempCtx.fill();
		}

		this.metabalize();
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
