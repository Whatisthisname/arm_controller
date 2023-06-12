"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RTree = void 0;
const RTreeRectangle_js_1 = require("./RTreeRectangle.js");
const sortRectanglesByHilbertCoordinates_js_1 = require("../misc/sortRectanglesByHilbertCoordinates.js");
const splitIntoTwo_js_1 = require("../misc/splitIntoTwo.js");
class RTree {
    /**
     * @param options Options to adjust how the RTree shall be generated.
     */
    constructor({ maxChildrenPerNode = 4 } = {}) {
        this.maxChildrenPerNode = maxChildrenPerNode;
    }
    recursiveSearchForOverlappingNodes(searchBoundingBox, node) {
        if (node.containedBy(searchBoundingBox)) {
            // If the query rectangles encapsulates this node, any data points stored within the node
            // rectangle should be returned by the search.
            return node.getSubtreeData();
        }
        else if (node.isLeafNode() && node.overlaps(searchBoundingBox)) {
            // If the query overlaps a leaf node, the leaf data shall be returned.
            return node.getSubtreeData();
        }
        else {
            // Recursively search the rectangles intersected by the search query rectangle.
            return node.children
                .filter(n => n.overlaps(searchBoundingBox))
                .map(n => this.recursiveSearchForOverlappingNodes(searchBoundingBox, n))
                .reduce((acc, curr) => acc.concat(curr), []);
        }
    }
    /** Find data records that overlap with the bounding box.
     * @returns List of `Record["data"]` from overlapped Records. */
    search(searchBoundary) {
        if (this.rootNode === undefined) {
            throw new Error("Expect tree to be created");
        }
        if (searchBoundary.x < 0) {
            throw new Error("Expect X coordinate to be >= 0");
        }
        if (searchBoundary.y < 0) {
            throw new Error("Expect Y coordinate to be >= 0");
        }
        if (searchBoundary.height < 0) {
            throw new Error("Expect `height` to be >= 0");
        }
        if (searchBoundary.width < 0) {
            throw new Error("Expect `width` to be >= 0");
        }
        const searchRect = new RTreeRectangle_js_1.RTreeRectangle(searchBoundary);
        return this
            .recursiveSearchForOverlappingNodes(searchRect, this.rootNode)
            .map(node => node.data);
    }
    /** Insert a single record to the RTree and re-balance the tree if it violates `maxChildrenPerNode`.  */
    insert(record) {
        if (record.x < 0) {
            throw new Error("Expect X coordinate to be >= 0");
        }
        if (record.y < 0) {
            throw new Error("Expect Y coordinate to be >= 0");
        }
        if ("height" in record && record.height < 0) {
            throw new Error("Expect `height` to be >= 0 if defined");
        }
        if ("width" in record && record.width < 0) {
            throw new Error("Expect `width` to be >= 0 if defined");
        }
        // Rectangle representation of the data point to insert into the RTree
        const insertRect = new RTreeRectangle_js_1.RTreeRectangle(record);
        // Since the rootNode is not defined, this is the first node in the tree.
        if (!this.rootNode) {
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const { data, ...boundingBox } = record;
            this.rootNode = new RTreeRectangle_js_1.RTreeRectangle(boundingBox);
        }
        // Walk the existing RTree from the rootNode to leaf nodes.
        const observedNodes = [this.rootNode];
        // If the currently observed node doesn't have leaf nodes, expand this (parent) node to
        // include the new node's geometry
        while (observedNodes.length) {
            const [currentNode] = observedNodes.splice(0, 1);
            // If the node isn't a leaf parent, iterate into the node's children
            if (currentNode.hasLeafNodes()) {
                // Insert the new rectangle in the identified leaf node
                currentNode.insertChildren([insertRect]);
            }
            else {
                // Grow the node's bounding rectangle
                currentNode.growRectangleToFit(insertRect);
                // Decide the subsequent node to expand. The node is decided by choosing the
                // bounding box that experience the least increase in area if chosen.
                observedNodes.push(currentNode.children
                    .map(node => ({ node, area: node.increaseInAreaIfGrownByRectangle(insertRect) }))
                    // Find node that results in the smallest rectangle
                    .reduce((accumulated, current) => current.area < accumulated.area ? current : accumulated)
                    .node);
            }
        }
        // Execute the balance routine
        this.balanceTreePath(insertRect);
    }
    /**
     * Group a list of rectangles by parents according to their coordinate position instead
     * of optimizing parent rectangle area.
     * @param rectangles  List of child nodes that shall be grouped to parent nodes.
     *                    Each parent will contain at most `maxChildrenPerNode` children.
     * @returns           Returns the `rectangles` grouped by parent nodes
     */
    constructTreeLevelsRecursively(rectangles) {
        // Create a copy of `rectangles` to modify without causing side-effects
        const rectCopy = [].concat(rectangles);
        const parentCount = Math.ceil(rectangles.length / this.maxChildrenPerNode);
        const parents = new Array(parentCount).fill(0)
            .map(() => {
            const children = rectCopy.splice(0, this.maxChildrenPerNode);
            const parent = new RTreeRectangle_js_1.RTreeRectangle({
                width: children[0].width,
                height: children[0].height,
                x: children[0].x,
                y: children[0].y,
            });
            parent.insertChildren(children);
            return parent;
        });
        // Continue to group the nodes recursively until the set of parents only
        // contain a single node, which then becomes the tree rootNode.
        if (parents.length > 1) {
            return this.constructTreeLevelsRecursively(parents);
        }
        else {
            return parents;
        }
    }
    /** Create a new R-Tree by inserting multiple records at once. This method uses a Hilbert curve
     * to pack the tree.
     *
     * This method may only be applied when creating a new R-Tree. Subsequent additions to the tree must use `insert()`.*/
    batchInsert(
    /** List of data records to insert in a R-tree structure. */
    records) {
        if (this.rootNode !== undefined) {
            throw new Error("Expect tree to be empty before batch inserting nodes");
        }
        for (const record of records) {
            if (record.x < 0) {
                throw new Error("Expect X coordinate to be >= 0");
            }
            if (record.y < 0) {
                throw new Error("Expect Y coordinate to be >= 0");
            }
            if ("height" in record && record.height < 0) {
                throw new Error("Expect `height` to be >= 0 if defined");
            }
            if ("width" in record && record.width < 0) {
                throw new Error("Expect `width` to be >= 0 if defined");
            }
        }
        const rectangles = records
            .map(record => new RTreeRectangle_js_1.RTreeRectangle(record));
        [this.rootNode] = this.constructTreeLevelsRecursively((0, sortRectanglesByHilbertCoordinates_js_1.sortRectanglesByHilbertCoordinates)(rectangles));
    }
    /** Move `leaf` if the node's parent contains more than `maxChildrenPerNode` children. */
    balanceTreePath(leaf) {
        if (!leaf.isLeafNode()) {
            throw new Error("Expect the provided node to be a leaf node");
        }
        const observedNodes = [leaf.parent];
        // Traverse the ancestor path if the leaf node if the next parent node has too many children.
        while (observedNodes.length) {
            // Remove FIFO node from observed nodes
            const [currentNode] = observedNodes.splice(0, 1);
            if (currentNode.children.length > this.maxChildrenPerNode) {
                // If the current node is an internal tree node, split the node into two siblings with equal number of children
                if (currentNode.parent) {
                    const parent = currentNode.parent;
                    parent
                        .insertChildren((0, splitIntoTwo_js_1.splitIntoTwo)(currentNode.children));
                    parent.removeChild(currentNode);
                    // If this node's parent has too many children, add it to the list of observed nodes
                    if (parent.children.length > this.maxChildrenPerNode) {
                        observedNodes.push(parent);
                    }
                }
                else {
                    // Split the children of the rootNode node (implies adding another tree level), and add these newly
                    // generated children to the rootNode node again.
                    const existingChildren = [].concat(currentNode.children);
                    currentNode.removeChildren();
                    // Add a new tree level consisting of a partitioned set of children
                    currentNode
                        .insertChildren((0, splitIntoTwo_js_1.splitIntoTwo)(existingChildren));
                }
            }
        }
    }
}
exports.RTree = RTree;
