import nodemailer from "nodemailer";
import { loadEmailTemplate } from "./loadEmailTemplate";

export const sendEmail = async (
  to: string,
  subject: string,
  templateName: string,
  replacements: { [key: string]: string }
) => {
  const htmlContent = loadEmailTemplate(templateName, replacements);

  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: {
      user: "halder25572@gmail.com",
      pass: "jpjk wxcj dzda qmyc",
    },
  });

  const mailOptions = {
    from: "halder25572@gmail.com",
    to,
    subject: subject,
    html: htmlContent,
  };

  try {
    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error("Error sending email: ", error);
  }
};
