const Card = require('../models/card');
const {
  OK,
  CREATED,
  BAD_REQUEST_ERROR,
  FORBIDDEN_ERROR,
  NOT_FOUND_ERROR,
} = require('../constants/HHTP-status-codes');
const BadRequestError = require('../errors/bad-request-error');
const ForbiddenError = require('../errors/forbidden-error');
const NotFoundError = require('../errors/not-found-error');

module.exports.getCards = (req, res, next) => {
  Card.find({})
    .then((cards) => res.status(OK).send(cards))
    .catch(next);
};

module.exports.createCard = (req, res, next) => {
  const { name, link } = req.body;
  const owner = req.user._id;
  Card.create({ name, link, owner })
    .then((card) => res.status(CREATED).send(card))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        next(new BadRequestError(`Переданы некорректные данные при создании карточки ${BAD_REQUEST_ERROR}`));
      }
      return next(err);
    });
};

module.exports.deleteCard = (req, res, next) => {
  const { cardId } = req.params;
  Card.findById(cardId)
    .orFail(new Error('NotValidId'))
    .then((card) => {
      if (card.owner.toString() === req.user._id) {
        Card.findByIdAndRemove(cardId).then(() => res.status(OK).send(card));
      } else {
        throw new ForbiddenError(`Нет прав на удаление карточки ${FORBIDDEN_ERROR}`);
      }
    })
    .catch((err) => {
      if (err.message === 'NotValidId') {
        next(new NotFoundError(`Передан id несуществующий карточки ${NOT_FOUND_ERROR}`));
      }
      return next(err);
    });
};

module.exports.likeCard = (req, res, next) => {
  const owner = req.user._id;
  const { cardId } = req.params;
  Card.findByIdAndUpdate(cardId, { $addToSet: { likes: owner } }, { new: true })
    .orFail(new Error('NotValidId'))
    .then((card) => {
      res.status(OK).send(card);
    })
    .catch((err) => {
      if (err.message === 'NotValidId') {
        next(new NotFoundError(`Передан id несуществующий карточки ${NOT_FOUND_ERROR}`));
      }
      if (err.name === 'ValidationError' || err.name === 'CastError') {
        next(new BadRequestError(`Переданы некорректные данные для постановки лайка ${BAD_REQUEST_ERROR}`));
      }
      return next(err);
    });
};

module.exports.dislikeCard = (req, res, next) => {
  const owner = req.user._id;
  const { cardId } = req.params;
  Card.findByIdAndUpdate(cardId, { $pull: { likes: owner } }, { new: true })
    .orFail(new Error('NotValidId'))
    .then((card) => {
      res.status(OK).send(card);
    })
    .catch((err) => {
      if (err.message === 'NotValidId') {
        next(new NotFoundError(`Передан id несуществующий карточки ${NOT_FOUND_ERROR}`));
      }
      if (err.name === 'ValidationError' || err.name === 'CastError') {
        next(new BadRequestError(`Переданы некорректные данные при удалении лайка ${BAD_REQUEST_ERROR}`));
      }
      return next(err);
    });
};
