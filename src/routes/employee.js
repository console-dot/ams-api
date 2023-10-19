const router = require('express').Router();
const { Employee } = require('../handlers');
const handler = new Employee();

router.get('/', handler.getAllEmployees);
router.get('/:id', handler.getOneEmployee);
router.post('/', handler.createEmployee);
router.delete('/:id', handler.deleteEmployee);
router.put('/:id', handler.updateEmployee);

module.exports = router;
