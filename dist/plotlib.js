"use strict";
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
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
function plot2DFunctionToHeatmap(canvas, func, options) {
    var all_data = Array(canvas.width * canvas.height * 4);
    var min = Infinity;
    var max = -Infinity;
    var xRange = options.xMax - options.xMin;
    var yRange = options.yMax - options.yMin;
    for (var j = 0; j < canvas.height; j++) {
        for (var i = 0; i < canvas.width; i++) {
            var x = options.xMin + (i / canvas.width) * xRange;
            var y = options.yMax - (j / canvas.height) * yRange;
            var value = func(x, y);
            all_data[i + j * canvas.width] = value;
            min = Math.min(min, value);
            max = Math.max(max, value);
        }
    }
    var span = max - min;
    var ctx = canvas.getContext('2d');
    var imageData = ctx.createImageData(canvas.width, canvas.height);
    var data = imageData.data;
    for (var j = 0; j < canvas.height; j++) {
        for (var i = 0; i < canvas.width; i++) {
            var color = options.colorMap((all_data[i + j * canvas.width] - min) / span);
            if ((all_data[i + j * canvas.width] - min) / span > 1 || (all_data[i + j * canvas.width] - min) / span < 0) {
                console.log("error");
            }
            var index = (j * options.width_res + i) * 4;
            var r = color[0], g = color[1], b = color[2];
            data[index + 0] = r;
            data[index + 1] = g;
            data[index + 2] = b;
            data[index + 3] = 255;
        }
    }
    ctx.putImageData(imageData, 0, 0);
}
var coordinateSystem = /** @class */ (function () {
    function coordinateSystem(canvas, xMin, xMax, yMin, yMax, resolution) {
        var _this = this;
        this.last_mouse_pos = new v2(0, 0);
        this.is_mouse_within_bounds = false;
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.xMin = xMin;
        this.xMax = xMax;
        this.yMin = yMin;
        this.yMax = yMax;
        var width = this.canvas.width;
        var height = this.canvas.height;
        this.canvas.width = Math.floor(width * resolution);
        this.canvas.height = Math.floor(height * resolution);
        this.canvas.style.width = width + "px";
        this.canvas.style.height = height + "px";
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
    }
    coordinateSystem.prototype.point_to_pixel = function (x, y) {
        var xPixel = (x - this.xMin) / (this.xMax - this.xMin) * this.canvas.width;
        var yPixel = (this.yMax - y) / (this.yMax - this.yMin) * this.canvas.height;
        return [xPixel, yPixel];
    };
    coordinateSystem.prototype.line = function (p1, p2) {
        var _a = this.point_to_pixel(p1.x, p1.y), x1 = _a[0], y1 = _a[1];
        var _b = this.point_to_pixel(p2.x, p2.y), x2 = _b[0], y2 = _b[1];
        this.ctx.beginPath();
        this.ctx.moveTo(x1, y1);
        this.ctx.lineTo(x2, y2);
        this.ctx.stroke();
    };
    coordinateSystem.prototype.circle = function (p, r, color) {
        this.ctx.strokeStyle = "rgb(".concat(color[0], ", ").concat(color[1], ", ").concat(color[2], ")");
        var _a = this.point_to_pixel(p.x, p.y), x = _a[0], y = _a[1];
        this.ctx.beginPath();
        this.ctx.arc(x, y, r, 0, 2 * Math.PI);
        this.ctx.stroke();
    };
    coordinateSystem.prototype.addAxes = function () {
        var _a, _b, _c;
        this.line(new v2(this.xMin, 0), new v2(this.xMax, 0));
        this.line(new v2(0, this.yMin), new v2(0, this.yMax));
        (_a = this.ctx).fillText.apply(_a, __spreadArray(["0,0"], this.point_to_pixel(0, 0), false));
        (_b = this.ctx).fillText.apply(_b, __spreadArray(["x=".concat(this.xMax.toFixed(2))], this.point_to_pixel(this.xMax * 0.8, 0), false));
        (_c = this.ctx).fillText.apply(_c, __spreadArray(["y=".concat(this.yMax.toFixed(2))], this.point_to_pixel(0, this.yMax * 0.8), false));
    };
    coordinateSystem.prototype.world_to_point = function (mousePos) {
        var xRange = this.xMax - this.xMin;
        var yRange = this.yMax - this.yMin;
        var rect = arm_canvas.getBoundingClientRect();
        var x = (mousePos.x - this.canvas.offsetLeft) / this.canvas.width * xRange / this.scale + this.xMin;
        var y = (this.canvas.offsetTop + rect.height - mousePos.y) / this.canvas.height * yRange / this.scale + this.yMin;
        return new v2(x, y);
    };
    coordinateSystem.prototype.heatmap = function (func, colorMap) {
        plot2DFunctionToHeatmap(this.canvas, func, {
            width_res: this.canvas.width,
            height_res: this.canvas.height,
            xMin: this.xMin,
            xMax: this.xMax,
            yMin: this.yMin,
            yMax: this.yMax,
            colorMap: colorMap,
        });
    };
    return coordinateSystem;
}());
