const { Schema, model } = require('mongoose');

const resetPassword = Schema({
  key: { type: String, required: true, unique: true },
  email: { type: String, required: true },
});

const ResetPasswordModel = model('ResetPassword', resetPassword);
module.exports = { ResetPasswordModel };
