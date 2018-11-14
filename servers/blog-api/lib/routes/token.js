const {
	schema,
} = require('../middlewares');

module.exports = (router) => {
	router.post('/token', schema('body', {
		properties: {
			userId: {
				type: 'integer',
			},
		},
		required: [
			'userId',
		],
	}), (req, res, next) => {
		const userId = req.body.userId;

		return req.redis.exists('user:' + userId, (err, exists) => {
			if (err)
				return next(err);

			if (!exists)
				return res.sendStatus(400);

			return res.sendToken({
				userId,
			});
		});
	});
};
