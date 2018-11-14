const chai = require('chai');
const chaiHttp = require('chai-http');
const redisLib = require('redis-mock');

const servicesFactory = require('../lib/services');
const appFactory = require('../lib/app');

chai.use(chaiHttp);

const services = servicesFactory({
	confOverrides: {
		'TOKEN_SECRET': 'keyboard cat',
	},
	redisLib,
});

const {
	app,
} = appFactory(services);

afterEach((done) => services.redis.flushall(done));

exports.app = app;
