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
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', 'http://116.58.56.154');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  next();
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
