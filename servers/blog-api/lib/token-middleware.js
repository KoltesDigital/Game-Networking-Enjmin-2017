const jwt = require('jsonwebtoken');

module.exports = (conf) => (req, res, next) => {
	res.sendToken = (contents) => {
		const token = jwt.sign(contents, conf['TOKEN_SECRET'], {
			expiresIn: conf['TOKEN_DURATION'],
		});

		return res.status(200).send({
			token,
		});
	};

	const token = req.headers['x-auth-token'];
	if (!token)
		return next();

	return jwt.verify(token, conf['TOKEN_SECRET'], (err, decoded) => {
		if (err)
			return next(err);

		req.token = decoded;
		return next();
	});
};
