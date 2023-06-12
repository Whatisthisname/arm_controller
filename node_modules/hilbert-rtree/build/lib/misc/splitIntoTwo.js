"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.splitIntoTwo = void 0;
const RTreeRectangle_js_1 = require("../r-tree/RTreeRectangle.js");
const sortRectanglesByHilbertCoordinates_js_1 = require("./sortRectanglesByHilbertCoordinates.js");
function splitIntoTwo(rectangles) {
    if (rectangles.length <= 1) {
        return rectangles;
    }
    const pivot = Math.floor(rectangles.length / 2);
    const sortedRectangles = (0, sortRectanglesByHilbertCoordinates_js_1.sortRectanglesByHilbertCoordinates)(rectangles);
    // console.log({ sortedRectangles, rectangles });
    const firstChildPartition = sortedRectangles.splice(0, pivot);
    const secondChildPartition = sortedRectangles;
    const sibling1Child = firstChildPartition[0];
    const sibling1 = new RTreeRectangle_js_1.RTreeRectangle({
        x: sibling1Child.x,
        y: sibling1Child.y,
        height: sibling1Child.height,
        width: sibling1Child.width
    });
    sibling1.insertChildren(firstChildPartition);
    const sibling2Child = secondChildPartition[0];
    const sibling2 = new RTreeRectangle_js_1.RTreeRectangle({
        x: sibling2Child.x,
        y: sibling2Child.y,
        height: sibling2Child.height,
        width: sibling2Child.width
    });
    sibling2.insertChildren(secondChildPartition);
    return [sibling1, sibling2];
}
exports.splitIntoTwo = splitIntoTwo;
