const { validationResult } = require('express-validator');

module.exports = function (req, res, next) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(403).json({
           success: false,
            errors: errors.array()
        });
    }
    next()
};