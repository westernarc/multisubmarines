/**************************************************
** NODE.JS REQUIREMENTS
**************************************************/
var util = require("util"),					// Utility resources (logging, object inspection, etc)
	io = require("socket.io"),				// Socket.IO
	Player = require("./Player").Player;	// Player class
var Torpedo = require("./Torpedo").Torpedo;	// Torpedo class

/**************************************************
** GAME VARIABLES
**************************************************/
var socket,		// Socket controller
	players;	// Array of connected players
var torpedos;	// Array of torpedos
	
/**************************************************
** GAME INITIALISATION
**************************************************/
function init() {
	// Create an empty array to store players
	players = [];
	
	//Create array to store torpedos;
	torpedos = [];

	// Set up Socket.IO to listen on port 8000
	socket = io.listen(8000);

	// Configure Socket.IO
	socket.configure(function() {
		// Only use WebSockets
		socket.set("transports", ["websocket"]);

		// Restrict log output
		socket.set("log level", 2);
	});

	// Start listening for events
	setEventHandlers();
};


/**************************************************
** GAME EVENT HANDLERS
**************************************************/
var setEventHandlers = function() {
	// Socket.IO
	socket.sockets.on("connection", onSocketConnection);
};

// New socket connection
function onSocketConnection(client) {
	util.log("New player has connected: "+client.id);

	// Listen for client disconnected
	client.on("disconnect", onClientDisconnect);

	// Listen for new player message
	client.on("new player", onNewPlayer);

	// Listen for move player message
	client.on("move player", onMovePlayer);
	
	// Listen for new torpedo
	client.on("new torpedo", onNewTorpedo);
	client.on("move torpedo", onMoveTorpedo);
};

// Socket client has disconnected
function onClientDisconnect() {
	util.log("Player has disconnected: "+this.id);

	var removePlayer = playerById(this.id);

	// Player not found
	if (!removePlayer) {
		util.log("Server: Remove: Player not found: "+this.id);
		return;
	};

	// Remove player from players array
	players.splice(players.indexOf(removePlayer), 1);

	// Broadcast removed player to connected socket clients
	this.broadcast.emit("remove player", {id: this.id});
};

// New player has joined
function onNewPlayer(data) {
	// Create a new player
	var newPlayer = new Player(data.x, data.y, data.angle);
	newPlayer.id = this.id;

	// Broadcast new player to connected socket clients
	this.broadcast.emit("new player", {id: newPlayer.id, x: newPlayer.getX(), y: newPlayer.getY(), angle: newPlayer.getAngle()});

	// Send existing players to the new player
	var i, existingPlayer;
	for (i = 0; i < players.length; i++) {
		existingPlayer = players[i];
		this.emit("new player", {id: existingPlayer.id, x: existingPlayer.getX(), y: existingPlayer.getY(), angle: existingPlayer.getAngle()});
	};
	
	// Add new player to the players array
	players.push(newPlayer);
	util.log("Pushed: " + newPlayer.id);
};

// Player has moved
function onMovePlayer(data) {
	// Find player in array
	var movePlayer = playerById(this.id);

	// Player not found
	if (!movePlayer) {
		util.log("Server: Move: Player not found: "+this.id);
		return;
	};

	// Update player position
	movePlayer.setX(data.x);
	movePlayer.setY(data.y);
	movePlayer.setAngle(data.angle);

	// Broadcast updated position to connected socket clients
	this.broadcast.emit("move player", {id: movePlayer.id, x: movePlayer.getX(), y: movePlayer.getY(), angle: movePlayer.getAngle()});
};

function onNewTorpedo(data) {
	var newTorpedo = new Torpedo(data.x, data.y, data.angle);
	newTorpedo.id = this.id;
	
	//On new torpedo received, send this new torpedo to all clients
	this.broadcast.emit("new torpedo", {id: newTorpedo.id, x: newTorpedo.getX(), y: newTorpedo.getY(), angle: newTorpedo.getAngle()});

	torpedos.push(newTorpedo);  //Add the torpedo to the server's torpedo list
}
function onMoveTorpedo(data) {
	var moveTorpedo = torpedoById(this.id);
	
	if(!moveTorpedo) {
		util.log("Server: Move: Torpedo not found: "+this.id);
		return;
	};
	
	moveTorpedo.setX(data.x);
	moveTorpedo.setY(data.y);
	moveTorpedo.setAngle(data.angle);
	
	this.broadcast.emit("move torpedo", {id: moveTorpedo.id, x: moveTorpedo.getX(), y: moveTorpedo.getY(), angle: moveTorpedo.getAngle()});
}

/**************************************************
** GAME HELPER FUNCTIONS
**************************************************/
// Find player by ID
function playerById(id) {
	var i;
	for (i = 0; i < players.length; i++) {
		if (players[i].id == id)
			return players[i];
	};
	
	return false;
};

function torpedoById(id) {
	var i;
	for(i = 0; i < torpedos.length; i++) {
		if(torpedos[i].id == id) {
			return torpedos[i];
		}
	};
	
	return false;
};

/**************************************************
** RUN THE GAME
**************************************************/
init();