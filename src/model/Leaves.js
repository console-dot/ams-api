const mongoose = require("mongoose");
const { Schema, model } = mongoose;

const leaveSchema = new Schema({
  employeeId: {
    type: mongoose.Types.ObjectId,
    ref: "Employee",
    required: [true, "Please provide an employeeId"],
  },
  leaveDate: {
    type: Date,
    required: [true, "Please provide at least one leave date"],
  },

});

const LeavesModel = model("Leaves", leaveSchema);

module.exports = { LeavesModel };
