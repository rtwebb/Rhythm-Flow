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
    this.pressureField = pressureField.copyImg();
    for (let x = 0; x < colorField.width; x++) {
        for (let y = 0; y < colorField.height; y++) {
            this.vecField.setVector(x, y, new THREE.Vector2(Math.sin(2 * Math.PI * y), Math.sin(2 * Math.PI * x))); 
            this.colorField.setVector(x, y, new THREE.Vector3(0, 0, 1)); // Blue
            this.pressureField.setVector(x, y, 0);
        }
    }
    

}

Fluid.prototype.interpolate = function(position, img){
    var coord1 = position.clone();

    // bounding values of position
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
        
    let Q11 = img.getVector(x1, y1).clone();     
    let Q12 = img.getVector(x1, y2).clone();
    let Q21 = img.getVector(x2, y1).clone();
    let Q22 = img.getVector(x2, y2).clone();

    let p1 = Q11.multiplyScalar((x2 - coord1.x)).multiplyScalar((y2 - coord1.y));
    let p2 = Q21.multiplyScalar((coord1.x - x1)).multiplyScalar((y2 - coord1.y));
    let p3 = Q12.multiplyScalar((x2 - coord1.x)).multiplyScalar((coord1.y - y1));
    let p4 = Q22.multiplyScalar((coord1.x - x1)).multiplyScalar((coord1.y - y1));

    let p = p1.add(p2).add(p3).add(p4);

    return p.multiplyScalar(val);
    

}

Fluid.prototype.advection = function(flag){
    // true is vecField
    // false is colorField
    var cpyImg;
    if (flag)
        cpyImg = this.vecField.copyImg();
    else
        cpyImg = this.colorField.copyImg();

    var original = cpyImg.copyImg();

    for(let x = 0; x < width; x++){
        for (let y = 0; y < height; y++){
            let coords = new THREE.Vector2(x, y);

            var uVelocity = this.vecField.getVector(coords.x, coords.y);
            var prev = coords.clone().sub(uVelocity.clone().multiplyScalar(deltaT));
            var X = this.interpolate(prev, original);  // interpolation 
            cpyImg.setVector(x, y, X); // Set image
        }
    }

    if(flag)
        this.vecField = cpyImg;
    else
        this.colorField = cpyImg;
}

Fluid.prototype.divergenceMath = function(coords){
    var uRight = this.vecField.getVector(coords.x + 1, coords.y);
    var uLeft = this.vecField.getVector(coords.x - 1, coords.y);
    var uTop = this.vecField.getVector(coords.x, coords.y + 1);
    var uBottom = this.vecField.getVector(coords.x, coords.y - 1);

    var val = uRight.clone().sub(uLeft).add(uTop).sub(uBottom);
    return val.multiplyScalar(-2/deltaT);
}   

Fluid.prototype.divergence = function(){
    
    var divergenceField = this.vecField.copyImg();
    
    // iterating through image to find divergence
    for(let x = 0; x < width; x++){
        for(let y = 0; y < height; y++){
            let coords = new THREE.Vector2(x, y);
            var new_color = this.divergenceMath(coords);
            divergenceField.setVector(x, y, new_color);
        }   
    }

    // Call Jacobi with x being pressure field and b being divergenceField
    for (let i = 0; i < 20; i++) {
        let cpyImg = this.pressureField.copyImg();
        for (let x = 0; x < width; x++){
            for (let y = 0; y < height; y++){
                let coords = new THREE.Vector2(x, y);
                let divergence = divergenceField.getVector(coords.x, coords.y).clone();
                let pRight = this.pressureField.getPressure(Math.floor(coords.x + 2), Math.floor(coords.y));
                let pLeft = this.pressureField.getPressure(Math.floor(coords.x - 2), Math.floor(coords.y));
                let pTop = this.pressureField.getPressure(Math.floor(coords.x), Math.floor(coords.y + 2));
                let pBottom = this.pressureField.getPressure(Math.floor(coords.x), Math.floor(coords.y - 2));

                let val = divergence.addScalar(pRight).addScalar(pLeft).addScalar(pTop).addScalar(pBottom);
                let pressure = val.divideScalar(4);

                cpyImg.setVector(x, y, pressure);
            }
        }
        this.pressureField = cpyImg;
    } 
}

Fluid.prototype.subtract = function(){
    var cpyImg = this.vecField.copyImg();
    var cpyPressure = this.pressureField.copyImg();
    
    for(let x = 0; x < width; x++){
        for(let y = 0; y < height; y++){
            let u = this.vecField.getVector(x, y);
            let u_x = u.x - (deltaT/2) * (cpyPressure.getPressure((x + 1), y) - cpyPressure.getPressure((x -1), y)); 
            let u_y = u.y - (deltaT/2) * (cpyPressure.getPressure(x, (y+1)) - cpyPressure.getPressure(x, (y-1)));
            cpyImg.setVector(x, y, val)

        }
    }
}

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

    
    this.advection(true); // u_a := advect field u through itself
    this.divergence(); // d := calculate divergence of u_a
    this.calcPressure(); // p := calculate pressure based on d, using jacobi iteration
    this.subtract();                    // u := u_a - gradient of p
    this.advection(false); // c := advect field c through velocity field u
        
}


