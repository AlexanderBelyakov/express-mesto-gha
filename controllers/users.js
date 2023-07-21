const User = require('../models/user');
const {
  OK,
  CREATED,
  BAD_REQUEST_ERROR,
  NOT_FOUND_ERROR,
  INTERVAL_SERVER_ERROR,
} = require('../HHTP_status_codes/HHTP-status-codes');

module.exports.getUsers = (req, res) => {
  User.find({})
    .then((users) => res.status(OK).send(users))
    .catch(() => res.status(INTERVAL_SERVER_ERROR).send({ message: `Ошибка сервера ${INTERVAL_SERVER_ERROR}` }));
};

module.exports.getUser = (req, res) => {
  const { userId } = req.params;
  User.findById(userId)
    .then((user) => res.status(OK).send(user))
    .catch((err) => {
      if (err.name === 'CastError') {
        return res.status(NOT_FOUND_ERROR).send({ message: `Пользователь по указанному id не найден ${NOT_FOUND_ERROR}` });
      }
      return res.status(INTERVAL_SERVER_ERROR).send({ message: `Ошибка сервера ${INTERVAL_SERVER_ERROR}` });
    });
};

module.exports.createUser = (req, res) => {
  const { name, about, avatar } = req.body;
  User.create({ name, about, avatar })
    .then((user) => res.status(CREATED).send(user))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        return res.status(BAD_REQUEST_ERROR).send({ message: `Переданы некорректные данные при создании пользователя ${BAD_REQUEST_ERROR}` });
      }
      return res.status(INTERVAL_SERVER_ERROR).send({ message: `Ошибка сервера ${INTERVAL_SERVER_ERROR}` });
    });
};

module.exports.updateProfile = (req, res) => {
  const { userId } = req.params;
  const { name, about } = req.body;
  User.findByIdAndUpdate(userId, { name, about }, { new: true, runValidators: true })
    .then((user) => res.status(OK).send(user))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        return res.status(BAD_REQUEST_ERROR).send({ message: `Переданы некорректные данные при обновлении профиля ${BAD_REQUEST_ERROR}` });
      }
      if (err.name === 'CastError') {
        return res.status(NOT_FOUND_ERROR).send({ message: `Пользователь по указанному id не найден ${NOT_FOUND_ERROR}` });
      }
      return res.status(INTERVAL_SERVER_ERROR).send({ message: `Ошибка сервера ${INTERVAL_SERVER_ERROR}` });
    });
};

module.exports.updateAvatar = (req, res) => {
  const { userId } = req.params;
  const { avatar } = req.body;
  User.findByIdAndUpdate(userId, { avatar }, { new: true, runValidators: true })
    .then((user) => res.status(OK).send(user))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        return res.status(BAD_REQUEST_ERROR).send({ message: `Переданы некорректные данные при обновлении аватара ${BAD_REQUEST_ERROR}` });
      }
      if (err.name === 'CastError') {
        return res.status(NOT_FOUND_ERROR).send({ message: `Пользователь по указанному id не найден ${NOT_FOUND_ERROR}` });
      }
      return res.status(INTERVAL_SERVER_ERROR).send({ message: `Ошибка сервера ${INTERVAL_SERVER_ERROR}` });
    });
};
