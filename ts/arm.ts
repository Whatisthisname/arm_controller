type Segment = {
    angle: number,
    length: number
}

type Arm = {
    segments: Segment[],
    pos: v2
}

enum Loss {
    L2,
    L2_squared,
    L1,
    L1_squared,
    Match_Y
}


function drawArm(cs: coordinateSystem, arm: Arm, color: Color): void {

    let pos = arm.pos;
    for (const segment of arm.segments) {
        const tip: v2 = v2.fromPolar(segment.angle, segment.length);
        cs.line(pos, pos.add(tip), color);
        pos = pos.add(tip);
    }
}

function perform_arm_gradient_step (arm : Arm, arm_tip_target : v2, current_loss_type : Loss, step_size : number) {
    for (let i = 0; i < segments.length; i++) {
        const grad: number[] = loss_gradient(arm, arm_tip_target, current_loss_type)

        if (toggle_stay_in_level_set.checked) {
            for (let its = 0; its < 4; its++) {
                const inner = level_set_scale * current_loss_func(arm, arm_tip_target) + level_set_offset
                segments[i].angle += Math.cos((inner)) * level_set_scale * grad[i] * step_size
            }
        }
        else {
            segments[i].angle -= grad[i] * step_size;
        }
    }
}

class Losses {

    static get_loss(loss: Loss): (arm: Arm, target: v2) => number {
        switch (loss) {
            case Loss.L2:
                return Losses.L2;
                break;
            case Loss.L2_squared:
                return Losses.L2_squared;
                break;
            case Loss.L1:
                return Losses.L1;
                break;
            case Loss.L1_squared:
                return Losses.L1_squared;
                break
            case Loss.Match_Y:
                return Losses.Line;
                break
        }
    }

    static get_loss_gradient(loss: Loss): (tip: v2, target: v2) => v2 {
        switch (loss) {
            case Loss.L2:
                return Losses.L2_gradient;
                break;
            case Loss.L2_squared:
                return Losses.L2_squared_gradient;
                break;
            case Loss.L1:
                return Losses.L1_gradient;
                break;
            case Loss.L1_squared:
                return Losses.L1_squared_gradient;
                break;
            case Loss.Match_Y:
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
        return Math.abs(tip_pos.y - 5);
    }

    private static Line_gradient(tip: v2, target: v2): v2 {
        const dLoss_dtip = v2.zero();
        dLoss_dtip.y = tip.y > target.y ? 1 : -1;
        return dLoss_dtip;
    }

}


function get_arm_tip_pos(arm: Arm): v2 {
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