const nodemailer = require("nodemailer");
const config = require("../config");
const {
  emailVerifyTemplate,
  resetPasswordTemplate,
  twoFATemplate,
} = require("../emailTemplates/authTemplate");

const { SMTPAuth } = config;

const SENDER_EMAIL = SMTPAuth.Email;

const setTransporter = () => {
  return nodemailer.createTransport({
    host: SMTPAuth.Host,
    port: SMTPAuth.Port,
    secure: false,
    auth: {
      user: SMTPAuth.Email,
      pass: SMTPAuth.Password,
    },
    tls: {
      ciphers: "SSLv3", // Optional, but often helps with older Node/OpenSSL combos
    },
  });
};
const selectTemplate = (user, body, template) => {
  if (body.verifyOTP) {
    template = emailVerifyTemplate(user, body);
  }
  if (body.verifyTwoFA) {
    template = twoFATemplate(user, body);
  } else if (body.resetPassword) {
    template = resetPasswordTemplate(user, body);
  }

  return template;
};

const sendEmail = async (user, subject, body) => {
  const transporter = setTransporter();
  const template = selectTemplate(user, body);
  const msg = {
    from: SENDER_EMAIL,
    to: user.email,
    subject: subject,
    html: template,
  };
  try {
    await transporter.sendMail(msg);
  } catch (error) {
    console.log(error);
  }
};

module.exports = {
  sendEmail,
};
