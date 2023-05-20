const dropdown = document.getElementById('select_loss') as HTMLSelectElement;
const toggle_level_set = document.getElementById('toggle_level_set') as HTMLInputElement;

const slider_level_set_scale = document.getElementById("slider_level_set_scale") as HTMLInputElement;
const number_level_set_offset = document.getElementById("number_level_set_offset") as HTMLInputElement;
const x_axis_index_input = document.getElementById("x_axis_index") as HTMLInputElement;
const y_axis_index_input = document.getElementById("y_axis_index") as HTMLInputElement;
const arm_amount_input = document.getElementById("arm_amount") as HTMLInputElement;

toggle_level_set.addEventListener('change', function() {
  const isDisabled = !toggle_level_set.checked;
  slider_level_set_scale.disabled = isDisabled;
  number_level_set_offset.disabled = isDisabled;
  });


slider_level_set_scale.disabled =  true;
number_level_set_offset.disabled = true;


let level_set_offset = number_level_set_offset.valueAsNumber;

arm_amount_input.addEventListener("input", () => {
  const arm_amount = arm_amount_input.valueAsNumber;
  
  makeArm(arm_amount);
  

  x_axis_index_input.max = (arm_amount - 2).toString();
  y_axis_index_input.max = (arm_amount - 1).toString();
  if (x_axis_index > arm_amount - 2) {
    x_axis_index = arm_amount - 2;
    x_axis_index_input.value = x_axis_index.toString();
  }
  if (y_axis_index > arm_amount - 1) {
    y_axis_index = arm_amount - 1;
    y_axis_index_input.value = y_axis_index.toString();
  }

})


let x_axis_index = x_axis_index_input.valueAsNumber;
x_axis_index_input.addEventListener("input", () => {
  x_axis_index = x_axis_index_input.valueAsNumber;
  if (x_axis_index == y_axis_index) {
    y_axis_index = x_axis_index + 1;
    y_axis_index_input.value = y_axis_index.toString();
  }
})

let y_axis_index = y_axis_index_input.valueAsNumber;

y_axis_index_input.addEventListener("input", () => {
  y_axis_index = y_axis_index_input.valueAsNumber;
  if (x_axis_index == y_axis_index) {
    x_axis_index = y_axis_index - 1;
    x_axis_index_input.value = x_axis_index.toString();
  }
})

number_level_set_offset.addEventListener("input", () => {
  level_set_offset = number_level_set_offset.valueAsNumber;
})

let level_set_scale = slider_level_set_scale.valueAsNumber;
slider_level_set_scale.addEventListener("input", () => {
  level_set_scale = slider_level_set_scale.valueAsNumber;
})

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
      case "Match Y":
        current_loss_type = Loss.Match_Y
        break
      default:
        console.log("Error: unknown loss type: " + dropdown.value)
    }
    current_loss_func = Losses.get_loss(current_loss_type)
    current_loss_gradient = Losses.get_loss_gradient(current_loss_type)
  }
  )