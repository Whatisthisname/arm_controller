type Color = [number, number, number];

function linearColorMap(startColor: Color, endColor: Color, startVal: number, endVal: number): (value: number) => Color {

  function lerpColor(a: Color, b: Color, t: number): Color {
    return [
      Math.round((1 - t) * a[0] + t * b[0]),
      Math.round((1 - t) * a[1] + t * b[1]),
      Math.round((1 - t) * a[2] + t * b[2]),
    ];
  }

  return function (value: number): Color {
    value = Math.min(endVal, Math.max(startVal, value)); // clamp between start and end val
    const t = (value - startVal) / (endVal - startVal); // Normalize value to [0, 1]
    return lerpColor(startColor, endColor, t);
  };
}


type PlotOptions = {
  width_res: number;
  height_res: number;
  xMin: number;
  xMax: number;
  yMin: number;
  yMax: number;
  colorMap: (value: number) => Color;
};


class coordinateSystem {
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  xMin: number;
  xMax: number;
  yMin: number;
  yMax: number;

  last_mouse_pos: v2 = new v2(0, 0);
  is_mouse_within_bounds: boolean = false;

  scale: number;

  constructor(canvas: HTMLCanvasElement, xMin: number, xMax: number, yMin: number, yMax: number, resolution: number) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d') as CanvasRenderingContext2D;
    this.xMin = xMin;
    this.xMax = xMax;
    this.yMin = yMin;
    this.yMax = yMax;

    const width = this.canvas.width;
    const height = this.canvas.height;

    this.canvas.width = Math.floor(width * resolution);
    this.canvas.height = Math.floor(height * resolution);

    this.canvas.style.width = width + "px";
    this.canvas.style.height = height + "px";

    this.scale = width / Math.floor(width * resolution);

    this.canvas.addEventListener('mousemove', (e) => {
      this.last_mouse_pos = this.world_to_point(new v2(e.clientX, e.clientY));
    })

    this.canvas.addEventListener('mouseenter', (e) => {
      this.is_mouse_within_bounds = true;
    }
    )

    this.canvas.addEventListener('mouseleave', (e) => {
      this.is_mouse_within_bounds = false;
    }
    )

  }

  point_to_pixel(x: number, y: number): [number, number] {
    const xPixel = (x - this.xMin) / (this.xMax - this.xMin) * this.canvas.width;
    const yPixel = (this.yMax - y) / (this.yMax - this.yMin) * this.canvas.height;
    return [xPixel, yPixel];
  }

  line(p1: v2, p2: v2) {
    const [x1, y1] = this.point_to_pixel(p1.x, p1.y);
    const [x2, y2] = this.point_to_pixel(p2.x, p2.y);
    this.ctx.beginPath();
    this.ctx.moveTo(x1, y1);
    this.ctx.lineTo(x2, y2);
    this.ctx.stroke();
  }

  circle(p: v2, r: number, color: Color) {
    this.ctx.strokeStyle = `rgb(${color[0]}, ${color[1]}, ${color[2]})`;
    const [x, y] = this.point_to_pixel(p.x, p.y);
    this.ctx.beginPath();
    this.ctx.arc(x, y, r, 0, 2 * Math.PI);
    this.ctx.stroke();
  }

  addAxes() {
    this.line(new v2(this.xMin, 0), new v2(this.xMax, 0));
    this.line(new v2(0, this.yMin), new v2(0, this.yMax));
    this.ctx.fillText("0,0", ...this.point_to_pixel(0, 0));
    this.ctx.fillText(`x=${this.xMax.toFixed(2)}`, ...this.point_to_pixel(this.xMax * 0.8, 0));
    this.ctx.fillText(`y=${this.yMax.toFixed(2)}`, ...this.point_to_pixel(0, this.yMax * 0.8));
  }

  world_to_point(mousePos: v2): v2 {
    const xRange = this.xMax - this.xMin;
    const yRange = this.yMax - this.yMin;
    const rect = arm_canvas.getBoundingClientRect();

    const x = (mousePos.x - this.canvas.offsetLeft) / this.canvas.width * xRange / this.scale + this.xMin;
    const y = (this.canvas.offsetTop + rect.height - mousePos.y) / this.canvas.height * yRange / this.scale + this.yMin;
    return new v2(x, y);
  }

  heatmap(func: (x: number, y: number) => number, colorMap: (value: number) => Color, level_set: boolean) {


    const all_data = Array<number>(this.canvas.width * this.canvas.height * 4);

    let min = Infinity;
    let max = -Infinity;

    const xRange = this.xMax - this.xMin;
    const yRange = this.yMax - this.yMin;
    for (let j = 0; j < this.canvas.height; j++) {
      for (let i = 0; i < this.canvas.width; i++) {
        const x = this.xMin + (i / this.canvas.width) * xRange;
        const y = this.yMax - (j / this.canvas.height) * yRange;

        const value = func(x, y);
        all_data[i + j * this.canvas.width] = value;
        min = Math.min(min, value);
        max = Math.max(max, value);
      }
    }

    const span = max - min;

    const imageData = this.ctx.createImageData(this.canvas.width, this.canvas.height);
    const data = imageData.data;

    for (let j = 0; j < this.canvas.height; j++) {
      for (let i = 0; i < this.canvas.width; i++) {
        let color = [0, 0, 0]
        const normalized_data = (all_data[i + j * this.canvas.width] - min) / span;
        if (level_set) {
          color = colorMap((0.5 * (Math.sin(normalized_data * 2 * Math.PI * 10) + 1))**2);
        } else {
          color = colorMap(normalized_data)
        }

        const index = (j * this.canvas.width + i) * 4;
        const [r, g, b] = color;
        data[index + 0] = r;
        data[index + 1] = g;
        data[index + 2] = b;
        data[index + 3] = 255;
      }
    }

    this.ctx.putImageData(imageData, 0, 0);

  }

}