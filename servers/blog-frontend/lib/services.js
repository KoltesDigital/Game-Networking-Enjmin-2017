const confFactory = require('./services/conf');
const loggerFactory = require('./services/logger');

module.exports = ({
	confOverrides,
}) => {
	const logger = loggerFactory();
	const conf = confFactory(confOverrides);

	return {
		conf,
		logger,
	};
};
