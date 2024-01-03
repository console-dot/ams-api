const { io } = require("../app");
const {
  AttendanceModel,
  EmployeeModel,
  QrModel,
  ExtraHoursModel,
} = require("../model");
const Response = require("./Response");

function generateRandomKey(length) {
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+-=`~";
  let randomKey = "";

  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    randomKey += characters.charAt(randomIndex);
  }

  return randomKey;
}

class Attendance extends Response {
  getAllAttendance = async () => {
    console.log("first");
    try {
      const attendance = await AttendanceModel.find()
        .populate({
          path: "employeeId",
          populate: { path: "designation", populate: { path: "department" } },
        })
        .sort({ checkin: -1 });

      return { data: attendance };
    } catch (err) {
      console.error(err);
      throw { message: "Internal Server Error", status: 500 };
    }
  };
  getEmployeeAttendance = async (req, res) => {
    try {
      const { id } = req.params;
      const currentDate = new Date();

      // Find the first day of the current week (Monday)
      const firstDayOfWeek = new Date(currentDate);
      firstDayOfWeek.setDate(currentDate.getDate() - currentDate.getDay() + 1);
      firstDayOfWeek.setHours(0, 0, 0, 0); // Set to midnight

      // Find the last day of the current week (Sunday)
      const lastDayOfWeek = new Date(firstDayOfWeek);
      lastDayOfWeek.setDate(firstDayOfWeek.getDate() + 6);
      lastDayOfWeek.setHours(23, 59, 59, 999);

      const attendance = await AttendanceModel.find({
        employeeId: id,
        checkin: { $gte: firstDayOfWeek, $lt: lastDayOfWeek },
      });
      return this.sendResponse(req, res, { data: attendance });
    } catch (err) {
      console.log(err);
      return this.sendResponse(req, res, {
        message: "Internal Server Error",
        status: 500,
      });
    }
  };
  searchEmployeeAttendance = async (req, res) => {
    try {
      const { id } = req.params;
      const { start, end } = req.query;
      const startDate = new Date(start);
      const endDate = new Date(end);
      const newEndDate = new Date(endDate);
      newEndDate.setDate(newEndDate.getDate() + 1);
      const updatedDate = newEndDate.toISOString();
      const attendance = await AttendanceModel.find({
        employeeId: id,
        checkin: {
          $gte: startDate,
          $lte: updatedDate,
        },
      });
      return this.sendResponse(req, res, { data: attendance });
    } catch (err) {
      console.log(err);
      return this.sendResponse(req, res, {
        message: "Internal Server Error",
        status: 500,
      });
    }
  };
  markAttendance = async (req, res) => {
    try {
      const { employeeId, key } = req.body;
      if (!employeeId) {
        return this.sendResponse(req, res, {
          message: "Employee id is required",
          status: 405,
        });
      }
      if (!key) {
        return this.sendResponse(req, res, {
          message: "Key is required",
          status: 405,
        });
      }
      const keyExist = await QrModel.findOne({ key });
      if (!keyExist) {
        return this.sendResponse(req, res, {
          message: "Key is invalid",
          status: 405,
        });
      }
      const employeeExist = await EmployeeModel.findOne({ _id: employeeId });
      if (!employeeExist) {
        return this.sendResponse(req, res, {
          message: "Employee not found",
          status: 404,
        });
      }
      const attendanceExist = await AttendanceModel.findOne({
        employeeId,
        checkout: null,
      });
      if (attendanceExist) {
        let currStatus = "half";
        const s = new Date(attendanceExist?.checkin);
        const e = new Date();
        const diff = e - s;
        const extraHours = parseInt(diff) - 9;
        if (extraHours > 0) {
          const extraHourEntry = new ExtraHoursModel({
            employeeId: attendanceExist.employeeId,
            hours: extraHours,
            date: Date.now(),
          });
          await extraHourEntry.save();
        }
        if (diff / (1000 * 60 * 60) >= 8) {
          currStatus = "full";
        }
        if (diff / (1000 * 60 * 60) >= 1) {
          await AttendanceModel.updateOne(
            { _id: attendanceExist?._id },
            { $set: { checkout: Date.now(), status: currStatus } }
          );
          await QrModel.deleteMany({});
          return this.sendResponse(req, res, {
            message: "Check-out successfull",
            status: 200,
          });
        } else {
          return this.sendResponse(req, res, { message: "000" });
        }
      }
      const today = new Date();
      const startOfDay = new Date(today);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(today);
      endOfDay.setHours(23, 59, 59, 999);
      const attendanceExistSameDay = await AttendanceModel.findOne({
        checkin: { $gte: startOfDay, $lt: endOfDay },
        employeeId,
      });
      if (attendanceExistSameDay) {
        const checkoutTime = new Date(attendanceExistSameDay?.checkout);
        const diff = today - checkoutTime;
        if (diff / (1000 * 60 * 60) < 8) {
          return this.sendResponse(req, res, {
            message: "Already checked-in today.",
            status: 405,
          });
        }
      }
      const newAttendance = new AttendanceModel({ employeeId });
      await newAttendance.save();
      await QrModel.deleteMany({});
      return this.sendResponse(req, res, {
        message: "Check-in successfull",
        status: 201,
      });
    } catch (err) {
      console.log(err);
      return this.sendResponse(req, res, {
        message: "Internal Server Error",
        status: 500,
      });
    }
  };
}

module.exports = { Attendance, generateRandomKey };
