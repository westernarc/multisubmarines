/**************************************************
** GAME VARIABLES
**************************************************/
var canvas,			// Canvas DOM element
	ctx,			// Canvas rendering context
	keys,			// Keyboard input
	localPlayer,	// Local player
	remotePlayers,	// Remote players
	localTorpedos,  // Local torpedos
	remoteTorpedos, // Remote torpedos
	socket;			// Socket connection


/**************************************************
** GAME INITIALISATION
**************************************************/
function init() {
	// Declare the canvas and rendering context
	canvas = document.getElementById("gameCanvas");
	ctx = canvas.getContext("2d");

	// Maximise the canvas
	canvas.width = window.innerWidth;
	canvas.height = window.innerHeight;

	// Initialise keyboard controls
	keys = new Keys();

	// Calculate a random start position for the local player
	// The minus 5 (half a player size) stops the player being
	// placed right on the egde of the screen
	var startX = Math.round(Math.random()*(canvas.width-5)),
		startY = Math.round(Math.random()*(canvas.height-5));

	// Initialise the local player
	localPlayer = new Player(startX, startY, 0);
	
	// Initialise socket connection
	socket = io.connect("http://localhost", {port: 8000, transports: ["websocket"]});

	// Initialise remote players array
	remotePlayers = [];

	//Torpedo arrays
	localTorpedos = [];
	remoteTorpedos = [];
	
	// Start listening for events
	setEventHandlers();
};


/**************************************************
** GAME EVENT HANDLERS
**************************************************/
var setEventHandlers = function() {
	// Keyboard
	window.addEventListener("keydown", onKeydown, false);
	window.addEventListener("keyup", onKeyup, false);

	// Window resize
	window.addEventListener("resize", onResize, false);

	// Socket connection successful
	socket.on("connect", onSocketConnected);

	// Socket disconnection
	socket.on("disconnect", onSocketDisconnect);

	// New player message received
	socket.on("new player", onNewPlayer);

	// Player move message received
	socket.on("move player", onMovePlayer);

	// Player removed message received
	socket.on("remove player", onRemovePlayer);
	
	socket.on("new torpedo", onNewTorpedo);
	socket.on("move torpedo", onMoveTorpedo);
};

// Keyboard key down
function onKeydown(e) {
	if (localPlayer) {
		keys.onKeyDown(e);
	};
};

// Keyboard key up
function onKeyup(e) {
	if (localPlayer) {
		keys.onKeyUp(e);
	};
};

// Browser window resize
function onResize(e) {
	// Maximise the canvas
	canvas.width = window.innerWidth;
	canvas.height = window.innerHeight;
};

// Socket connected
function onSocketConnected() {
	console.log("Connected to socket server");

	// Send local player data to the game server
	socket.emit("new player", {x: localPlayer.getX(), y: localPlayer.getY(), angle: localPlayer.getAngle()});
};

// Socket disconnected
function onSocketDisconnect() {
	console.log("Disconnected from socket server");
};

// New player
function onNewPlayer(data) {
	console.log("New player connected: "+data.id);

	// Initialise the new player
	var newPlayer = new Player(data.x, data.y, data.angle);
	newPlayer.id = data.id;

	// Add new player to the remote players array
	remotePlayers.push(newPlayer);
};

// Move player
function onMovePlayer(data) {
	var movePlayer = playerById(data.id);

	// Player not found
	if (!movePlayer) {
		console.log("Player not found: "+data.id);
		return;
	};

	// Update player position
	movePlayer.setX(data.x);
	movePlayer.setY(data.y);
	movePlayer.setAngle(data.angle);
};

// Remove player
function onRemovePlayer(data) {
	var removePlayer = playerById(data.id);

	// Player not found
	if (!removePlayer) {
		console.log("Player not found: "+data.id);
		return;
	};

	// Remove player from array
	remotePlayers.splice(remotePlayers.indexOf(removePlayer), 1);
};

function onNewTorpedo(data) {
	var newTorpedo = new Torpedo(data.x, data.y, data.angle);
	newTorpedo.id = data.id;
	remoteTorpedos.push(newTorpedo);
};

function onMoveTorpedo(data) {
	var moveTorpedo = torpedoById(data.id);
	
	//If torpedo is not found
	if(!moveTorpedo) {
		console.log("Torpedo not found: " + data.id);
		return;
	};
	
	//update torpedo position
	moveTorpedo.setX(data.x);
	moveTorpedo.setY(data.y);
	moveTorpedo.setAngle(data.angle);
}
/**************************************************
** GAME ANIMATION LOOP
**************************************************/
function animate() {
	update();
	draw();

	// Request a new animation frame using Paul Irish's shim
	window.requestAnimFrame(animate);
};


/**************************************************
** GAME UPDATE
**************************************************/
function update() {
	// Update local player and check for change
	localPlayer.update(keys);
	//if (localPlayer.update(keys)) {
		// Send local player data to the game server
	socket.emit("move player", {x: localPlayer.getX(), y: localPlayer.getY(), angle: localPlayer.getAngle()});
	//};
	
	//Shot button is pressed, fire torpedo
	if(keys.z) {
		var newTorpedo = new Torpedo(localPlayer.getX(), localPlayer.getY(), localPlayer.getAngle() + (Math.random()-0.5)/3);
		localTorpedos.push(newTorpedo);
	}
	
	var i;
	for(i = 0; i < localTorpedos.length; i += 1) {
		localTorpedos[i].update();
		socket.emit("move torpedo", {x: localTorpedos[i].getX(), y: localTorpedos[i].getY(), angle: localTorpedos[i].getAngle()});
	}
};


/**************************************************
** GAME DRAW
**************************************************/
function draw() {
	// Wipe the canvas clean
	ctx.clearRect(0, 0, canvas.width, canvas.height);
	
	// Draw the local player
	ctx.strokeStyle = "rgba(0,0,0,1)";
	localPlayer.draw(ctx);
	drawInfo(ctx, localPlayer);
	
	//drawPlayer(localPlayer);
	// Draw the remote players
	var i;
	for (i = 0; i < remotePlayers.length; i++) {
		//Calculate distance between players
		var alpha = distToAlpha(remotePlayers[i].getX() - localPlayer.getX(), remotePlayers[i].getY() - localPlayer.getY());

		//Set color of draw depending on distance from player.
		//Other playes fade out as they grow farther
		ctx.strokeStyle = "rgba(0,0,0,"+ alpha.toString() +")";
		
		//Draw other player
		remotePlayers[i].draw(ctx);
		drawInfo(ctx, remotePlayers[i]);
	};
	
	//Draw local torpedos
	for (i = 0; i < localTorpedos.length; i++) {
		//Calculate distance between players
		var alpha = distToAlpha(localTorpedos[i].getX() - localPlayer.getX(), localTorpedos[i].getY() - localPlayer.getY());

		//Set color of draw depending on distance from player.
		//Other torpedos fade out as they grow farther
		ctx.strokeStyle = "rgba(0,0,0,"+ alpha.toString() +")";
		
		//Draw other torpedos
		localTorpedos[i].draw(ctx);
		//drawInfo(ctx, localTorpedos[i]);
	};
};

//Draw sub info
function drawInfo(ctx, player) {
	ctx.strokeText(Math.round(toDegrees(player.getAngle())), player.getX() + 25, player.getY() - 25);
	ctx.strokeText(Math.round(player.getX()), player.getX() + 25, player.getY() - 15);
	ctx.strokeText(Math.round(player.getY()), player.getX() + 25, player.getY() - 5);
}

/**************************************************
** GAME HELPER FUNCTIONS
**************************************************/
// Find player by ID
function playerById(id) {
	var i;
	for (i = 0; i < remotePlayers.length; i++) {
		if (remotePlayers[i].id == id)
			return remotePlayers[i];
	};
	return false;
};

//Torpedo by ID
function torpedoById(id) {
	var i;
	for(i = 0; i < torpedos.length; i++) {
		if(torpedos[i].id == id) {
			return torpedos[i];
		}
	};
	
	return false;
}

//Radians to degrees
function toDegrees(angle) {
	var degrees = angle * (180 / Math.PI) % 360;
	while(degrees < 0) degrees += 360;
	return degrees;
}

//Return an alpha value for a given distance
function distToAlpha(dx, dy) {
	var distance = getDistance(dx, dy);
	if(distance < 0) distance = -distance;
	var maxAlpha = 1;
	var minAlpha = 0.05;
	var maxDist = 40;
	
	var alpha = maxDist / distance;
	if(alpha > maxAlpha) alpha = maxAlpha;
	if(alpha < minAlpha) alpha = minAlpha;
	
	return alpha;
}

//Find approximate distance
//http://www.flipcode.com/archives/Fast_Approximate_Distance_Functions.shtml
function getDistance(dx, dy) {
	var min, max, dist;
	
	//Absolute values
	if(dx < 0) dx = -dx;
	if(dy < 0) dy = -dy;
	
	//Find min and max
	if(dx < dy) {
		min = dx;
		max = dy;
	} else {
		min = dy;
		max = dx;
	}
	
	dist = (max * 1007) + (min * 441);
	if(max < (min << 4)) dist -= (max * 40);
	
	return ((dist + 512) >> 10);
}