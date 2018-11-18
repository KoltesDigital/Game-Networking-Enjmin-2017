module.exports = (router, {
	middlewares,
	services,
}) => {
	router.get('/users/:id',
		(req, res, next) => {
			const id = req.params.id;

			return services.redis.get('user:' + id, (err, json) => {
				if (err)
					return next(err);
				if (!json)
					return res.sendStatus(404);

				const user = JSON.parse(json);
				user.id = parseInt(id);

				return res.json(user);
			});
		});

	router.post('/users',
		middlewares.schema('body', {
			properties: {
				name: {
					minLength: 1,
					type: 'string',
				},
			},
			required: [
				'name',
			],
		}),
		(req, res, next) => {
			return services.redis.incr('user-id-counter', (err, id) => {
				if (err)
					return next(err);

				return services.redis.multi()
					.sadd('user-ids', id)
					.set('user:' + id, JSON.stringify({
						name: req.body.name,
					}))
					.exec((err) => {
						if (err)
							return next(err);

						return res.status(201).json({
							id,
						});
					});
			});
		});

	router.put('/users/:id',
		middlewares.checkToken,
		middlewares.authenticated,
		middlewares.schema('body', {
			properties: {
				name: {
					minLength: 1,
					type: 'string',
				},
			},
			required: [
				'name',
			],
		}),
		(req, res, next) => {
			const id = parseInt(req.params.id);

			if (req.token.userId !== id)
				return res.sendStatus(403);

			return services.redis.set('user:' + id, JSON.stringify({
				name: req.body.name,
			}), (err) => {
				if (err)
					return next(err);

				return res.sendStatus(200);
			});
		});

	router.delete('/users/:id',
		middlewares.checkToken,
		middlewares.authenticated,
		(req, res, next) => {
			const id = parseInt(req.params.id);

			if (req.token.userId !== id)
				return res.sendStatus(403);

			return services.redis.multi()
				.srem('user-ids', id)
				.del('user:' + id)
				.exec((err) => {
					if (err)
						return next(err);

					return res.sendStatus(200);
				});
		});
};
