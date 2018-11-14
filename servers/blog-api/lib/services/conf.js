module.exports = (overrides) => {
	const conf = Object.assign({
		'HOST': '0.0.0.0',
		'PORT': 80,
		'REDIS_DB': 0,
		'REDIS_HOST': 'redis',
		'REDIS_PORT': 6379,
		'TOKEN_DURATION': '15m',
		'TOKEN_SECRET': null,
	}, overrides);

	[
		'TOKEN_SECRET',
	].forEach((property) => {
		if (!conf[property]) {
			throw new Error(property + ' should be set.');
		}
	});

	return conf;
};
