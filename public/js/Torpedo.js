/**************************************************
** TORPEDO CLASS
**************************************************/
var Torpedo = function(startX, startY, startAngle) {
	var x = startX,
		y = startY,
		id,
		moveAmount = 0.1;

	var radius = 3;	//Radius of contact for submarine
	var torpSize = 5;
	var angle = startAngle;	//Angle of submarine

	var speed = 0;
	var maxSpeed = 2;
	// Getters and setters
	var getX = function() {
		return x;
	};

	var getY = function() {
		return y;
	};

	var setX = function(newX) {
		x = newX;
	};

	var setY = function(newY) {
		y = newY;
	};

	var getAngle = function() {
		return angle;
	};
	
	var setAngle = function(newA) {
		angle = newA;
	};
	
	// Update player position
	var update = function() {
		//Make torpedo accelerate
		speed += moveAmount;
		if(speed > maxSpeed) {
			speed = maxSpeed;
		} else if(speed < 0) {
			speed = 0;
		}
		
		//Move the torpedo according to angle and speed
		if(speed != 0) {
			x += Math.cos(angle) * speed;
			y += Math.sin(angle) * speed;
		}
	};

	// Draw torpedo
	var draw = function(ctx) {
		//Draw sub
		ctx.beginPath();
		ctx.moveTo(x + Math.cos(angle + 0.1) * torpSize, y + Math.sin(angle + 0.1) * torpSize);
		ctx.lineTo(x + Math.cos(angle - 0.1) * torpSize, y + Math.sin(angle - 0.1) * torpSize);
		ctx.lineTo(x + Math.cos(angle + Math.PI + 0.1) * torpSize, y + Math.sin(angle + Math.PI + 0.1) * torpSize);
		ctx.lineTo(x + Math.cos(angle + Math.PI - 0.1) * torpSize, y + Math.sin(angle + Math.PI - 0.1) * torpSize);
		ctx.lineWidth = 1;
		ctx.closePath();
		ctx.stroke();
	};

	// Define which variables and methods can be accessed
	return {
		getX: getX,
		getY: getY,
		setX: setX,
		setY: setY,
		getAngle: getAngle,
		setAngle: setAngle,
		update: update,
		draw: draw
	}
};