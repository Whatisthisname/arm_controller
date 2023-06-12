import { Color, coordinateSystem } from "./plotlib";
import { angle_diff, angledistance_2d, fastest_way_angle, mod } from "./utils";
import { v2 } from "./v2";


class TreeNode {
    constructor(public pos: v2, public parent: TreeNode | null, public cost: number) { }
}

export class Tree {
    public nodes: TreeNode[] = [];

    addNode(point: v2, parent: TreeNode | null, dist: number): TreeNode {
        const newcost = (parent ? parent.cost : 0) + dist;
        const node = new TreeNode(point, parent, newcost);
        this.nodes.push(node);
        return node;
    }

    getRandomNode(): TreeNode {
        const randomIndex = Math.floor(Math.random() * this.nodes.length);
        return this.nodes[randomIndex];
    }

    getNodeCount(): number {
        return this.nodes.length;
    }
}


export class RRTStar {
    private readonly tree: Tree;
    private readonly stepSize: number;

    public point_collides: (point: v2) => boolean = () => false;
    public goal_reached: (point: v2) => boolean = () => false;

    minX = -10;
    maxX = 10;
    minY = -10;
    maxY = 10;

    goalnode: TreeNode | null = null;

    star: boolean = true;

    searchradius = 1;

    finished: boolean = false;

    public exploration_target : v2 | null = null;
    public go_to_target : boolean = false;

    constructor(start: v2, stepSize: number) {
        this.tree = new Tree();
        this.tree.addNode(start, null, 0);
        this.stepSize = stepSize;
    }

    generateRRTStar(maxIterations: number): Tree {
        for (let i = 0; i < maxIterations; i++) {
            if (this.goalnode == null && this.finished) { // the first time we find the goal, we stop. Later we continue to find a better path
                break;
            }
            
            let randomPoint: v2;
            // if (this.exploration_target != null && Math.random() < 0.1) {
            //     randomPoint = this.exploration_target;
            // } else {
            // }
            randomPoint = this.generateRandomPoint();

            const [nearestNode, dist1] = this.findNearestNode(randomPoint);
            let [newPoint, dist2] = this.extend(nearestNode.pos, randomPoint, this.stepSize, dist1);

            if (newPoint && this.point_collides(newPoint) == false) {
                newPoint = newPoint as v2;

                let newNode: TreeNode;
                let success: boolean = false;

                if (this.star) {
                    const nearbyNodes: [TreeNode, number][] = this.findNearbyNodes(newPoint);

                    // sort by cost, in ascending order
                    nearbyNodes.sort((a, b) => a[0].cost+a[1] - (b[0].cost+b[1]));

                    for (const [nearby_node, dist] of nearbyNodes) {
                        if (this.check_line_collides(nearby_node.pos, newPoint)) {
                            continue;
                        }

                        newNode = this.tree.addNode(newPoint, nearby_node, dist);
                        this.rewire(newNode, nearbyNodes);
                        success = true;
                        break;
                    }

                } else {
                    if (this.check_line_collides(nearestNode.pos, newPoint)) {
                        continue;
                    }
                    newNode = this.tree.addNode(newPoint, nearestNode, dist2);
                    success = true;
                }


                if (success && this.goal_reached(newPoint)) {
                    this.goalnode = this.tree.nodes[this.tree.nodes.length - 1];
                    this.finished = true;
                    break;
                }
            }
        }

        return this.tree;
    }

    public generateRandomPoint(): v2 {

        const x = Math.random() * (this.maxX - this.minX) + this.minX;
        const y = Math.random() * (this.maxY - this.minY) + this.minY;
        return new v2(x, y);
    }

    private findNearestNode(point: v2): [node: TreeNode, dist: number] {
        let nearestNode: TreeNode | null = null;
        let nearestDistance = Infinity;

        for (const node of this.tree.nodes) {
            const distance = angledistance_2d(node.pos, point);
            if (distance < nearestDistance) {
                nearestNode = node;
                nearestDistance = distance;
            }
        }

        return [nearestNode!, nearestDistance]
    }

    private extend(from: v2, to: v2, stepSize: number, dist: number): [v2 | null, number] {

        if (dist <= stepSize) {
            return [to, dist];
        }

        const dir: v2 = angle_diff(from, to).normalize().scale(stepSize);

        const newX = mod(from.x + dir.x, Math.PI * 2);
        const newY = mod(from.y + dir.y, Math.PI * 2);
        return [new v2(newX, newY), stepSize];
    }

    public re_check_solution_found(): boolean {
        if (this.goalnode == null) {
            for (const node of this.tree.nodes.sort((a, b) => Math.random() - 0.5)) {
                if (this.goal_reached(node.pos)) {
                    this.goalnode = node;
                    this.finished = true;
                    return true;
                }
            }
        }
        return false;
    }

    private rewire(newNode: TreeNode, nearbyNodes: [TreeNode, number][]): void {

        for (const [nearby_node, dist] of nearbyNodes) {

            // the root node has no parent
            if (nearby_node.parent == null) {
                continue;
            }


            if (newNode.cost + dist < nearby_node.cost) {
                // check collision
                if (this.check_line_collides(nearby_node.pos, newNode.pos)) {
                    continue;
                }
                // this.finished = true;
                nearby_node.parent = newNode;
                nearby_node.cost = newNode.cost + dist;
                // break;
            }
        }
    }

    public findNearbyNodes(point: v2): [TreeNode, number][] {

        const nearby_nodes: [TreeNode, number][] = [];

        for (const node of this.tree.nodes) {
            const distance = angledistance_2d(node.pos, point);
            if (distance <= this.searchradius) {
                nearby_nodes.push([node, distance]);
            }
        }

        return nearby_nodes;
    }

    public drawtree(coords: coordinateSystem) {
        for (let i = 0; i < this.tree.nodes.length; i++) {
            const node = this.tree.nodes[i];
            if (node.parent) {
                const dir: v2 = angle_diff(node.pos, node.parent.pos)


                // random color:
                const part = 100
                const v2 = 200
                const v = 255 - part + part * Math.random();
                let color : Color = [(2000 * node.cost % 255) * 100/255, (2000 * node.cost % 255) * 100/255, 2000 * node.cost % 255];
                color = [100, 100, (2000 * node.cost) % 255];
                coords.line(node.pos, node.pos.add(dir), color);
                coords.line(node.parent.pos, node.parent.pos.sub(dir), color);



                // coords.draw_text(`${i}, ${node.cost.toFixed(1)}`, node.pos, 0, [0, 0, 0], "center", new v2(0, 10))
                // coords.draw_text(`${i}`, node.pos, 0, [0, 0, 255], "center", new v2(0, 10))
            }
            // coords.circle(node.pos, this.stepSize / 5, [255, 0, 0]);
        }

    }

    public get_shortest_path(): v2[] {
        if (this.goalnode == null) {
            return [];
        }

        const path: v2[] = [];
        let node: TreeNode | null = this.goalnode;
        while (node) {
            path.push(node.pos);
            node = node.parent;
        }

        return path.reverse();
    }

    public check_line_collides(from: v2, to: v2): boolean {
        const dir: v2 = angle_diff(from, to)
        const steps = Math.ceil(dir.magnitude / this.stepSize);
        const step = dir.scale(1 / steps);
        let pos = from;
        let i = 0;
        let points: v2[] = [];
        while (i < steps) {
            i++;

            pos = pos.add(step);

            if (is_within_angle(pos) == false) {
                pos = to;
                step.scale(-1);
            }

            points.push(pos.copy());
        }

        for (const point of points.sort((a,b) => Math.random()-0.5)) {
            if (this.point_collides(point)) {
                return true;
            }
        }
        return false;
    }

}

function is_within_angle(p: v2) {
    return (p.x >= 0 && p.y >= 0) && (p.x <= Math.PI * 2 && p.y <= Math.PI * 2);
}

