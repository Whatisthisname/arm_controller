import { Color, coordinateSystem } from "./plotlib";
import { v2 } from "./v2";


export abstract class Obstacle {
    
    
    bbox: [v2, v2] | null = null;
    
    get_AABB(): [v2, v2] {
        if (this.bbox != null) {
            return this.bbox;
        } else {
            this.bbox = this.calculate_AABB();
            return this.bbox;
        }
    }
    
    contains(point: v2): boolean {
        const [min, max] = this.get_AABB();
        if (point.x >= min.x && point.x <= max.x && point.y >= min.y && point.y <= max.y) {
            return this.query (point)
        } else {
            return false;
        }
    }

    abstract calculate_AABB(): [v2, v2];
    abstract draw(coords: coordinateSystem, color: Color): void;
    /** given that the point is inside the bounding box, is it also inside the shape? */
    abstract query(point: v2): boolean;


}

export class CircleObstacle extends Obstacle {
    query(point: v2): boolean {
        return this.pos.distance(point) <= this.radius;
    }

    constructor(public pos: v2, public radius: number) {
        super();
    }

    calculate_AABB(): [v2, v2] {
        return [this.pos.sub(new v2(this.radius, this.radius)), this.pos.add(new v2(this.radius, this.radius))];
    }

    draw(coords: coordinateSystem, color: Color): void {
        coords.circle(this.pos, this.radius, color);
    }
}

export class RectangleObstacle extends Obstacle {
    
    query(point: v2): boolean {
        return true
    }
    constructor(public pos: v2, public size: v2) {
        super();
    }

    calculate_AABB(): [v2, v2] {
        return [this.pos, this.pos.add(this.size)];
    }

    draw(coords: coordinateSystem, color: Color): void {
        // coords.rectangle(this.pos, this.size, color);
        throw new Error("Method not implemented.");
    }
}