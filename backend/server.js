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
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

//cors configuration
const corsOptions = {
    origin: ["http://localhost:5173"]
}

const app = express();

app.use(cors(corsOptions))

app.get("/", (request, response) => {
    response.json({statusMessage: "App is running!"})
})


const fanficLink = "https://archiveofourown.org/works/61755115/chapters/157874314"; //hard-coded for now; will be user-given later
const kindleEmail = process.env.TEST_KINDLE_EMAIL //hard-coded for now; will be user-given later
const downloadFolder = path.join(path.resolve(), 'downloads');


const getDownloadLink = async (url) => {
    try {
        const { data } = await axios.get(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
                'Accept-Language': 'en-US,en;q=0.9',
                'Connection': 'keep-alive',
                'Upgrade-Insecure-Requests': '1',
                'TE': 'Trailers'
            }
        });
        const $ = cheerio.load(data);
        const epubLink = $("a[href*='.epub']").attr("href");
        if (!epubLink) {
            throw new Error(".epub link not found on the page!");
        }
        console.log("Download link found: ", epubLink);
        return "https://archiveofourown.org" + epubLink;
    } 
    catch (error) {
        console.error("Error getting download link: ", error);
    }
}

//to add: auto remove from server
const downloadFile = async (downloadLink, downloadPath) => {
    const writer = fs.createWriteStream(downloadPath);
    const response = await axios({ 
        url: downloadLink, 
        method: "GET", 
        responseType: "stream",
        headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
            'Accept': 'application/octet-stream',
            'Connection': 'keep-alive'
        },
        maxContentLength: Infinity, //optimizations for faster download
        maxBodyLength: Infinity
    });
    response.data.pipe(writer);

    return new Promise((resolve, reject) => {
        writer.on('finish', resolve);
        writer.on('error', reject);
    });
}

//to add: handle multiple attachments later on
const sendEmailWithAttachment = async (recipientEmail, filePath, fileName) => {
    try {
        // const mailOptions = {
        //     from: process.env.EMAIL_USER,
        //     to: recipientEmail,
        //     subject: "AO3 to Kindle sender",
        //     text: "",
        //     attachments: [
        //         {
        //             filename: fileName,
        //             path: filePath
        //         }
        //     ]
        // }

        // const info = await transporter.sendMail(mailOptions);
        const info = await transporter.sendMail({
            to: recipientEmail,
            subject: "AO3 to Kindle sender",
            text: "Successful mail.",
            attachments: [
                {
                    filename: fileName,
                    path: filePath
                }
            ]
        })
        console.log("Email sent: ", info.response);
        return {success: true, message: "Email sent successfully!"};
    } catch (error) {
        console.log("Error sending email: ", error);
        return {success: false, message: error.message};
    }
}

const fsPromises = fs.promises;

const removeDocument = async (filePath) => {
    try {
        await fsPromises.unlink(filePath);
        console.log("File removed from the server.");
    } catch (error) {
        console.error("Error removing file:", error);
    }
}

//to add: update user on status progress (websockets?)
app.post("/execute", async (request, response) => {
    console.log("Attempting to get the download link from AO3...");
    try {
        const downloadLink = await getDownloadLink(fanficLink);
        const fileName = downloadLink.split("/").pop().split("?")[0];
        console.log(`EPUB link: ${downloadLink}, file name: ${fileName}`);
        //to add: logic to check if file already exists in downloads folder (if there will be enough time)
        const downloadPath = path.join(downloadFolder, fileName);
        console.log(`Attempting download from ${downloadLink} to ${downloadPath}...`);
        await downloadFile(downloadLink, downloadPath);
        console.log("Download completed.")
        // response.json({ message: "File downloaded successfully!", fileName });
        console.log("Sending email with attachment...");
        const emailResult = await sendEmailWithAttachment(kindleEmail, downloadPath, fileName);
        if (emailResult.success) {
            removeDocument(downloadPath);
            response.json({ message: "File downloaded and email sent successfully!" });
        } else {
            response.status(500).json({ message: "An error occurred: " + emailResult.message });
        }
    } 
    catch (error) {
        console.error("Error:", error.message);
        response.status(500).json({ message: "An error occurred: " + error.message });
    }
 });


app.listen(8080, () => {
    console.log("Server started on port 8080")
})


