// Scene contains the html canvas and context
// MOST IMPORTANTLY: it has the actual image being displayed
var Scene = Scene || {};

Scene.canvas = document.getElementById("canvas");
Scene.ctx = canvas.getContext("2d"); 

Scene.canvas.width  = 300;
Scene.canvas.height = 300;

Scene.vecField = new Image(Scene.canvas.width, Scene.canvas.height, undefined, true);
Scene.colorField = new Image(Scene.canvas.width, Scene.canvas.height, undefined, false);
Scene.pressureField = new Pressurefield(Scene.canvas.width, Scene.canvas.height, undefined);
