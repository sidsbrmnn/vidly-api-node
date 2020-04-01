module.exports = function(req, res, next) {
    const isAdmin = res.locals.user.isAdmin;
    if (!isAdmin) {
        res.status(403).send({ error: 'Permission denied' });
        return;
    }

    next();
};
