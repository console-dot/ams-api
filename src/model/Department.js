const { Schema, model } = require('mongoose');

const department = Schema({
  title: { type: String, required: true, unique: true },
});

const DepartmentModel = model('Department', department);
module.exports = { DepartmentModel };
