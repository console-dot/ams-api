const { QrModel } = require('../model');
const { generateRandomKey } = require('./Attendance');
const Response = require('./Response');

class Qr extends Response {
  getKey = async (req, res) => {
    try {
      const newKey = generateRandomKey(64);
      const key = await QrModel.find({});
      if (key.length > 0) return res.status(200).json({ key: key[0]?.key });
      const newQr = new QrModel({ key: newKey });
      const n = await newQr.save();
      return res.status(200).json({ key: n?.key });
    } catch (err) {
      console.log(err);
      return this.sendResponse(req, res, {
        message: 'Internal server error',
        status: 500,
      });
    }
  };
}

module.exports = { Qr };
