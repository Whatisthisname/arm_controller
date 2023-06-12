import { Rectangle } from "./Rectangle.js";
import type { Record } from "../@types/Record.js";
export declare class RTreeRectangle<T = any> extends Rectangle {
    children: Array<RTreeRectangle>;
    parent?: RTreeRectangle;
    record?: Record<T>;
    constructor(record: Record<T>);
    isLeafNode(): boolean;
    hasLeafNodes(): boolean;
    insertChildren(rectangles: Array<RTreeRectangle>): void;
    setParent(node: RTreeRectangle): void;
    unsetParent(): void;
    removeChild(child: RTreeRectangle): void;
    removeChildren(): void;
    getSubtreeData(): Array<Record>;
}
//# sourceMappingURL=RTreeRectangle.d.ts.map