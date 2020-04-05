const bodyParser = require('body-parser');

module.exports = function (app) {
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({ extended: false }));

    app.use('/api/auth', require('../routes/auth'));
    app.use('/api/customers', require('../routes/customers'));
    app.use('/api/genres', require('../routes/genres'));
    app.use('/api/movies', require('../routes/movies'));
    app.use('/api/rentals', require('../routes/rentals'));
    app.use('/api/returns', require('../routes/returns'));
    app.use('/api/users', require('../routes/users'));

    app.use(require('../middlewares/error'));
};
