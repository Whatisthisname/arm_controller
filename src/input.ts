import { arm_tip_target, arm_coord } from "./app"
import { current_arm } from "./arm"
import { x_axis_index, y_axis_index } from "./settings"

export function handle_input() {
    if (input.ArrowRight) {
        current_arm.arm.segments[x_axis_index].angle += 4 * Math.PI / 180
    }
    if (input.ArrowLeft) {
        current_arm.arm.segments[x_axis_index].angle -= 4 * Math.PI / 180
    }
    if (input.ArrowUp) {
        current_arm.arm.segments[y_axis_index].angle += 4 * Math.PI / 180
    }
    if (input.ArrowDown) {
        current_arm.arm.segments[y_axis_index].angle -= 4 * Math.PI / 180
    }

    if (input.w) {
        arm_tip_target.y += 0.25
        arm_tip_target.y = Math.min(arm_tip_target.y, arm_coord.yMax)
    }
    if (input.s) {
        arm_tip_target.y -= 0.25
        arm_tip_target.y = Math.max(arm_tip_target.y, arm_coord.yMin)
    }
    if (input.a) {
        arm_tip_target.x -= 0.25
        arm_tip_target.x = Math.max(arm_tip_target.x, arm_coord.xMin)
    }
    if (input.d) {
        arm_tip_target.x += 0.25
        arm_tip_target.x = Math.min(arm_tip_target.x, arm_coord.xMax)
    }
}

export const input: { [key: string]: boolean } = {
    ArrowUp: false,
    ArrowDown: false,
    ArrowLeft: false,
    ArrowRight: false,
    w: false,
    s: false,
    a: false,
    d: false,
    LeftMouse: false
};

document.addEventListener('keydown', (event) => {
    if (event.key in input) {
        input[event.key] = true;
        event.preventDefault()
    }
});


document.addEventListener('keyup', (event) => {
    if (event.key in input) {
        input[event.key] = false;
        event.preventDefault()
    }
});

document.addEventListener('mousedown', (event) => {
    if (event.button == 0) {
        input.LeftMouse = true;
    }
});

document.addEventListener('mouseup', (event) => {
    if (event.button == 0) {
        input.LeftMouse = false;
    }
});