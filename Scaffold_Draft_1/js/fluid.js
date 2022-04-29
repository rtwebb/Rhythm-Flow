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

function Fluid(vecField, colorField, pressureField) {
    // Initialize 2D velocity array (vecField) - that stores 2D vector w/ x and y velocity 
    // Initialize q - velocity and color (2d array of dictionaries)) 
    // Name = q -> each new [] represents a new row and the commas represent consecutive column
    // let q = Array( [{'color': 4d vector, 'velocity': 2d vector}, {'color': 4d vector, 'velocity': 2d vector}] 
                    // [{'color': 4d vector, 'velocity': 2d vector}, {'color': 4d vector, 'velocity': 2d vector}])
    this.vecField = vecField.copyImg();
    this.colorField = colorField.copyImg();
    this.q = [];
    for (let y = 0; y < colorField.height; y++) {
        row_of_q_vals = []
        for (let x = 0; x < colorField.width; x++) {
            this.vecField.setVector(x, y, new THREE.Vector2(1,0)); // To the right
            // this.vecField.setVector(x, y, new THREE.Vector2(x,y));
            // this.vecField.setVector(x, y, new THREE.Vector2(Math.sin(2 * Math.PI * y), Math.sin(2 * Math.PI * x)));
            if (x < width / 2) {
                this.colorField.setVector(x, y, new THREE.Vector3(0, 0, 1)); // Blue
            } else {
                this.colorField.setVector(x, y, new THREE.Vector3(0, 1, 0)); // Green
            }
            
            row_of_q_vals.push({"color": new THREE.Vector4(), "velocity": THREE.Vector2(), "pressure": 0});
        }
        // store velocity in image 'r' = 'x velocity' //store velocity as image to help update the colors which are ultimately shown 
        this.q.push(row_of_q_vals);
    }
    
    this.pressureField = pressureField.copyImg();
}



//////////////////////////////////////////////////////////
// Physics equations
//////////////////////////////////////////////////////////

//start = starting coordinates
Fluid.prototype.interpolate = function(position, vecFlag){
    var coord1 = position.clone();

    //confine within grid
    // coord1.round()
    coord1.x = Math.min(coord1.x, width - 1);
    coord1.x = Math.max(coord1.x, 0.0);
    coord1.y = Math.min(coord1.y, height - 1);
    coord1.y = Math.max(coord1.y, 0.0);

    // calculating bounds
    let x1 = Math.floor(coord1.x);
    let x2 = Math.floor(coord1.x) + 1;
    let y2 = Math.floor(coord1.y) + 1;
    let y1 = Math.floor(coord1.y);

    // linear interpolation
    let val = 1 / ((x2 - x1) * (y2 - y1));
    let Q11;
    let Q12;
    let Q21;
    let Q22;

    if( vecFlag === true){
        Q11 = this.vecField.getVector(x1, y1).clone();     
        Q12 = this.vecField.getVector(x1, y2).clone();
        Q21 = this.vecField.getVector(x2, y1).clone();
        Q22 = this.vecField.getVector(x2, y2).clone();
    }else{
        Q11 = this.colorField.getVector(x1, y1).clone();     
        Q12 = this.colorField.getVector(x1, y2).clone();
        Q21 = this.colorField.getVector(x2, y1).clone();
        Q22 = this.colorField.getVector(x2, y2).clone();

    }

    var xValue = ( Q11.multiplyScalar( (x2 - coord1.x) * (y2 - coord1.y) ).add(
        Q21.multiplyScalar( (coord1.x - x1) * (y2 - coord1.y) ) ).add(
        Q12.multiplyScalar( (x2 - coord1.x) * (coord1.y - y1) ) ).add(
        Q22.multiplyScalar( (coord1.x - x1) * ( coord1.y - y1)) )).multiplyScalar(val);

    return xValue;
}

//1D or 2D field and q?
// compute advection
Fluid.prototype.advector = function(vecFlag){
    //negate current velocity,
    //interpolate
    var cpyImg = undefined;
    if(vecFlag === true){
        cpyImg = this.vecField.copyImg();
    }else{
        cpyImg = this.colorField.copyImg();
    }


    for(let x = 0; x < width; x++){
        for (let y = 0; y < height; y++){
            let coords = new THREE.Vector2(x, y);
            
            var uVelocity = this.vecField.getVector(coords.x, coords.y).clone();
            var prev = coords.clone().sub(uVelocity.multiplyScalar(deltaT));
        
            // interpolation
            var X = this.interpolate(prev, vecFlag);
        
            // Set image
            cpyImg.setVector(x, y, X);
        }
    }
    if(vecFlag == true){
        this.vecField = cpyImg;
    }else{
        this.colorField = cpyImg;
    }
}

Fluid.prototype.diffusionPressure = function(coords){
    var x_left = q[Math.floor(coords.x - 1)][Math.floor(coords.y)].pressure;
    var x_right = q[Math.floor(coords.x + 1)][Math.floor(coords.y)].pressure;
    var x_top = q[Math.floor(coords.x)][Math.floor(coords.y + 1)].pressure;
    var x_bottom = q[Math.floor(coords.x)][Math.floor(coords.y - 1)].pressure;

    var pressure = q[Math.floor(coords.x)][Math.floor(coords.y)].pressure;
    var alpha = -Math.pow(pressure, 2.0);
    var rBeta = 1/4;
    return (x_left + x_right + x_top + x_bottom + (alpha * pressure)) * rBeta; 

}


// return updated color to set into copy of q
Fluid.prototype.diffusionMath = function(coords){
    // Grabbing coordinates
    var x_left = this.vecField.getVector(Math.floor(coords.x - 1), Math.floor(coords.y)).clone();
    var x_right = this.vecField.getVector(Math.floor(coords.x + 1), Math.floor(coords.y)).clone(); 
    var x_top = this.vecField.getVector(Math.floor(coords.x), Math.floor(coords.y + 1)).clone();
    var x_bottom = this.vecField.getVector(Math.floor(coords.x), Math.floor(coords.y - 1)).clone();
    

    var q_velocity = this.vecField.getVector(Math.floor(coords.x), Math.floor(coords.y)).clone(); 
    var q_squared = q_velocity.clone().multiply(q_velocity);
    var alpha = q_squared.clone().divideScalar(time); // velocity^2 / time
    var alpha_b_lower = q_velocity.clone().multiply(alpha);  //alpha * b

    // 1 / (4 + x^2/t)
    var val = q_squared.clone().divideScalar(time).addScalar(4); 
    var rbeta = new THREE.Vector2(1/val.x, 1/val.y); 
   
    var result = (x_left.add(x_right).add(x_top).add(x_bottom).add(alpha_b_lower));
    return result.multiply(rbeta);

}

// compute diffusion
Fluid.prototype.diffusion = function(flag){
    // take copy of image 
    var cpyImg = this.vecField.copyImg();

    // call diffusionMath on each pixel and set results in copy of q
    for (let x = 0; x < width; x++){
        for (let y = 0; y < height; y++){
            let coords = new THREE.Vector2(x, y);
            if (flag !== true){
                let new_color = this.diffusionMath(coords);
                cpyImg.setVector(x, y, new_color);
            }
            else{
                let new_pressure = this.diffusionPressure(coords);
            }

        }
    }

    // set old Image to newImg
    this.vecField = cpyImg;
    //colorImg = cpyImg;
}

// compute divergence 
// 2 assumptions: 
// Zero Padding (off grid means 0 flow) 
// Gridsize = 1 (not exactly sure, but think this is more for GPUs)
Fluid.prototype.divergenceMath = function(coords){
    uTop = this.vecField.getVector(coords.x, coords.y + 1);
    uBot = this.vecField.getVector(coords.x, coords.y - 1);
    uLeft = this.vecField.getVector(coords.x - 1, coords.y);
    uRight = this.vecField.getVector(coords.x + 1, coords.y);

    xComponent = new THREE.Vector2().copy(uRight).sub(uLeft);
    yComponent = new THREE.Vector2().copy(uTop).sub(uBot);

    return new THREE.Vector2().copy(xComponent).add(yComponent).divideScalar(2);
}

Fluid.prototype.computePressure = function() {
    // take copy of image 
    var divergenceField = this.vecField.copyImg();

    // call divergenceMath on each vector and set results in copy of vecField
    for (let x = 0; x < width; x++){
        for (let y = 0; y < height; y++){
            let coords = new THREE.Vector2(x, y);
            let new_color = this.divergenceMath(coords);
            divergenceField.setVector(x, y, new_color);
        }
    }

    // Call Jacobi with x being pressure field and b being divergenceField
    for (let i = 0; i < 20; i++) {
        let cpyImg = this.pressureField.copyImg();
        for (let x = 0; x < width; x++){
            for (let y = 0; y < height; y++){
                let coords = new THREE.Vector2(x, y);
                // set alpha = -x^2
                let alpha = -Math.pow(this.pressureField.getPressure(x, y), 2);
                // set Beta = 4 so rBeta = 1/4
                let rBeta = 1/4;
                // let new_pressure = this.jacobi(coords, alpha, rBeta, this.pressureField, divergenceField);
                cpyImg.setPressure(x, y, new_pressure);
            }
        }
        this.pressureField = cpyImg;
    } 
}

// Version of Jacobi (A.K.A. Diffusion) which takes 
// coords, alpha, rBeta, x, and b as input. So that we 
// can use it for both diffusion and computing pressure

// grad subtract


//////////////////////////////////////////////////////////
// Main to call all the functions
//////////////////////////////////////////////////////////

Fluid.prototype.advanceProgram = function(){
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

    // debugger;

    //true meaning vector advection
    this.advector(true);

    // debugger;
    
    // for (let i = 0; i < 30; i++){
    //     this.diffusion();
    // }

    // debugger;

    console.log('animation step done');
    
    // set pixel color
    
    //this.computePressure();
    // update velocity at given position 

    //false meaning color advection not vector advection
    this.advector(false);

   
        
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


