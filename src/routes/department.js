const router = require('express').Router();
const { Department } = require('../handlers');
const handler = new Department();

router.get('/', handler.getAllDepartments);
router.get('/:id', handler.getOneDepartment);
router.post('/', handler.createDepartment);
router.delete('/:id', handler.deleteDepartment);
router.put('/:id', handler.updateDepartment);

module.exports = router;
