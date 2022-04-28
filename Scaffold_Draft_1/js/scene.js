// Scene contains the html canvas and context
// MOST IMPORTANTLY: it has the actual image being displayed
var Scene = Scene || {};

Scene.canvas = document.getElementById("canvas");
Scene.ctx = canvas.getContext("2d"); 

Scene.image = new Image(Scene.canvas.width, Scene.canvas.height, undefined);
