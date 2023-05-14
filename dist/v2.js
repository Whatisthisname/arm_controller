"use strict";
var v2 = /** @class */ (function () {
    function v2(x, y) {
        if (x === void 0) { x = 0; }
        if (y === void 0) { y = 0; }
        this.x = x;
        this.y = y;
    }
    // basic vector arithmetic
    v2.prototype.add = function (other) {
        return new v2(this.x + other.x, this.y + other.y);
    };
    v2.prototype.subtract = function (other) {
        return new v2(this.x - other.x, this.y - other.y);
    };
    v2.prototype.scale = function (scalar) {
        return new v2(this.x * scalar, this.y * scalar);
    };
    Object.defineProperty(v2.prototype, "magnitude", {
        // vector magnitude and normalization
        get: function () {
            return Math.sqrt(Math.pow(this.x, 2) + Math.pow(this.y, 2));
        },
        enumerable: false,
        configurable: true
    });
    v2.prototype.normalize = function () {
        var magnitude = this.magnitude;
        return new v2(this.x / magnitude, this.y / magnitude);
    };
    // dot product and angle calculation
    v2.prototype.dot = function (other) {
        return this.x * other.x + this.y * other.y;
    };
    v2.prototype.angle = function (other) {
        var dotProduct = this.dot(other);
        var cosAngle = dotProduct / (this.magnitude * other.magnitude);
        return Math.acos(cosAngle);
    };
    // static vector operations
    v2.fromPolar = function (angle, magnitude) {
        var x = magnitude * Math.cos(angle);
        var y = magnitude * Math.sin(angle);
        return new v2(x, y);
    };
    v2.zero = function () {
        return new v2();
    };
    v2.distance = function (a, b) {
        return a.subtract(b).magnitude;
    };
    return v2;
}());
