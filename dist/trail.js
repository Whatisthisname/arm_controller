"use strict";
var arm_tip_trace = [];
var arm_tip_trace_max_points = 15;
var arm_tip_trace_min_dist = 0.5;
function update_trail(pos) {
    if (arm_tip_trace.length > arm_tip_trace_max_points) {
        arm_tip_trace.shift();
    }
    if (arm_tip_trace.length == 0 || v2.distance(arm_tip_trace[arm_tip_trace.length - 1], pos) > arm_tip_trace_min_dist) {
        arm_tip_trace.push(pos);
    }
}
function draw_trail() {
    for (var i = 0; i < arm_tip_trace.length - 1; i++) {
        var element = arm_tip_trace[i];
        var element2 = arm_tip_trace[i + 1];
        arm_coord.line(element, element2, [242, 255, 0]);
    }
}
