const { Schema, model } = require('mongoose');

const qr = Schema({
  key: { type: String, required: true, unique: true },
});

const QrModel = model('Qr', qr);
module.exports = { QrModel };
