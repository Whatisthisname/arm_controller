"use strict";
var Loss;
(function (Loss) {
    Loss[Loss["L2"] = 0] = "L2";
    Loss[Loss["L2_squared"] = 1] = "L2_squared";
    Loss[Loss["L1"] = 2] = "L1";
    Loss[Loss["L1_squared"] = 3] = "L1_squared";
    Loss[Loss["Match_Y"] = 4] = "Match_Y";
})(Loss || (Loss = {}));
var arm = { segments: [], pos: v2.zero() };
function makeArm(amount) {
    arm.segments = [];
    for (var i = 0; i < amount; i++) {
        arm.segments.push({ angle: 0, length: 10 / amount });
    }
}
function drawArm(cs, arm, color) {
    var pos = arm.pos;
    for (var _i = 0, _a = arm.segments; _i < _a.length; _i++) {
        var segment = _a[_i];
        var tip = v2.fromPolar(segment.angle, segment.length);
        cs.line(pos, pos.add(tip), color);
        pos = pos.add(tip);
    }
}
function perform_arm_gradient_step(arm, arm_tip_target, current_loss_type, step_size) {
    for (var i = 0; i < arm.segments.length; i++) {
        var grad = loss_gradient(arm, arm_tip_target, current_loss_type);
        if (toggle_level_set.checked) {
            for (var its = 0; its < 4; its++) {
                var inner = level_set_scale * current_loss_func(arm, arm_tip_target) + level_set_offset;
                arm.segments[i].angle -= Math.cos((inner)) * level_set_scale * grad[i] * step_size;
            }
        }
        else {
            arm.segments[i].angle -= grad[i] * step_size;
        }
    }
}
var Losses = /** @class */ (function () {
    function Losses() {
    }
    Losses.get_loss = function (loss) {
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
                break;
            case Loss.Match_Y:
                return Losses.Line;
                break;
        }
    };
    Losses.get_loss_gradient = function (loss) {
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
    };
    Losses.L2 = function (arm, target) {
        return v2.distance(get_arm_tip_pos(arm), target);
    };
    Losses.L2_gradient = function (tip, target) {
        var dLoss_dtip = v2.zero();
        var t1 = tip.x - target.x;
        var t2 = tip.y - target.y;
        var t3 = Math.pow(t1, 2) + Math.pow(t2, 2);
        t3 = Math.pow(t3, -0.1e1 / 0.2e1);
        dLoss_dtip.x = t3 * t1;
        dLoss_dtip.y = t3 * t2;
        return dLoss_dtip;
    };
    Losses.L2_squared = function (arm, target) {
        // return 5
        return Math.pow(v2.distance(get_arm_tip_pos(arm), target), 2);
    };
    Losses.L2_squared_gradient = function (tip, target) {
        var dLoss_dtip = v2.zero();
        dLoss_dtip.x = -2 * (target.x - tip.x);
        dLoss_dtip.y = 2 * (tip.y - target.y);
        return dLoss_dtip;
    };
    Losses.L1 = function (arm, target) {
        var tip_pos = get_arm_tip_pos(arm);
        return Math.abs(tip_pos.x - target.x) + Math.abs(tip_pos.y - target.y);
    };
    Losses.L1_gradient = function (tip, target) {
        var dLoss_dtip = v2.zero();
        dLoss_dtip.x = tip.x > target.x ? 1 : -1;
        dLoss_dtip.y = tip.y > target.y ? 1 : -1;
        return dLoss_dtip;
    };
    Losses.L1_squared = function (arm, target) {
        var tip_pos = get_arm_tip_pos(arm);
        return Math.pow(Math.abs(tip_pos.x - target.x) + Math.abs(tip_pos.y - target.y), 2);
    };
    Losses.L1_squared_gradient = function (tip, target) {
        var dLoss_dtip = v2.zero();
        dLoss_dtip.x = tip.x > target.x ? 2 : -2;
        dLoss_dtip.y = tip.y > target.y ? 2 : -2;
        dLoss_dtip.x *= Math.abs(tip.x - target.x);
        dLoss_dtip.y *= Math.abs(tip.y - target.y);
        return dLoss_dtip;
    };
    Losses.Line = function (arm, target) {
        var tip_pos = get_arm_tip_pos(arm);
        return Math.pow((tip_pos.y - target.y), 2);
    };
    Losses.Line_gradient = function (tip, target) {
        var dLoss_dtip = v2.zero();
        dLoss_dtip.y = 2 * (tip.y - target.y);
        return dLoss_dtip;
    };
    return Losses;
}());
function get_arm_tip_pos(arm) {
    var pos = arm.pos;
    for (var _i = 0, _a = arm.segments; _i < _a.length; _i++) {
        var segment = _a[_i];
        var tip = v2.fromPolar(segment.angle, segment.length);
        pos = pos.add(tip);
    }
    return pos;
}
function angle_tip_gradient(arm) {
    // let dtip_dlength = [];
    var dtip_dangle = [];
    var tip = arm.pos;
    for (var _i = 0, _a = arm.segments; _i < _a.length; _i++) {
        var segment = _a[_i];
        var local_tip = v2.fromPolar(segment.angle, segment.length);
        tip = tip.add(local_tip);
        var dtipx_dangle = -segment.length * Math.sin(segment.angle);
        var dtipy_dangle = segment.length * Math.cos(segment.angle);
        var angle_grad = new v2(dtipx_dangle, dtipy_dangle);
        dtip_dangle.push(angle_grad);
    }
    return dtip_dangle;
}
function loss_gradient(arm, target, loss) {
    var tip = get_arm_tip_pos(arm);
    var dloss_dtip = Losses.get_loss_gradient(loss)(tip, target);
    var change = [];
    for (var _i = 0, _a = angle_tip_gradient(arm); _i < _a.length; _i++) {
        var angle = _a[_i];
        var acc = 0;
        acc += dloss_dtip.x * angle.x;
        acc += dloss_dtip.y * angle.y;
        change.push(acc);
    }
    return change;
}
