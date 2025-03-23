import express from "express";
import cors from "cors";
import path from "path";
import rateLimit from "express-rate-limit";
import dotenv from "dotenv";

import { EventEmitter } from "events";

import { removeDocument } from "./services/fileServices.js";
import {
  getDownloadLink,
  downloadFile,
  getFileName,
} from "./services/downloadServices.js";
import { sendEmailWithAttachments } from "./services/mailServices.js";
import { validateEmail, validateLink } from "./services/validationServices.js";

dotenv.config();

const DEBUG_MODE = process.env.DEBUG;

//cors configuration
const corsOptions = {
  origin: process.env.ALLOWED_ORIGINS.split(","),
};

const app = express();

//rate limiter
app.set("trust proxy", 1);
const limiter = rateLimit({
  //100 requests per 15mins
  windowMs: 15 * 60 * 1000,
  max: 100,
});
app.use(limiter);

app.use(express.json()); //json parse
app.use(cors(corsOptions));

app.get("/", (request, response) => {
  response.json({ statusMessage: "App is running!" });
});

//sse configuration
const userEmitters = new Map();

const createUserEmitter = (userId) => {
  userEmitters.set(userId, new EventEmitter());
  console.log(`User id generated: ${userId}`);
};

app.get("/status-updates/:id", (req, res) => {
  const userId = req.params.id;

  if (!userEmitters.has(userId)) {
    createUserEmitter(userId);
  }

  const userEmitter = userEmitters.get(userId);

  //sse headers
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  //res.flushHeaders(); <- ?

  const sendUpdate = (update) => {
    if (update.id === req.query.id) {
      res.write(`data: ${JSON.stringify(update)}\n\n`);
    }
  };

  userEmitter.on("update", sendUpdate);

  //cleanup
  req.on("close", () => {
    userEmitter.off("update", sendUpdate);
    userEmitters.delete(userId);
    res.end();
  });
});

app.post("/process", async (request, response) => {
  console.log(`Debug mode: ${DEBUG_MODE}`);
  console.log(request.body);

  try {
    const { kindleEmail, fanficLinks, userId } = request.body;

    validateEmail(kindleEmail);
    for (const link of fanficLinks) {
      validateLink(link);
    }

    const attachments = {};
    const totalLinkCount = fanficLinks.length;
    let processedLinkCount = 0;
    let errorLinkCount = 0;

    if (!userEmitters.has(userId)) {
      createUserEmitter(userId);
    }

    const userEmitter = userEmitters.get(userId);

    userEmitter.emit("update", {
      message: "Begin process...",
    });

    for (const link of fanficLinks) {
      try {
        console.log(
          "Attempting to get the download link from AO3... - fic ",
          link
        );
        userEmitter.emit("update", {
          message: `Attempting to get the download URL - ${
            processedLinkCount + errorLinkCount + 1
          }/${totalLinkCount}...`,
        });
        const downloadLink = await getDownloadLink(link);
        userEmitter.emit("update", {
          message: `Attempting EPUB download - ${
            processedLinkCount + errorLinkCount + 1
          }/${totalLinkCount}...`,
        });
        const { fileName, downloadPath } = await downloadFile(downloadLink);
        attachments[fileName] = downloadPath;
        processedLinkCount++;
      } catch (error) {
        console.log(error);
        errorLinkCount++;
      }
    }

    console.log(attachments);
    console.log("Sending email with attachments...");
    userEmitter.emit("update", {
      message: "Sending email with attachments...",
    });

    if (DEBUG_MODE == "true") {
      console.log("DEBUG=TRUE: MAIL SENT.");
      response.json({
        message: `DEBUG=TRUE: Processed files: ${totalLinkCount}. Files downloaded and sent successfully: ${processedLinkCount}. Failures: ${errorLinkCount}.`,
      });
    } else {
      const emailResult = await sendEmailWithAttachments(
        kindleEmail,
        attachments
      );
      if (emailResult.success) {
        response.json({
          message: `Processed files: ${totalLinkCount}. Files downloaded and sent successfully: ${processedLinkCount}. Failures: ${errorLinkCount}.`,
        });
      } else {
        response
          .status(500)
          .json({ message: "An error occurred: " + emailResult.message });
      }
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
