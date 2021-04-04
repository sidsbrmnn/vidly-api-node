const jwt = require('jsonwebtoken');
const User = require('../../../models/user');

describe('user.generateAuthToken', () => {
  it('should return a valid JWT', () => {
    const payload = { name: 'John Doe', role: 'admin' };
    const user = new User({ ...payload });
    const token = user.generateAuthToken();
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    expect(decoded).toMatchObject(payload);
  });
});
