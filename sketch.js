var EPID = function(_p, _i, _d, _epsilon) {
  this.m_p = _p;
  this.m_i = _i;
  this.m_d = _d;
  this.m_errorEpsilon = _epsilon;
	this.m_desiredValue = 0;
	this.m_oldDesiredValue = 0;
	this.m_previousValue = 0;
	this.m_firstCycle = true;
	this.m_maxOutput = 100.0;
	this.m_errorSum = 0;
	this.m_errorIncrement = 1;
	this.m_cycleCount = 0;
	this.m_minCycleCount = 10;
  this.m_izone = 0;

  this.setConstants = function(_p, _i, _d) {
    this.m_p = _p;
	  this.m_i = _i;
	  this.m_d = _d;
  };
  this.setIzone = function(_izone) {
    this.m_izone = _izone;
  };
  this.setErrorEpsilon = function(_epsilon) {
    this.m_errorEpsilon = _epsilon;
  };
  this.setMaxOutput = function(_max) {
    this.m_maxOutput = _max;
  };
  this.setDesiredValue = function(_val) {
    this.m_desiredValue = _val;
  };
  this.resetErrorSum = function() {
    this.m_errorSum = 0;
  };
  this.calcPID = function(_currentValue) {
  	var pVal = 0.0;
  	var iVal = 0.0;
  	var dVal = 0.0;

  	// Don't apply D the first time through.
  	if (this.m_firstCycle) {
  		this.m_previousValue = _currentValue;  // Effective velocity of 0
  		this.m_firstCycle = false;
  	}

  	if (this.m_oldDesiredValue != this.m_desiredValue) {
  		this.m_firstCycle = true;
  	}

  	// Calculate P Component.
  	var error = this.m_desiredValue - _currentValue;
  	pVal = this.m_p * error;

  	// Calculate I Component.
  	// Error is positive and outside the epsilon band.
  	if (error >= this.m_errorEpsilon) {
  		// Check if epsilon was pushing in the wrong direction.
  		if (this.m_errorSum < 0) {
  			// If we are fighting away from the point, reset the error.
  			//m_errorSum = 0;
  		}
  		if (error < this.m_errorIncrement) {
  			// If the error is smaller than the max increment amount, add it.
  			this.m_errorSum += error;
  		} else {
  			// Otherwise, add the maximum increment per cycle.
  			this.m_errorSum += this.m_errorIncrement;
  		}
  	}
  	// Error is negative and outside the epsilon band.
  	else if (error <= -this.m_errorEpsilon) {
  		if (this.m_errorSum > 0) {
  			// If we are fighting away from the point, reset the error.
  			//m_errorSum = 0;
  		}
  		// error is small than max contribution -> just subtract error amount
  		if (error > -this.m_errorIncrement) {
  			// If the error is smaller than the max increment amount, add it.
  			this.m_errorSum += error; // Error is negative
  		} else {
  			// Otherwise, subtract the maximum increment per cycle.
  			this.m_errorSum -= this.m_errorIncrement;
  		}
  	}
  	// Error is inside the epsilon band.
  	else {
  		this.m_errorSum = 0;
  	}

  	if (this.m_izone !== 0 && fabs(error) > this.m_izone) {
  		this.m_errorSum = 0;
  	}
	   iVal = this.m_i * this.m_errorSum;

  	// Calculate D Component.
  	var velocity = ((_currentValue - this.m_previousValue) / 60) * 0.02;
  	if (!this.m_firstCycle) {
  		dVal = this.m_d * velocity;
  	} else {
  		dVal = 0;
  	}

	// Calculate and limit the ouput: Output = P + I - D
	var output = pVal + iVal - dVal;
	if (output > this.m_maxOutput) {
		output = this.m_maxOutput;
	} else if (output < -this.m_maxOutput) {
		output = -this.m_maxOutput;
	}

	// Save the current value for next cycle's D calculation.
	this.m_previousValue = _currentValue;
	this.m_oldDesiredValue = this.m_desiredValue;
	return output;
  };
};

var Vector = function(_x, _y) {
  this.x = _x;
  this.y = _y;
};

var Robot = function(_x, _y) {
  this.width = 50;
  this.height = 50;
  this.angle = 0;
  this.av = 0;
  this.cr = 40;
  this.cg = 90;
  this.cb = 164;
  this.centerX = this.width/2;
  this.centerY = this.height/2;
  this.d = new Vector(_x, _y);
  this.v = new Vector(0,0);
  this.a = new Vector(0,0);


  this.moveRobot = function() {
    this.d.x += this.v.x;
    this.d.y += this.v.y;
    this.v.x += this.a.x;
    this.v.y += this.a.y;

    this.angle += this.av;
  };

  this.drawRobot = function() {
    noStroke();
    fill(this.cr,this.cg,this.cb);
    //rect(this.d.x - this.centerX, this.d.y - this.centerY, this.width, this.height);
    stroke(this.cr,this.cg,this.cb);
    beginShape();
    vertex((this.width * Math.cos(deg2rad(this.angle + 45))) + this.d.x, (this.height * Math.sin(deg2rad(this.angle + 45))) + this.d.y);
    vertex((this.width * Math.cos(deg2rad(this.angle + 90 + 45))) + this.d.x, (this.height * Math.sin(deg2rad(this.angle + 90 + 45))) + this.d.y);
    vertex((this.width * Math.cos(deg2rad(this.angle + 180 + 45))) + this.d.x, (this.height * Math.sin(deg2rad(this.angle + 180 + 45))) + this.d.y);
    vertex((this.width * Math.cos(deg2rad(this.angle + 270 + 45))) + this.d.x, (this.height * Math.sin(deg2rad(this.angle + 270 + 45))) + this.d.y);
    endShape();
    this.moveRobot();
  };
};

var Goal = function(_x, _y) {
  this.x = _x;
  this.y = _y;

  this.draw = function(_rbt) {
    noStroke();
    fill(255,0,0);
    ellipse(this.x,this.y,10,10);
    stroke(255,0,0);
    line(_rbt.x, _rbt.y, this.x, this.y);
    stroke(0);
    line(_rbt.x, _rbt.y, this.x, _rbt.y);
    line(this.x, _rbt.y, this.x, this.y);
  };
};

var r;
var g;
var drivePIDX;
var drivePIDY;
var turnPID;
var DRIVE_P = 0.05;
var DRIVE_I = 0.00;
var DRIVE_D = 10;
var DRIVE_E = 1;
var TURN_P = 0.1;
var TURN_I = 0.01;
var TURN_D = 20;
var TURN_E = 1;

function setup() {
  createCanvas(windowWidth, windowHeight);
  r = new Robot(100,100);
  g = new Goal(400,600);
  drivePIDX = new EPID(DRIVE_P, DRIVE_I, DRIVE_D, DRIVE_E);
  drivePIDY = new EPID(DRIVE_P, DRIVE_I, DRIVE_D, DRIVE_E);
  turnPID = new EPID(TURN_P, TURN_I, TURN_D, TURN_E);

  drivePIDX.setMaxOutput(10);
  drivePIDY.setMaxOutput(10);
}

function draw() {
  background(200,200,200);
  r.drawRobot();
  //r.v.x = drivePID.calcPID(r.d.x);
  g.draw(r.d);
  var theta = rad2deg(Math.atan2(g.y - r.d.x, g.x - r.d.y));
  var c = pyth(g.x - r.d.x, g.y - r.d.y);
  var a = c * Math.cos(deg2rad(theta));
  var b = c * Math.sin(deg2rad(theta));
  simplePIDdrive(g.x, g.y, 0);
}

function simplePIDdrive(_x, _y, heading) {
  drivePIDX.setDesiredValue(_x);
  drivePIDY.setDesiredValue(_y);
  turnPID.setDesiredValue(heading);
  r.v.x = drivePIDX.calcPID(r.d.x);
  r.v.y = drivePIDY.calcPID(r.d.y);
  r.av = turnPID.calcPID(r.angle);

}

function rad2deg(_rad) {
    return _rad * (180/Math.PI);
}
function deg2rad(_deg) {
    return _deg * (Math.PI/180);
}

function pyth(_a, _b) {
  return Math.sqrt((Math.pow(_a, 2)) + (Math.pow(_b, 2)));
}

function windowResized () {
  resizeCanvas (windowWidth, windowHeight);
}
