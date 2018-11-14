const {
	authenticated,
	schema,
} = require('../middlewares');

module.exports = (router) => {
	router.get('/users/:id', (req, res, next) => {
		const id = req.params.id;

		return req.redis.get('user:' + id, (err, json) => {
			if (err)
				return next(err);
			if (!json)
				return res.sendStatus(404);

			const user = JSON.parse(json);
			user.id = parseInt(id);

			return res.json(user);
		});
	});

	router.post('/users', schema('body', {
		properties: {
			name: {
				minLength: 1,
				type: 'string',
			},
		},
		required: [
			'name',
		],
	}), (req, res, next) => {
		return req.redis.incr('user-id-counter', (err, id) => {
			if (err)
				return next(err);

			return req.redis.multi()
				.sadd('user-ids', id)
				.set('user:' + id, JSON.stringify({
					name: req.body.name,
				}))
				.exec((err) => {
					if (err)
						return next(err);

					return res.status(201).send({
						id,
					});
				});
		});
	});

	router.put('/users/:id', authenticated, schema('body', {
		properties: {
			name: {
				minLength: 1,
				type: 'string',
			},
		},
		required: [
			'name',
		],
	}), (req, res, next) => {
		const id = parseInt(req.params.id);

		if (req.token.userId !== id)
			return res.sendStatus(403);

		return req.redis.set('user:' + id, JSON.stringify({
			name: req.body.name,
		}), (err) => {
			if (err)
				return next(err);

			return res.sendStatus(200);
		});
	});

	router.delete('/users/:id', authenticated, (req, res, next) => {
		const id = parseInt(req.params.id);

		if (req.token.userId !== id)
			return res.sendStatus(403);

		return req.redis.multi()
			.srem('user-ids', id)
			.del('user:' + id)
			.exec((err) => {
				if (err)
					return next(err);

				return res.sendStatus(200);
			});
	});
};
