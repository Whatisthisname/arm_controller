import { Color, coordinateSystem } from "./plotlib";
import { level_set_offset, level_set_scale, toggle_level_set } from "./settings";
import { v2 } from "./v2";

export type Segment = {
    angle: number,
    length: number
}

export type Arm = {
    segments: Segment[],
    pos: v2
}

export type Loss = 
    "L2" |
    "L2_squared" |
    "L1" |
    "L1_squared" |
    "Match_Y"


export class current_arm {
    static arm: Arm = { segments: [], pos: v2.zero() };
}

export function copy_arm(arm: Arm): Arm {
    return { segments: arm.segments.map(s => ({ angle: s.angle, length: s.length })), pos: arm.pos.copy() }
}

export function makeArm(amount : number) {
    
    current_arm.arm.segments = [];

    for (let i = 0; i < amount; i++) {

        current_arm.arm.segments.push({ angle: Math.random() * 2 * Math.PI, length: 10 / amount });
    }
}

export function drawArm(cs: coordinateSystem, arm: Arm, color: Color): void {

    let pos = arm.pos;
    for (const segment of arm.segments) {
        const tip: v2 = v2.fromPolar(segment.angle, segment.length);
        cs.line(pos, pos.add(tip), color);
        pos = pos.add(tip);
    }
}

export function perform_arm_gradient_step (arm : Arm, arm_tip_target : v2, current_loss_type : Loss, step_size : number) {
    for (let i = 0; i < arm.segments.length; i++) {
        const grad: number[] = loss_gradient(arm, arm_tip_target, current_loss_type)

        if (toggle_level_set.checked) {
            for (let its = 0; its < 4; its++) {
                const inner = level_set_scale * Losses.get_loss(current_loss_type)(arm, arm_tip_target) + level_set_offset
                arm.segments[i].angle -= Math.cos((inner)) * level_set_scale * grad[i] * step_size
            }
        }
        else {
            arm.segments[i].angle -= grad[i] * step_size;
        }
    }
}

export class Losses {

    static get_loss(loss: Loss): (arm: Arm, target: v2) => number {
        switch (loss) {
            case "L2":
                return Losses.L2;
                break;
            case "L2_squared":
                return Losses.L2_squared;
                break;
            case "L1":
                return Losses.L1;
                break;
            case "L1_squared":
                return Losses.L1_squared;
                break
            case "Match_Y":
                return Losses.Line;
                break
        }
    }

    static get_loss_gradient(loss: Loss): (tip: v2, target: v2) => v2 {
        switch (loss) {
            case "L2":
                return Losses.L2_gradient;
                break;
            case "L2_squared":
                return Losses.L2_squared_gradient;
                break;
            case "L1":
                return Losses.L1_gradient;
                break;
            case "L1_squared":
                return Losses.L1_squared_gradient;
                break;
            case "Match_Y":
                return Losses.Line_gradient;
                break;
        }
    }


    private static L2(arm: Arm, target: v2): number {
        return v2.distance(get_arm_tip_pos(arm), target);
    }

    private static L2_gradient(tip: v2, target: v2): v2 {
        const dLoss_dtip = v2.zero();
        const t1 = tip.x - target.x;
        const t2 = tip.y - target.y;
        let t3 = Math.pow(t1, 2) + Math.pow(t2, 2);
        t3 = Math.pow(t3, -0.1e1 / 0.2e1);
        dLoss_dtip.x = t3 * t1;
        dLoss_dtip.y = t3 * t2;
        return dLoss_dtip;
    }

    private static L2_squared(arm: Arm, target: v2): number {
        // return 5
        return Math.pow(v2.distance(get_arm_tip_pos(arm), target), 2);
    }

    private static L2_squared_gradient(tip: v2, target: v2): v2 {
        const dLoss_dtip = v2.zero();
        dLoss_dtip.x = -2 * (target.x - tip.x);
        dLoss_dtip.y = 2 * (tip.y - target.y);
        return dLoss_dtip;
    }

    private static L1(arm: Arm, target: v2): number {
        const tip_pos = get_arm_tip_pos(arm);
        return Math.abs(tip_pos.x - target.x) + Math.abs(tip_pos.y - target.y);
    }

    private static L1_gradient(tip: v2, target: v2): v2 {
        const dLoss_dtip = v2.zero();
        dLoss_dtip.x = tip.x > target.x ? 1 : -1;
        dLoss_dtip.y = tip.y > target.y ? 1 : -1;
        return dLoss_dtip;
    }

    private static L1_squared(arm: Arm, target: v2): number {
        const tip_pos = get_arm_tip_pos(arm);
        return Math.pow(Math.abs(tip_pos.x - target.x) + Math.abs(tip_pos.y - target.y), 2);
    }

    private static L1_squared_gradient(tip: v2, target: v2): v2 {
        const dLoss_dtip = v2.zero();
        dLoss_dtip.x = tip.x > target.x ? 2 : -2;
        dLoss_dtip.y = tip.y > target.y ? 2 : -2;
        dLoss_dtip.x *= Math.abs(tip.x - target.x);
        dLoss_dtip.y *= Math.abs(tip.y - target.y);
        return dLoss_dtip;
    }

    private static Line(arm: Arm, target: v2): number {
        const tip_pos = get_arm_tip_pos(arm);
        return (tip_pos.y - target.y)**2;
    }

    private static Line_gradient(tip: v2, target: v2): v2 {
        const dLoss_dtip = v2.zero();
        dLoss_dtip.y = 2 * (tip.y - target.y)
        return dLoss_dtip;
    }

}

export function points_along_arm(arm: Arm, step : number): v2[] {
    
    const points: v2[] = [];
    let ref_pos = arm.pos;
    let leftover = 0;

    
    for (const segment of arm.segments) {
        
        points.push(ref_pos); // base 
        let current = -leftover
        while (current + step < segment.length) {
            current += step;
            const new_point: v2 = v2.fromPolar(segment.angle, current).add(ref_pos);
            points.push(new_point);
            
        }
        leftover = segment.length - current;
        
        const tip = v2.fromPolar(segment.angle, segment.length);
        ref_pos = ref_pos.add(tip);
    }
    points.push(ref_pos); // tip
    return points; 
}


export function get_arm_tip_pos(arm: Arm): v2 {
    let pos = arm.pos;
    for (const segment of arm.segments) {
        const tip: v2 = v2.fromPolar(segment.angle, segment.length);
        pos = pos.add(tip);
    }
    return pos;
}

function angle_tip_gradient(arm: Arm): v2[] {
    // let dtip_dlength = [];
    let dtip_dangle = [];

    let tip = arm.pos;

    for (const segment of arm.segments) {
        const local_tip: v2 = v2.fromPolar(segment.angle, segment.length);
        tip = tip.add(local_tip);
        const dtipx_dangle = -segment.length * Math.sin(segment.angle);
        const dtipy_dangle = segment.length * Math.cos(segment.angle);
        const angle_grad = new v2(dtipx_dangle, dtipy_dangle);
        dtip_dangle.push(angle_grad);
    }
    return dtip_dangle
}

function loss_gradient(arm: Arm, target: v2, loss: Loss): number[] {

    const tip = get_arm_tip_pos(arm);
    let dloss_dtip = Losses.get_loss_gradient(loss)(tip, target);

    let change = [];
    for (const angle of angle_tip_gradient(arm)) {
        let acc = 0;
        acc += dloss_dtip.x * angle.x;
        acc += dloss_dtip.y * angle.y;
        change.push(acc);
    }
    return change;
}

export class l_obj {
    loss : Loss = "L2_squared"
    loss_func : (arm : Arm, arm_tip_target : v2) => number = Losses.get_loss("L2_squared")
    loss_gradient_func : (tip : v2, arm_tip_target : v2) => v2 = Losses.get_loss_gradient("L2_squared")
}

export let current_loss : l_obj = new l_obj()