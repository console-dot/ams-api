const router = require('express').Router();
const { Designation } = require('../handlers');
const handler = new Designation();

router.get('/', handler.getAllDesignations);
router.get('/:id', handler.getOneDesignation);
router.post('/', handler.createDesignation);
router.delete('/:id', handler.deleteDesignation);
router.put('/:id', handler.updateDesignation);

module.exports = router;
