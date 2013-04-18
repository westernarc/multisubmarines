/**************************************************
** TORPEDO CLASS
**************************************************/
var Torpedo = function(startX, startY, startAngle) {
	var x = startX,
		y = startY,
		angle = startAngle,
		id;

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

	var setAngle = function(newA) {
		angle = newA;
	};
	
	var getAngle = function() {
		return angle;
	};
	
	// Define which variables and methods can be accessed
	return {
		getX: getX,
		getY: getY,
		setX: setX,
		setY: setY,
		getAngle: getAngle,
		setAngle: setAngle,
		id: id
	}
};

exports.Torpedo = Torpedo;