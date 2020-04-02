const auth = require('../../../middlewares/auth');

const { User } = require('../../../models/user');

describe('auth middleware', () => {
    it('should populate res.locals.user with the payload of a valid JWT', () => {
        const payload = { isAdmin: true };
        const token = new User({ ...payload }).generateAuthToken();
        const req = { header: jest.fn().mockReturnValue(token) };
        const res = { locals: {} };
        const next = jest.fn();

        auth(req, res, next);

        expect(res.locals.user).toMatchObject(payload);
    });
});
