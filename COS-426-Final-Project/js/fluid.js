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
        // store velocity in image 'r' = 'x velocity' //store velocity as image to help update the colors which are ultimately shown 
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

//start = starting coordinates
Fluid.interpolate = function(X){
    var coord1 = X.clone();
    var coord2 = new THREE.Vector2(0,0);
    var coord3 = new THREE.Vector2(0,0);
    var coord4 = new THREE.Vector2(0,0);

    //confine within grid
    coord1.round()
    coord1.x = Math.min(coord1.x, width - 1);
    coord1.x = Math.max(coord1.x, 0.0);
    coord1.y = Math.min(coord1.y, height - 1);
    coord1.y = Math.max(coord1.y, 0.0);

    //Define offsets
    var offset1;
    var offset2;
    var offset3;

    //top right corner
    if(start.x == width - 1 && start.y == 0){
        offset1 = new THREE.Vector2(-1, 0);
        offset2 = new THREE.Vector2(0, -1);
        offset3 = new THREE.Vector2(-1, -1);
    }
    //rightmost column
    else if(start.x == width - 1){
        offset1 = new THREE.Vector2(-1, 0);
        offset2 = new THREE.Vector2(0, 1);
        offset3 = new THREE.Vector2(-1, 1);
    //top row
    }else if(start.y == 0){
        offset1 = new THREE.Vector2(1, 0);
        offset2 = new THREE.Vector2(0, -1);
        offset3 = new THREE.Vector2(1, -1);
    //always left and down , wonder how this might change if went right and up
    }else{
        offset1 = new THREE.Vector2(1, 0);
        offset2 = new THREE.Vector2(0, 1);
        offset3 = new THREE.Vector2(1, 1)
    }

    //compute 3 nearest coords
    coord2.addVectors(start, offset1);
    coord3.addVectors(start, offset2);
    coord4.addVectors(start, offset3);

    var x1 = coord1.x;
    var y1 = coord1.y;
    var x2 = coor4.x;
    var y2 = coord4.y;

    //velocity?
    //Bilinear interpolation
    xValue = ( field[coord1.x][coord1.y].clone().multiplyScalar( (x2 - X.x) * (y2 - X.y) ).add(
                field[coord2.x][coord2.y].clone().multiplyScalar( (X.x - x1) * (y2 - X.y) ) ).add(
                field[coord3.x][coord3.y].clone().multiplyScalar( (x2 - X.x) * (X.y - y1) ) ).add(
                field[coord4.x][coord4.y].clone().multiplyScalar( (X.x - x1) * ( X.y - y1)) )).multipleScalar( 1 / ((x2 - x1) * (y2 - y1)) );

    return xValue;


}

//1D or 2D field and q?
// compute advection
Fluid.advection = function(coords, deltaT){
    //negate current velocity,
    //interpolate
    var uVelocity = vecField[coords.x][coords.y];
    var negated = uVelocity.negate();
    var prev = negated.multiplyScalar(deltaT);

    var X = this.interpolate(prev);

    //updateing q or velocity?
    q[coords.x][coords.y] = q[X.x][X.y];

}

// return updated color to set into copy of q
Fluid.diffusionMath = function(coords){
    // Grabbing coordinates
    var x_left = q[Math.floor(coords.x - 1)][Math.floor(coords.y)].velocity.clone();
    var x_right = q[Math.floor(coords.x + 1)][Math.floor(coords.y)].velocity.clone();
    var x_top = q[Math.floor(coords.x)][Math.floor(coords.y + 1)].velocity.clone();
    var x_bottom = q[Math.floor(coords.x)][Math.floor(coords.y - 1)].velocity.clone();

    var q_squared = q_velocity.clone().multiply(q_velocity);

    var q_velocity = q[coords.x][coords.y].velocity.clone(); 
    var alpha = q_squared.clone().divideScalar(time); // velocity^2 / time
    var alpha_b_lower = q_velocity.clone().multiply(alpha);  //alpha * b
    var val = q_squared.clone().divideScalar(time).addScalar(4); 
    var rbeta = new THREE.Vector2(1/val.x, 1/val.y); // not sure if I am taking the reciprocal right
    var result = (x_left.add(x_right).add(x_top).add(x_bottom).add(alpha_b_lower));
    return result.multiply(rbeta);

}

// compute diffusion
Fluid.diffusion = function(colorImg, ){
    // take copy of image 

    // call diffusionMath on each pixel and set results in copy of q
    for (let x = 0; x < width; x++){
        for (let y = 0; y < height; y++){
            let coords = new THREE.Vector2(x, y);
            let new_color = this.diffusionMath(coords);
            cpyImg.setPixel(x, y, new_color);
        }
    }

    // set old Image to newImg
    colorImg = cpyImg;
    

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

    // one equation to do update question 
        // that gets called across the image 
        // do not overwrite old values 
        // after calling for every pixel update the whole image 

    // var Img = image
    // do whole field not just x and y 
    for (let x = 0; x < width; x++){
        for (let y = 0; y < height; y++){
            coords = new THREE.Vector2(x, y); 
            this.advection();
            
            for (let i = 0; i < 30; i++){
                // send a copy of q 
                this.diffusion(); // send image of colors and then grab the new image and set image to that and then send that into diffusion
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
