const { Schema, model, default: mongoose } = require('mongoose');

const designation = Schema({
  title: { type: String, required: true },
  department: {
    type: mongoose.Types.ObjectId,
    required: true,
    ref: 'Department',
  },
});

const DesignationModel = model('Designation', designation);
module.exports = { DesignationModel };
