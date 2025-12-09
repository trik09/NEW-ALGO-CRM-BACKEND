const passwordResetTemplate = (name, resetUrl) => {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <meta http-equiv="X-UA-Compatible" content="IE=edge" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>Password Reset</title>
    </head>
    <body style="margin: 0; padding: 0; background-color: #f4f4f7; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;">
      <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
        <tr>
          <td align="center" style="padding: 30px;">
            <table width="600" cellpadding="0" cellspacing="0" role="presentation" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
              <tr>
                <td style="background-color: #007bff; color: white; text-align: center; padding: 30px;">
                  <h1 style="margin: 0;">Password Reset</h1>
                </td>
              </tr>
              <tr>
                <td style="padding: 30px; color: #333333;">
                  <p style="font-size: 16px;">Hi <strong>${name}</strong>,</p>
                  <p style="font-size: 16px;">We received a request to reset your password. Click the button below to continue:</p>
                  <div style="text-align: center; margin: 30px 0;">
                    <a href="${resetUrl}" style="background-color: #007bff; color: #ffffff; padding: 14px 28px; text-decoration: none; border-radius: 5px; font-size: 16px; display: inline-block;">
                      Reset Password
                    </a>
                  </div>
                  <p style="font-size: 14px;">If the button doesn't work, copy and paste this link in your browser:</p>
                  <p style="word-break: break-word;"><a href="${resetUrl}" style="color: #007bff;">${resetUrl}</a></p>
                  <p style="font-size: 14px; color: #999999;">If you didn’t request a password reset, you can ignore this email.</p>
                  <hr style="margin: 30px 0;" />
                  <p style="text-align: center; font-size: 13px; color: #bbbbbb;">&copy; ${new Date().getFullYear()} Quik Serv. All rights reserved.</p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;
};

module.exports = passwordResetTemplate;
