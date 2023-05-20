"use strict";
var arm_canvas = document.getElementById('arm_canvas');
var loss_heatmap_canvas = document.getElementById('loss_heatmap_canvas');
var loss_highres_canvas = document.getElementById('loss_highres_canvas');
arm_canvas.width = 300;
arm_canvas.height = 300;
loss_heatmap_canvas.width = 300;
loss_heatmap_canvas.height = 300;
loss_highres_canvas.width = 300;
loss_highres_canvas.height = 300;
var arm_coord = new coordinateSystem(arm_canvas, -10, 10, -10, 10, 1);
var loss_heatmap_coord = new coordinateSystem(loss_heatmap_canvas, 0, 2 * Math.PI, 0, 2 * Math.PI, 0.2);
var loss_highres_coord = new coordinateSystem(loss_highres_canvas, 0, 2 * Math.PI, 0, 2 * Math.PI, 1);
loss_highres_coord.set_as_overlay_on(loss_heatmap_coord);
makeArm(2);
var arm_tip_target = new v2((Math.random() * 10) - 5, (Math.random() * 10) - 5);
arm_canvas.addEventListener("mousedown", function (ev) {
    arm_tip_target = arm_coord.last_mouse_pos;
    tip_trail.points = [];
    state_trail.points = [];
});
arm_canvas.addEventListener("mousemove", function (ev) {
    if (input.LeftMouse) {
        arm_tip_target = arm_coord.last_mouse_pos;
        tip_trail.points = [];
        state_trail.points = [];
    }
});
loss_heatmap_coord.canvas.addEventListener("mousedown", function (ev) {
    arm.segments[x_axis_index].angle = loss_heatmap_coord.last_mouse_pos.x;
    arm.segments[y_axis_index].angle = loss_heatmap_coord.last_mouse_pos.y;
    tip_trail.points = [];
    state_trail.points = [];
});
loss_heatmap_coord.canvas.addEventListener("mousemove", function (ev) {
    if (input.LeftMouse) {
        arm.segments[x_axis_index].angle = loss_heatmap_coord.last_mouse_pos.x;
        arm.segments[y_axis_index].angle = loss_heatmap_coord.last_mouse_pos.y;
        tip_trail.points = [];
        state_trail.points = [];
    }
});
var current_loss_type = Loss.L2_squared;
var current_loss_func = Losses.get_loss(current_loss_type);
var current_loss_gradient = Losses.get_loss_gradient(current_loss_type);
var tip_trail = new Trail(30, 0.5, 2000);
var state_trail = new Trail(30, 0.3, 4);
var arm_copy = { segments: arm.segments.map(function (s) { return ({ angle: s.angle, length: s.length }); }), pos: new v2(arm.pos.x, arm.pos.y) };
var angles_2_to_loss = function (x, y) {
    arm_copy.segments[x_axis_index].angle = x;
    arm_copy.segments[y_axis_index].angle = y;
    return current_loss_func(arm_copy, arm_tip_target);
};
function update() {
    arm_coord.clear();
    loss_highres_coord.clear();
    arm_copy = { segments: arm.segments.map(function (s) { return ({ angle: s.angle, length: s.length }); }), pos: new v2(arm.pos.x, arm.pos.y) };
    loss_heatmap_coord.heatmap(angles_2_to_loss, matplotlib_cmap, toggle_level_set.checked, level_set_scale, level_set_offset);
    var state = new v2(mod(arm.segments[x_axis_index].angle, (2 * Math.PI)), mod(arm.segments[y_axis_index].angle, (2 * Math.PI)));
    loss_highres_coord.circle(state, 2, [255, 0, 0]);
    handle_input();
    arm_coord.ctx.fillText("loss: ".concat(current_loss_func(arm, arm_tip_target).toFixed(2)), 10, 10);
    // add each gradient to the corresponding angle
    var step_size = 0.01;
    perform_arm_gradient_step(arm, arm_tip_target, current_loss_type, step_size);
    if (state_trail.update(state)) {
        tip_trail.update(get_arm_tip_pos(arm));
    }
    tip_trail.draw(arm_coord, [128, 50, 128]);
    state_trail.draw(loss_highres_coord, [255, 0, 0]);
    arm_coord.circle(arm_tip_target, 4, [128, 50, 128]);
    drawArm(arm_coord, arm, [0, 0, 0]);
    // Schedule the next update
    requestAnimationFrame(update);
}
// Start the update loop
requestAnimationFrame(update);
arm_coord.addAxes(2);
loss_heatmap_coord.axis_names = ['joint angle', 'joint angle'];
arm_coord.axis_names = ["", ""];
loss_heatmap_coord.addAxes(2);
