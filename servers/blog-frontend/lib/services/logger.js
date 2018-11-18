const bunyan = require('bunyan');

module.exports = () => {
	return bunyan.createLogger({
		name: 'api',
	});
};
