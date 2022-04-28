// images defines our special image class that allows us
// to convert vectors (flow field) to colors which display
// on the screen.

//////////////////////////////////////////////////////////
// IMAGE
//////////////////////////////////////////////////////////

function Image(width, height, data) {
  this.width = width;
  this.height = height;
  this.data = data || this.createData(width, height);
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
  // initial value of image is white and fully opaque
  for (var i = 0; i < data.length; i++) {
    data[i] = 255;
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
    return new THREE.Vector2(0, 0);
  }

  var index = this.vectorIndex(x, y);
  var vector = new THREE.Vector2(
    this.data[index] / 255,
    this.data[index + 1] / 255
  );
  return vector;
};

// NOTE: pixel must be in rgb colorspace
// TODO: assert here?
Image.prototype.setVector = function(x, y, vector) {
  if (y >= 0 && x >= 0 && y < this.height && x < this.width) {
    var index = this.vectorIndex(x, y);
    this.data[index] = vector.x * 255;
    this.data[index + 1] = vector.y * 255;
    this.data[index + 2] = 0 * 255; // set blue comp to 0
    this.data[index + 3] = 1 * 255; // set alpha to 1
  }
};
