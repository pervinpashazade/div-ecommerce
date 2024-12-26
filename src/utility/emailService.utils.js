import { appConfig } from "../consts.js";
import nodemailer from "nodemailer";
export const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: appConfig.EMAIL,
    pass: appConfig.EMAIL_PASS,
  },
});
export const sendMail = async (req, res, to, subject, text) => {
  const mailData = {
    from: appConfig.EMAIL,
    to,
    subject,
    text,
  };

  try {
    const info = await transporter.sendMail(mailData);
    console.log("Email sent: ", info.response);
    return res.status(200).json({
      message: "Email sent successfully",
    });
  } catch (error) {
    console.error("Error sending email: ", error);
    return res.status(500).json({
      message: "Failed to send email",
      error,
    });
  }
};
