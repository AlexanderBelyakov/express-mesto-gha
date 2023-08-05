const express = require('express');

const mongoose = require('mongoose');

const helmet = require('helmet');

const { errors, celebrate, Joi } = require('celebrate');

const { NOT_FOUND_ERROR } = require('./constants/HHTP-status-codes');
const NotFoundError = require('./errors/not-found-error');
const { AVATAR_REGEXP } = require('./constants/avatar-regexp');

const { PORT = 3000 } = process.env;
// Слушаем 3000 порт
const { login, createUser } = require('./controllers/users');
const auth = require('./middlewares/auth');
const mainErrorHandler = require('./middlewares/mainErrorHandler');

const app = express();
app.use(helmet());
mongoose.connect('mongodb://127.0.0.1:27017/mestodb', { // MongooseServerSelectionError: connect ECONNREFUSED ::1:27017

})
  .then(() => {
    console.log('connected');
  })
  .catch(() => {
    console.log('no connection');
  });
app.use(express.json());
// Встроенный посредник, разбирающий входящие запросы в объект в формате JSON.

app.post('/signup', celebrate({
  body: Joi.object().keys({
    name: Joi.string().min(2).max(30),
    about: Joi.string().min(2).max(30),
    avatar: Joi.string().pattern(AVATAR_REGEXP),
    email: Joi.string().required().email(),
    password: Joi.string().required(),
  }),
}), createUser);
app.post('/signin', celebrate({
  body: Joi.object().keys({
    email: Joi.string().required().email(),
    password: Joi.string().required(),
  }),
}), login);
app.use(auth);
app.use('/users', require('./routes/users'));
app.use('/cards', require('./routes/cards'));

app.use('*', (req, res, next) => {
  next(new NotFoundError(`Страница не найдена ${NOT_FOUND_ERROR}`));
});

app.use(errors());
app.use(mainErrorHandler);

app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}`);
});
