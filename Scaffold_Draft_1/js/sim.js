// Sim calls the methods in Fluid to update the image in Scene
var Sim = Sim || {};

var fluid;

Sim.init = function() {
    // The fluid being simulated.
    fluid = new Fluid(Scene.vecField, Scene.colorField, Scene.pressureField);
    Sim.update();
}

Sim.simulate = function() {
    fluid.advanceProgram();
    Sim.update();
}

Sim.update = function() {
    Scene.vecField = fluid.vecField.copyImg();
    Scene.colorField = fluid.colorField.copyImg();
    Scene.pressureField = fluid.pressureField.copyImg();
}