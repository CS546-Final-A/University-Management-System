import SMTPConnect from "../../config/smptConnection.js";

import verify from "../../data_validation.js";

const UNIVERSITYNAME = "Stevens Institute of Technology";

async function sendRegistrationEmail(email, registrationcode) {
  email = verify.email(email);
  registrationcode = verify.UUID(registrationcode);

  const emailer = await SMTPConnect();

  const registrationlink = `http://${process.env.SiteDomain}/register/${registrationcode}`;

  const message = {
    from: `account-registration@${process.env.MailServerDomain}`,
    to: email,
    subject: `Welcome to ${UNIVERSITYNAME}`,
    text: `Congratulations, you have been selected to join the ${UNIVERSITYNAME} family. Please use the link below to create your ${UNIVERSITYNAME} account.
    
    ${registrationlink}`,
    html: `
    <!doctype html>
    <html>
        <body>
            <p>Congratulations, you have been selected to join the ${UNIVERSITYNAME} family. Please use the link below to create your ${UNIVERSITYNAME} account.</p><br>
            <a href="${registrationlink}">Register Now</a><br>
            <a href="${registrationlink}">${registrationlink}</a>
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

export default sendRegistrationEmail;
