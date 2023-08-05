const router = require('express').Router();
const { celebrate, Joi } = require('celebrate');
const { AVATAR_REGEXP } = require('../constants/avatar-regexp');

const {
  getUsers, getUser, updateProfile, updateAvatar, getMe,
} = require('../controllers/users');

router.get('/', getUsers);
router.get('/me', getMe);
router.get('/:userId', celebrate({
  params: Joi.object().keys({
    userId: Joi.string().required().hex(),
  }),
}), getUser);
router.patch('/me', celebrate({
  body: Joi.object().keys({
    name: Joi.string().min(2).max(30),
    about: Joi.string().min(2).max(30),
  }),
}), updateProfile);
router.patch('/me/avatar', celebrate({
  body: Joi.object().keys({
    avatar: Joi.string().pattern(AVATAR_REGEXP),
  }),
}), updateAvatar);

module.exports = router;
