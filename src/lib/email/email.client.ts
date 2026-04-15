import nodemailer from "nodemailer";
import env from "../../config/env.js";

type EmailOptions = {
  to: string;
  subject: string;
  text: string;
  html: string;
};

export const sendEmail = async (options: EmailOptions) => {
  const config = {
    host: env.SMTP_HOST,
    port: Number(env.SMTP_PORT),
    secure: false,
    auth: {
      user: env.SMTP_EMAIL,
      pass: env.SMTP_PASSWORD,
    },
  };

  const transporter = nodemailer.createTransport(config);

  const mailOptions = {
    from: `"Your App" <no-reply@serenphea.com>`,
    to: options.to,
    subject: options.subject,
    text: options.text,
    html: options.html,
  };

  await transporter.sendMail(mailOptions);
};
