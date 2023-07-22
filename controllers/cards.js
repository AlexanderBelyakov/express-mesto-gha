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
    .then((card) => {
      if (card) {
        res.status(OK).send(card);
      }
      return res.status(NOT_FOUND_ERROR).send({ message: `Передан id несуществующий карточки ${NOT_FOUND_ERROR}` });
    })
    .catch(() => res.status(BAD_REQUEST_ERROR).send({ message: `Карточка с некорректным _id ${BAD_REQUEST_ERROR}` }));
};

module.exports.likeCard = (req, res) => {
  const owner = req.user._id;
  const { cardId } = req.params;
  Card.findByIdAndUpdate(cardId, { $addToSet: { likes: owner } }, { new: true })
    .then((card) => {
      if (card) {
        res.status(OK).send(card);
      }
      return res.status(NOT_FOUND_ERROR).send({ message: `Передан id несуществующий карточки ${NOT_FOUND_ERROR}` });
    })
    .catch((err) => {
      if (err.name === 'ValidationError' || err.name === 'CastError') {
        return res.status(BAD_REQUEST_ERROR).send({ message: `Переданы некорректные данные для постановки лайка ${BAD_REQUEST_ERROR}` });
      }
      return res.status(INTERVAL_SERVER_ERROR).send({ message: `Ошибка сервера ${INTERVAL_SERVER_ERROR}` });
    });
};

module.exports.dislikeCard = (req, res) => {
  const owner = req.user._id;
  const { cardId } = req.params;
  Card.findByIdAndUpdate(cardId, { $pull: { likes: owner } }, { new: true })
    .then((card) => {
      if (card) {
        res.status(OK).send(card);
      }
      return res.status(NOT_FOUND_ERROR).send({ message: `Передан id несуществующий карточки ${NOT_FOUND_ERROR}` });
    })
    .catch((err) => {
      if (err.name === 'ValidationError' || err.name === 'CastError') {
        return res.status(BAD_REQUEST_ERROR).send({ message: `Переданы некорректные данные при удалении лайка ${BAD_REQUEST_ERROR}` });
      }
      return res.status(INTERVAL_SERVER_ERROR).send({ message: `Ошибка сервера ${INTERVAL_SERVER_ERROR}` });
    });
};
