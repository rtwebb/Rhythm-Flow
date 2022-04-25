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
// global width and height




//////////////////////////////////////////////////////////
// Physics equations
//////////////////////////////////////////////////////////

// compute advection
Fluid.advection = function(){

}

// compute diffusion
Fluid.diffusion = function(){

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
            this.diffusion();
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
    }
    advanceProgram();

}



Fluid.applyForces = function(){
    requestAnimationFrame(timeStep);
    // Initialize the array 

}

