import { arm_coord, arm_tip_target, loss_heatmap_coord, loss_highres_coord, state_trail, tip_trail } from "./app"
import { current_arm, current_loss, perform_arm_gradient_step, get_arm_tip_pos, drawArm, copy_arm } from "./arm"
import { handle_input } from "./input"
import { matplotlib_cmap } from "./plotlib"
import { toggle_level_set, level_set_scale, level_set_offset, x_axis_index, y_axis_index } from "./settings"
import { mod } from "./utils"
import { v2 } from "./v2"



export function perform_gradient_mode_setup() {

}

export function perform_gradient_mode_loop() {
    arm_coord.clear()
    loss_highres_coord.clear()
  
    loss_heatmap_coord.heatmap(
      angles_2_to_loss,
      matplotlib_cmap,
      toggle_level_set.checked,
      level_set_scale,
      level_set_offset
    )
  
    const state = new v2(mod(current_arm.arm.segments[x_axis_index].angle, (2 * Math.PI)), mod(current_arm.arm.segments[y_axis_index].angle, (2 * Math.PI)))
    loss_highres_coord.circle(state, 0.2, [255, 0, 0])
  
    handle_input()
  
    arm_coord.ctx.fillText(`loss: ${current_loss.loss_func(current_arm.arm, arm_tip_target).toFixed(2)}`, 10, 10)
  
    // add each gradient to the corresponding angle
    perform_arm_gradient_step(current_arm.arm, arm_tip_target, current_loss.loss, 0.01)
  
  
    if (state_trail.update(state)) {
      tip_trail.update(get_arm_tip_pos(current_arm.arm))
    }
    tip_trail.draw(arm_coord, [128, 50, 128])
    state_trail.draw(loss_highres_coord, [255, 0, 0])
  
    arm_coord.circle(arm_tip_target, 0.5, [128, 50, 128])
    drawArm(arm_coord, current_arm.arm, [0, 0, 0]);
  }

  const angles_2_to_loss = function (x: number, y: number) {
    const arm_copy = copy_arm(current_arm.arm)
    arm_copy.segments[x_axis_index].angle = x;
    arm_copy.segments[y_axis_index].angle = y;
    return current_loss.loss_func(arm_copy, arm_tip_target);
  }