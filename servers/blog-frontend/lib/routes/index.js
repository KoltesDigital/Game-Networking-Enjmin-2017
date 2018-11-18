const request = require('request');

module.exports = (router) => {
	router.get('/', (req, res, next) => {
		return request(req.conf['API_URL'] + '/messages', (err, response, body) => {
			if (err)
				return next(err);

			if (response.statusCode !== 200)
				return res.send502();

			return res.render('index', JSON.parse(body));
		});
	});
};
