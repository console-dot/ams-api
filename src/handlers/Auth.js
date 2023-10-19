const { EmployeeModel } = require('../model');
const Response = require('./Response');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

class Auth extends Response {
  login = async (req, res) => {
    try {
      const { username, password } = req.body;
      if (!username || !password) {
        return this.sendResponse(req, res, {
          status: 405,
          message: 'Username/Password required',
        });
      }
      const employeeExist = await EmployeeModel.findOne({
        $or: [{ email: username }, { employeeId: username }],
      });
      if (!employeeExist) {
        return this.sendResponse(req, res, {
          status: 405,
          message: 'Username/Password not correct',
        });
      }
      const password0 = employeeExist?.password;
      const isValid = await bcrypt.compare(password, password0);
      if (!isValid) {
        return this.sendResponse(req, res, {
          status: 405,
          message: 'Username/Password not correct',
        });
      }
      const token = jwt.sign({ employeeExist }, process.env.JWT_SECRET, {
        expiresIn: 60 * 10,
      });
      return this.sendResponse(req, res, { data: { token, employeeExist } });
    } catch (err) {
      console.log(err);
      return this.sendResponse(req, res, {
        message: 'Internal Server Error',
        status: 500,
      });
    }
  };
}

module.exports = { Auth };
