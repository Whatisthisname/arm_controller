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

//[red, green, blue]
//[255, 0, 0]
//[128, 50, 128]

const matplotlib_cmap = linearColorMap([128 / 2, 50 / 2, 128 / 2], [242, 255, 50], 0, 1)

class coordinateSystem {
  canvas: HTMLCanvasElement;
  axes_canvas: HTMLCanvasElement | null = null
  axes_coords: coordinateSystem | null = null
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
    this.canvas.style.width = width + "px";
    this.canvas.style.height = height + "px";

    this.canvas.width = Math.floor(width * resolution);
    this.canvas.height = Math.floor(height * resolution);


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

    window.addEventListener('resize', this.on_resize.bind(this));
  }

  on_resize() {


    if (this.is_overlay_on) { // fit to the canvas we are on top of
      const coord = this.is_overlay_on;
      this.canvas.style.position = 'absolute';
      // this.canvas.width = coord.canvas.width;
      // this.canvas.height = coord.canvas.height;
      this.canvas.style.width = coord.canvas.style.width;
      this.canvas.style.height = coord.canvas.style.height;
      this.canvas.style.left = (coord.canvas.offsetLeft).toString() + "px";
      this.canvas.style.top = (coord.canvas.offsetTop).toString() + "px";
      this.canvas.style.pointerEvents = 'none';
      this.canvas.style.zIndex = (parseInt(coord.canvas.style.zIndex) + 1).toString();
      this.canvas.style.imageRendering = 'optimize-contrast';
    }

    if (this.needs_axes) { // draw axes
      this.axes_canvas?.remove();
      this.axes_coords = null;

      this.axes_canvas = document.createElement('canvas');
      this.axes_canvas.style.position = 'absolute';

      const diff = 1.4
      this.axes_canvas.width = Math.round(diff * this.canvas.width * this.scale * this.axes_resolution);
      this.axes_canvas.height = Math.round(diff * this.canvas.height * this.scale * this.axes_resolution);

      const width_change = 0.5 * (diff - 1) * (this.xMax - this.xMin);
      const height_change = 0.5 * (diff - 1) * (this.yMax - this.yMin);

      this.axes_coords = new coordinateSystem(this.axes_canvas, this.xMin - width_change, this.xMax + width_change, this.yMin - height_change, this.yMax + height_change, 1);

      this.axes_canvas.style.width = Math.round((parseInt(this.canvas.style.width) * diff)).toString() + "px";
      this.axes_canvas.style.height = Math.round((parseInt(this.canvas.style.height) * diff)).toString() + "px";


      this.axes_canvas.style.left = (this.canvas.offsetLeft - this.canvas.width * this.scale * (diff - 1) * 0.5).toString() + "px";
      this.axes_canvas.style.top = (this.canvas.offsetTop - this.canvas.height * this.scale * (diff - 1) * 0.5).toString() + "px";

      this.axes_canvas.style.pointerEvents = 'none';
      this.axes_canvas.style.zIndex = (parseInt(this.canvas.style.zIndex) + 1).toString();
      this.axes_canvas.style.imageRendering = 'optimize-contrast';

      this.canvas.parentElement?.appendChild(this.axes_canvas);


      const axes_ctx = this.axes_canvas.getContext('2d') as CanvasRenderingContext2D;

      // axes_ctx.rect(0, 0, this.axes_canvas.width, this.axes_canvas.height);
      // axes_ctx.stroke();

      this.axes_coords.line(new v2(this.xMin, 0), new v2(this.xMax, 0), [0, 0, 0]);
      this.axes_coords.line(new v2(0, this.yMin), new v2(0, this.yMax), [0, 0, 0]);

      const fontsize = 35;
      axes_ctx.font = `${fontsize}px Times New Roman`;
      axes_ctx.fillStyle = 'black';

      const local_fontsize = 0.01 * fontsize * (this.xMax-this.xMin) / this.canvas.width

      const x_label_pos = new v2(0.5, 0).scale(this.xMax);
      const x_max_pos = new v2(this.xMax, 0);
      const x_min_pos = new v2(this.xMin, 0);
      const x_offset = new v2(0, fontsize * 0.8)
      
      const y_label_pos = new v2(0, 0.5).scale(this.yMax);
      const y_max_pos = new v2(0, this.yMax);
      const y_min_pos = new v2(0, this.yMin);
      const y_offset = new v2(-fontsize*0.2, 0)

      const col : Color = [0, 0, 0]
    
      this.axes_coords.draw_text(this.axis_names[0], x_label_pos, 0, col, "center", x_offset)
      this.axes_coords.draw_text(this.xMax.toFixed(2), x_max_pos, 0, col, "end", x_offset)
      this.axes_coords.draw_text(this.xMin.toFixed(2), x_min_pos, 0, col, "start", x_offset)
      
      this.axes_coords.draw_text(this.axis_names[1].toString(), y_label_pos, Math.PI / 2, [255, 0, 0], "center", y_offset);
      this.axes_coords.draw_text(this.yMax.toFixed(2).toString(), y_max_pos, Math.PI / 2, [255, 0, 0], "end", y_offset);
      this.axes_coords.draw_text(this.yMin.toFixed(2).toString(), y_min_pos, Math.PI / 2, [255, 0, 0], "start", y_offset);
    }
  }

  clear() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }

  is_overlay_on: coordinateSystem | null = null;

  set_as_overlay_on(coord: coordinateSystem) {
    this.is_overlay_on = coord;
    this.on_resize();
  }

  draw_text(text: string, pos: v2, rad_angle: number, color: Color, textAlign: CanvasTextAlign = "center", pixel_offset: v2 = new v2(0, 0)) {
    const pixel_pos = this.point_to_pixel(pos);

    // this.ctx.fillStyle = `rgb(${color[0]}, ${color[1]}, ${color[2]})`;
    this.ctx.textAlign = textAlign;

    this.ctx.translate(pixel_pos.x + pixel_offset.x, pixel_pos.y + pixel_offset.y)
    this.ctx.rotate(-rad_angle);

    this.ctx.fillText(text, 0, 0);

    this.ctx.rotate(rad_angle);
    this.ctx.translate(-pixel_pos.x - pixel_offset.x, -pixel_pos.y - pixel_offset.y)

  }

  point_to_pixel(point: v2): v2 {
    const xPixel = (point.x - this.xMin) / (this.xMax - this.xMin) * this.ctx.canvas.width;
    const yPixel = (this.yMax - point.y) / (this.yMax - this.yMin) * this.ctx.canvas.height;
    return new v2(xPixel, yPixel);
  }

  line(p1: v2, p2: v2, color: Color) {

    const pp1 = this.point_to_pixel(p1);
    const pp2 = this.point_to_pixel(p2);
    this.ctx.strokeStyle = `rgb(${color[0]}, ${color[1]}, ${color[2]})`;
    this.ctx.beginPath();
    this.ctx.moveTo(pp1.x, pp1.y);
    this.ctx.lineTo(pp2.x, pp2.y);
    this.ctx.stroke();
  }

  circle(p: v2, r: number, color: Color) {
    this.ctx.strokeStyle = `rgb(${color[0]}, ${color[1]}, ${color[2]})`;
    const pp = this.point_to_pixel(p);
    this.ctx.beginPath();
    this.ctx.arc(pp.x, pp.y, r, 0, 2 * Math.PI);
    this.ctx.stroke();
  }

  needs_axes: boolean = false;
  axes_resolution: number = 1;
  axis_names: [string, string] = ["x", "y"];

  addAxes(resolution: number) {
    this.needs_axes = true;
    this.axes_resolution = resolution;
    this.on_resize();
  }

  world_to_point(mousePos: v2): v2 {
    const xRange = this.xMax - this.xMin;
    const yRange = this.yMax - this.yMin;
    const rect = this.canvas.getBoundingClientRect();

    const x = (mousePos.x - rect.left) / this.canvas.width * xRange / this.scale + this.xMin;
    const y = (rect.bottom - mousePos.y) / this.canvas.height * yRange / this.scale + this.yMin;
    return new v2(x, y);
  }

  heatmap(func: (x: number, y: number) => number, colorMap: (value: number) => Color, level_set: boolean, level_set_scale: number, level_set_offset: number) {


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
        if (level_set) {
          const level_data = all_data[i + j * this.canvas.width] * level_set_scale + level_set_offset;
          color = colorMap((0.5 * (Math.sin(level_data) + 1)));
        } else {
          const normalized_data = (all_data[i + j * this.canvas.width] - min) / span;
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