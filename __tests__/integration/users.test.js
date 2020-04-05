const mongoose = require('mongoose');
const supertest = require('supertest');

const server = require('../..');

const { User } = require('../../models/user');

const payload = {
    name: 'John Doe',
    email: 'name@example.com',
    password: 'password',
};

describe('/api/users', () => {
    let request;

    beforeAll(() => {
        request = supertest(server);
    });

    afterAll(async (done) => {
        server.close();
        await mongoose.connection.close();
        done();
    });

    afterEach(async (done) => {
        await User.deleteMany({});
        done();
    });

    describe('POST /', () => {
        const exec = (options = {}) => {
            const defaults = {
                sendValidUser: true,
            };
            const parsed = Object.assign({}, defaults, options);

            const values = {
                email: parsed.sendValidUser ? payload.email : 'user@example',
            };

            return request
                .post('/api/users')
                .send({ ...payload, email: values.email });
        };

        it('should return 400 if details are incorrect', async () => {
            const res = await exec({ sendValidUser: false });

            expect(res.status).toBe(400);
        });

        it('should return 409 if user with given mail id already exists', async () => {
            await exec();
            const res = await exec();

            expect(res.status).toBe(409);
        });

        it('should save the user if user details are valid', async () => {
            await exec();

            const user = await User.findOne({ email: payload.email });

            expect(user).not.toBeNull();
            expect(user).toHaveProperty('name', payload.name);
            expect(user).toHaveProperty('email', payload.email);
        });

        it('should return a token if user details are valid', async () => {
            const res = await exec();

            expect(res.status).toBe(200);
            expect(res.body).toHaveProperty('data');
        });
    });
});
