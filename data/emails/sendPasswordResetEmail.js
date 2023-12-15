import SMTPConnect from "../../config/smptConnection.js";

import verify from "../../data_validation.js";

async function sendPasswordResetEmail(email, secret) {
  email = verify.email(email);
  secret = verify.UUID(secret);

  const resetdomain = `http://${process.env.SiteDomain}/resetpassword/${secret}`;

  const emailer = await SMTPConnect();
  const message = {
    from: `account-services@${process.env.MailServerDomain}`,
    to: email,
    subject: `Password reset`,
    text: `If you have requested that your password be reset, please use the link below to complete the reset.
    If you did not request a password reset no further action is required from you at this time.
    
    ${resetdomain}`,
    html: `
    <!doctype html>
    <html>
        <body>
            <p>If you have requested that your password be reset, please use the link below to complete the reset.</p><br>
            <p>If you did not request a password reset no further action is required from you at this time.</p><br>
            <a href="${resetdomain}">Reset Password</a><br>
            <br>
            Please use this link if the button is not working: <a href="${resetdomain}">${resetdomain}</a>
        </body>
    </html>
    `,
  };
  let messagesent;

  try {
    messagesent = await emailer.sendMail(message);
  } catch (e) {
    // Throw only the response message
    const error = { status: 500, message: e.response };
    throw error;
  }
  if (messagesent.rejected.length) {
    const error = { status: 400, message: "Email rejected" };
    throw error;
  }
  return messagesent;
}

export default sendPasswordResetEmail;
