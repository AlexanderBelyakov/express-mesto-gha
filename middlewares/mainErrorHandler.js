const { INTERVAL_SERVER_ERROR } = require('../constants/HHTP-status-codes');

module.exports = (err, req, res, next) => {
  const { statusCode = INTERVAL_SERVER_ERROR, message } = err;

  res.status(statusCode).send({
    message: statusCode === INTERVAL_SERVER_ERROR
      ? `На сервере произошла ошибка ${INTERVAL_SERVER_ERROR}`
      : message,
  });
  next();
};
