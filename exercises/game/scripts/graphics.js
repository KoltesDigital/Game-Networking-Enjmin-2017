class Renderer extends Component {
	onAttach() {
		this._element = document.createElement('div');
		this._element.className = 'circle';
		document.body.appendChild(this._element);
	}

	onDetach() {
		this._element.remove();
	}

	update() {
		this._element.style.transform = 'translate(' + this.gameObject.x + 'px, ' + this.gameObject.y + 'px)';
	}
}
