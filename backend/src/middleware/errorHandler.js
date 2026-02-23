const { sendError } = require('../utils/responseHandler');

const errorHandler = (err, req, res, next) => {
    console.error(err.stack);

    const statusCode = err.statusCode || 500;
    const message = err.message || 'Server Error';

    return sendError(res, statusCode, message);
};

module.exports = { errorHandler };
