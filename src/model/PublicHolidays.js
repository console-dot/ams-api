const mongoose = require("mongoose");
const { Schema, model } = mongoose;

const publicHolidaysSchema = new Schema({
  holidayDate: {
    type: Date,
    required: [true, "Please provide at least one leave date"],
  },
  reasonForLeave: {
    type: String,
    required: [true, "Please provide the reason for leave"],
  },
});
const PublicHolidaysModel = model("PublicHolidays", publicHolidaysSchema);

module.exports = { PublicHolidaysModel };
