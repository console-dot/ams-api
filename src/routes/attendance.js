const router = require('express').Router();
const { Attendance } = require('../handlers');
const handler = new Attendance();

router.get('/', handler.getAllAttendance);
router.get('/:id', handler.getEmployeeAttendance);
router.post('/', handler.markAttendance);

module.exports = router;
