const { Schema, model, default: mongoose } = require('mongoose');

const attendance = Schema({
  employeeId: {
    type: mongoose.Types.ObjectId,
    ref: 'Employee',
    required: 'true',
  },
  checkin: {
    type: Date,
    default: Date.now,
  },
  status: String,
  checkout: Date,
});

const AttendanceModel = model('Attendance', attendance);
module.exports = { AttendanceModel };
