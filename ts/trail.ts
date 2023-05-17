const arm_tip_trace: v2[] = []
const arm_tip_trace_max_points = 15
const arm_tip_trace_min_dist = 0.5

function update_trail(pos : v2) {
  if (arm_tip_trace.length > arm_tip_trace_max_points) {
    arm_tip_trace.shift()
  }
  if (arm_tip_trace.length == 0 || v2.distance(arm_tip_trace[arm_tip_trace.length - 1], pos) > arm_tip_trace_min_dist) {
    arm_tip_trace.push(pos)
  }
}

function draw_trail() {
  for (let i = 0; i < arm_tip_trace.length - 1; i++) {
    const element = arm_tip_trace[i];
    const element2 = arm_tip_trace[i + 1];
    arm_coord.line(element, element2, [242, 255, 0])
  }
}
