import axios from "axios";
import * as cheerio from "cheerio";
import fs from "fs";
import path from "path";

const downloadFolder = path.join(path.resolve(), "downloads");
const MAX_RETRIES = 3; //for HTTP 525
const RETRY_DELAY = 2000;

const getFileName = (downloadLink) => {
  return downloadLink.split("/").pop().split("?")[0];
};

const getDownloadLink = async (url) => {
  const headers = {
    "User-Agent":
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
    Accept:
      "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8",
    "Accept-Language": "en-US,en;q=0.9",
    Connection: "keep-alive",
    "Upgrade-Insecure-Requests": "1",
    TE: "Trailers",
  };

  try {
    const { data } = await axios.get(url, { headers });
    const $ = cheerio.load(data);
    const epubLink = $("a[href*='.epub']").attr("href");

    if (!epubLink) {
      throw new Error(".epub link not found on the page!");
    }

    console.log("Download link found: ", epubLink);
    return "https://archiveofourown.org" + epubLink;
  } catch (error) {
    if (error.response && error.response.status === 525 && retries > 0) {
      console.log(
        `HTTP 525 error. Retrying... (${
          MAX_RETRIES - retries + 1
        }/${MAX_RETRIES})`
      );
      await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY));
      return getDownloadLink(url, retries - 1);
    }
  }
  console.error("Error getting download link: ", error.message);
  throw error;
};

const downloadFile = async (downloadLink, downloadPath) => {
  if (!fs.existsSync(downloadPath)) {
    fs.mkdirSync(downloadPath);
  }
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
