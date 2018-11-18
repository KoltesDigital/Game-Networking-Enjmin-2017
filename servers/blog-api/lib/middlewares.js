const Ajv = require('ajv');
const jwt = require('jsonwebtoken');

const ajv = new Ajv({
	allErrors: true,
});

module.exports = (conf) => {
	return {
		checkToken: (req, res, next) => {
			const token = req.headers['x-auth-token'];
			if (!token)
				return res.sendStatus(401);

			return jwt.verify(token, conf['TOKEN_SECRET'], (err, decoded) => {
				if (err)
					return next(err);

				req.token = decoded;
				return next();
			});
		},

		authenticated: (req, res, next) => {
			if (!req.token.userId)
				return res.sendStatus(401);

			return next();
		},

		sendToken: (req, res, next) => {
			res.sendToken = (contents) => {
				const token = jwt.sign(contents, conf['TOKEN_SECRET'], {
					expiresIn: conf['TOKEN_DURATION'],
				});

				return res.status(200).json({
					token,
				});
			};

			return next();
		},

		schema: (property, schema) => {
			var validate = ajv.compile(schema);

			return (req, res, next) => {
				var valid = validate(req[property]);

				if (!valid)
					return res.status(400).json({
						errors: validate.errors,
					});

				return next();
			};
		},
	};
};
