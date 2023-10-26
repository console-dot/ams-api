const path = require('node:path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const express = require('express');
const app = express();
const cors = require('cors');
const { db } = require('./db');
const router = require('./routes');
const fileUpload = require('express-fileupload');

app.use(fileUpload());
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));

// Static IP Code
const allowedIP = '116.58.56.154';
app.use((req, res, next) => {
  const clientIP = req.headers['x-real-ip'] || req.ip; // Get the client's IP address

  if (clientIP === allowedIP) {
    // If the client's IP matches the allowed IP, proceed with the request.
    next();
  } else {
    // If the client's IP doesn't match, send a 403 Forbidden response.
    res.status(403).json({
      message: 'Access denied',
      status: 403,
    });
  }
});
// API ENDPOINT
app.use('/api/v1', router);

if (process.env.NODE_ENV === 'local') {
  app.listen(process.env.PORT || 5000, () => {
    console.log('\x1b[33m%s\x1b[0m', '[!] Connection to database...');
    // Database connection error
    db.on('error', (err) => {
      console.error(err);
    });
    // Database connection open
    db.on('open', () => {
      console.log('\x1b[32m', '[+] Database Connected');
      console.log(
        '\x1b[32m',
        `[+] Server Started: http://localhost:${process.env.PORT || 5000}`
      );
    });
  });
}

module.exports = app;
