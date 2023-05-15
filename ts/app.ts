const arm_canvas = document.getElementById('arm_canvas') as HTMLCanvasElement;
const loss_canvas = document.getElementById('loss_canvas') as HTMLCanvasElement;
const dropdown = document.getElementById('select_loss') as HTMLSelectElement;
const toggle_level_set = document.getElementById('toggle_level_set') as HTMLInputElement;
const map = linearColorMap([255, 0, 0], [0, 0, 255], -10, 10)




arm_canvas.width = 300
arm_canvas.height = 300
loss_canvas.width = 300
loss_canvas.height = 300

const arm_coord = new coordinateSystem(arm_canvas, -10, 10, -10, 10, 1)
const loss_coord = new coordinateSystem(loss_canvas, -1, 2 * Math.PI + 1, -1, 2 * Math.PI + 1, 0.25)


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

loss_coord.canvas.addEventListener("mousemove", ev => {
  if (input.LeftMouse || true) {
    arm.segments[0].angle = loss_coord.last_mouse_pos.x;
    arm.segments[1].angle = loss_coord.last_mouse_pos.y;
  }
});


let current_loss_type: Loss = Loss.L2_squared;
let current_loss_func = Losses.get_loss(current_loss_type)
let current_loss_gradient = Losses.get_loss_gradient(current_loss_type)

dropdown.addEventListener('change', (event) => {
  switch (dropdown.value) {
    case "L2 squared":
      current_loss_type = Loss.L2_squared
      break
    case "L2":
      current_loss_type = Loss.L2
      break
    case "L1":
      current_loss_type = Loss.L1
      break
    case "L1 squared":
      current_loss_type = Loss.L1_squared
      break
  }
  current_loss_func = Losses.get_loss(current_loss_type)
  current_loss_gradient = Losses.get_loss_gradient(current_loss_type)
}
)









const matplotlib_cmap = linearColorMap([0, 4, 122], [242, 255, 0], 0, 1)


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

  arm_coord.ctx.clearRect(0, 0, arm_canvas.width, arm_canvas.height);
  loss_coord.ctx.clearRect(0, 0, loss_canvas.width, loss_canvas.height);
  arm_coord.addAxes()
  loss_coord.heatmap(
    angles_2_to_loss,
    matplotlib_cmap,
    toggle_level_set.checked
  )

  // loss_coord.addAxes()

  loss_coord.circle(new v2(mod(arm.segments[0].angle, (2 * Math.PI)), mod(arm.segments[1].angle, (2 * Math.PI))), 3, [255, 0, 0])

  if (input.ArrowRight) {
    segments[0].angle += 10 * Math.PI / 180
  }
  if (input.ArrowLeft) {
    segments[0].angle -= 10 * Math.PI / 180
  }
  if (input.ArrowUp) {
    segments[1].angle += 10 * Math.PI / 180
  }
  if (input.ArrowDown) {
    segments[1].angle -= 10 * Math.PI / 180
  }

  if (input.w) {
    arm_tip_target.y += 0.1
  }
  if (input.s) {
    arm_tip_target.y -= 0.1
  }
  if (input.a) {
    arm_tip_target.x -= 0.1
  }
  if (input.d) {
    arm_tip_target.x += 0.1
  }

  // loss_gradient
  arm_coord.ctx.fillText(`loss: ${current_loss_func(arm, arm_tip_target).toFixed(2)}`, 10, 10)


  const grad: number[] = loss_gradient(arm, arm_tip_target, current_loss_type)
  // add each gradient to the corresponding angle
  for (let i = 0; i < segments.length; i++) {
    segments[i].angle -= grad[i] * 0.01
  }

  arm_coord.circle(arm_tip_target, 3, [0, 0, 255])
  drawArm(arm_coord, arm);

  // Schedule the next update
  requestAnimationFrame(update);
}

// Start the update loop
requestAnimationFrame(update);