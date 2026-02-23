/**
 * Standard API Response Formatters
 */

const sendSuccess = (res, statusCode, message, data = {}) => {
    return res.status(statusCode).json({
        success: true,
        message: message,
        data: data
    });
};

const sendError = (res, statusCode, message) => {
    return res.status(statusCode).json({
        success: false,
        message: message
    });
};

module.exports = {
    sendSuccess,
    sendError
};
