const nodemailer = require('nodemailer');

class Mailer {
  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.MAIL_HOST,
      port: parseInt(process.env.MAIL_PORT),
      secure: parseInt(process.env.MAIL_PORT) == 465, // true for 465, false for other ports
      auth: {
        user: process.env.MAIL_EMAIL, // generated ethereal user
        pass: process.env.MAIL_PASSWORD, // generated ethereal password
      },
    });
  }
  sendMail = async (from, to, subject, html) => {
    const mailOptions = {
      from,
      to,
      subject,
      html,
    };
    try {
      const res = await this.transporter.sendMail(mailOptions);
      return 0;
    } catch (err) {
      console.log('Failed. Trying again (1/3)');
      try {
        const res = await this.transporter.sendMail(mailOptions);
        return 0;
      } catch (err) {
        console.log('Failed. Trying again (2/3)');
        try {
          const res = await this.transporter.sendMail(mailOptions);
          return 0;
        } catch (err) {
          console.log('Failed. Trying again (3/3)');
          try {
            const res = await this.transporter.sendMail(mailOptions);
            return 0;
          } catch (err) {
            console.log(err);
            return -1;
          }
        }
      }
    }
  };
}

module.exports = Mailer;