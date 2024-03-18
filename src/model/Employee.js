const mongoose = require("mongoose");

const employeeSchema = mongoose.Schema({
  employeeId: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  email: { type: String, required: true, unique: true },
  avatar: { type: mongoose.Types.ObjectId, required: false, ref: "File" },
  designation: {
    type: mongoose.Types.ObjectId,
    required: true,
    ref: "Designation",
  },
  phone: { type: String, required: false },
  experience: {
    type: String,
    required: true,
  },
  education: {
    type: String,
    required: true,
  },
  joiningDate: {
    type: Date,
    required: true,
  },
  endingDate: {
    type: Date,
    required: false,
  }
 
});

const EmployeeModel = mongoose.model("Employee", employeeSchema);

module.exports = { EmployeeModel };
