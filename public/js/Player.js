/**************************************************
** GAME PLAYER CLASS
**************************************************/
var Player = function(startX, startY, startAngle) {
	var x = startX,
		y = startY,
		id,
		moveAmount = 0.1;

	var radius = 25;	//Radius of contact for submarine
	var armor = 3;		//Armor represents hull integrity
	var angle = startAngle;	//Angle of submarine
	var subSize = 15;	//Size of the submarine.  Defines radius withing a rectangle
						//will be circumscribed
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
	var update = function(keys) {
		// Previous position
		var prevX = x,
			prevY = y,
			prevAngle = angle;

		// Up key takes priority over down
		if (keys.up) {
			speed += moveAmount;
		} else if (keys.down) {
			speed -= moveAmount;
		};

		// Left key takes priority over right
		if (keys.left) {
			angle -= 0.1;
			//x -= moveAmount;
		} else if (keys.right) {
			angle += 0.1;
			//x += moveAmount;
		};
		
		if(speed > maxSpeed) {
			speed = maxSpeed;
		} else if(speed < 0) {
			speed = 0;
		}
		//Move the submarine according to angle and speed
		if(speed != 0) {
			x += Math.cos(angle) * speed;
			y += Math.sin(angle) * speed;
		}		
		
		return (prevX != x || prevY != y || prevAngle != angle) ? true : false;
	};

	// Draw player
	var draw = function(ctx) {
		//Draw armor arc
		ctx.beginPath();
		ctx.arc(x,y,radius,0,2*Math.PI,false);	
		ctx.lineWidth = armor;
		ctx.closePath();
		ctx.stroke();
		
		//Draw sub
		ctx.beginPath();
		ctx.moveTo(x + Math.cos(angle + 0.1) * subSize, y + Math.sin(angle + 0.1) * subSize);
		ctx.lineTo(x + Math.cos(angle - 0.1) * subSize, y + Math.sin(angle - 0.1) * subSize);
		ctx.lineTo(x + Math.cos(angle - Math.PI/2) * subSize / 3, y + Math.sin(angle - Math.PI/2) * subSize/3);
		ctx.lineTo(x + Math.cos(angle + Math.PI + 0.1) * subSize, y + Math.sin(angle + Math.PI + 0.1) * subSize);
		ctx.lineTo(x + Math.cos(angle + Math.PI - 0.1) * subSize, y + Math.sin(angle + Math.PI - 0.1) * subSize);
		ctx.lineTo(x + Math.cos(angle + Math.PI/2) * subSize / 3, y + Math.sin(angle + Math.PI/2) * subSize/3);
		ctx.lineWidth = 1;
		ctx.closePath();
		ctx.stroke();
		
		//Draw direction
		ctx.beginPath();
		ctx.moveTo(x,y);
		ctx.lineTo(x + Math.cos(angle) * 45, y + Math.sin(angle) * 45);
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