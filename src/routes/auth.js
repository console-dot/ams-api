const router = require('express').Router();
const { Auth } = require('../handlers');
const handler = new Auth();

router.post('/login', handler.login);

module.exports = router;
