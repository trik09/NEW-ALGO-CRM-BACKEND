// const nodemailer = require('nodemailer');


// const sendEmail = async ({
//   to,
//   subject,
//   html,
//   text,
//   fromName = 'QuickServe',
//   fromEmail = process.env.EMAIL_USER,
// }) => {
//   if (!to || !subject || !html) {
//     throw new Error('Email `to`, `subject`, and `html` are required');
//   }

//   const transporter = nodemailer.createTransport({
//     service: 'Gmail', // Or use host/port for custom SMTP
//     auth: {
//       user: process.env.EMAIL_USER,
//       pass: process.env.EMAIL_PASS,
//     },
//   });

//   const mailOptions = {
//     from: `"${fromName}" <${fromEmail}>`,
//     to,
//     subject,
//     html,
//     text, // optional fallback
//   };

//   const info = await transporter.sendMail(mailOptions);
//   console.log('HTML email sent: %s', info.messageId);
// };

// module.exports = sendEmail;


// const nodemailer = require('nodemailer');

// const sendEmail = ({
//   to,
//   subject,
//   html,
//   text,
//   fromName = 'QuickServe',
//   fromEmail = process.env.EMAIL_USER,
// }) => {
//   return new Promise((resolve, reject) => {
//     if (!to || !subject || !html) {
//       return reject(new Error('Email `to`, `subject`, and `html` are required'));
//     }

//     const transporter = nodemailer.createTransport({
//       service: 'Gmail',
//       auth: {
//         user: process.env.EMAIL_USER,
//         pass: process.env.EMAIL_PASS,
//       },
//     });

//     const mailOptions = {
//       from: `"${fromName}" <${fromEmail}>`,
//       to,
//       subject,
//       html,
//       text,
//     };

//     transporter.sendMail(mailOptions, (err, info) => {
//       if (err) return reject(err);
//       console.log('Email sent: %s', info.messageId);
//       resolve(info);
//     });
//   });
// };

// module.exports = sendEmail;


 const nodemailer = require('nodemailer');

const sendEmail = ({
  to,
  subject,
  html,
  text,
  // fromName = 'Quik Serv',
  fromName = 'AlgoMatix',
  fromEmail = process.env.EMAIL_USER,
}) => {
  return new Promise((resolve, reject) => {
    if (!to || !subject || !html) {
      return reject(new Error('Email `to`, `subject`, and `html` are required'));
    }

    const transporter = nodemailer.createTransport({
      service: 'Gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: `"${fromName}" <${fromEmail}>`,
      to,
      subject,
      html,
      text,
    };

    // ✅ Use callback form instead of await
    transporter.sendMail(mailOptions, (err, info) => {
      if (err) {
        console.error('Nodemailer error:', err);
        return reject(err);
      }
      console.log('Email sent:', info.messageId);
      resolve(info);
    });
  });
};

module.exports = sendEmail;
