module.exports = (router, {
	middlewares,
	services,
}) => {
	router.post('/token',
		middlewares.schema('body', {
			properties: {
				userId: {
					type: 'integer',
				},
			},
			required: [
				'userId',
			],
		}),
		middlewares.sendToken,
		(req, res, next) => {
			const userId = req.body.userId;

			return services.redis.exists('user:' + userId, (err, exists) => {
				if (err)
					return next(err);

				if (!exists)
					return res.sendStatus(401);

				return res.sendToken({
					userId,
				});
			});
		});
};
