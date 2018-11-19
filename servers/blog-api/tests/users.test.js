const {
	expect,
	request,
} = require('chai');

const {
	app,
} = require('./app');

describe('Users', () => {
	it('cannot create an user with no name', () => {
		return request(app)
			.post('/users')
			.send({})
			.then((res) => {
				expect(res).to.have.status(400);
			});
	});

	it('cannot create an user with empty name', () => {
		return request(app)
			.post('/users')
			.send({
				name: '',
			})
			.then((res) => {
				expect(res).to.have.status(400);
			});
	});

	it('creates an user, and gets it', () => {
		let userId;

		return request(app)
			.post('/users')
			.send({
				name: 'John Doe',
			})
			.then((res) => {
				expect(res).to.have.status(201);
				userId = res.body.id;
			})

			.then(() => {
				return request(app)
					.get('/users/' + userId);
			})
			.then((res) => {
				expect(res).to.have.status(200);
				expect(res.body).to.eql({
					id: userId,
					name: 'John Doe',
				});
			});
	});

	it('creates an user, but cannot update it if not authenticated', () => {
		let userId;

		return request(app)
			.post('/users')
			.send({
				name: 'John Doe',
			})
			.then((res) => {
				expect(res).to.have.status(201);
				userId = res.body.id;
			})

			.then(() => {
				return request(app)
					.put('/users/' + userId)
					.send({
						name: 'Jane Doe',
					});
			})
			.then((res) => {
				expect(res).to.have.status(401);
			})

			.then(() => {
				return request(app)
					.get('/users/' + userId);
			})
			.then((res) => {
				expect(res).to.have.status(200);
				expect(res.body).to.eql({
					id: userId,
					name: 'John Doe',
				});
			});
	});

	it('creates an user, edits it, and gets it', () => {
		let userId;
		let token;

		return request(app)
			.post('/users')
			.send({
				name: 'John Doe',
			})
			.then((res) => {
				expect(res).to.have.status(201);
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
				token = res.body.token;
			})

			.then(() => {
				return request(app)
					.put('/users/' + userId)
					.set('X-Auth-Token', token)
					.send({
						name: 'Jane Doe',
					});
			})
			.then((res) => {
				expect(res).to.have.status(204);
			})

			.then(() => {
				return request(app)
					.get('/users/' + userId);
			})
			.then((res) => {
				expect(res).to.have.status(200);
				expect(res.body).to.eql({
					id: userId,
					name: 'Jane Doe',
				});
			});
	});

	it('creates an user, updates it, and gets it', () => {
		let userId;
		let token;

		return request(app)
			.post('/users')
			.send({
				name: 'John Doe',
			})
			.then((res) => {
				expect(res).to.have.status(201);
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
				token = res.body.token;
			})

			.then(() => {
				return request(app)
					.put('/users/' + userId)
					.set('X-Auth-Token', token)
					.send({
						name: 'Jane Doe',
					});
			})
			.then((res) => {
				expect(res).to.have.status(204);
			})

			.then(() => {
				return request(app)
					.get('/users/' + userId);
			})
			.then((res) => {
				expect(res).to.have.status(200);
				expect(res.body).to.eql({
					id: userId,
					name: 'Jane Doe',
				});
			});
	});

	it('creates two users, the former cannot update the latter', () => {
		let userIdA;
		let userIdB;
		let token;

		return request(app)
			.post('/users')
			.send({
				name: 'John Doe',
			})
			.then((res) => {
				expect(res).to.have.status(201);
				userIdA = res.body.id;
			})

			.then(() => {
				return request(app)
					.post('/users')
					.send({
						name: 'Jane Doe',
					});
			})
			.then((res) => {
				expect(res).to.have.status(201);
				userIdB = res.body.id;
			})

			.then(() => {
				return request(app)
					.post('/token')
					.send({
						userId: userIdA,
					});
			})
			.then((res) => {
				expect(res).to.have.status(200);
				token = res.body.token;
			})

			.then(() => {
				return request(app)
					.put('/users/' + userIdB)
					.set('X-Auth-Token', token)
					.send({
						name: 'Jane Doe 2',
					});
			})
			.then((res) => {
				expect(res).to.have.status(403);
			})

			.then(() => {
				return request(app)
					.get('/users/' + userIdB);
			})
			.then((res) => {
				expect(res).to.have.status(200);
				expect(res.body).to.eql({
					id: userIdB,
					name: 'Jane Doe',
				});
			});
	});

	it('creates an user, but cannot delete it if not authenticated', () => {
		let userId;

		return request(app)
			.post('/users')
			.send({
				name: 'John Doe',
			})
			.then((res) => {
				expect(res).to.have.status(201);
				userId = res.body.id;
			})

			.then(() => {
				return request(app)
					.delete('/users/' + userId);
			})
			.then((res) => {
				expect(res).to.have.status(401);
			});
	});

	it('creates an user, and deletes it', () => {
		let userId;
		let token;

		return request(app)
			.post('/users')
			.send({
				name: 'John Doe',
			})
			.then((res) => {
				expect(res).to.have.status(201);
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
				token = res.body.token;
			})

			.then(() => {
				return request(app)
					.delete('/users/' + userId)
					.set('X-Auth-Token', token);
			})
			.then((res) => {
				expect(res).to.have.status(204);
			})

			.then(() => {
				return request(app)
					.get('/users/' + userId);
			})
			.then((res) => {
				expect(res).to.have.status(404);
			});
	});

	it('creates two users, the former cannot delete the latter', () => {
		let userIdA;
		let userIdB;
		let token;

		return request(app)
			.post('/users')
			.send({
				name: 'John Doe',
			})
			.then((res) => {
				expect(res).to.have.status(201);
				userIdA = res.body.id;
			})

			.then(() => {
				return request(app)
					.post('/users')
					.send({
						name: 'Jane Doe',
					});
			})
			.then((res) => {
				expect(res).to.have.status(201);
				userIdB = res.body.id;
			})

			.then(() => {
				return request(app)
					.post('/token')
					.send({
						userId: userIdA,
					});
			})
			.then((res) => {
				expect(res).to.have.status(200);
				token = res.body.token;
			})

			.then(() => {
				return request(app)
					.delete('/users/' + userIdB)
					.set('X-Auth-Token', token);
			})
			.then((res) => {
				expect(res).to.have.status(403);
			})

			.then(() => {
				return request(app)
					.get('/users/' + userIdB);
			})
			.then((res) => {
				expect(res).to.have.status(200);
				expect(res.body).to.eql({
					id: userIdB,
					name: 'Jane Doe',
				});
			});
	});
});
