const mongoose = require('mongoose');
const supertest = require('supertest');

const server = require('../..');

const { User } = require('../../models/user');

const jwt = require('../../util/jwt');

const payload = {
  name: 'John Doe',
  email: 'name@example.com',
  password: 'password',
};

describe('/api/auth', () => {
  let request;

  beforeAll(() => {
    request = supertest(server);
  });

  afterAll(async () => {
    server.close();
    await mongoose.connection.close();
  });

  afterEach(async () => {
    await User.deleteMany({});
  });

  describe('POST /', () => {
    let user;

    beforeEach(async () => {
      user = await new User({ ...payload }).save();
    });

    const exec = (options = {}) => {
      const defaults = {
        sendValidEmail: true,
        sendValidPassword: true,
      };
      const parsed = Object.assign({}, defaults, options);

      const values = {
        email: parsed.sendValidEmail ? payload.email : '',
        password: parsed.sendValidPassword ? payload.password : '',
      };

      return request.post('/api/auth').send({ ...values });
    };

    it('should return 401 if email is incorrect', async () => {
      const res = await exec({ sendValidEmail: false });

      expect(res.status).toBe(401);
    });

    it('should return 401 if password is incorrect', async () => {
      const res = await exec({ sendValidPassword: false });

      expect(res.status).toBe(401);
    });

    it('should return a valid token if the user is logged in', async () => {
      const res = await exec();

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('data');
      const token = res.body.data;
      const decoded = jwt.decode(token);
      expect(decoded).toHaveProperty('_id', user.id);
    });
  });

  describe('GET /me', () => {
    let token, user;

    beforeEach(async () => {
      user = await new User({ ...payload }).save();
      token = user.generateAuthToken();
    });

    const exec = (options = {}) => {
      const defaults = {
        sendToken: true,
        sendValidToken: true,
      };
      const parsed = Object.assign({}, defaults, options);

      const values = {
        token: parsed.sendToken
          ? parsed.sendValidToken
            ? token
            : new User().generateAuthToken()
          : '',
      };

      return request.get('/api/auth/me').set('x-auth-token', values.token);
    };

    it('should return 401 if no token is passed', async () => {
      const res = await exec({ sendToken: false });

      expect(res.status).toBe(401);
    });

    it('should return 410 if token has non existing user', async () => {
      const res = await exec({ sendValidToken: false });

      expect(res.status).toBe(410);
    });

    it('should return the user details if a valid token is passed', async () => {
      const res = await exec();

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('data');
      expect(res.body.data).toHaveProperty('_id', user.id);
      expect(res.body.data).toHaveProperty('name', user.name);
      expect(res.body.data).toHaveProperty('email', user.email);
    });
  });
});
