const { DesignationModel } = require('../model');
const Response = require('./Response');

class Designation extends Response {
  getAllDesignations = async (req, res) => {
    try {
      const designations = await DesignationModel.find({});
      return this.sendResponse(req, res, { data: designations });
    } catch (err) {
      console.log(err);
      return this.sendResponse(req, res, {
        message: 'Internal server error',
        status: 500,
      });
    }
  };
  getOneDesignation = async (req, res) => {
    try {
      const { id } = req.params;
      const designations = await DesignationModel.findOne({ _id: id });
      if (!designations) {
        return this.sendResponse(req, res, {
          message: 'Designation not found',
          status: 404,
        });
      }
      return this.sendResponse(req, res, { data: designations });
    } catch (err) {
      console.log(err);
      return this.sendResponse(req, res, {
        message: 'Internal server error',
        status: 500,
      });
    }
  };
  createDesignation = async (req, res) => {
    try {
      const { title, department } = req.body;
      const newDesignation = new DesignationModel({
        title,
        department,
      });
      await newDesignation.save();
      return this.sendResponse(req, res, {
        message: 'Designation created',
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
  updateDesignation = async (req, res) => {
    try {
      const data = req.body;
      const { id } = req.params;
      const designationExist = await DesignationModel.findOne({ _id: id });
      if (!designationExist) {
        return this.sendResponse(req, res, {
          message: 'Designation not found',
          status: 404,
        });
      }
      const update = await DesignationModel.updateOne(
        { _id: id },
        { $set: data }
      );
      if (update.modifiedCount > 0) {
        return this.sendResponse(req, res, {
          message: 'Designation updated',
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
  deleteDesignation = async (req, res) => {
    try {
      const { id } = req.params;
      const designationExist = await DesignationModel.deleteOne({ _id: id });
      if (designationExist.deletedCount > 0) {
        return this.sendResponse(req, res, {
          message: 'Designation deleted',
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

module.exports = { Designation };
