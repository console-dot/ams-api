const router = require("express").Router();
const { HrAttendance, Attendance } = require("../handlers");
const handler = new HrAttendance();
const handlerAttendance = new Attendance();

router.get("/all-attendances", handler.getAllAttendance);
router.get("/search-emp-attendance", handler.searchEmployeeAttendance);
router.patch("/mark-checkout", handler.markCheckout);
router.get("/search-all", handler.searchAttendance);
router.get("/report", handler.getReport);
router.post("/mark-leave", handler.markLeave);
router.get("/leaves", handler.fetchLeaves);
router.post("/mark-holiday", handler.markHoliday);
router.get("/all-leaves", handler.fetchAllLeaves);
router.put("/update-attendance/:id", handlerAttendance.updateAttendance);
router.post("/mark-attendance", handlerAttendance.customAttendance);

module.exports = router;
