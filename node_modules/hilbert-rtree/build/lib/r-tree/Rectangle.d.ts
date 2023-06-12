import type { BoundingBox } from "../@types/BoundingBox.js";
import type { Point } from "../@types/Point";
export declare class Rectangle implements BoundingBox {
    x: number;
    width: number;
    y: number;
    height: number;
    constructor(boundingBox: BoundingBox | Point);
    overlaps(boundingBox: BoundingBox): boolean;
    containedBy(boundingBox: BoundingBox): boolean;
    growRectangleToFit(boundingBox: BoundingBox): void;
    increaseInAreaIfGrownByRectangle(boundingBox: BoundingBox): number;
    getArea(): number;
    getCenter(): {
        centerX: number;
        centerY: number;
    };
}
//# sourceMappingURL=Rectangle.d.ts.map