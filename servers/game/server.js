const app = require('express')();
const http = require('http').Server(app);
const io = require('socket.io')(http);

const gameObjectPositionStates = {};

io.on('connection', (socket) => {
	let gameObjectPositionStatesInRoom;
	let ownGameObjectPositionStates;
	let channel = null;

	socket.on('disconnect', () => {
		if (!channel) return;
		for (let gameObjectId in ownGameObjectPositionStates) {
			io.to(channel).emit('destroy-game-object', socket.id, gameObjectId);
		}
		delete gameObjectPositionStatesInRoom[socket.id];
	});

	socket.on('join', (name) => {
		if (channel)
			socket.leave(channel);

		if (!name) return;

		socket.join(name);
		channel = name;

		gameObjectPositionStatesInRoom = gameObjectPositionStates[channel];
		if (!gameObjectPositionStatesInRoom)
			gameObjectPositionStatesInRoom = gameObjectPositionStates[channel] = {};

		for (let otherClientId in gameObjectPositionStatesInRoom) {
			const clientGameObjectPositionStates = gameObjectPositionStatesInRoom[otherClientId];
			for (let gameObjectId in clientGameObjectPositionStates) {
				io.to(channel).emit('create-game-object', otherClientId, gameObjectId, clientGameObjectPositionStates[gameObjectId]);
			}
		}

		ownGameObjectPositionStates = gameObjectPositionStatesInRoom[socket.id] = {};
	});

	socket.on('create-game-object', (gameObjectId, positionState) => {
		if (!channel) return;
		ownGameObjectPositionStates[gameObjectId] = positionState;
		io.to(channel).emit('create-game-object', socket.id, gameObjectId, positionState);
	});

	socket.on('destroy-game-object', (gameObjectId) => {
		if (!channel) return;
		delete ownGameObjectPositionStates[gameObjectId];

		io.to(channel).emit('destroy-game-object', socket.id, gameObjectId);
	});

	socket.on('synchronize-position', (gameObjectId, positionState) => {
		if (!channel) return;
		ownGameObjectPositionStates[gameObjectId] = positionState;
		io.to(channel).emit('synchronize-position', socket.id, gameObjectId, positionState);
	});
});

http.listen(80, () => {
	console.log('listening');
});
