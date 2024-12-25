import { appConfig } from "../consts.js";
import { transporter } from "../service/nodemailer.js";

export const sendEmailMessage = async (email, code, expirationTime) => {
  const mailOptions = {
    from: appConfig.EMAIL,
    to: email,
    subject: "Email Subscription  verify code",
    text: `Your verification code is: ${code}. It will expire in ${expirationTime} minute.`,
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
