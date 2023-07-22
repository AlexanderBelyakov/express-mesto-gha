const express = require('express');

const mongoose = require('mongoose');

const { NOT_FOUND_ERROR } = require('./HHTP_status_codes/HHTP-status-codes');

const { PORT = 3000 } = process.env;
// Слушаем 3000 порт
const app = express();

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
app.use((req, res, next) => { // Псевдоавторризация
  req.user = {
    _id: '64b872cca4c43e1e2b5ee6d1',
  };

  next();
});

app.use('*', (req, res) => {
  res.status(NOT_FOUND_ERROR).send({ message: `Страница не найдена ${NOT_FOUND_ERROR}` });
});

app.use('/users', require('./routes/users'));
app.use('/cards', require('./routes/cards'));

app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}`);
});
