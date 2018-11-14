const confFactory = require('./services/conf');
const loggerFactory = require('./services/logger');
const redisFactory = require('./services/redis');

module.exports = ({
	confOverrides,
	redisLib,
}) => {
	const logger = loggerFactory();
	const conf = confFactory(confOverrides);
	const redis = redisFactory(conf, redisLib);

	return {
		conf,
		logger,
		redis,
	};
};
