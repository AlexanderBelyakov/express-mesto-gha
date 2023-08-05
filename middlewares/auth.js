const jwt = require('jsonwebtoken');
const {
  UNAUTHORIZED_ERROR,
} = require('../constants/HHTP-status-codes');
const { SECRET_KEY } = require('../constants/secret-key');
const UnauthorizedError = require('../errors/unauthorized-error');

module.exports = (req, res, next) => {
  const { authorization } = req.headers;

  if (!authorization || !authorization.startsWith('Bearer ')) {
    next(new UnauthorizedError(`Требуется авторизация ${UNAUTHORIZED_ERROR}`));
  }

  const token = authorization.replace('Bearer ', '');
  let payload;

  try {
    payload = jwt.verify(token, SECRET_KEY);
  } catch (err) {
    next(new UnauthorizedError(`Требуется авторизация ${UNAUTHORIZED_ERROR}`));
  }

  req.user = payload;
  console.log(req.user);

  return next(); // пропускаем запрос дальше
};
