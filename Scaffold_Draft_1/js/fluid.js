// Fluid is the actual math being done
// Also contains global time variable!!!

//////////////////////////////////////////////////////////
// Constructor
//////////////////////////////////////////////////////////
 
// define constant deltaT - 30 FPS 1/30 
const deltaT = SceneParams.deltaT;

// Global Vars for Ease of Use
var time = 0
var width = Scene.canvas.width;
var height = Scene.canvas.height;

function Fluid(image) {
    // Initialize 2D velocity array (vecField) - that stores 2D vector w/ x and y velocity 
    // Initialize q - velocity and color (2d array of dictionaries)) 
    // Name = q -> each new [] represents a new row and the commas represent consecutive column
    // let q = Array( [{'color': 4d vector, 'velocity': 2d vector}, {'color': 4d vector, 'velocity': 2d vector}] 
                    // [{'color': 4d vector, 'velocity': 2d vector}, {'color': 4d vector, 'velocity': 2d vector}])
    this.vecField = image.copyImg();
    this.q = [];
    for (let y = 0; y < image.height; y++) {
        row_of_q_vals = []
        for (let x = 0; x < image.width; x++) {
            this.vecField.setVector(x, y, new THREE.Vector2(0,0));
            row_of_q_vals.push({"color": new THREE.Vector4(), "velocity": THREE.Vector2()});
        }
        // store velocity in image 'r' = 'x velocity' //store velocity as image to help update the colors which are ultimately shown 
        this.q.push(row_of_q_vals);
    }
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
    var uVelocity = this.vecField.getVector(coords.x, coords.y);
    var negated = uVelocity.negate();
    var prev = negated.multiplyScalar(deltaT);

    var X = this.interpolate(prev);

    //updateing q or velocity?
    q[coords.x][coords.y] = q[X.x][X.y];

}

// return updated color to set into copy of q
Fluid.diffusionMath = function(coords){
    // Grabbing coordinates
    var x_left = this.vecField.getVector(Math.floor(coords.x - 1), Math.floor(coords.y)).clone();
    var x_right = this.vecField.getVector(Math.floor(coords.x + 1), Math.floor(coords.y)).clone(); 
    var x_top = this.vecField.getVector(Math.floor(coords.x), Math.floor(coords.y + 1)).clone();
    var x_bottom = this.vecField.getVector(Math.floor(coords.x), Math.floor(coords.y - 1)).clone();
    

    var q_velocity = this.vecField.getVector(Math.floor(coords.x), Math.floor(coords.y)).clone(); 
    var q_squared = q_velocity.clone().multiply(q_velocity);
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
    var cpyImg = this.vecField.copyImg();

    // call diffusionMath on each pixel and set results in copy of q
    for (let x = 0; x < width; x++){
        for (let y = 0; y < height; y++){
            let coords = new THREE.Vector2(x, y);
            let new_color = this.diffusionMath(coords);
            cpyImg.setPixel(x, y, new_color);
        }
    }

    // set old Image to newImg
    //colorImg = cpyImg;
}

// compute divergence 
// 2 assumptions: 
// Zero Padding (off grid means 0 flow) 
// Gridsize = 1 (not exactly sure, but think this is more for GPUs)
Fluid.divergence = function(coords){
    uTop = this.fieldVec.getVector(coords.x, coords.y + 1);
    uBot = this.fieldVec.getVector(coords.x, coords.y - 1);
    uLeft = this.fieldVec.getVector(coords.x - 1, coords.y);
    uRight = this.fieldVec.getVector(coords.x + 1, coords.y);

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


    // do whole field not just x and y 
    for (let x = 0; x < width; x++){
        for (let y = 0; y < height; y++){
            coords = new THREE.Vector2(x, y); 
            this.advection();
            
            for (let i = 0; i < 30; i++){
                // send a copy of q 
                this.diffusion();
            }
            
            // set pixel color
            
            this.divergence(coords);
            // update velocity at given position 
        }
    }       
        
}

Fluid.prototype.advanceProgramTest = function(){
    var r = 1;
    var g = 0;

    if (Math.round(time) % 2 == 0) {
        r = 0;
        g = 1;
    }

    for (let x = 0; x < width; x++) {
        for (let y = 0; y < height; y++) {
            this.vecField.setVector(x, y, new THREE.Vector2(r, g));
        }
    }
}


