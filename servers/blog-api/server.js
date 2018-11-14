const redisLib = require('redis');

const servicesFactory = require('./lib/services');
const appFactory = require('./lib/app');

const services = servicesFactory({
	confOverrides: process.env,
	redisLib,
});

const {
	listen,
} = appFactory(services);

listen();
