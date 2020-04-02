const { User } = require('../../../models/user');

const jwt = require('../../../util/jwt');

describe('user.generateAuthToken', () => {
    it('should return a valid JWT', () => {
        const payload = { isAdmin: true };
        const user = new User({ ...payload });
        const token = user.generateAuthToken();
        const decoded = jwt.verify(token);
        expect(decoded).toMatchObject(payload);
    });
});
