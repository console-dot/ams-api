const router = require('express').Router();
const { Qr } = require('../handlers');
const handler = new Qr();

router.get('/', handler.getKey);

module.exports = router;
