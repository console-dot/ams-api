const router = require('express').Router();
const { File } = require('../handlers');
const handler = new File();

router.get('/:id', handler.getFile);
router.post('/', handler.upload);

module.exports = router;
