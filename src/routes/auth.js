const router = require('express').Router();
const { Auth } = require('../handlers');
const handler = new Auth();

router.post('/login', handler.login);
router.post('/forget-password', handler.forgetPassword);
router.post('/reset-password', handler.resetPassword);

module.exports = router;
