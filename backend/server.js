import express from "express";
import cors from "cors";

import axios from "axios";
import * as cheerio from "cheerio";
import fs from "fs";
import path from "path";

import nodemailer from "nodemailer";
import dotenv from "dotenv";

//nodemailer configuration
dotenv.config();

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

//cors configuration
const corsOptions = {
  origin: ["http://localhost:5173"],
};

const app = express();

app.use(express.json()); //json parse
app.use(cors(corsOptions));

app.get("/", (request, response) => {
  response.json({ statusMessage: "App is running!" });
});

const downloadFolder = path.join(path.resolve(), "downloads");

const getDownloadLink = async (url) => {
  try {
    const { data } = await axios.get(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
        Accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9",
        Connection: "keep-alive",
        "Upgrade-Insecure-Requests": "1",
        TE: "Trailers",
      },
    });
    const $ = cheerio.load(data);
    const epubLink = $("a[href*='.epub']").attr("href");
    if (!epubLink) {
      throw new Error(".epub link not found on the page!");
    }
    console.log("Download link found: ", epubLink);
    return "https://archiveofourown.org" + epubLink;
  } catch (error) {
    console.error("Error getting download link: ", error);
  }
};

const getFileName = (downloadLink) => {
  return downloadLink.split("/").pop().split("?")[0];
};

const downloadFile = async (downloadLink, downloadPath) => {
  const writer = fs.createWriteStream(downloadPath);
  const response = await axios({
    url: downloadLink,
    method: "GET",
    responseType: "stream",
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
      Accept: "application/octet-stream",
      Connection: "keep-alive",
    },
    maxContentLength: Infinity,
    maxBodyLength: Infinity,
  });
  response.data.pipe(writer);

  return new Promise((resolve, reject) => {
    writer.on("finish", resolve);
    writer.on("error", reject);
  });
};

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

const fsPromises = fs.promises;

const removeDocument = async (filePath) => {
  try {
    await fsPromises.unlink(filePath);
    console.log("File removed from the server.");
  } catch (error) {
    console.error("Error removing file:", error);
  }
};

//to add: update user on status progress (websockets?)
app.post("/process", async (request, response) => {
  console.log(request.body);
  try {
    const { kindleEmail, fanficLinks } = request.body;
    const attachments = {};

    const totalLinkCount = fanficLinks.length;
    let processedLinkCount = 0;
    let errorLinkCount = 0;
    for (const link of fanficLinks) {
      try {
        console.log(
          "Attempting to get the download link from AO3... - fic ",
          link
        );
        const downloadLink = await getDownloadLink(link);
        const fileName = getFileName(downloadLink);
        const downloadPath = path.join(downloadFolder, fileName);
        console.log(
          `Attempting download of ${fileName} from ${downloadLink} to ${downloadPath}...`
        );
        await downloadFile(downloadLink, downloadPath);
        attachments[fileName] = downloadPath;
        processedLinkCount++;
      } catch (error) {
        errorLinkCount++;
      }
    }
    console.log(attachments);
    console.log("Sending email with attachments...");

    const emailResult = await sendEmailWithAttachment(kindleEmail, attachments);

    if (emailResult.success) {
      response.json({
        message: `Processed files: ${totalLinkCount}. Files downloaded and sent successfully: ${processedLinkCount}. Failures: ${errorLinkCount}.`,
      });
    } else {
      response
        .status(500)
        .json({ message: "An error occurred: " + emailResult.message });
    }
    console.log("Removing files...");
    for (const filePath of Object.values(attachments)) {
      removeDocument(filePath);
    }
  } catch (error) {
    console.error("Error:", error.message);
    response
      .status(500)
      .json({ message: "An error occurred: " + error.message });
  }
});

app.listen(8080, () => {
  console.log("Server started on port 8080");
});
