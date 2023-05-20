"use strict";
var Trail = /** @class */ (function () {
    function Trail(max_points, min_dist, max_dist) {
        this.points = [];
        this.max_points = max_points;
        this.min_dist = min_dist;
        this.max_dist = max_dist;
    }
    Trail.prototype.update = function (pos) {
        if (this.points.length > this.max_points) {
            this.points.shift();
        }
        if (this.points.length == 0) {
            this.points.push([pos, true]);
            return true;
        }
        else {
            var dist = v2.distance(this.points[this.points.length - 1][0], pos);
            if (dist > this.min_dist) {
                this.points.push([pos, dist < this.max_dist]);
                return true;
            }
        }
        return false;
    };
    Trail.prototype.draw = function (coord, color) {
        for (var i = 0; i < this.points.length - 1; i++) {
            if (!this.points[i + 1][1]) {
                continue;
            }
            var element = this.points[i][0];
            var element2 = this.points[i + 1][0];
            coord.line(element, element2, color);
        }
    };
    return Trail;
}());
