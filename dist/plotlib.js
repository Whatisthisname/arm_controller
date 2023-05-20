"use strict";
function linearColorMap(startColor, endColor, startVal, endVal) {
    function lerpColor(a, b, t) {
        return [
            Math.round((1 - t) * a[0] + t * b[0]),
            Math.round((1 - t) * a[1] + t * b[1]),
            Math.round((1 - t) * a[2] + t * b[2]),
        ];
    }
    return function (value) {
        value = Math.min(endVal, Math.max(startVal, value)); // clamp between start and end val
        var t = (value - startVal) / (endVal - startVal); // Normalize value to [0, 1]
        return lerpColor(startColor, endColor, t);
    };
}
//[red, green, blue]
//[255, 0, 0]
//[128, 50, 128]
var matplotlib_cmap = linearColorMap([128 / 2, 50 / 2, 128 / 2], [242, 255, 50], 0, 1);
var coordinateSystem = /** @class */ (function () {
    function coordinateSystem(canvas, xMin, xMax, yMin, yMax, resolution) {
        var _this = this;
        this.axes_canvas = null;
        this.axes_coords = null;
        this.last_mouse_pos = new v2(0, 0);
        this.is_mouse_within_bounds = false;
        this.is_overlay_on = null;
        this.needs_axes = false;
        this.axes_resolution = 1;
        this.axis_names = ["x", "y"];
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.xMin = xMin;
        this.xMax = xMax;
        this.yMin = yMin;
        this.yMax = yMax;
        var width = this.canvas.width;
        var height = this.canvas.height;
        this.canvas.style.width = width + "px";
        this.canvas.style.height = height + "px";
        this.canvas.width = Math.floor(width * resolution);
        this.canvas.height = Math.floor(height * resolution);
        this.scale = width / Math.floor(width * resolution);
        this.canvas.addEventListener('mousemove', function (e) {
            _this.last_mouse_pos = _this.world_to_point(new v2(e.clientX, e.clientY));
        });
        this.canvas.addEventListener('mouseenter', function (e) {
            _this.is_mouse_within_bounds = true;
        });
        this.canvas.addEventListener('mouseleave', function (e) {
            _this.is_mouse_within_bounds = false;
        });
        window.addEventListener('resize', this.on_resize.bind(this));
    }
    coordinateSystem.prototype.on_resize = function () {
        var _a, _b;
        if (this.is_overlay_on) { // fit to the canvas we are on top of
            var coord = this.is_overlay_on;
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
            (_a = this.axes_canvas) === null || _a === void 0 ? void 0 : _a.remove();
            this.axes_coords = null;
            this.axes_canvas = document.createElement('canvas');
            this.axes_canvas.style.position = 'absolute';
            var diff = 1.4;
            this.axes_canvas.width = Math.round(diff * this.canvas.width * this.scale * this.axes_resolution);
            this.axes_canvas.height = Math.round(diff * this.canvas.height * this.scale * this.axes_resolution);
            var width_change = 0.5 * (diff - 1) * (this.xMax - this.xMin);
            var height_change = 0.5 * (diff - 1) * (this.yMax - this.yMin);
            this.axes_coords = new coordinateSystem(this.axes_canvas, this.xMin - width_change, this.xMax + width_change, this.yMin - height_change, this.yMax + height_change, 1);
            this.axes_canvas.style.width = Math.round((parseInt(this.canvas.style.width) * diff)).toString() + "px";
            this.axes_canvas.style.height = Math.round((parseInt(this.canvas.style.height) * diff)).toString() + "px";
            this.axes_canvas.style.left = (this.canvas.offsetLeft - this.canvas.width * this.scale * (diff - 1) * 0.5).toString() + "px";
            this.axes_canvas.style.top = (this.canvas.offsetTop - this.canvas.height * this.scale * (diff - 1) * 0.5).toString() + "px";
            this.axes_canvas.style.pointerEvents = 'none';
            this.axes_canvas.style.zIndex = (parseInt(this.canvas.style.zIndex) + 1).toString();
            this.axes_canvas.style.imageRendering = 'optimize-contrast';
            (_b = this.canvas.parentElement) === null || _b === void 0 ? void 0 : _b.appendChild(this.axes_canvas);
            var axes_ctx = this.axes_canvas.getContext('2d');
            // axes_ctx.rect(0, 0, this.axes_canvas.width, this.axes_canvas.height);
            // axes_ctx.stroke();
            this.axes_coords.line(new v2(this.xMin, 0), new v2(this.xMax, 0), [0, 0, 0]);
            this.axes_coords.line(new v2(0, this.yMin), new v2(0, this.yMax), [0, 0, 0]);
            var fontsize = 35;
            axes_ctx.font = "".concat(fontsize, "px Times New Roman");
            axes_ctx.fillStyle = 'black';
            var local_fontsize = 0.01 * fontsize * (this.xMax - this.xMin) / this.canvas.width;
            var x_label_pos = new v2(0.5, 0).scale(this.xMax);
            var x_max_pos = new v2(this.xMax, 0);
            var x_min_pos = new v2(this.xMin, 0);
            var x_offset = new v2(0, fontsize * 0.8);
            var y_label_pos = new v2(0, 0.5).scale(this.yMax);
            var y_max_pos = new v2(0, this.yMax);
            var y_min_pos = new v2(0, this.yMin);
            var y_offset = new v2(-fontsize * 0.2, 0);
            var col = [0, 0, 0];
            this.axes_coords.draw_text(this.axis_names[0], x_label_pos, 0, col, "center", x_offset);
            this.axes_coords.draw_text(this.xMax.toFixed(2), x_max_pos, 0, col, "end", x_offset);
            this.axes_coords.draw_text(this.xMin.toFixed(2), x_min_pos, 0, col, "start", x_offset);
            this.axes_coords.draw_text(this.axis_names[1].toString(), y_label_pos, Math.PI / 2, [255, 0, 0], "center", y_offset);
            this.axes_coords.draw_text(this.yMax.toFixed(2).toString(), y_max_pos, Math.PI / 2, [255, 0, 0], "end", y_offset);
            this.axes_coords.draw_text(this.yMin.toFixed(2).toString(), y_min_pos, Math.PI / 2, [255, 0, 0], "start", y_offset);
        }
    };
    coordinateSystem.prototype.clear = function () {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    };
    coordinateSystem.prototype.set_as_overlay_on = function (coord) {
        this.is_overlay_on = coord;
        this.on_resize();
    };
    coordinateSystem.prototype.draw_text = function (text, pos, rad_angle, color, textAlign, pixel_offset) {
        if (textAlign === void 0) { textAlign = "center"; }
        if (pixel_offset === void 0) { pixel_offset = new v2(0, 0); }
        var pixel_pos = this.point_to_pixel(pos);
        // this.ctx.fillStyle = `rgb(${color[0]}, ${color[1]}, ${color[2]})`;
        this.ctx.textAlign = textAlign;
        this.ctx.translate(pixel_pos.x + pixel_offset.x, pixel_pos.y + pixel_offset.y);
        this.ctx.rotate(-rad_angle);
        this.ctx.fillText(text, 0, 0);
        this.ctx.rotate(rad_angle);
        this.ctx.translate(-pixel_pos.x - pixel_offset.x, -pixel_pos.y - pixel_offset.y);
    };
    coordinateSystem.prototype.point_to_pixel = function (point) {
        var xPixel = (point.x - this.xMin) / (this.xMax - this.xMin) * this.ctx.canvas.width;
        var yPixel = (this.yMax - point.y) / (this.yMax - this.yMin) * this.ctx.canvas.height;
        return new v2(xPixel, yPixel);
    };
    coordinateSystem.prototype.line = function (p1, p2, color) {
        var pp1 = this.point_to_pixel(p1);
        var pp2 = this.point_to_pixel(p2);
        this.ctx.strokeStyle = "rgb(".concat(color[0], ", ").concat(color[1], ", ").concat(color[2], ")");
        this.ctx.beginPath();
        this.ctx.moveTo(pp1.x, pp1.y);
        this.ctx.lineTo(pp2.x, pp2.y);
        this.ctx.stroke();
    };
    coordinateSystem.prototype.circle = function (p, r, color) {
        this.ctx.strokeStyle = "rgb(".concat(color[0], ", ").concat(color[1], ", ").concat(color[2], ")");
        var pp = this.point_to_pixel(p);
        this.ctx.beginPath();
        this.ctx.arc(pp.x, pp.y, r, 0, 2 * Math.PI);
        this.ctx.stroke();
    };
    coordinateSystem.prototype.addAxes = function (resolution) {
        this.needs_axes = true;
        this.axes_resolution = resolution;
        this.on_resize();
    };
    coordinateSystem.prototype.world_to_point = function (mousePos) {
        var xRange = this.xMax - this.xMin;
        var yRange = this.yMax - this.yMin;
        var rect = this.canvas.getBoundingClientRect();
        var x = (mousePos.x - rect.left) / this.canvas.width * xRange / this.scale + this.xMin;
        var y = (rect.bottom - mousePos.y) / this.canvas.height * yRange / this.scale + this.yMin;
        return new v2(x, y);
    };
    coordinateSystem.prototype.heatmap = function (func, colorMap, level_set, level_set_scale, level_set_offset) {
        var all_data = Array(this.canvas.width * this.canvas.height * 4);
        var min = Infinity;
        var max = -Infinity;
        var xRange = this.xMax - this.xMin;
        var yRange = this.yMax - this.yMin;
        for (var j = 0; j < this.canvas.height; j++) {
            for (var i = 0; i < this.canvas.width; i++) {
                var x = this.xMin + (i / this.canvas.width) * xRange;
                var y = this.yMax - (j / this.canvas.height) * yRange;
                var value = func(x, y);
                all_data[i + j * this.canvas.width] = value;
                min = Math.min(min, value);
                max = Math.max(max, value);
            }
        }
        var span = max - min;
        var imageData = this.ctx.createImageData(this.canvas.width, this.canvas.height);
        var data = imageData.data;
        for (var j = 0; j < this.canvas.height; j++) {
            for (var i = 0; i < this.canvas.width; i++) {
                var color = [0, 0, 0];
                if (level_set) {
                    var level_data = all_data[i + j * this.canvas.width] * level_set_scale + level_set_offset;
                    color = colorMap((0.5 * (Math.sin(level_data) + 1)));
                }
                else {
                    var normalized_data = (all_data[i + j * this.canvas.width] - min) / span;
                    color = colorMap(normalized_data);
                }
                var index = (j * this.canvas.width + i) * 4;
                var r = color[0], g = color[1], b = color[2];
                data[index + 0] = r;
                data[index + 1] = g;
                data[index + 2] = b;
                data[index + 3] = 255;
            }
        }
        this.ctx.putImageData(imageData, 0, 0);
    };
    return coordinateSystem;
}());
