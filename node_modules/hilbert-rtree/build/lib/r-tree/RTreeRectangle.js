"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RTreeRectangle = void 0;
const Rectangle_js_1 = require("./Rectangle.js");
class RTreeRectangle extends Rectangle_js_1.Rectangle {
    constructor(record) {
        super(record);
        // eslint-disable-next-line no-use-before-define
        this.children = [];
        this.record = record;
    }
    isLeafNode() {
        return this.children.length === 0;
    }
    hasLeafNodes() {
        return this.isLeafNode() || this.children.some(node => node.isLeafNode());
    }
    insertChildren(rectangles) {
        for (const rectangle of rectangles) {
            this.growRectangleToFit(rectangle);
            rectangle.setParent(this);
            this.children.push(rectangle);
        }
    }
    setParent(node) {
        this.parent = node;
    }
    unsetParent() {
        this.parent = undefined;
    }
    removeChild(child) {
        child.unsetParent();
        this.children.splice(this.children.indexOf(child), 1);
    }
    removeChildren() {
        for (const child of this.children) {
            child.parent = undefined;
        }
        this.children.length = 0;
    }
    getSubtreeData() {
        var _a;
        return [
            ...(((_a = this.record) === null || _a === void 0 ? void 0 : _a.data) ? [this.record] : []),
            ...(this.children.length === 0 ? [] :
                this.children
                    .map(node => node.getSubtreeData())
                    .reduce((acc, curr) => acc.concat(curr), []))
        ];
    }
}
exports.RTreeRectangle = RTreeRectangle;
