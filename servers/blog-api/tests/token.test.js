const {
	expect,
	request,
} = require('chai');

const {
	app,
} = require('./app');

describe('Token', () => {
	it('fails to authenticate with no valid user', () => {
		return request(app)
			.post('/token')
			.send({
				userId: 1,
			})
			.then((res) => {
				expect(res).to.have.status(401);
			});
	});

	it('succeeds to authenticate', () => {
		let userId;

		return request(app)
			.post('/users')
			.send({
				name: 'John Doe',
			})
			.then((res) => {
				expect(res).to.have.status(201);
				expect(res.body).to.have.property('id');
				userId = res.body.id;
			})

			.then(() => {
				return request(app)
					.post('/token')
					.send({
						userId,
					});
			})
			.then((res) => {
				expect(res).to.have.status(200);
				expect(res.body).to.have.property('token');
			});
	});

	it('cannot authenticate with a string', () => {
		let userId;

		return request(app)
			.post('/users')
			.send({
				name: 'John Doe',
			})
			.then((res) => {
				expect(res).to.have.status(201);
				expect(res.body).to.have.property('id');
				userId = res.body.id;
			})

			.then(() => {
				return request(app).post('/token')
					.send({
						userId: userId + '',
					});
			})
			.then((res) => {
				expect(res).to.have.status(400);
			});
	});
});
