const express = require('express');

const routerFactory = require('./router');
const tokenMiddlewareFactory = require('./token-middleware');

module.exports = (services) => {
	const {
		conf,
		logger,
	} = services;

	const app = express();

	app.use(tokenMiddlewareFactory(conf));

	app.use((req, res, next) => {
		Object.assign(req, services);
		return next();
	});

	app.use(express.json());

	app.use(routerFactory());

	if (process.env['NODE_ENV']) {
		app.use((err, req, res, next) => { // eslint-disable-line no-unused-vars
			services.logger.error({
				err,
			}, 'Error handler called.');
			return res.sendStatus(500);
		});
	} else {
		const errorhandler = require('errorhandler');

		app.use(errorhandler());
	}

	function listen() {
		const host = conf['HOST'];
		const port = conf['PORT'];

		return app.listen(port, host, () => {
			logger.info({
				host,
				port,
			}, 'Listening.');
		});
	}

	return {
		app,
		listen,
	};
};
