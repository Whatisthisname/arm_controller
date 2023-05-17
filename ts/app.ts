const arm_canvas = document.getElementById('arm_canvas') as HTMLCanvasElement;
const loss_canvas = document.getElementById('loss_canvas') as HTMLCanvasElement;


arm_canvas.width = 300
arm_canvas.height = 300
loss_canvas.width = 300
loss_canvas.height = 300

const arm_coord = new coordinateSystem(arm_canvas, -10, 10, -10, 10, 1)
const loss_coord = new coordinateSystem(loss_canvas, 0, 2 * Math.PI, 0, 2 * Math.PI, 0.25)


const segments = [
  { angle: 0, length: 4 },
  { angle: Math.PI / 2, length: 5 }
  // {angle: 90, length: 100}
]

let pos: v2 = new v2(0, 0)

const arm: Arm = { segments, pos: pos }

let arm_tip_target: v2 = new v2((Math.random() * 10) - 5, (Math.random() * 10) - 5)

arm_canvas.addEventListener("mousedown", ev => {
  arm_tip_target = arm_coord.last_mouse_pos;
});


loss_coord.canvas.addEventListener("mousemove", ev => {
  if (input.LeftMouse || true) {
    arm.segments[0].angle = loss_coord.last_mouse_pos.x;
    arm.segments[1].angle = loss_coord.last_mouse_pos.y;
  }
});


let current_loss_type: Loss = Loss.L2_squared;
let current_loss_func = Losses.get_loss(current_loss_type)
let current_loss_gradient = Losses.get_loss_gradient(current_loss_type)





const angles_2_to_loss = function (x: number, y: number) {
  return current_loss_func(
    {
      segments: [
        { angle: x, length: arm.segments[0].length }, { angle: y, length: arm.segments[1].length }
      ],
      pos: arm.pos
    }, arm_tip_target);
}

function update() {

  console.log("hej")

  arm_coord.ctx.clearRect(0, 0, arm_canvas.width, arm_canvas.height);
  loss_coord.ctx.clearRect(0, 0, loss_canvas.width, loss_canvas.height);
  arm_coord.addAxes()
  loss_coord.heatmap(
    angles_2_to_loss,
    matplotlib_cmap,
    toggle_level_set.checked,
    level_set_scale,
    level_set_offset
    )
    
    
  loss_coord.circle(new v2(mod(arm.segments[0].angle, (2 * Math.PI)), mod(arm.segments[1].angle, (2 * Math.PI))), 3, [255, 0, 0])

  handle_input()
  
  arm_coord.ctx.fillText(`loss: ${current_loss_func(arm, arm_tip_target).toFixed(2)}`, 10, 10)

  // add each gradient to the corresponding angle
  const step_size = 0.01
  perform_arm_gradient_step(arm, arm_tip_target, current_loss_type, step_size)

  update_trail(get_arm_tip_pos(arm))
  draw_trail()
  
  arm_coord.circle(arm_tip_target, 3, [128, 50, 128])
  drawArm(arm_coord, arm, [0, 0, 0]);

  // Schedule the next update
  requestAnimationFrame(update);
}

// Start the update loop
requestAnimationFrame(update);