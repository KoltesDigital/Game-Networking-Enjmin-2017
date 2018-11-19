class Component {
	constructor() {
		this.gameObject = null;
	}

	onAttach() {
		this._startTimeoutId = setTimeout(() => this.start());
	}

	onDetach() {
		clearTimeout(this._startTimeoutId);
	}

	start() {}
	update(dt) {}
}

class GameObject {
	constructor() {
		this._components = [];
		this.x = 0;
		this.y = 0;
	}

	addComponent(component) {
		if (!(component instanceof Component))
			return null;

		this._components.push(component);
		component.gameObject = this;
		component.onAttach();

		return component;
	}

	getComponent(componentClass) {
		for (let i = 0; i < this._components.length; ++i) {
			if (this._components[i] instanceof componentClass) {
				return this._components[i];
			}
		}
		return null;
	}

	removeComponent(componentClass) {
		for (let i = 0; i < this._components.length; ++i) {
			const component = this._components[i];
			if (component instanceof componentClass) {
				component.onDetach();
				component.gameObject = null;
				this._components.splice(i, 1);
				return component;
			}
		}
		return null;
	}

	removeComponents() {
		this._components.forEach((component) => {
			component.onDetach();
			component.gameObject = null;
		});
		this._components = [];
	}

	update(dt) {
		this._components.forEach((component) => component.update(dt));
	}
}

class Scene {
	constructor() {
		this._lastTime = Date.now() * 1e-3;
		this._gameObjects = [];
		this._nextGameObjectId = 1;
	}

	createGameObject() {
		const gameObject = new GameObject();
		this._gameObjects.push(gameObject);

		gameObject.id = this._nextGameObjectId.toString();
		++this._nextGameObjectId;

		return gameObject;
	}

	destroyGameObject(gameObject) {
		gameObject.removeComponents();

		const index = this._gameObjects.indexOf(gameObject);
		this._gameObjects.splice(index, 1);
	}

	update() {
		const time = Date.now() * 1e-3;
		const dt = time - this._lastTime;
		this._lastTime = time;

		this._gameObjects.forEach((gameObject) => gameObject.update(dt));
	}
}

const scene = new Scene();

{
	function _update() {
		requestAnimationFrame(_update);

		scene.update();
	}

	requestAnimationFrame(_update);
}
