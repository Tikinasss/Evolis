const nodemailer = require("nodemailer");

let transporter;

function getTransporter() {
  if (transporter) {
    return transporter;
  }

  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS } = process.env;
  if (!SMTP_HOST || !SMTP_PORT || !SMTP_USER || !SMTP_PASS) {
    return null;
  }

  transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: Number(SMTP_PORT),
    secure: Number(SMTP_PORT) === 465,
    auth: {
      user: SMTP_USER,
      pass: SMTP_PASS,
    },
  });

  return transporter;
}

async function sendHighRiskNotification({ companyName, riskLevel, recipientEmail }) {
  const sender = process.env.SMTP_FROM || process.env.SMTP_USER;
  const client = getTransporter();

  if (!client || !sender || !recipientEmail) {
    return;
  }

  await client.sendMail({
    from: sender,
    to: recipientEmail,
    subject: `[AI Business Rescue] High risk detected for ${companyName}`,
    text: `A new analysis was marked as ${riskLevel} risk for ${companyName}.`,
  });
}

async function sendSupportMessage({ name, email, subject, category, message }) {
  const sender = process.env.SMTP_FROM || process.env.SMTP_USER;
  const supportRecipient = process.env.SUPPORT_EMAIL || process.env.ALERT_EMAIL;
  const client = getTransporter();

  if (!client || !sender || !supportRecipient) {
    return false;
  }

  await client.sendMail({
    from: sender,
    to: supportRecipient,
    replyTo: email,
    subject: `[Support] ${subject}`,
    text: [
      "New support request",
      `Name: ${name}`,
      `Email: ${email}`,
      `Category: ${category}`,
      "",
      "Message:",
      message,
    ].join("\n"),
  });

  return true;
}

module.exports = {
  sendHighRiskNotification,
  sendSupportMessage,
};