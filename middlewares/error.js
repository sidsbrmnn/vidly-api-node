module.exports = function(err, req, res, next) {
    switch (err.name) {
        case 'ClientError':
            res.status(err.statusCode).send({ error: err.message });
            break;

        case 'ValidationError':
            res.status(400).send({ error: err.message });
            break;

        default:
            console.log(err.name, err.message);
            res.status(500).send({ error: 'Something went wrong' });
            break;
    }
};
