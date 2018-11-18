const express = require('express');
const md = require('markdown-it')({
	linkify: true,
});

const routerFactory = require('./router');

module.exports = (services) => {
	const {
		conf,
		logger,
	} = services;

	const app = express();
	app.set('view engine', 'pug');

	app.locals.markdown = (src) => md.render(src);

	app.use((req, res, next) => {
		Object.assign(req, services);

		res.send502 = () => res.status(502).render('502');

		return next();
	});

	app.use(routerFactory());

	app.use(express.static('./static'));

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
