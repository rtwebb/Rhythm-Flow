//////////////////////////////////////////////////////////
// Constructor
//////////////////////////////////////////////////////////


// Initialize 2D velocity array - that stores 2D vector w/ x and y velocity 
    // Name = vecField
// Initialize q - velocity and color (2d array of dictionaries)) 
    // Name = q -> each new [] represents a new row and the commas represent consecutive column
    // let q = Array( [{'color': 4d vector, 'velocity': 2d vector}, {'color': 4d vector, 'velocity': 2d vector}] 
                    // [{'color': 4d vector, 'velocity': 2d vector}, {'color': 4d vector, 'velocity': 2d vector}])
// define constant deltaT - 30 FPS 1/30 
    // Name = deltaT
// global variable time - initialize to zero
    // Name = time
// global width and height - should come from image.js
// maybe pixel 




//////////////////////////////////////////////////////////
// Physics equations
//////////////////////////////////////////////////////////

// compute advection
Fluid.advection = function(){

}

// compute diffusion
Fluid.diffusion = function(coords, ){
    // Grabbing coordinates
    var x_left = new THREE.Vector2(Math.floor(coords.x - 1), Math.floor(coords.y));
    var x_right = new THREE.Vector2(Math.floor(coords.x + 1), Math.floor(coords.y));
    var x_top = new THREE.Vector2(Math.floor(coords.x), Math.floor(coords.y + 1));
    var x_bottom = new THREE.Vector2(Math.floor(coords.x), Math.floor(coords.y - 1));

    var q_velocity = q[coords.x][coords.y].velocity; 
    var alpha = Math.pow(q_velocity, 2) / time; // velocity is a 2d vector this will not work
    var b_lower = q_velocity; 
    var rbeta = 1 / (4 + Math.pow(q_velocity, 2)/time); // velocity is a 2d vector this will not work
    var result = (x_left + x_right + x_top + x_bottom + alpha * b_lower) * rbeta;



}


// compute divergence
Fluid.divergence = function(){

}


//////////////////////////////////////////////////////////
// Main to call all the functions
//////////////////////////////////////////////////////////

Fluid.advanceProgram = function(){
    // Steps   
    for (let x = 0; x < width; x++){
        for (let y = 0; y < height; y++){
            this.advection();
            
            for (let i = 0; i < 30; i++){
                this.diffusion();
            }
            
            // set pixel color
            
            this.divergence();
            // update velocity at given position 
        }
    }       
        
}

Fluid.timeStep = function(){

    // Probably have to change deltaT so it does not conflict with time it takes to update 
    for (let i = deltaT; deltaT < 40; i++){
        requestAnimationFrame(timeStep);
        time += deltaT;
    }
    advanceProgram();

}



Fluid.applyForces = function(){
    requestAnimationFrame(timeStep);
    // Initialize the array 

}

