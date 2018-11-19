const socket = io('https://game.enjmin.koltes.digital');

let network;

{
	const _synchronizePositionSubscribers = [];
	const _synchronizedGameObjects = {};

	socket.on('create-game-object', function (clientId, gameObjectId, positionState) {
		if (clientId !== socket.id) {
			const gameObject = scene.createGameObject(gameObjectId);
			_synchronizedGameObjects[clientId + '/' + gameObjectId] = gameObject;

			gameObject.addComponent(new Renderer());

			const networkSynchronization = gameObject.addComponent(new NetworkSynchronization());
			networkSynchronization.ownerId = clientId;
			networkSynchronization.ownerGameObjectId = gameObjectId;
			networkSynchronization.setPosition(positionState);
		}
	});

	socket.on('destroy-game-object', function (clientId, gameObjectId) {
		if (clientId !== socket.id) {
			const gameObject = _synchronizedGameObjects[clientId + '/' + gameObjectId];
			if (gameObject) {
				scene.destroyGameObject(gameObject);
				delete _synchronizedGameObjects[clientId + '/' + gameObjectId];
			}
		}
	});

	socket.on('synchronize-position', function (clientId, gameObjectId, positionState) {
		_synchronizePositionSubscribers.forEach((subscriber) => {
			if (subscriber.clientId === clientId &&
				subscriber.gameObjectId === gameObjectId) {
				subscriber.handler(positionState);
			}
		});
	});

	network = {
		subscribeTransformEvent: (clientId, gameObjectId, handler) => {
			_synchronizePositionSubscribers.push({
				clientId,
				gameObjectId,
				handler,
			});
		},

		unsubscribeTransformEvent: (clientId, gameObjectId, handler) => {
			for (let i = 0; i < _synchronizePositionSubscribers.length; ++i) {
				const subscriber = _synchronizePositionSubscribers[i];
				if (subscriber.clientId === clientId &&
					subscriber.gameObjectId === gameObjectId &&
					subscriber.handler === handler) {
					_synchronizePositionSubscribers.splice(i, 1);
					return true;
				}
			}
			return false;
		},
	};
}

class NetworkSynchronization extends Component {
	constructor() {
		super();

		this._intervalId = null;
		this.ownerId = null;
		this.ownerGameObjectId = null;

		this._setPositionHandler = (positionState) => {
			this.setPosition(positionState);
		};
	}

	onDetach() {
		super.onDetach();

		if (this.isOwner()) {
			socket.emit('destroy-game-object', this.gameObject.id);
			clearInterval(this._intervalId);
		} else {
			network.unsubscribeTransformEvent(this.ownerId, this.ownerGameObjectId, this._setPositionHandler);
		}
	}

	isOwner() {
		return this.ownerId === null;
	}

	start() {
		if (this.isOwner()) {
			socket.emit('create-game-object', this.gameObject.id, this.getPositionState());

			this._intervalId = setInterval(() => {
				socket.emit('synchronize-position', this.gameObject.id, this.getPositionState());
			}, 500);
		} else {
			network.subscribeTransformEvent(this.ownerId, this.ownerGameObjectId, this._setPositionHandler);
		}
	}

	getPositionState() {
		return {
			x: this.gameObject.x,
			y: this.gameObject.y,
		};
	}

	setPosition(positionState) {
		this.gameObject.x = positionState.x;
		this.gameObject.y = positionState.y;
	}
}
