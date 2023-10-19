const { EmployeeModel } = require('../model');
const Response = require('./Response');
const bcrypt = require('bcrypt');

class Employee extends Response {
  getAllEmployees = async (req, res) => {
    try {
      const employees = await EmployeeModel.find({})
        .populate('designation')
        .populate({
          path: 'designation',
          populate: {
            path: 'department',
            model: 'Department',
          },
        });
      return this.sendResponse(req, res, { data: employees });
    } catch (err) {
      console.log(err);
      return this.sendResponse(req, res, {
        message: 'Internal server error',
        status: 500,
      });
    }
  };
  getOneEmployee = async (req, res) => {
    try {
      const { id } = req.params;
      const employees = await EmployeeModel.findOne({ _id: id });
      if (!employees) {
        return this.sendResponse(req, res, {
          message: 'Employee not found',
          status: 404,
        });
      }
      return this.sendResponse(req, res, { data: employees });
    } catch (err) {
      console.log(err);
      return this.sendResponse(req, res, {
        message: 'Internal server error',
        status: 500,
      });
    }
  };
  createEmployee = async (req, res) => {
    try {
      const {
        employeeId,
        password1,
        password2,
        name,
        email,
        avatar,
        designation,
        phone,
      } = req.body;
      if (password1 !== password2) {
        return this.sendResponse(req, res, {
          status: 405,
          message: 'Passwords should match',
        });
      }
      const password = await bcrypt.hash(password1, 10);
      const newEmployee = new EmployeeModel({
        employeeId,
        password,
        name,
        email,
        avatar,
        designation,
        phone,
      });
      await newEmployee.save();
      return this.sendResponse(req, res, {
        message: 'Employee created',
        status: 201,
      });
    } catch (err) {
      console.log(err);
      return this.sendResponse(req, res, {
        message: 'Internal server error',
        status: 500,
      });
    }
  };
  updateEmployee = async (req, res) => {
    try {
      const data = req.body;
      const { id } = req.params;
      const employeeExist = await EmployeeModel.findOne({ _id: id });
      if (!employeeExist) {
        return this.sendResponse(req, res, {
          message: 'Employee not found',
          status: 404,
        });
      }
      const update = await EmployeeModel.updateOne({ _id: id }, { $set: data });
      if (update.modifiedCount > 0) {
        return this.sendResponse(req, res, {
          message: 'Employee updated',
          status: 200,
        });
      }
      return this.sendResponse(req, res, {
        message: 'Nothing to update',
        status: 405,
      });
    } catch (err) {
      console.log(err);
      return this.sendResponse(req, res, {
        message: 'Internal server error',
        status: 500,
      });
    }
  };
  deleteEmployee = async (req, res) => {
    try {
      const { id } = req.params;
      const employeeExist = await EmployeeModel.deleteOne({ _id: id });
      if (employeeExist.deletedCount > 0) {
        return this.sendResponse(req, res, {
          message: 'Employee deleted',
          status: 200,
        });
      }
      return this.sendResponse(req, res, {
        message: 'Nothing to delete',
        status: 405,
      });
    } catch (err) {
      console.log(err);
      return this.sendResponse(req, res, {
        message: 'Internal server error',
        status: 500,
      });
    }
  };
}

module.exports = { Employee };
