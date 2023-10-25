const { EmployeeModel, ResetPasswordModel } = require('../model');
const Mailer = require('./Mailer');
const Response = require('./Response');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

class Auth extends Response {
  login = async (req, res) => {
    try {
      const { username, password, remember } = req.body;
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
      let token;
      if (!remember) {
        token = jwt.sign({ employeeExist }, process.env.JWT_SECRET, {
          expiresIn: 60 * 10,
        });
      } else {
        token = jwt.sign({ employeeExist }, process.env.JWT_SECRET);
      }
      return this.sendResponse(req, res, {
        data: { token, employeeExist },
        message: 'Login Successful',
      });
    } catch (err) {
      console.log(err);
      return this.sendResponse(req, res, {
        message: 'Internal Server Error',
        status: 500,
      });
    }
  };
  forgetPassword = async (req, res) => {
    try {
      const { email } = req.body;
      if (!email) {
        return this.sendResponse(req, res, {
          message: 'Email is required',
          status: 405,
        });
      }
      const employeeExist = await EmployeeModel.findOne({ email });
      if (employeeExist) {
        await ResetPasswordModel.deleteMany({ email });
        const key = jwt.sign({ email }, process.env.JWT_SECRET, {
          expiresIn: 60 * 60,
        });
        const mailer = new Mailer();
        const html = `
      <!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Password Reset</title>
</head>
<body>
    <table align="center" cellpadding="0" cellspacing="0" width="600" style="border-collapse: collapse;">
        <tr>
            <td align="center" bgcolor="#0078d4" style="padding: 40px 0;">
                <h1 style="color: #fff;">Password Reset</h1>
            </td>
        </tr>
        <tr>
            <td style="padding: 20px 0;">
                <p>Hello,</p>
                <p>You have requested to reset your password. To complete the password reset process, please click the following link:</p>
                <p><a href="${
                  process.env.BASE_URL || 'http://localhost:3000'
                }/reset-password?key=${key}" style="background-color: #0078d4; color: #fff; padding: 10px 20px; text-decoration: none;">Reset Password</a></p>
                <p>If you did not request a password reset, you can ignore this email.</p>
                <p>Thank you,</p>
                <p>ConsoleDot</p>
            </td>
        </tr>
        <tr>
            <td bgcolor="#0078d4" style="padding: 20px 0; color: #fff; text-align: center;">
                &copy; 2023 ConsoleDot. All rights reserved.
            </td>
        </tr>
    </table>
</body>
</html>`;
        mailer.sendMail(
          process.env.MAIL_EMAIL,
          email,
          'Reset Password Link',
          html
        );
        const newKey = new ResetPasswordModel({ email, key });
        await newKey.save();
      }
      return this.sendResponse(req, res, {
        message:
          'Reset link will be sent to your email address if found in our records',
      });
    } catch (err) {
      console.log(err);
      return this.sendResponse(req, res, {
        message: 'Internal Server Error',
        status: 500,
      });
    }
  };
  resetPassword = async (req, res) => {
    try {
      const { key, password1, password2 } = req.body;
      if (!key) {
        return this.sendResponse(req, res, {
          message: 'Key is required',
          status: 405,
        });
      }
      if (!password1) {
        return this.sendResponse(req, res, {
          message: 'Password is required',
          status: 405,
        });
      }
      if (password1 !== password2) {
        return this.sendResponse(req, res, {
          message: 'Both passwords should match',
          status: 405,
        });
      }
      try {
        const decoded = jwt.verify(key, process.env.JWT_SECRET);
        const keyExist = await ResetPasswordModel.findOne({
          email: decoded?.email,
          key,
        });
        if (!keyExist) {
          return this.sendResponse(req, res, {
            message: 'Invalid key',
            status: 405,
          });
        }
        await ResetPasswordModel.deleteMany({ email: decoded?.email });
        const password = await bcrypt.hash(password1, 10);
        await EmployeeModel.updateOne(
          { email: decoded?.email },
          { $set: { password } }
        );
        return this.sendResponse(req, res, {
          message: 'Password Updated',
          status: 200,
        });
      } catch (err) {
        return this.sendResponse(req, res, {
          message: err?.message ? 'Link Expired' : err?.message.toUpperCase(),
          status: 405,
        });
      }
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
