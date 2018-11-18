const Ajv = require('ajv');

const ajv = new Ajv({
	allErrors: true,
});

exports.authenticated = (req, res, next) => {
	if (!req.token || !req.token.userId)
		return res.sendStatus(401);

	return next();
};

exports.schema = (property, schema) => {
	var validate = ajv.compile(schema);

	return (req, res, next) => {
		var valid = validate(req[property]);

		if (!valid)
			return res.status(400).json({
				errors: validate.errors,
			});

		return next();
	};
};
