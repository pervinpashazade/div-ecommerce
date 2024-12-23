import nodemailer from "nodemailer"
import { appConfig } from "../consts.js";

export const transporter = nodemailer.createTransport({
    service: "Gmail",
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
      user: appConfig.EMAIL,
      pass: appConfig.EMAIL_PASSWORD,
    },
    tls: {
        rejectUnauthorized: false,
    },
  });