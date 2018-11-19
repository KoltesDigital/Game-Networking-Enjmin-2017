const {
	expect,
	request,
} = require('chai');

const {
	app,
} = require('./app');

describe('Messages', () => {
	it('gets zero entries', () => {
		return request(app)
			.get('/messages')
			.then((res) => {
				expect(res).to.have.status(200);
				expect(res.body).to.eql({
					messages: [],
				});
			});
	});

	it('cannot publish if not authenticated', () => {
		return request(app)
			.post('/messages')
			.send({
				body: 'foo bar',
			})
			.then((res) => {
				expect(res).to.have.status(401);
			});
	});

	it('publishes and gets the message', () => {
		let userId;
		let messageId;
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
					.post('/messages')
					.set('X-Auth-Token', token)
					.send({
						body: 'foo bar',
					});
			})
			.then((res) => {
				expect(res).to.have.status(201);
				messageId = res.body.id;
			})

			.then(() => {
				return request(app)
					.get('/messages');
			})
			.then((res) => {
				expect(res).to.have.status(200);
				expect(res.body.messages).to.be.an('Array').with.lengthOf(1);
				expect(res.body.messages[0]).to.deep.include({
					body: 'foo bar',
					id: messageId,
					user: {
						id: userId,
						name: 'John Doe',
					},
				});
				expect(res.body.messages[0].date).to.be.a('number');
			})

			.then(() => {
				return request(app)
					.get('/messages/' + messageId);
			})
			.then((res) => {
				expect(res).to.have.status(200);
				expect(res.body).to.be.an('object');
				expect(res.body).to.deep.include({
					body: 'foo bar',
					id: messageId,
					user: {
						id: userId,
						name: 'John Doe',
					},
				});
				expect(res.body.date).to.be.a('number');
			});
	});

	it('publishes, deletes user, and gets the message with no user', () => {
		let userId;
		let messageId;
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
					.post('/messages')
					.set('X-Auth-Token', token)
					.send({
						body: 'foo bar',
					});
			})
			.then((res) => {
				expect(res).to.have.status(201);
				messageId = res.body.id;
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
					.get('/messages');
			})
			.then((res) => {
				expect(res).to.have.status(200);
				expect(res.body.messages).to.be.an('Array').with.lengthOf(1);
				expect(res.body.messages[0]).to.deep.include({
					body: 'foo bar',
					id: messageId,
				});
				expect(res.body.messages[0].date).to.be.a('number');
			})

			.then(() => {
				return request(app)
					.get('/messages/' + messageId);
			})
			.then((res) => {
				expect(res).to.have.status(200);
				expect(res.body).to.be.an('object');
				expect(res.body).to.deep.include({
					body: 'foo bar',
					id: messageId,
				});
				expect(res.body.date).to.be.a('number');
			});
	});

	it('publishes and cannot update with no token', () => {
		let userId;
		let messageId;
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
					.post('/messages')
					.set('X-Auth-Token', token)
					.send({
						body: 'foo bar',
					});
			})
			.then((res) => {
				expect(res).to.have.status(201);
				messageId = res.body.id;
			})

			.then(() => {
				return request(app)
					.put('/messages/' + messageId)
					.send({
						body: 'foo bar 2',
					});
			})
			.then((res) => {
				expect(res).to.have.status(401);
			})

			.then(() => {
				return request(app)
					.get('/messages');
			})
			.then((res) => {
				expect(res).to.have.status(200);
				expect(res.body.messages).to.be.an('Array').with.lengthOf(1);
				expect(res.body.messages[0]).to.deep.include({
					body: 'foo bar',
					id: messageId,
					user: {
						id: userId,
						name: 'John Doe',
					},
				});
				expect(res.body.messages[0].date).to.be.a('number');
			})

			.then(() => {
				return request(app)
					.get('/messages/' + messageId);
			})
			.then((res) => {
				expect(res).to.have.status(200);
				expect(res.body).to.be.an('object');
				expect(res.body).to.deep.include({
					body: 'foo bar',
					id: messageId,
					user: {
						id: userId,
						name: 'John Doe',
					},
				});
				expect(res.body.date).to.be.a('number');
			});
	});

	it('publishes and updates the message', () => {
		let userId;
		let messageId;
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
					.post('/messages')
					.set('X-Auth-Token', token)
					.send({
						body: 'foo bar',
					});
			})
			.then((res) => {
				expect(res).to.have.status(201);
				messageId = res.body.id;
			})

			.then(() => {
				return request(app)
					.put('/messages/' + messageId)
					.set('X-Auth-Token', token)
					.send({
						body: 'foo bar 2',
					});
			})
			.then((res) => {
				expect(res).to.have.status(204);
			})

			.then(() => {
				return request(app)
					.get('/messages');
			})
			.then((res) => {
				expect(res).to.have.status(200);
				expect(res.body.messages).to.be.an('Array').with.lengthOf(1);
				expect(res.body.messages[0]).to.deep.include({
					body: 'foo bar 2',
					id: messageId,
					user: {
						id: userId,
						name: 'John Doe',
					},
				});
				expect(res.body.messages[0].date).to.be.a('number');
			})

			.then(() => {
				return request(app)
					.get('/messages/' + messageId);
			})
			.then((res) => {
				expect(res).to.have.status(200);
				expect(res.body).to.be.an('object');
				expect(res.body).to.deep.include({
					body: 'foo bar 2',
					id: messageId,
					user: {
						id: userId,
						name: 'John Doe',
					},
				});
				expect(res.body.date).to.be.a('number');
			});
	});

	it('publishes and other users cannot update the message', () => {
		let userIdA;
		let userIdB;
		let messageId;
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
					.post('/messages')
					.set('X-Auth-Token', token)
					.send({
						body: 'foo bar',
					});
			})
			.then((res) => {
				expect(res).to.have.status(201);
				messageId = res.body.id;
			})

			.then(() => {
				return request(app)
					.post('/token')
					.send({
						userId: userIdB,
					});
			})
			.then((res) => {
				expect(res).to.have.status(200);
				token = res.body.token;
			})

			.then(() => {
				return request(app)
					.put('/messages/' + messageId)
					.set('X-Auth-Token', token)
					.send({
						body: 'foo bar 2',
					});
			})
			.then((res) => {
				expect(res).to.have.status(403);
			})

			.then(() => {
				return request(app)
					.get('/messages');
			})
			.then((res) => {
				expect(res).to.have.status(200);
				expect(res.body.messages).to.be.an('Array').with.lengthOf(1);
				expect(res.body.messages[0]).to.deep.include({
					body: 'foo bar',
					id: messageId,
					user: {
						id: userIdA,
						name: 'John Doe',
					},
				});
				expect(res.body.messages[0].date).to.be.a('number');
			})

			.then(() => {
				return request(app)
					.get('/messages/' + messageId);
			})
			.then((res) => {
				expect(res).to.have.status(200);
				expect(res.body).to.be.an('object');
				expect(res.body).to.deep.include({
					body: 'foo bar',
					id: messageId,
					user: {
						id: userIdA,
						name: 'John Doe',
					},
				});
				expect(res.body.date).to.be.a('number');
			});
	});

	it('publishes and cannot delete the message with no token', () => {
		let userId;
		let messageId;
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
					.post('/messages')
					.set('X-Auth-Token', token)
					.send({
						body: 'foo bar',
					});
			})
			.then((res) => {
				expect(res).to.have.status(201);
				messageId = res.body.id;
			})

			.then(() => {
				return request(app)
					.delete('/messages/' + messageId);
			})
			.then((res) => {
				expect(res).to.have.status(401);
			})

			.then(() => {
				return request(app)
					.get('/messages');
			})
			.then((res) => {
				expect(res).to.have.status(200);
				expect(res.body.messages).to.be.an('Array').with.lengthOf(1);
				expect(res.body.messages[0]).to.deep.include({
					body: 'foo bar',
					id: messageId,
					user: {
						id: userId,
						name: 'John Doe',
					},
				});
				expect(res.body.messages[0].date).to.be.a('number');
			})

			.then(() => {
				return request(app)
					.get('/messages/' + messageId);
			})
			.then((res) => {
				expect(res).to.have.status(200);
				expect(res.body).to.be.an('object');
				expect(res.body).to.deep.include({
					body: 'foo bar',
					id: messageId,
					user: {
						id: userId,
						name: 'John Doe',
					},
				});
				expect(res.body.date).to.be.a('number');
			});
	});

	it('publishes and deletes the message', () => {
		let userId;
		let messageId;
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
					.post('/messages')
					.set('X-Auth-Token', token)
					.send({
						body: 'foo bar',
					});
			})
			.then((res) => {
				expect(res).to.have.status(201);
				messageId = res.body.id;
			})

			.then(() => {
				return request(app)
					.delete('/messages/' + messageId)
					.set('X-Auth-Token', token);
			})
			.then((res) => {
				expect(res).to.have.status(204);
			})

			.then(() => {
				return request(app)
					.get('/messages');
			})
			.then((res) => {
				expect(res).to.have.status(200);
				expect(res.body).to.eql({
					messages: [],
				});
			});
	});

	it('publishes and other users cannot delete the message', () => {
		let userIdA;
		let userIdB;
		let messageId;
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
					.post('/messages')
					.set('X-Auth-Token', token)
					.send({
						body: 'foo bar',
					});
			})
			.then((res) => {
				expect(res).to.have.status(201);
				messageId = res.body.id;
			})

			.then(() => {
				return request(app)
					.post('/token')
					.send({
						userId: userIdB,
					});
			})
			.then((res) => {
				expect(res).to.have.status(200);
				token = res.body.token;
			})

			.then(() => {
				return request(app)
					.delete('/messages/' + messageId)
					.set('X-Auth-Token', token);
			})
			.then((res) => {
				expect(res).to.have.status(403);
			})

			.then(() => {
				return request(app)
					.get('/messages');
			})
			.then((res) => {
				expect(res).to.have.status(200);
				expect(res.body.messages).to.be.an('Array').with.lengthOf(1);
				expect(res.body.messages[0]).to.deep.include({
					body: 'foo bar',
					id: messageId,
					user: {
						id: userIdA,
						name: 'John Doe',
					},
				});
				expect(res.body.messages[0].date).to.be.a('number');
			})

			.then(() => {
				return request(app)
					.get('/messages/' + messageId);
			})
			.then((res) => {
				expect(res).to.have.status(200);
				expect(res.body).to.be.an('object');
				expect(res.body).to.deep.include({
					body: 'foo bar',
					id: messageId,
					user: {
						id: userIdA,
						name: 'John Doe',
					},
				});
				expect(res.body.date).to.be.a('number');
			});
	});
});
