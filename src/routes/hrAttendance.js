const router = require("express").Router();
const { HrAttendance } = require("../handlers");
const handler = new HrAttendance();

router.get("/all-attendances", handler.getAllAttendance);
router.get("/search-emp-attendance", handler.searchEmployeeAttendance);
router.patch("/mark-checkout", handler.markCheckout);
router.get("/search-all", handler.searchAttendance);
router.get("/report", handler.getReport);
router.post("/mark-leave", handler.markLeave);
router.get("/leaves", handler.fetchLeaves);
router.post("/mark-holiday", handler.markHoliday);
router.get("/all-leaves", handler.fetchAllLeaves);

module.exports = router;
