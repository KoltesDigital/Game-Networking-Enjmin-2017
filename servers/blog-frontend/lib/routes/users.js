const request = require('request');

module.exports = (router) => {
	router.get('/users/:id', (req, res, next) => {
		const id = req.params.id;

		return request(req.conf['API_URL'] + '/users/' + id, (err, response, body) => {
			if (err)
				return next(err);

			if (response.statusCode !== 200)
				return res.send502();

			return res.render('user', {
				user: JSON.parse(body),
			});
		});
	});
};
