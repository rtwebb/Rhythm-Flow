// Sim calls the methods in Fluid to update the image in Scene
var Sim = Sim || {};

var fluid;

Sim.init = function() {
    // The fluid being simulated.
    fluid = new Fluid(Scene.image);
    Sim.update();
}

Sim.simulate = function() {
    fluid.advanceProgramTest();
    Sim.update();
}

Sim.update = function() {
    Scene.image = fluid.vecField.copyImg();
}