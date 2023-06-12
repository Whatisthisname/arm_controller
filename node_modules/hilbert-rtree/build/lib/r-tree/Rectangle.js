"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Rectangle = void 0;
class Rectangle {
    constructor(boundingBox) {
        this.x = boundingBox.x;
        this.y = boundingBox.y;
        this.width = "width" in boundingBox ? boundingBox.width : 0;
        this.height = "height" in boundingBox ? boundingBox.height : 0;
    }
    overlaps(boundingBox) {
        return (this.x <= boundingBox.x + boundingBox.width && this.x + this.width >= boundingBox.x) &&
            this.y + this.height >= boundingBox.y && boundingBox.y + boundingBox.height >= this.y;
    }
    containedBy(boundingBox) {
        return this.x >= boundingBox.x && this.x + this.width <= boundingBox.x + boundingBox.width && this.y >= boundingBox.y && this.y + this.height <= boundingBox.y + boundingBox.height;
    }
    growRectangleToFit(boundingBox) {
        this.height = Math.max(this.y + this.height, boundingBox.y + boundingBox.height) - Math.min(this.y, boundingBox.y);
        this.width = Math.max(this.x + this.width, boundingBox.x + boundingBox.width) - Math.min(this.x, boundingBox.x);
        this.x = Math.min(this.x, boundingBox.x);
        this.y = Math.min(this.y, boundingBox.y);
    }
    increaseInAreaIfGrownByRectangle(boundingBox) {
        const maxYCoordinate = Math.max(this.y + this.height, boundingBox.y + boundingBox.height);
        const minYCoordinate = Math.min(this.y, boundingBox.y);
        const maxXCoordinate = Math.max(this.x + this.width, boundingBox.x + boundingBox.width);
        const minXCoordinate = Math.min(this.x, boundingBox.x);
        const newArea = (maxYCoordinate - minYCoordinate) * (maxXCoordinate - minXCoordinate);
        return newArea - this.getArea();
    }
    getArea() {
        return this.height * this.width;
    }
    getCenter() {
        return {
            centerX: this.x + (this.width / 2),
            centerY: this.y + (this.height / 2),
        };
    }
}
exports.Rectangle = Rectangle;
