const mongoose = require('mongoose');
const supertest = require('supertest');

const server = require('../..');

const { Genre } = require('../../models/genre');
const { User } = require('../../models/user');

describe('auth middleware', () => {
    let request;

    beforeAll(() => {
        request = supertest(server);
    });

    afterAll(async (done) => {
        server.close();
        await mongoose.connection.close();
        done();
    });

    afterEach(async () => {
        await Genre.deleteMany({});
    });

    const exec = (token) => {
        return request
            .post('/api/genres')
            .set('x-auth-token', token ? token : '')
            .send({ name: 'Genre 1' });
    };

    it('should return 401 if no token is provided', async () => {
        const res = await exec();

        expect(res.status).toBe(401);
    });

    it('should return 400 if token is invalid', async () => {
        const token = 'a';
        const res = await exec(token);

        expect(res.status).toBe(400);
    });

    it('should return 403 if user is not an admin', async () => {
        const token = new User().generateAuthToken();
        const res = await exec(token);

        expect(res.status).toBe(403);
    });

    it('should return 200 if token is valid', async () => {
        const token = new User({ isAdmin: true }).generateAuthToken();
        const res = await exec(token);

        expect(res.status).toBe(200);
    });
});
