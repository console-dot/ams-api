const router = require('express').Router();
const { Leave } = require('../handlers');
const handler = new Leave();

router.get('/', handler.getAllLeaves);
router.get('/:id', handler.getLeave);
router.post('/', handler.applyLeave);
router.delete('/:id', handler.deleteLeave);

module.exports = router;
