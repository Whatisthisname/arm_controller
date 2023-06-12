import type { BoundingBox } from "../@types/BoundingBox.js";
import type { Record } from "../@types/Record.js";
export declare class RTree {
    private rootNode?;
    private readonly maxChildrenPerNode;
    /**
     * @param options Options to adjust how the RTree shall be generated.
     */
    constructor({ maxChildrenPerNode }?: {
        /** The tree will split up nodes with more than `maxChildrenPerNode` number of children.  */
        maxChildrenPerNode?: number;
    });
    private recursiveSearchForOverlappingNodes;
    /** Find data records that overlap with the bounding box.
     * @returns List of `Record["data"]` from overlapped Records. */
    search(searchBoundary: BoundingBox): unknown[];
    /** Insert a single record to the RTree and re-balance the tree if it violates `maxChildrenPerNode`.  */
    insert(record: Record): void;
    /**
     * Group a list of rectangles by parents according to their coordinate position instead
     * of optimizing parent rectangle area.
     * @param rectangles  List of child nodes that shall be grouped to parent nodes.
     *                    Each parent will contain at most `maxChildrenPerNode` children.
     * @returns           Returns the `rectangles` grouped by parent nodes
     */
    private constructTreeLevelsRecursively;
    /** Create a new R-Tree by inserting multiple records at once. This method uses a Hilbert curve
     * to pack the tree.
     *
     * This method may only be applied when creating a new R-Tree. Subsequent additions to the tree must use `insert()`.*/
    batchInsert(
    /** List of data records to insert in a R-tree structure. */
    records: Array<Record>): void;
    /** Move `leaf` if the node's parent contains more than `maxChildrenPerNode` children. */
    private balanceTreePath;
}
//# sourceMappingURL=RTree.d.ts.map