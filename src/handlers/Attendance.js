const { AttendanceModel, EmployeeModel, QrModel } = require('../model');
const Response = require('./Response');

function generateRandomKey(length) {
  const characters =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+-=`~';
  let randomKey = '';

  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    randomKey += characters.charAt(randomIndex);
  }

  return randomKey;
}

class Attendance extends Response {
  getAllAttendance = async (req, res) => {
    try {
      const attendance = await AttendanceModel.find();
      return this.sendResponse(req, res, { data: attendance });
    } catch (err) {
      console.log(err);
      return this.sendResponse(req, res, {
        message: 'Internal Server Error',
        status: 500,
      });
    }
  };
  getEmployeeAttendance = async (req, res) => {
    try {
      const { id } = req.params;
      const attendance = await AttendanceModel.find({ employeeId: id });
      return this.sendResponse(req, res, { data: attendance });
    } catch (err) {
      console.log(err);
      return this.sendResponse(req, res, {
        message: 'Internal Server Error',
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
        message: 'Internal Server Error',
        status: 500,
      });
    }
  };
  markAttendance = async (req, res) => {
    try {
      const { employeeId, key } = req.body;
      if (!employeeId) {
        return this.sendResponse(req, res, {
          message: 'Employee id is required',
          status: 405,
        });
      }
      if (!key) {
        return this.sendResponse(req, res, {
          message: 'Key is required',
          status: 405,
        });
      }
      const keyExist = await QrModel.findOne({ key });
      if (!keyExist) {
        return this.sendResponse(req, res, {
          message: 'Key is invalid',
          status: 405,
        });
      }
      const employeeExist = await EmployeeModel.findOne({ _id: employeeId });
      if (!employeeExist) {
        return this.sendResponse(req, res, {
          message: 'Employee not found',
          status: 404,
        });
      }
      const attendanceExist = await AttendanceModel.findOne({
        employeeId,
        checkout: null,
      });
      if (attendanceExist) {
        let currStatus = 'half';
        const s = new Date(attendanceExist?.checkin);
        const e = new Date();
        const diff = e - s;
        if (diff / (1000 * 60 * 60) >= 8) {
          currStatus = 'full';
        }
        await AttendanceModel.updateOne(
          { _id: attendanceExist?._id },
          { $set: { checkout: Date.now(), status: currStatus } }
        );
        await QrModel.deleteMany({});
        return this.sendResponse(req, res, {
          message: 'Check-out successfull',
        });
      }
      const newAttendance = new AttendanceModel({ employeeId });
      await newAttendance.save();
      await QrModel.deleteMany({});
      return this.sendResponse(req, res, {
        message: 'Check-in successfull',
        status: 201,
      });
    } catch (err) {
      console.log(err);
      return this.sendResponse(req, res, {
        message: 'Internal Server Error',
        status: 500,
      });
    }
  };
}

module.exports = { Attendance, generateRandomKey };
