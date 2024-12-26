import { appConfig } from "../consts.js";
import { transporter } from "../service/nodemailer.js";

export const sendEmailMessage = async (email, subject, message) => {
  const mailOptions = {
    from: appConfig.EMAIL,
    to: email,
    subject: subject,
    text: message,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log("Verification email sent to:", email);
    return true;
  } catch (error) {
    console.error("Error sending email:", error);
    return false;
  }
};
