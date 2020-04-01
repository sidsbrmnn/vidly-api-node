class ClientError extends Error {
    /**
     *
     * @param {number} statusCode
     * @param {string} message
     */
    constructor(statusCode, message) {
        super(message);
        this.name = 'ClientError';
        this.statusCode = statusCode;
    }
}

module.exports.ClientError = ClientError;
