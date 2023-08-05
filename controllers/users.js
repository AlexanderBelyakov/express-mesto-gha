const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const {
  OK,
  CREATED,
  BAD_REQUEST_ERROR,
  UNAUTHORIZED_ERROR,
  NOT_FOUND_ERROR,
  CONFLICT_ERROR,
} = require('../constants/HHTP-status-codes');

const BadRequestError = require('../errors/bad-request-error');
const UnauthorizedError = require('../errors/unauthorized-error');
const NotFoundError = require('../errors/not-found-error');
const ConflictError = require('../errors/conflict-error');
const { SECRET_KEY } = require('../constants/secret-key');

module.exports.getUsers = (req, res, next) => {
  User.find({})
    .then((users) => res.status(OK).send(users))
    .catch(next);
};

module.exports.getUser = (req, res, next) => {
  const { userId } = req.params;
  User.findById(userId)
    .orFail(new Error('NotValidId'))
    .then((user) => {
      res.status(OK).send(user);
    })
    .catch((err) => {
      console.log(err);
      if (err.message === 'NotValidId') {
        next(new NotFoundError(`Пользователь по указанному id не найден ${NOT_FOUND_ERROR}`));
      }
      if (err.name === 'CastError' || err.name === 'ValidationError') {
        next(new BadRequestError(`Пользователь по указанному id не найден ${BAD_REQUEST_ERROR}`));
      }
      return next(err);
    });
};

module.exports.createUser = (req, res, next) => {
  const { name, about, avatar } = req.body;
  bcrypt.hash(req.body.password, 10)
    .then((hash) => User.create({
      name,
      about,
      avatar,
      email: req.body.email,
      password: hash,
    })
      .then((user) => res.status(CREATED).send(user))
      .catch((err) => {
        if (err.code === 11000) {
          next(new ConflictError(`Указанный email занят другим пользователем ${CONFLICT_ERROR}`));
        }
        if (err.name === 'ValidationError') {
          next(new BadRequestError(`Переданы некорректные данные при создании пользователя ${BAD_REQUEST_ERROR}`));
        }
        return next(err);
      }));
};

module.exports.updateProfile = (req, res, next) => {
  const owner = req.user._id;
  const { name, about } = req.body;
  User.findByIdAndUpdate(owner, { name, about }, { new: true, runValidators: true })
    .then((newData) => { res.status(OK).send(newData); })
    .catch((err) => {
      if (err.name === 'ValidationError') {
        next(new BadRequestError(`Переданы некорректные данные при обновлении профиля ${BAD_REQUEST_ERROR}`));
      }
      if (err.name === 'CastError') {
        next(new BadRequestError(`Пользователь по указанному id не найден ${BAD_REQUEST_ERROR}`));
      }
      return next(err);
    });
};

module.exports.updateAvatar = (req, res, next) => {
  const owner = req.user._id;
  const { avatar } = req.body;
  User.findByIdAndUpdate(owner, { avatar }, { new: true, runValidators: true })
    .then((user) => res.status(OK).send(user))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        next(new BadRequestError(`Переданы некорректные данные при обновлении аватара ${BAD_REQUEST_ERROR}`));
      }
      if (err.name === 'CastError') {
        next(new BadRequestError(`Пользователь по указанному id не найден ${BAD_REQUEST_ERROR}`));
      }
      return next(err);
    });
};

module.exports.login = (req, res, next) => {
  const { email, password } = req.body;

  return User.findUserByCredentials(email, password)
    .then((user) => {
      const token = jwt.sign(
        { _id: user._id },
        SECRET_KEY,
        { expiresIn: '7d' },
      );

      res.send({ token });
    })
    .catch(() => {
      next(new UnauthorizedError(`Неверные почта или пароль ${UNAUTHORIZED_ERROR}`));
    });
};

module.exports.getMe = (req, res, next) => {
  User.findById(req.user._id)
    .orFail(new Error('NotValidId'))
    .then((user) => {
      res.status(OK).send(user);
    })
    .catch((err) => {
      console.log(err);
      if (err.message === 'NotValidId') {
        next(new NotFoundError(`Пользователь по указанному id не найден ${NOT_FOUND_ERROR}`));
      }
      if (err.name === 'CastError' || err.name === 'ValidationError') {
        next(new BadRequestError(`Пользователь по указанному id не найден ${BAD_REQUEST_ERROR}`));
      }
      return next(err);
    });
};
