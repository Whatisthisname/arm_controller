"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sortRectanglesByHilbertCoordinates = void 0;
const HilbertCurves_js_1 = require("../hilbert/HilbertCurves.js");
function sortRectanglesByHilbertCoordinates(rectangles) {
    // We shall create a square sized coordinate system with height = width. The
    // square must encapsulate all rectangles in the tree. To determine the required
    // size of the square, we must identify the max/min coordinates of the encapsulated
    // rectangles.
    const { maxCoordinate, minCoordinate } = rectangles
        .map(rectangle => rectangle.getCenter())
        .map(({ centerX, centerY }) => [
        // X coordinate
        Math.floor(centerX),
        // Y coordinate
        Math.floor(centerY)
    ])
        .reduce(({ maxCoordinate: accumulatedMax, minCoordinate: accumulatedMin }, [x, y]) => {
        return {
            maxCoordinate: Math.max(accumulatedMax, Math.max(x, y)),
            minCoordinate: Math.min(accumulatedMin, Math.min(x, y))
        };
    }, { maxCoordinate: -Infinity, minCoordinate: Infinity });
    const weightedRectangles = rectangles
        .map(rectangle => ({ ...rectangle.getCenter(), rectangle }))
        .map(({ rectangle, centerX, centerY }) => ({
        rectangle,
        weight: (0, HilbertCurves_js_1.toHilbertCoordinates)(maxCoordinate - minCoordinate, Math.floor(centerX) - minCoordinate, Math.floor(centerY) - minCoordinate)
    }));
    weightedRectangles.sort((A, B) => A.weight - B.weight);
    return weightedRectangles.map(({ rectangle }) => rectangle);
}
exports.sortRectanglesByHilbertCoordinates = sortRectanglesByHilbertCoordinates;
