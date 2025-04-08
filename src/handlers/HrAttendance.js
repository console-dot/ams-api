const { EmployeeModel, PublicHolidaysModel } = require("../model");
const { AttendanceModel } = require("../model");
const jwt = require("jsonwebtoken");
const Response = require("./Response");
const { createLeaveCollections, LeavesModel } = require("../model/Leaves");

class HrAttendance extends Response {
  getAllAttendance = async (req, res) => {
    try {
      const attendance = await AttendanceModel.find()
        .populate({
          path: "employeeId",
          populate: { path: "designation", populate: { path: "department" } },
        })
        .sort({ checkin: -1 });
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
      const { empId, start, end } = req.query;
      if (!start || !end) {
        return this.sendResponse(req, res, {
          message: "Dates are required",
          status: 400,
        });
      }
      const startDate = new Date(start);
      const endDate = new Date(end);
      const newEndDate = new Date(endDate);
      newEndDate.setDate(newEndDate.getDate() + 1);
      const updatedDate = newEndDate.toISOString();

      const token = req.headers.authorization;
      if (!token) {
        return this.sendResponse(req, res, {
          message: "Access Denied",
          status: 401,
        });
      } else {
        const decoded = jwt.decode(token);
        const id = decoded.employeeExist._id;
        const user = await EmployeeModel.findById(id).populate("designation");
        const userDesignation = user?.designation?.title;

        if (userDesignation !== "Director HR") {
          return this.sendResponse(req, res, {
            message:
              "Access denied. Only HR department can perform this action.",
            status: 403,
          });
        }
        if (!empId) {
          const attendance = await AttendanceModel.find({
            checkin: {
              $gte: startDate,
              $lte: updatedDate,
            },
          }).populate({
            path: "employeeId",
            populate: { path: "designation", populate: { path: "department" } },
          });
          return this.sendResponse(req, res, { data: attendance });
        }
        const employeeData = await EmployeeModel.find({ employeeId: empId });
        const emId = employeeData[0]._id;
        const attendance = await AttendanceModel.find({
          employeeId: emId,
          checkin: {
            $gte: startDate,
            $lte: updatedDate,
          },
        }).populate({
          path: "employeeId",
          populate: { path: "designation", populate: { path: "department" } },
        });
        return this.sendResponse(req, res, { data: attendance });
      }
    } catch (err) {
      console.log(err);
      return this.sendResponse(req, res, {
        message: "Internal Server Error",
        status: 500,
      });
    }
  };
  searchAttendance = async (req, res) => {
    const { start, end } = req.query;
    const startDate = new Date(start);
    const endDate = new Date(end);
    const newEndDate = new Date(endDate);
    newEndDate.setDate(newEndDate.getDate() + 1);
    const updatedDate = newEndDate.toISOString();
    try {
      const token = req.headers.authorization;
      if (!token) {
        return this.sendResponse(req, res, {
          message: "Access Denied",
          status: 401,
        });
      } else {
        const decoded = jwt.decode(token.split(" ")[1]);
        const id = decoded.employeeExist._id;

        const user = await EmployeeModel.findById(id).populate("designation");
        const userDesignation = user?.designation?.title;

        if (userDesignation !== "Director HR") {
          return this.sendResponse(req, res, {
            message:
              "Access denied. Only HR department can perform this action.",
            status: 403,
          });
        }
        const attendances = await AttendanceModel.find({
          checkin: { $gte: startDate, $lte: updatedDate },
        });

        return this.sendResponse(req, res, { data: attendances });
      }
    } catch (error) {
      console.log(error);
      return this.sendResponse(req, res, {
        message: "Internal Server Error",
        status: 500,
      });
    }
  };
  markCheckout = async (req, res) => {
    const { date, attendanceId } = req.body;
    const token = req.headers.authorization;
    try {
      if (!token) {
        return this.sendResponse(req, res, {
          message: "Access Denied",
          status: 401,
        });
      } else {
        const decoded = jwt.decode(token.split(" ")[1]);
        const id = decoded.employeeExist._id;
        const user = await EmployeeModel.findById(id).populate("designation");
        const userDesignation = user?.designation?.title;
        if (userDesignation !== "Director HR") {
          return this.sendResponse(req, res, {
            message: "Only HR Department can perform this action",
            status: 404,
          });
        }
        const attendanceExist = await AttendanceModel.findOne({
          _id: attendanceId,
        });
        if (!attendanceExist) {
          return this.sendResponse(req, res, {
            message: "The user did not check in on this date",
            status: 404,
          });
        }
        const checkIn = new Date(attendanceExist.checkin);
        const newCheckout = new Date(date);
        if (newCheckout < checkIn) {
          return this.sendResponse(req, res, {
            message: "Employee checkout is not matching",
            status: 400,
          });
        }
        const updatedAttendance = await AttendanceModel.updateOne(
          { _id: attendanceId },
          { $set: { checkout: date } },
          { new: true }
        );
        if (updatedAttendance.modifiedCount > 0) {
          return this.sendResponse(req, res, {
            message: "Employee is checked out successfully",
            status: 200,
            data: updatedAttendance,
          });
        } else {
          throw new Error("Failed to update the employee's attendance record");
        }
      }
    } catch (err) {
      console.log(err);
      return this.sendResponse(req, res, {
        message: "Internal Server Error",
        status: 500,
      });
    }
  };
  getReport = async (req, res) => {
    const { empId, start, end } = req.query;
    const endDate = new Date(end);
    const newEndDate = new Date(endDate);
    newEndDate.setDate(newEndDate.getDate() + 1);
    try {
      const token = req.headers.authorization;
      if (!token) {
        return this.sendResponse(req, res, {
          message: "Access Denied",
          status: 401,
        });
      }
      if (endDate > Date.now()) {
        return this.sendResponse(req, res, {
          message: "End date should not be greater than today's date",
          status: 400,
        });
      }
      const decoded = jwt.decode(token);
      const id = decoded.employeeExist._id;
      const user = await EmployeeModel.findById(id).populate("designation");
      const userDesignation = user?.designation?.title;

      if (userDesignation !== "Director HR") {
        return this.sendResponse(req, res, {
          message: "Access denied. Only HR department can perform this action.",
          status: 403,
        });
      }
      const isEmployee = await EmployeeModel.findOne({ employeeId: empId });
      if (!isEmployee) {
        return this.sendResponse(req, res, {
          message: "User does not exist with this id",
          status: 404,
        });
      }
      let absents = await getLeaves2(start, end, empId);
      const leaves = await LeavesModel.find({
        employeeId: isEmployee?._id,
        leaveDate: { $gte: new Date(start).setHours(0, 0, 0) },
      });
      const tLeaves = leaves.map((obj) => {
        return obj?.leaveDate;
      });
      const totalAbsents = absents?.absent?.filter(
        (absent) =>
          !tLeaves.some((curr) =>
            areDatesEqualIgnoringTime(new Date(curr), new Date(absent))
          )
      );
      return this.sendResponse(req, res, {
        message: "Report is Fetched Successfully",
        status: 200,
        data: {
          attendance: absents?.attendance,
          user: isEmployee,
          leaves: leaves,
          abDates: totalAbsents,
          publicHolidays: absents.publicHolidays,
        },
      });
    } catch (error) {
      console.log(error);
      return this.sendResponse(req, res, {
        message: "Internal Server Error",
        status: 500,
      });
    }
  };
  markLeave = async (req, res) => {
    const { start, end, empId } = req.body;
    try {
      if (!start || !end || !empId) {
        return this.sendResponse(req, res, {
          message: "Invalid credentials",
          status: 400,
        });
      }

      const currentDate = new Date();
      currentDate.setHours(0, 0, 0, 0);
      const providedStartDate = new Date(start);
      const providedEndDate = new Date(end);
      const token = req.headers.authorization;
      if (!token) {
        return this.sendResponse(req, res, {
          message: "Token is not valid",
          status: 400,
        });
      } else {
        const decoded = jwt.decode(token);
        const id = decoded.employeeExist?._id;
        const isHr = await EmployeeModel.findOne({ _id: id }).populate(
          "designation"
        );

        if (isHr.designation.title !== "Director HR") {
          return this.sendResponse(req, res, {
            message:
              "Access denied. Only HR department can perform this action.",
            status: 400,
          });
        }

        const isEmployee = await EmployeeModel.findOne({ employeeId: empId });
        if (!isEmployee) {
          return this.sendResponse(req, res, {
            message: "Employee with this id does not exist",
            status: 400,
          });
        }

        const leaveDates = [];

        for (
          let currentDate = new Date(providedStartDate);
          currentDate.getTime() <= providedEndDate.getTime();
          currentDate.setDate(currentDate.getDate() + 1)
        ) {
          leaveDates.push({
            leaveDate: new Date(currentDate),
            employeeId: isEmployee?._id,
          });
        }
        const marked = await LeavesModel.insertMany(leaveDates);
        if (marked.length > 0) {
          return this.sendResponse(req, res, {
            message: "Leaves are marked successfully",
            status: 201,
          });
        }
      }
    } catch (error) {
      console.log(error);
      return this.sendResponse(req, res, {
        message: "Internal Server Error",
        status: 500,
      });
    }
  };

  fetchLeaves = async (req, res) => {
    const { id, start, end } = req.query;
    const empId = id;
    const providedStartDate = new Date(start);
    providedStartDate.setHours(0, 0, 0, 0);
    const providedEndDate = new Date(end);
    providedEndDate.setHours(0, 0, 0);
    try {
      const token = req.headers.authorization;
      if (!token) {
        return this.sendResponse(req, res, {
          message: "Token is not valid",
          status: 400,
        });
      } else {
        const decoded = jwt.decode(token);
        const id = decoded.employeeExist?._id;
        const isHr = await EmployeeModel.findOne({ _id: id }).populate(
          "designation"
        );
        if (isHr.designation.title !== "Director HR") {
          return this.sendResponse(req, res, {
            message:
              "Access denied. Only HR department can perform this action.",
            status: 400,
          });
        }
        const isEmployee = await EmployeeModel.find({ _id: empId });
        if (!isEmployee) {
          return this.sendResponse(req, res, {
            message: "Employee with this id does not exist",
            status: 400,
          });
        }
        let query = { employeeId: empId };

        if (providedStartDate && providedEndDate) {
          // Both start and end dates are provided
          query.leaveDate = { $gte: providedStartDate, $lte: providedEndDate };
        } else if (providedStartDate) {
          // Only start date is provided
          query.leaveDate = { $gte: providedStartDate };
          // You can optionally add an endDate condition if needed
        } else if (providedEndDate) {
          // Only end date is provided
          query.leaveDate = { $lte: providedEndDate };
        }
        const leaves = await LeavesModel.find(query);
        if (!leaves) {
          return this.sendResponse(req, res, {
            message: "No Leaves are found ",
            status: 404,
          });
        }
        return this.sendResponse(req, res, {
          message: "Leave are fetched successfull",
          status: 200,
          data: leaves,
        });
      }
    } catch (error) {
      console.log(error);
      return this.sendResponse(req, res, {
        message: "Internal Server Error",
        status: 500,
      });
    }
  };
  fetchAllLeaves = async (req, res) => {
    const { start, end } = req.query;
    const providedStartDate = new Date(start);
    providedStartDate.setHours(0, 0, 0, 0);
    const providedEndDate = new Date(end);
    providedEndDate.setHours(0, 0, 0);
    try {
      const token = req.headers.authorization;
      if (!token) {
        return this.sendResponse(req, res, {
          message: "Token is not valid",
          status: 400,
        });
      } else {
        const decoded = jwt.decode(token);
        const id = decoded.employeeExist?._id;
        const isHr = await EmployeeModel.findOne({ _id: id }).populate(
          "designation"
        );
        if (isHr.designation.title !== "Director HR") {
          return this.sendResponse(req, res, {
            message:
              "Access denied. Only HR department can perform this action.",
            status: 400,
          });
        }
        const leaves = await LeavesModel.find({})
          .populate({
            path: "employeeId",
            populate: { path: "designation", populate: { path: "department" } },
          })
          .sort({ leaveDate: -1 });
        if (!leaves) {
          return this.sendResponse(req, res, {
            message: "No Leaves are found ",
            status: 404,
          });
        }
        return this.sendResponse(req, res, {
          message: "Leave are fetched successfull",
          status: 200,
          data: leaves,
        });
      }
    } catch (error) {
      console.log(error);
      return this.sendResponse(req, res, {
        message: "Internal Server Error",
        status: 500,
      });
    }
  };
  markHoliday = async (req, res) => {
    const { reason, start, end } = req.body;
    console.log(start, reason);
    const providedStartDate = new Date(start);
    if (!providedStartDate) {
      return this.sendResponse(req, res, {
        message: "Requires date",
        status: 400,
      });
    }
    try {
      const token = req.headers.authorization;
      if (!token) {
        return this.sendResponse(req, res, {
          message: "Token is not valid",
          status: 400,
        });
      } else {
        const decoded = jwt.decode(token);
        const id = decoded.employeeExist?._id;
        const isHr = await EmployeeModel.findOne({ _id: id }).populate(
          "designation"
        );

        if (isHr.designation.title !== "Director HR") {
          return this.sendResponse(req, res, {
            message:
              "Access denied. Only HR department can perform this action.",
            status: 400,
          });
        }

        // Create a new holiday entry
        const holidayData = {
          holidayDate: providedStartDate,
          reasonForLeave: reason,
        };

        // If end date is provided, add it to the holiday data
        if (end) {
          const providedEndDate = new Date(end);
          holidayData.endHolidayDate = providedEndDate; // Only set if end date exists
        }

        // Save the holiday entry
        const holiDayAdded = new PublicHolidaysModel(holidayData);
        await holiDayAdded.save();
        return this.sendResponse(req, res, {
          message: "Holiday date added successfully",
          status: 201,
        });
      }
    } catch (error) {
      console.error(error);
      return this.sendResponse(req, res, {
        message: "Internal server error",
        status: 500,
      });
    }
  };
  fetchAllHolidays = async (req, res) => {
    const { start, end } = req.query;
    const providedStartDate = new Date(start);
    providedStartDate.setHours(0, 0, 0, 0);
    const providedEndDate = new Date(end);
    providedEndDate.setHours(0, 0, 0);
    try {
      const token = req.headers.authorization;
      if (!token) {
        return this.sendResponse(req, res, {
          message: "Token is not valid",
          status: 400,
        });
      } else {
        const decoded = jwt.decode(token);
        const id = decoded.employeeExist?._id;
        const isHr = await EmployeeModel.findOne({ _id: id }).populate(
          "designation"
        );
        if (isHr.designation.title !== "Director HR") {
          return this.sendResponse(req, res, {
            message:
              "Access denied. Only HR department can perform this action.",
            status: 400,
          });
        }
        const holidays = await PublicHolidaysModel.find({}).sort({ holidayDate: -1 });
        console.log(holidays);
        if (!holidays) {
          return this.sendResponse(req, res, {
            message: "No Holidays are found ",
            status: 404,
          });
        }
        return this.sendResponse(req, res, {
          message: "Holidays are fetched successfull",
          status: 200,
          data: holidays,
        });
      }
    } catch (error) {
      console.log(error);
      return this.sendResponse(req, res, {
        message: "Internal Server Error",
        status: 500,
      });
    }
  };
}

module.exports = { HrAttendance };

const getLeaves2 = async (start, end, empId) => {
  try {
    const emp = await EmployeeModel.findOne({ employeeId: empId });
    if (!emp) {
      return { absent: [], attendance: [] };
    }

    const S = new Date(start);
    const E = new Date(end);
    E.setHours(23, 59, 59, 999);
    const today = new Date();

    const attendances = await AttendanceModel.find({
      checkin: { $gte: S, $lte: E },
      employeeId: emp._id,
    });

    const oneDay = 24 * 60 * 60 * 1000;
    const s = S.getTime();
    const e = E.getTime();
    const difference = Math.abs(s - e);
    const daysDifference = Math.ceil(difference / oneDay) + 1;

    const daysOfWeek = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
      "12-25",
      "08-14",
    ];

    const absents = [];
    const PublicHolidays = await PublicHolidaysModel.find({
      holidayDate: { $gte: S, $lte: E },
    });
    for (let i = 0; i < daysDifference; i++) {
      const result = new Date(S);
      const temp = new Date(S);
      result.setDate(result.getDate() + i);
      temp.setDate(temp.getDate() + i + 1);

      if (
        daysOfWeek[result.getDay()] === "Sunday" ||
        daysOfWeek[result.getDay()] === "Saturday"
      ) {
        continue;
      }
      const isPublicHoliday = PublicHolidays.some(({ holidayDate }) =>
        areDatesEqualIgnoringTime(result, new Date(holidayDate))
      );
      if (isPublicHoliday) {
        continue;
      }
      // Check if the date is today and if the checkin time has already occurred
      const isToday = result.toDateString() === today.toDateString();
      const isCheckinDone = today.getTime() > temp.getTime();

      if (isToday && !isCheckinDone) {
        continue;
      }

      let a = attendances.filter(({ checkin }) => {
        const c = new Date(checkin);
        if (c.getTime() >= result.getTime() && c.getTime() < temp.getTime()) {
          return true;
        }
        return false;
      });

      if (a?.length < 1) {
        absents.push(result);
      }
    }

    return {
      absent: absents,
      attendance: attendances,
      publicHolidays: PublicHolidays,
    };
  } catch (err) {
    console.log(err);
    return { absent: [], attendance: [], PublicHolidays: [] };
  }
};

const areDatesEqualIgnoringTime = (curr, leave) => {
  return (
    curr.getUTCFullYear() === leave.getUTCFullYear() &&
    curr.getUTCMonth() === leave.getUTCMonth() &&
    curr.getUTCDate() === leave.getUTCDate()
  );
};
