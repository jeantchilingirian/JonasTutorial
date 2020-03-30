const nodemailer = require('nodemailer');

const sendEmail = async options => {
  var transport = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    auth: {
      user: process.env.EMAIL,
      pass: process.env.EMAIL_PASSWORD
    }
  });

  let mailOptions = {
    from: 'jeanjilinkirian@gmaill.com',
    to: options.email,
    text: options.message,
    subject: options.subject
  };

  await transport.sendMail(mailOptions);
};
/*
(async () => {
  try {
    await sendEmail({
      email: 'jeanjilinkirian@gmaill.com',
      subject: `Your password reset token is valid for 10 minutes`,
      message: 'hi'
    });
  } catch (e) {
    console.log(e);
  }
})();*/

module.exports = sendEmail;
