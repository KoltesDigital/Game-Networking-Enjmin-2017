module.exports = (conf, redisLib) => {
	return redisLib.createClient({
		host: conf['REDIS_HOST'],
		port: conf['REDIS_PORT'],
		db: conf['REDIS_DB'],
	});
};
