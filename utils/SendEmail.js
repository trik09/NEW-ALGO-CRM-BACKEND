const nodemailer = require("nodemailer");

const sendEmail = ({
  to,
  subject,
  html,
  text,
  fromName = "AlgoMatix",
  fromEmail = process.env.EMAIL_USER, // should be algo.crm@algotrack.in
}) => {
  return new Promise((resolve, reject) => {
    if (!to || !subject || !html) {
      return reject(new Error("Email `to`, `subject`, and `html` are required"));
    }

    const transporter = nodemailer.createTransport({
      host: "smtp.bizmail.yahoo.com",
      port: 465,
      secure: true, // ✅ SSL for 465
      auth: {
        user: process.env.EMAIL_USER, // algo.crm@algotrack.in
        pass: process.env.EMAIL_PASS, // ideally an APP PASSWORD
      },

      // Optional: helps debug + compatibility
      // logger: true,
      // debug: true,
      // tls: { rejectUnauthorized: true },
    });

    const mailOptions = {
      from: `"${fromName}" <${fromEmail}>`,
      to,
      subject,
      html,
      text,
    };

    // (Optional) verify connection/auth before sending
    transporter.sendMail(mailOptions, (err, info) => {
      if (err) {
        console.error("Nodemailer error:", err);
        return reject(err);
      }
      console.log("Email sent:", to, info.messageId);
      resolve(info);
    });

  });
};

module.exports = sendEmail;
