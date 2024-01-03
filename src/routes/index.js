const router = require("express").Router();
const employee = require("./employee");
const file = require("./file");
const department = require("./department");
const designation = require("./designation");
const auth = require("./auth");
const attendance = require("./attendance");
const qr = require("./qr");
const hrModule = require("./hrAttendance");
const temp = require("./temp");

router.use("/employee", employee);
router.use("/file", file);
router.use("/department", department);
router.use("/designation", designation);
router.use("/auth", auth);
router.use("/attendance", attendance);
router.use("/qr", qr);
router.use("/hr", hrModule);
router.use("/temp", temp);

module.exports = router;
