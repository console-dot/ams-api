const { DepartmentModel } = require('../model');
const Response = require('./Response');

class Department extends Response {
  getAllDepartments = async (req, res) => {
    try {
      const departments = await DepartmentModel.find({});
      return this.sendResponse(req, res, { data: departments });
    } catch (err) {
      console.log(err);
      return this.sendResponse(req, res, {
        message: 'Internal server error',
        status: 500,
      });
    }
  };
  getOneDepartment = async (req, res) => {
    try {
      const { id } = req.params;
      const departments = await DepartmentModel.findOne({ _id: id });
      if (!departments) {
        return this.sendResponse(req, res, {
          message: 'Department not found',
          status: 404,
        });
      }
      return this.sendResponse(req, res, { data: departments });
    } catch (err) {
      console.log(err);
      return this.sendResponse(req, res, {
        message: 'Internal server error',
        status: 500,
      });
    }
  };
  createDepartment = async (req, res) => {
    try {
      const { title } = req.body;
      const newDepartment = new DepartmentModel({
        title,
      });
      await newDepartment.save();
      return this.sendResponse(req, res, {
        message: 'Department created',
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
  updateDepartment = async (req, res) => {
    try {
      const data = req.body;
      const { id } = req.params;
      const departmentExist = await DepartmentModel.findOne({ _id: id });
      if (!departmentExist) {
        return this.sendResponse(req, res, {
          message: 'Department not found',
          status: 404,
        });
      }
      const update = await DepartmentModel.updateOne(
        { _id: id },
        { $set: data }
      );
      if (update.modifiedCount > 0) {
        return this.sendResponse(req, res, {
          message: 'Department updated',
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
  deleteDepartment = async (req, res) => {
    try {
      const { id } = req.params;
      const departmentExist = await DepartmentModel.deleteOne({ _id: id });
      if (departmentExist.deletedCount > 0) {
        return this.sendResponse(req, res, {
          message: 'Department deleted',
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

module.exports = { Department };
