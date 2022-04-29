// Sim calls the methods in Fluid to update the image in Scene
var Sim = Sim || {};

var fluid;

Sim.init = function() {
    // The fluid being simulated.
    fluid = new Fluid(Scene.image, Scene.pressureField);
    Sim.update();
}

Sim.simulate = function() {
    fluid.advanceProgram();
    Sim.update();
}

Sim.update = function() {
    Scene.image = fluid.vecField.copyImg();
    Scene.pressureField = fluid.pressureField.copyImg();
}