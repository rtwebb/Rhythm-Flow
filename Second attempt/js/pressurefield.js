// images defines our special image class that allows us
// to convert vectors (flow field) to colors which display
// on the screen.

//////////////////////////////////////////////////////////
// IMAGE
//////////////////////////////////////////////////////////

function Pressurefield(width, height, data) {
    this.width = width;
    this.height = height;
    this.data = data || this.createData(width, height);
  }
  
  Pressurefield.prototype.fill = function(pressure) {
    for (var x = 0; x < this.width; x++) {
      for (var y = 0; y < this.height; y++) {
        this.setPressure(x, y, pressure);
      }
    }
  };
  
  Pressurefield.prototype.createData = function(width, height) {
    return new Uint8ClampedArray(width * height);
  };
  
  Pressurefield.prototype.createImg = function(width, height) {
    var data = this.createData(width, height);
    // initial value of pressure is 0
    for (var i = 0; i < data.length; i++) {
      data[i] = 0;
    }
    return new Pressurefield(width, height, data);
  };
  
  Pressurefield.prototype.copyImg = function() {
    var data = this.createData(this.width, this.height);
  
    for (var i = 0; i < data.length; i++) {
      data[i] = this.data[i];
    }
    return new Pressurefield(this.width, this.height, data);
  };
  
  // says how to index into the pixel data of the image to get to pixel (x, y)
  Pressurefield.prototype.pressureIndex = function(x, y) {
    // if these are non-integers, indexing gets messed up
    y = Math.round(y);
    x = Math.round(x);
    return (y * this.width + x);
  };
  
  Pressurefield.prototype.getPressure = function(x, y) {
    if (y < 0 || y >= this.height || x < 0 || x >= this.width) {
      return 0;
    }
  
    var index = this.pressureIndex(x, y);
    var pressure = this.data[index];

    return pressure;
  };

  Pressurefield.prototype.setPressure = function(x, y, pressure) {
    if (y >= 0 && x >= 0 && y < this.height && x < this.width) {
      var index = this.pressureIndex(x, y);
      this.data[index] = pressure;
    }
  };
  