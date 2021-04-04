const auth = require('../../../middlewares/auth');
const User = require('../../../models/user');

describe('auth middleware', () => {
  it('should populate req.user with the payload of a valid JWT', () => {
    const payload = { name: 'John Doe', role: 'admin' };
    const token = new User({ ...payload }).generateAuthToken();
    const req = { headers: { authorization: `Bearer ${token}` } };
    const res = {};
    const next = jest.fn();

    auth(req, res, next);

    expect(req.user).toMatchObject(payload);
  });
});
