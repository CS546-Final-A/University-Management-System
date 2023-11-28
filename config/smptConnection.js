import nodemailer from "nodemailer";

let transporter = undefined;

function connect() {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      pool: true,
      host: process.env.SMTPServerURL,
      port: process.env.SMTPPort,
      maxConnections: 11,
      secure: true, // use TLS
      auth: {
        user: process.env.SMTPUsername,
        pass: process.env.SMTPPassword,
      },
    });
  }
  return transporter;
}

export default connect;
