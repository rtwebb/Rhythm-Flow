//////////////////////////////////////////////////////////
// Constructor
//////////////////////////////////////////////////////////
 
// define constant deltaT - 30 FPS 1/30 
const deltaT = 1/30
// global variable time - initialize to zero
var time = 0

// We don't have infrastructure to get these yet. For now, 
// I'm setting them to -1 until the constructor gets them.
var width = -1 
var height = -1

function Fluid(image) {
    // Initialize 2D velocity array (vecField) - that stores 2D vector w/ x and y velocity 
    // Initialize q - velocity and color (2d array of dictionaries)) 
    // Name = q -> each new [] represents a new row and the commas represent consecutive column
    // let q = Array( [{'color': 4d vector, 'velocity': 2d vector}, {'color': 4d vector, 'velocity': 2d vector}] 
                    // [{'color': 4d vector, 'velocity': 2d vector}, {'color': 4d vector, 'velocity': 2d vector}])
    this.vecField = [];
    this.q = [];
    for (let r = 0; r < image.height; r++) {
        row_of_vecs = []
        row_of_q_vals = []
        for (let c = 0; x < image.width; c++) {
            row_of_vecs.push(new THREE.Vector2());
            row_of_q_vals.push({"color": new THREE.Vector4(), "velocity": THREE.Vector2()});
        }
        this.vecField.push(row_of_vecs);
        this.q.push(row_of_q_vals);
    }

    // global width and height - should come from image.js
    width = image.width;
    height = image.height; 

    // maybe pixel 
}



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

// Get the element at this coord if in bounds, 
// otherwise return a zero vector
Fluid.zeroPadGetVec = function(x, y, field) {
    if (x < 0 || x >= width || y < 0 || y >= height) {
        if (field === Fluid.vecField) { // Checking if this is the vector field or the pressure field
            return new THREE.Vector2(0, 0);
        } else {
            return 0;
        }
    }
    // Need to do [y][x] because 2d arrays are [row][col]
    if (field === Fluid.vecField) { // If vector field, clone 2d vector
        return field[y][x].clone();
    } else { // else (pressure field) just return scalar
        return field[y][x];
    }
}

// compute divergence 
// 2 assumptions: 
// Zero Padding (off grid means 0 flow) 
// Gridsize = 1 (not exactly sure, but think this is more for GPUs)
Fluid.divergence = function(coords){
    uTop = Fluid.zeroPadGetVec(coords.x, coords.y + 1);
    uBot = Fluid.zeroPadGetVec(coords.x, coords.y - 1);
    uLeft = Fluid.zeroPadGetVec(coords.x - 1, coords.y);
    uRight = Fluid.zeroPadGetVec(coords.x + 1, coords.y);

    xComponent = new THREE.Vector2().copy(uRight).sub(uLeft);
    yComponent = new THREE.Vector2().copy(uTop).sub(uBot);

    return new THREE.Vector2().copy(xComponent).add(yComponent).divideScalar(2);
}

// Version of Jacobi (A.K.A. Diffusion) which takes 
// coords, alpha, rBeta, x, and b as input. So that we 
// can use it for both diffusion and computing pressure

// grad subtract


//////////////////////////////////////////////////////////
// Main to call all the functions
//////////////////////////////////////////////////////////

Fluid.advanceProgram = function(){
    // Steps   
    // Clayton Comment on Simulation Step: 
    // I think we're supposed to run these functions 
    // over the entire grid (i.e. advection on all vectors, then diffusion 
    // on all vectors, etc.) rather than one vector at a time (i.e. advection, 
    // diffusion, forces, projection on this vector, then the next vector, etc.). 

    for (let x = 0; x < width; x++){
        for (let y = 0; y < height; y++){
            coords = new THREE.Vector2(x, y); 
            this.advection();
            
            for (let i = 0; i < 30; i++){
                this.diffusion();
            }
            
            // set pixel color
            
            this.divergence(coords);
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
