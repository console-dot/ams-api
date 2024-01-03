const mongoose = require("mongoose");

const extraHours = mongoose.Schema({
  employeeId: {
    type: mongoose.Types.ObjectId,
    ref: "Employee",
    required: true,
  },
  hours: {
    type: Number,
    required: true,
  },
  date: {
    type: Date,
    default: Date.now,
  },
});

const ExtraHoursModel = mongoose.model("ExtraHours", extraHours);
module.exports = { ExtraHoursModel };
