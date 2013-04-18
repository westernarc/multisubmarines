/**************************************************
** GAME PLAYER CLASS
**************************************************/
var Player = function(startX, startY) {
	var x = startX,
		y = startY,
		id,
		moveAmount = 2;
	
	var radius = 25;	//Radius of contact for submarine
	var armor = 3;		//Armor represents hull integrity
	var angle = 0;		//Angle of submarine
	var subSize = 15;
	
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

	// Update player position
	var update = function(keys) {
		// Previous position
		var prevX = x,
			prevY = y;

		// Up key takes priority over down
		if (keys.up) {
			y -= moveAmount;
		} else if (keys.down) {
			y += moveAmount;
		};

		// Left key takes priority over right
		if (keys.left) {
			angle -= 0.1;
			x -= moveAmount;
		} else if (keys.right) {
			angle += 0.1;
			x += moveAmount;
		};

		return (prevX != x || prevY != y) ? true : false;
	};

	// Draw player
	var draw = function(ctx) {
		//ctx.fillRect(x-5, y-5, 10, 10);
		
		//Draw armor arc
		ctx.beginPath();
		ctx.arc(x,y,radius,0,2*Math.PI,false);	
		ctx.lineWidth = armor;
		ctx.closePath();
		ctx.stroke();
		
		//Draw sub
		ctx.beginPath();
		ctx.moveTo(x + Math.cos(angle + 0.2) * subSize, y + Math.sin(angle + 0.2) * subSize);
		ctx.lineTo(x + Math.cos(angle - 0.2) * subSize, y + Math.sin(angle - 0.2) * subSize);
		ctx.lineTo(x + Math.cos(angle + Math.PI + 0.2) * subSize, y + Math.sin(angle + Math.PI + 0.2) * subSize);
		ctx.lineTo(x + Math.cos(angle + Math.PI - 0.2) * subSize, y + Math.sin(angle + Math.PI - 0.2) * subSize);
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
		update: update,
		draw: draw
	}
};