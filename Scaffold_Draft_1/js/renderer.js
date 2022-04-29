// Renderer initializes and controls how/when other files interact

var Renderer = Renderer || {};

// Displays the image based on vector components
Renderer.displayImage = function(image, offsetX, offsetY, noClear) {
    offsetX = offsetX || 0;
    offsetY = offsetY || 0;

    if (!noClear) {
        // NOTE: changing canvas dimensions clears it
        Scene.canvas.width = image.width + offsetX;
        Scene.canvas.height = image.height + offsetY;
    }
    Scene.ctx.putImageData(image.getImageData(), offsetX, offsetY);
};

Renderer.init = function() {
    Sim.init();
    Renderer.displayImage(Scene.colorField, undefined, undefined, true);
}

Renderer.clearDisplay = function() {
    Renderer.ctx.clearRect(0, 0, Scene.canvas.width, Scene.canvas.height);
};

Renderer.animate = function() {
    requestAnimationFrame(Renderer.animate);

    // Using realtime clocks leads to undesirable effects when simulation is
    // paused or slowed down
    // time = Date.now();
    time += SceneParams.deltaT; // equivalent to ~33 fps

    Sim.simulate();
    Renderer.displayImage(Scene.colorField, undefined, undefined, true);
}

// when HTML is finished loading, do this
window.onload = function() {
    Renderer.init();
    Renderer.animate();
}
