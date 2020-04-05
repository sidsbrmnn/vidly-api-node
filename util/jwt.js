const jwt = require('jsonwebtoken');

class Jwt {
    constructor() {
        this.secretKey = process.env.JWT_SECRET || 'some_secret';
    }

    /**
     *
     * @param {string|Object} payload
     */
    sign(payload) {
        return jwt.sign(payload, this.secretKey);
    }

    /**
     *
     * @param {string} token
     */
    verify(token) {
        return jwt.verify(token, this.secretKey);
    }

    /**
     *
     * @param {string} token
     */
    decode(token) {
        return jwt.decode(token);
    }
}

module.exports = new Jwt();
