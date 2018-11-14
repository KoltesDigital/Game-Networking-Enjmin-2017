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

	it('cannot publish if not logged in', () => {
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
				expect(res.body.messages[0]).to.include({
					body: 'foo bar',
					id: messageId,
					userId: userId,
				});
				expect(res.body.messages[0].date).to.be.a('number');
			});
	});
});
