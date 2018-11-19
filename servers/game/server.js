const app = require('express')();
const http = require('http').Server(app);
const io = require('socket.io')(http);

const gameObjectPositionStates = {};

io.on('connection', (socket) => {
	for (let otherClientId in gameObjectPositionStates) {
		const clientGameObjectPositionStates = gameObjectPositionStates[otherClientId];
		for (let gameObjectId in clientGameObjectPositionStates) {
			io.emit('create-game-object', otherClientId, gameObjectId, clientGameObjectPositionStates[gameObjectId]);
		}
	}

	const ownGameObjectPositionStates = gameObjectPositionStates[socket.id] = {};

	socket.on('disconnect', () => {
		for (let gameObjectId in ownGameObjectPositionStates) {
			io.emit('destroy-game-object', socket.id, gameObjectId);
		}
		delete gameObjectPositionStates[socket.id];
	});

	socket.on('join', (name) => {
		socket.join(name);
	});

	socket.on('create-game-object', (gameObjectId, positionState) => {
		ownGameObjectPositionStates[gameObjectId] = positionState;
		io.emit('create-game-object', socket.id, gameObjectId, positionState);
	});

	socket.on('destroy-game-object', (gameObjectId) => {
		delete ownGameObjectPositionStates[gameObjectId];

		io.emit('destroy-game-object', socket.id, gameObjectId);
	});

	socket.on('synchronize-position', (gameObjectId, positionState) => {
		ownGameObjectPositionStates[gameObjectId] = positionState;
		io.emit('synchronize-position', socket.id, gameObjectId, positionState);
	});
});

http.listen(80, () => {
	console.log('listening');
});
