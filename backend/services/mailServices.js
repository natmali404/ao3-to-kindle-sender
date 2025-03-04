import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendEmailWithAttachment = async (recipientEmail, attachments) => {
  const attachmentsObject = Object.entries(attachments).map(
    ([fileName, filePath]) => ({
      //should there be a try?
      filename: fileName,
      path: filePath,
    })
  );
  try {
    const info = await transporter.sendMail({
      to: recipientEmail,
      subject: "AO3 to Kindle sender",
      text: "Successful mail, enjoy reading!!",
      attachments: attachmentsObject,
    });
    console.log("Email sent: ", info.response);
    return { success: true, message: "Email sent successfully!" };
  } catch (error) {
    console.log("Error sending email: ", error);
    return { success: false, message: error.message };
  }
};
