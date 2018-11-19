module.exports = (router, {
	middlewares,
	services,
}) => {
	router.get('/messages',
		(req, res, next) => {
			return services.redis.lrange('message-ids', 0, -1, (err, ids) => {
				if (err)
					return next(err);

				let multi = services.redis.multi();
				ids.forEach((id) => {
					multi = multi.get('message:' + id);
				});

				return multi.exec((err, jsons) => {
					if (err)
						return next(err);

					const userIdSet = {};

					const messages = jsons.map((json, i) => {
						const message = JSON.parse(json);
						message.id = parseInt(ids[i]);
						userIdSet[message.userId] = true;
						return message;
					});

					const userIds = Object.keys(userIdSet);

					const multi = services.redis.multi();
					userIds.forEach((userId) => {
						multi.get('user:' + userId);
					});

					return multi.exec((err, jsons) => {
						if (err)
							return next(err);

						const users = {};
						userIds.forEach((userId, i) => {
							if (jsons[i]) {
								users[userId] = JSON.parse(jsons[i]);
								users[userId].id = parseInt(userId);
							}
						});

						messages.forEach((message) => {
							message.user = users[message.userId];
							delete message.userId;
						});

						return res.json({
							messages,
						});
					});
				});
			});
		});

	router.get('/messages/:id',
		(req, res, next) => {
			const id = req.params.id;

			return services.redis.get('message:' + id, (err, json) => {
				if (err)
					return next(err);

				if (!json)
					return res.sendStatus(404);

				const message = JSON.parse(json);
				message.id = parseInt(id);

				return services.redis.get('user:' + message.userId, (err, json) => {
					if (err)
						return next(err);

					if (json) {
						message.user = JSON.parse(json);
						message.user.id = message.userId;
					}
					delete message.userId;

					return res.json(message);
				});
			});
		});

	router.post('/messages',
		middlewares.checkToken,
		middlewares.authenticated,
		middlewares.schema('body', {
			properties: {
				body: {
					minLength: 1,
					type: 'string',
				},
			},
			required: [
				'body',
			],
		}),
		(req, res, next) => {
			return services.redis.incr('message-id-counter', (err, id) => {
				if (err)
					return next(err);

				const message = {
					body: req.body.body,
					date: Date.now(),
					userId: req.token.userId,
				};

				return services.redis.multi()
					.lpush('message-ids', id)
					.set('message:' + id, JSON.stringify(message))
					.exec((err) => {
						if (err)
							return next(err);

						return res.status(201).json({
							id,
						});
					});
			});
		});

	router.put('/messages/:id',
		middlewares.checkToken,
		middlewares.authenticated,
		middlewares.schema('body', {
			properties: {
				body: {
					minLength: 1,
					type: 'string',
				},
			},
			required: [
				'body',
			],
		}),
		(req, res, next) => {
			const id = req.params.id;

			return services.redis.get('message:' + id, (err, json) => {
				if (err)
					return next(err);

				if (!json)
					return res.sendStatus(404);

				const message = JSON.parse(json);
				if (message.userId !== req.token.userId)
					return res.sendStatus(403);

				Object.assign(message, {
					body: req.body.body,
				});

				return services.redis.set('message:' + id, JSON.stringify(message), (err) => {
					if (err)
						return next(err);

					return res.sendStatus(204);
				});
			});
		});

	router.delete('/messages/:id',
		middlewares.checkToken,
		middlewares.authenticated,
		(req, res, next) => {
			const id = req.params.id;

			return services.redis.get('message:' + id, (err, json) => {
				if (err)
					return next(err);

				if (!json)
					return res.sendStatus(404);

				const message = JSON.parse(json);
				if (message.userId !== req.token.userId)
					return res.sendStatus(403);

				return services.redis.multi()
					.lrem('message-ids', 1, id)
					.del('message:' + id)
					.exec((err) => {
						if (err)
							return next(err);

						return res.sendStatus(204);
					});
			});
		});
};
