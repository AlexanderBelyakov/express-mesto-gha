const Card = require('../models/card');
const {
  OK,
  CREATED,
  BAD_REQUEST_ERROR,
  NOT_FOUND_ERROR,
  INTERVAL_SERVER_ERROR,
} = require('../HHTP_status_codes/HHTP-status-codes');

module.exports.getCards = (req, res) => {
  Card.find({})
    .then((cards) => res.status(OK).send(cards))
    .catch(() => res.status(INTERVAL_SERVER_ERROR).send({ message: `Ошибка сервера ${INTERVAL_SERVER_ERROR}` }));
};

module.exports.createCard = (req, res) => {
  const { name, link } = req.body;
  const owner = req.user._id;
  Card.create({ name, link, owner })
    .then((card) => res.status(CREATED).send(card))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        return res.status(BAD_REQUEST_ERROR).send({ message: `Переданы некорректные данные при создании карточки ${BAD_REQUEST_ERROR}` });
      }
      return res.status(INTERVAL_SERVER_ERROR).send({ message: `Ошибка сервера ${INTERVAL_SERVER_ERROR}` });
    });
};

module.exports.deleteCard = (req, res) => {
  const { cardId } = req.params;
  Card.findByIdAndRemove(cardId)
    .then((card) => res.status(OK).send(card))
    .catch(() => res.status(NOT_FOUND_ERROR).send({ message: `Карточка с указанным _id не найдена ${NOT_FOUND_ERROR}` }));
};

module.exports.likeCard = (req, res) => {
  const { _id: userId } = req.user;
  const { cardId } = req.params;
  Card.findByIdAndUpdate(cardId, { $addToSet: { likes: userId } }, { new: true })
    .then((card) => res.status(OK).send(card))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        return res.status(BAD_REQUEST_ERROR).send({ message: `Переданы некорректные данные для постановки лайка ${BAD_REQUEST_ERROR}` });
      }
      if (err.name === 'CastError') {
        return res.status(NOT_FOUND_ERROR).send({ message: `Передан id несуществующий карточки ${NOT_FOUND_ERROR}` });
      }
      return res.status(INTERVAL_SERVER_ERROR).send({ message: `Ошибка сервера ${INTERVAL_SERVER_ERROR}` });
    });
};

module.exports.dislikeCard = (req, res) => {
  const { _id: userId } = req.user;
  const { cardId } = req.params;
  Card.findByIdAndUpdate(cardId, { $pull: { likes: userId } }, { new: true })
    .then((card) => res.status(OK).send(card))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        return res.status(BAD_REQUEST_ERROR).send({ message: `Переданы некорректные данные при снятии лайка ${BAD_REQUEST_ERROR}` });
      }
      if (err.name === 'CastError') {
        return res.status(NOT_FOUND_ERROR).send({ message: `Передан id несуществующий карточки ${NOT_FOUND_ERROR}` });
      }
      return res.status(INTERVAL_SERVER_ERROR).send({ message: `Ошибка сервера ${INTERVAL_SERVER_ERROR}` });
    });
};
