"use strict";
var dropdown = document.getElementById('select_loss');
var toggle_level_set = document.getElementById('toggle_level_set');
var toggle_stay_in_level_set = document.getElementById('toggle_stay_in_level_set');
var slider_level_set_scale = document.getElementById("slider_level_set_scale");
var slider_level_set_offset = document.getElementById("slider_level_set_offset");
var level_set_offset = slider_level_set_offset.valueAsNumber;
slider_level_set_offset.addEventListener("input", function () {
    level_set_offset = slider_level_set_offset.valueAsNumber;
});
var level_set_scale = slider_level_set_scale.valueAsNumber;
slider_level_set_scale.addEventListener("input", function () {
    level_set_scale = slider_level_set_scale.valueAsNumber;
});
dropdown.addEventListener('change', function (event) {
    switch (dropdown.value) {
        case "L2 squared":
            current_loss_type = Loss.L2_squared;
            break;
        case "L2":
            current_loss_type = Loss.L2;
            break;
        case "L1":
            current_loss_type = Loss.L1;
            break;
        case "L1 squared":
            current_loss_type = Loss.L1_squared;
            break;
        case "Match Y":
            current_loss_type = Loss.Match_Y;
            break;
    }
    current_loss_func = Losses.get_loss(current_loss_type);
    current_loss_gradient = Losses.get_loss_gradient(current_loss_type);
});
