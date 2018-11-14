const {
	Router,
} = require('express');
const {
	readdirSync,
} = require('fs');

module.exports = () => {
	const router = new Router();

	readdirSync(__dirname + '/routes').forEach((filename) => {
		require('./routes/' + filename)(router);
	});

	return router;
};
