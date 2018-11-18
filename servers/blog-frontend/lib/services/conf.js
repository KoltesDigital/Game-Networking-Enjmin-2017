module.exports = (overrides) => {
	const conf = Object.assign({
		'API_URL': null,
		'HOST': '0.0.0.0',
		'PORT': 80,
	}, overrides);

	[
		'API_URL',
	].forEach((property) => {
		if (!conf[property]) {
			throw new Error(property + ' should be set.');
		}
	});

	return conf;
};
