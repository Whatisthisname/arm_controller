import { arm_coord, arm_tip_target, loss_heatmap_coord, loss_highres_coord, state_trail, tip_trail } from "./app"
import { Arm, current_arm, copy_arm, get_arm_tip_pos, drawArm, points_along_arm } from "./arm"
import { handle_input, input } from "./input"
import { Obstacle, CircleObstacle } from "./obstacles"
import { matplotlib_cmap } from "./plotlib"
import { RRTStar } from "./rrt"
import { toggle_level_set, level_set_scale, level_set_offset, x_axis_index, y_axis_index } from "./settings"
import { mod, delay, angle_diff } from "./utils"
import { v2 } from "./v2"

let rrt_container: RRTStar = new RRTStar(v2.zero(), 0.0);

const obstacles: Obstacle[] = []
export function perform_rrt_mode_setup() {
    obstacles.pop()
    obstacles.pop()
    obstacles.pop()
    obstacles.push(new CircleObstacle(new v2(5, 5), 1))
    obstacles.push(new CircleObstacle(new v2(-3.5, 3.5), 2))
    obstacles.push(new CircleObstacle(new v2(3, -7), 2))

    loss_heatmap_coord.heatmap(
        (x, y) => angles_2_to_collision(x, y) ? 1 : 0,
        matplotlib_cmap,
        toggle_level_set.checked,
        level_set_scale,
        level_set_offset
    )

    rrt_goal = arm_tip_target;

    
    arm_coord.canvas.addEventListener("mousedown", reset_rrt_on_click)
    make_tree_slow();
}

export function perform_rrt_mode_setdown() {
    arm_coord.canvas.removeEventListener("mousedown", reset_rrt_on_click)
}




let rrt_goal :v2 = arm_tip_target;

function reset_rrt_on_click() {

    rrt_goal = arm_coord.last_mouse_pos;
    const state = new v2(mod(current_arm.arm.segments[x_axis_index].angle, (2 * Math.PI)), mod(current_arm.arm.segments[y_axis_index].angle, (2 * Math.PI)))
    const start = state
    const stepSize = 0.2;
    rrt_container = new RRTStar(start, stepSize);
    rrt_container.maxX = 2 * Math.PI;
    rrt_container.maxY = 2 * Math.PI;
    rrt_container.minX = 0;
    rrt_container.minY = 0;

    rrt_container.star = true;
    rrt_container.searchradius = 0.5;
    rrt_container.point_collides = (angles) => angles_2_to_collision(angles.x, angles.y);
    rrt_container.goal_reached = (angles) => {
        const copy = copy_arm(current_arm.arm);
        copy.segments[x_axis_index].angle = angles.x;
        copy.segments[y_axis_index].angle = angles.y;
        const tip = get_arm_tip_pos(copy);
        const dist = tip.sub(rrt_goal).magnitude;
        return dist < 0.5;
    }
    tip_trail.points = []
    state_trail.points = []
}



// Generate RRT* tree
const maxIterations = 1;

let last_valid_state: Arm = { segments: [], pos: v2.zero() };
export async function perform_rrt_mode_loop() {

    if (rrt_container.finished == false) {
        loss_highres_coord.clear()
        // draw tree
        rrt_container.drawtree(loss_highres_coord);
    }



    arm_coord.clear()
    // loss_highres_coord.clear()


    const state = new v2(mod(current_arm.arm.segments[x_axis_index].angle, (2 * Math.PI)), mod(current_arm.arm.segments[y_axis_index].angle, (2 * Math.PI)))
    loss_highres_coord.circle(state, 0.2, [255, 0, 0])

    handle_input()

    for (const o of obstacles) {
        o.draw(arm_coord, [0, 0, 0])
    }

    last_valid_state = copy_arm(current_arm.arm)


    const collided = angles_2_to_collision(current_arm.arm.segments[x_axis_index].angle, current_arm.arm.segments[y_axis_index].angle);

    if (collided) {
        current_arm.arm = collided ? copy_arm(last_valid_state) : current_arm.arm;
    }

    if (state_trail.update(state)) {
        tip_trail.update(get_arm_tip_pos(current_arm.arm))
    }
    tip_trail.draw(arm_coord, [128, 50, 128])
    state_trail.draw(loss_highres_coord, [255, 0, 0])

    arm_coord.circle(arm_tip_target, 0.5, [128, 50, 128])
    drawArm(arm_coord, current_arm.arm, collided ? [255, 0, 0] : [0, 0, 0]);
    await delay(10)

}

async function make_tree_slow() {
    while (rrt_container.finished == false) {

        if (input.LeftMouse && loss_heatmap_coord.mouse_within_bounds) {
            rrt_container.exploration_target = loss_heatmap_coord.last_mouse_pos;
            // rrt_container.go_to_target = true;
        } else {
            // rrt_container.exploration_target = rrt_goal;
            // rrt_container.go_to_target = false;
        }
        rrt_container.generateRRTStar(maxIterations);
        await delay(10)

        // run rrt for maxIterations steps
    }

    // rrt_container.finished = false;
    // // run a couple more after finishing
    // rrt_container.generateRRTStar(1000);
    // rrt_container.finished = true;

    // Draw the path
    const path = rrt_container.get_shortest_path();

    for (let i = 0; i < path.length - 1; i++) {
        const dir = angle_diff(path[i], path[i + 1])

        loss_highres_coord.line(path[i], path[i].add(dir), [255, 0, 0])
        loss_highres_coord.line(path[i + 1], path[i + 1].sub(dir), [255, 0, 0])
    }

}

const angles_2_to_collision = function (x: number, y: number) {
    const arm_copy = copy_arm(current_arm.arm)
    arm_copy.segments[x_axis_index].angle = x;
    arm_copy.segments[y_axis_index].angle = y;
    const arm_points = points_along_arm(arm_copy, 1.0)

    arm_points.sort((a, b) => Math.random() - 0.5) // randomize order

    let collided = false;
    for (const p of arm_points) {
        if (collided) {
            break;
        }
        // arm_coord.circle(p, 0.1, [0, 255, 0])
        for (const o of obstacles) {
            if (o.contains(p)) {
                collided = true;
                break;
            }
        }
    }
    return collided;
}