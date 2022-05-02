// images defines our special image class that allows us
// to convert vectors (flow field) to colors which display
// on the screen.

//////////////////////////////////////////////////////////
// IMAGE
//////////////////////////////////////////////////////////

function Image(width, height, data, isVelocity) {
  this.width = width;
  this.height = height;
  this.data = data || this.createData(width, height);
  
  // if velocity field, vecs need 2 dimension
  // otherwise, vectors will be 4 dimensional
  this.isVelocity = isVelocity; 
}

Image.prototype.fill = function(vector) {
  for (var x = 0; x < this.width; x++) {
    for (var y = 0; y < this.height; y++) {
      this.setVector(x, y, vector);
    }
  }
};

Image.prototype.createData = function(width, height) {
  return new Uint8ClampedArray(width * height * 4);
};

Image.prototype.createImg = function(width, height) {
  var data = this.createData(width, height);
  // initial value of image is zero vectors
  for (var i = 0; i < data.length; i++) {
    data[i] = 0;
  }
  return new Image(width, height, data);
};

Image.prototype.copyImg = function() {
  var data = this.createData(this.width, this.height);

  for (var i = 0; i < data.length; i++) {
    data[i] = this.data[i];
  }
  return new Image(this.width, this.height, data);
};

Image.prototype.getImageData = function() {
  // this function should be this one-liner, but it only works in firefox and safari:
  // return new ImageData( this.data, this.width, this.height );

  // instead here is an ugly way to convert our data to ImageData object
  // this is a workaround because Chrome does not yet implement the constructor above
  var canvas = document.createElement("canvas");
  var ctx = canvas.getContext("2d");
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  var imageData = ctx.createImageData(this.width, this.height);
  imageData.data.set(this.data);
  return imageData;
};

// says how to index into the pixel data of the image to get to pixel (x, y)
Image.prototype.vectorIndex = function(x, y) {
  // if these are non-integers, indexing gets messed up
  y = Math.round(y);
  x = Math.round(x);
  return 4 * (y * this.width + x);
};

Image.prototype.getVector = function(x, y) {
  if (y < 0 || y >= this.height || x < 0 || x >= this.width) {
    if (this.isVelocity) return new THREE.Vector2(0, 0);
    return new THREE.Vector3(0, 0, 0);
  }

  var index = this.vectorIndex(x, y);

  var vector; 
  if (this.isVelocity) { // this is velocity field
    vector = new THREE.Vector2(
      this.data[index],
      this.data[index + 1]
    );
  } else { // this is color field
    vector = new THREE.Vector3(
      this.data[index] / 255, // red
      this.data[index + 1] / 255, // green
      this.data[index + 2] / 255 // blue
    );
  }
  return vector.clone();
};

// NOTE: color vectors must be in rgb colorspace
// TODO: assert here?
Image.prototype.setVector = function(x, y, vector) {
  if (y >= 0 && x >= 0 && y < this.height && x < this.width) {
    var index = this.vectorIndex(x, y);
    if (this.isVelocity) {
      this.data[index] = vector.x;
      this.data[index + 1] = vector.y;
      this.data[index + 2] = 0; // irrelevant for velocity field, set to 0 
      this.data[index + 3] = 255; // irrelevant for velocity field, set to 255 (alpha = 1)
    } else {
      this.data[index] = vector.x * 255; // red 
      this.data[index + 1] = vector.y * 255; // green
      this.data[index + 2] = vector.z * 255; // blue
      this.data[index + 3] = 255; // alpha 
    }
  }
};
