import { Color, coordinateSystem, matplotlib_cmap } from "./plotlib";
import { handle_input, input } from "./input";
import { makeArm, Loss, Arm, drawArm, Losses, perform_arm_gradient_step, get_arm_tip_pos, current_loss, points_along_arm, current_arm, copy_arm } from "./arm";
import { x_axis_index, y_axis_index, toggle_level_set, level_set_scale, level_set_offset, current_mode } from "./settings";
import { Trail } from "./trail";
import { v2 } from "./v2";
import { angle_diff, delay, fastest_way_angle, mod } from "./utils";
import { RRTStar } from "./rrt";
import { CircleObstacle, Obstacle } from "./obstacles";
import { perform_gradient_mode_loop, perform_gradient_mode_setup } from "./gradient_mode";
import { perform_rrt_mode_loop, perform_rrt_mode_setup } from "./rrt_mode";

const arm_canvas = document.getElementById('arm_canvas') as HTMLCanvasElement;
const loss_heatmap_canvas = document.getElementById('loss_heatmap_canvas') as HTMLCanvasElement;
const loss_highres_canvas = document.getElementById('loss_highres_canvas') as HTMLCanvasElement;

arm_canvas.width = 300
arm_canvas.height = 300
loss_heatmap_canvas.width = 300
loss_heatmap_canvas.height = 300
loss_highres_canvas.width = 300
loss_highres_canvas.height = 300

export const arm_coord = new coordinateSystem(arm_canvas, -10, 10, -10, 10, 1)
export const loss_heatmap_coord = new coordinateSystem(loss_heatmap_canvas, 0, 2 * Math.PI, 0, 2 * Math.PI, 0.3) // 0.2
export const loss_highres_coord = new coordinateSystem(loss_highres_canvas, 0, 2 * Math.PI, 0, 2 * Math.PI, 1)

loss_highres_coord.set_as_overlay_on(loss_heatmap_coord)


makeArm(2);
export let arm_tip_target: v2 = new v2((Math.random() * 10) - 5, (Math.random() * 10) - 5)

arm_canvas.addEventListener("mousedown", ev => {
  arm_tip_target = arm_coord.last_mouse_pos;
  tip_trail.points = []
  state_trail.points = []
});

arm_canvas.addEventListener("mousemove", ev => {
  if (input.LeftMouse) {
    arm_tip_target = arm_coord.last_mouse_pos;
    tip_trail.points = []
    state_trail.points = []
  }
});


loss_heatmap_coord.canvas.addEventListener("mousedown", ev => {
  current_arm.arm.segments[x_axis_index].angle = loss_heatmap_coord.last_mouse_pos.x;
  current_arm.arm.segments[y_axis_index].angle = loss_heatmap_coord.last_mouse_pos.y;
  tip_trail.points = []
  state_trail.points = []
});

loss_heatmap_coord.canvas.addEventListener("mousemove", ev => {
  if (input.LeftMouse) {
    current_arm.arm.segments[x_axis_index].angle = loss_heatmap_coord.last_mouse_pos.x;
    current_arm.arm.segments[y_axis_index].angle = loss_heatmap_coord.last_mouse_pos.y;
    tip_trail.points = []
    state_trail.points = []
  }
});


export const tip_trail = new Trail(30, 0.5, 2000)
export const state_trail = new Trail(30, 0.3, 4)




if (current_mode.rrt) {
  perform_rrt_mode_setup()
} else {
  perform_gradient_mode_setup()
}






async function update() {

  if (current_mode.rrt) {
    await perform_rrt_mode_loop()

  } else {
    perform_gradient_mode_loop()
  }

  // Schedule the next update
  requestAnimationFrame(update);
}

// Start the update loop
requestAnimationFrame(update);
arm_coord.addAxes(2)
loss_heatmap_coord.axis_names = ['joint angle', 'joint angle']
arm_coord.axis_names = ["", ""]
loss_heatmap_coord.addAxes(2)