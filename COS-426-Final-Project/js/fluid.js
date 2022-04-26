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
    var x_left = new THREE.Vector2(Math.floor(coords.x - 1), Math.floor(coords.y)); // should these be velocities or positions
    var x_right = new THREE.Vector2(Math.floor(coords.x + 1), Math.floor(coords.y));
    var x_top = new THREE.Vector2(Math.floor(coords.x), Math.floor(coords.y + 1));
    var x_bottom = new THREE.Vector2(Math.floor(coords.x), Math.floor(coords.y - 1));

    var q_squared = q_velocity.clone().multiply(q_velocity);

    var q_velocity = q[coords.x][coords.y].velocity.clone(); 
    var alpha = q_squared.clone().divideScalar(time); // velocity^2 / time
    var alpha_b_lower = q_velocity.clone().multiply(alpha);  //alpha * b
    var val = q_squared.clone().divideScalar(time).addScalar(4); 
    var rbeta = new THREE.Vector2(1/val.x, 1/val.y); // not sure if I am taking the reciprocal right
    var result = (x_left.add(x_right).add(x_top).add(x_bottom).add(alpha_b_lower));
    return result.multiply(rbeta);

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

