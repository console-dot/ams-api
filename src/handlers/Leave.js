const { LeaveModel, EmployeeModel } = require("../model");
const Response = require("./Response");
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    service: 'gmail', // Use your email service
    auth: {
      user: 'skbakar1999@gmail.com', // Your email
      pass: 'jwwb lbix uubc ilqf', // Your email password or app-specific password
    //   jwwb lbix uubc ilqf
    },
  });

  transporter.verify((error, success) => {
    if (error) {
      console.error('Error setting up transporter: ', error);
    } else {
      console.log('Transporter is ready to send messages: ', success);
    }
  });

class Leave extends Response {
    async getAllLeaves(req, res) {
        try {
          const leaves = await LeaveModel.find();
          res.json(leaves);
        } catch (error) {
          res.status(500).json({ error: error.message });
        }
      };

  getLeave = async (req, res) => {
    try {
      const { id } = req.params;
      const leave = await LeaveModel.findById(id);
      if (!leave) {
        return this.sendResponse(req, res, {
          message: "Leave not found",
          status: 404,
        });
      }
      return this.sendResponse(req, res, { data: leave });
    } catch (err) {
      console.error(err);
      return this.sendResponse(req, res, {
        message: "Internal Server Error",
        status: 500,
      });
    }
  };
  

  applyLeave = async (req, res) => {
        try {
          console.log(req.body);
          const { employeeId, startDate, endDate, applicationReason, email, name } = req.body;
      
          if (!employeeId || !startDate || !endDate || !applicationReason || !email || !name) {
            return this.sendResponse(req, res, {
              message: "All fields are required",
              status: 400,
            });
          }
      
          const employeeExist = await EmployeeModel.findOne({ employeeId });
          if (!employeeExist) {
            return this.sendResponse(req, res, {
              message: "Employee not found",
              status: 404,
            });
          }
      
          const newLeave = new LeaveModel({
            employeeId,
            fromDate: startDate,
            toDate: endDate,
            applicationReason,
            email,
            name,
          });
      
          await newLeave.save();
      
          // Prepare email options
          const mailOptions = {
            from: 'skbakar1999@gmail.com', // Your email
            to: 'skbakar1999@gmail.com', // HR email
            subject: `Leave Application: ${name}`,
            text: `${name} (Employee ID: ${employeeId}) has applied for leave\nFrom: ${startDate}\nTo: ${endDate}.\nReason: ${applicationReason}.`,
            replyTo: email,
        };
      
          // Send email
          transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
              console.error('Error sending email: ', error);
            } else {
              console.log('Email sent: ' + info.response);
            }
          });
      
          return this.sendResponse(req, res, {
            message: "Leave application submitted successfully",
            status: 201,
          });
        } catch (err) {
          console.error(err);
          return this.sendResponse(req, res, {
            message: "Internal Server Error",
            status: 500,
          });
        }
      };

  deleteLeave = async (req, res) => {
    try {
      const { id } = req.params;
      const leave = await LeaveModel.findByIdAndDelete(id);
      if (!leave) {
        return this.sendResponse(req, res, {
          message: "Leave not found",
          status: 404,
        });
      }
      return this.sendResponse(req, res, {
        message: "Leave deleted successfully",
        status: 200,
      });
    } catch (err) {
      console.error(err);
      return this.sendResponse(req, res, {
        message: "Internal Server Error",
        status: 500,
      });
    }
  };
}

module.exports = { Leave };
