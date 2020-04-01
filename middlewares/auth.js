const jwt = require('jsonwebtoken');

module.exports = function(req, res, next) {
    const token = req.header('x-auth-token');
    if (!token) {
        res.status(401).send({ error: 'Please login to continue' });
        return;
    }

    try {
        const decoded = jwt.verify(token, secretKey);
        res.locals.user = decoded;

        next();
    } catch (error) {
        res.status(400).send({ error: 'Invalid token. Please login again' });
    }
};
