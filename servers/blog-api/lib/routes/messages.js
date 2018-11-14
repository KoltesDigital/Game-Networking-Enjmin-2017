const {
	authenticated,
	schema,
} = require('../middlewares');

module.exports = (router) => {
	router.get('/messages', (req, res, next) => {
		return req.redis.lrange('message-ids', 0, -1, (err, ids) => {
			if (err)
				return next(err);

			let multi = req.redis.multi();
			ids.forEach((id) => {
				multi = multi.get('message:' + id);
			});

			return multi.exec((err, jsons) => {
				if (err)
					return next(err);

				const messages = jsons.map((json, i) => {
					const message = JSON.parse(json);
					message.id = parseInt(ids[i]);
					return message;
				});

				return res.json({
					messages,
				});
			});
		});
	});

	router.get('/messages/:id', (req, res, next) => {
		const id = req.params.id;

		return req.redis.get('message:' + id, (err, json) => {
			if (err)
				return next(err);
			if (!json)
				return res.sendStatus(404);

			const message = JSON.parse(json);
			message.id = parseInt(id);

			return res.json(message);
		});
	});

	router.post('/messages', authenticated, schema('body', {
		properties: {
			body: {
				minLength: 1,
				type: 'string',
			},
		},
		required: [
			'body',
		],
	}), (req, res, next) => {
		return req.redis.incr('message-id-counter', (err, id) => {
			if (err)
				return next(err);

			const message = {
				body: req.body.body,
				date: Date.now(),
				userId: req.token.userId,
			};

			return req.redis.multi()
				.lpush('message-ids', id)
				.set('message:' + id, JSON.stringify(message))
				.exec((err) => {
					if (err)
						return next(err);

					return res.status(201).send({
						id,
					});
				});
		});
	});

	router.put('/messages/:id', authenticated, schema('body', {
		properties: {
			body: {
				minLength: 1,
				type: 'string',
			},
		},
		required: [
			'body',
		],
	}), (req, res, next) => {
		const id = req.params.id;

		return req.redis.get('message:' + id, (err, json) => {
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

			return req.redis.set('message:' + id, JSON.stringify(message), (err) => {
				if (err)
					return next(err);

				return res.status(201).send({
					id,
				});
			});
		});
	});

	router.delete('/messages/:id', authenticated, (req, res, next) => {
		const id = req.params.id;

		return req.redis.get('message:' + id, (err, json) => {
			if (err)
				return next(err);

			if (!json)
				return res.sendStatus(404);

			const message = JSON.parse(json);
			if (message.userId !== req.token.userId)
				return res.sendStatus(403);

			return req.redis.multi()
				.srem('message-ids', id)
				.del('message:' + id)
				.exec((err) => {
					if (err)
						return next(err);

					return res.sendStatus(200);
				});
		});
	});
};
