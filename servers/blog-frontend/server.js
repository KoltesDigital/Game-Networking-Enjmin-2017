const servicesFactory = require('./lib/services');
const appFactory = require('./lib/app');

const services = servicesFactory({
	confOverrides: process.env,
});

const {
	listen,
} = appFactory(services);

listen();
