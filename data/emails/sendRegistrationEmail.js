import SMTPConnect from "../../config/smptConnection.js";

import verify from "../../data_validation.js";

const UNIVERSITYNAME = "Stevens Institute of Technology";

async function sendRegistrationEmail(email, userid) {
  email = verify.email(email);
  userid = verify.dbid(userid);

  const emailer = await SMTPConnect();

  const message = {
    from: `account-registration@${process.env.MailServerDomain}`,
    to: email,
    subject: `Welcome to ${UNIVERSITYNAME}`,
    text: `Congragulations, you have been selected to join the ${UNIVERSITYNAME} family. Please use the link below to create your ${UNIVERSITYNAME} account.
    
    ${process.env.SiteDomain}/register/${userid}`,
    html: `
    <!doctype html>
    <html>
        <body>
            <p>Congragulations, you have been selected to join the ${UNIVERSITYNAME} family. Please use the link below to create your ${UNIVERSITYNAME} account.</p><br>
            <a href="http://${process.env.SiteDomain}/register/${userid}">Register Now</a><br>
            <a href="http://${process.env.SiteDomain}/register/${userid}">http://${process.env.SiteDomain}/register/${userid}></a>
        </body>
    </html>
    `,
  };

  const messagesent = await emailer.sendMail(message);
  console.log(messagesent);

  if (messagesent.rejected.length) {
    throw "Failed to send email";
  }
  return messagesent;
}

export default sendRegistrationEmail;
