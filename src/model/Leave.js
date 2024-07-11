const { Schema, model, default: mongoose } = require("mongoose");

const leaveSchema = new Schema({
  employeeId: {
    type: String,
  },
  fromDate: {
    type: Date,
  },
  toDate: {
    type: Date,
  },
  applicationReason: {
    type: String,
  },
  status: {
    type: String,
    enum: ["Pending", "Approved", "Rejected"],
    default: "Pending",
  },
  email: {
    type: String,
  },
  name: {
    type: String,
  },
});

const LeaveModel = model("Leave", leaveSchema);
module.exports = { LeaveModel };
