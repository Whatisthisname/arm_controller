function handle_input() {
    if (input.ArrowRight) {
        segments[0].angle += 2 * Math.PI / 180
    }
    if (input.ArrowLeft) {
        segments[0].angle -= 2 * Math.PI / 180
    }
    if (input.ArrowUp) {
        segments[1].angle += 2 * Math.PI / 180
    }
    if (input.ArrowDown) {
        segments[1].angle -= 2 * Math.PI / 180
    }

    if (input.w) {
        arm_tip_target.y += 0.1
        arm_tip_target.y = Math.min(arm_tip_target.y, arm_coord.yMax)
    }
    if (input.s) {
        arm_tip_target.y -= 0.1
        arm_tip_target.y = Math.max(arm_tip_target.y, arm_coord.yMin)
    }
    if (input.a) {
        arm_tip_target.x -= 0.1
        arm_tip_target.x = Math.max(arm_tip_target.x, arm_coord.xMin)
    }
    if (input.d) {
        arm_tip_target.x += 0.1
        arm_tip_target.x = Math.min(arm_tip_target.x, arm_coord.xMax)
    }
}

const input: { [key: string]: boolean } = {
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