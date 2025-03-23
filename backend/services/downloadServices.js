import axios from "axios";
import * as cheerio from "cheerio";
import fs from "fs";
import path from "path";

const DOWNLOAD_FOLDER = path.join(path.resolve(), "downloads");
const MAX_RETRIES = 3; //for HTTP 525
const RETRY_DELAY = 2000;

const SCRAPING_HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
  Accept:
    "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8",
  "Accept-Language": "en-US,en;q=0.9",
  Connection: "keep-alive",
  "Upgrade-Insecure-Requests": "1",
  TE: "Trailers",
};

const DOWNLOAD_HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
  Accept: "application/octet-stream",
  Connection: "keep-alive",
};

const getFileName = (downloadLink) => {
  return downloadLink.split("/").pop().split("?")[0];
};

const getDownloadLink = async (url, retries = MAX_RETRIES) => {
  try {
    const { data } = await axios.get(url, { headers: SCRAPING_HEADERS });
    const $ = cheerio.load(data);

    const epubLink = $("a[href*='.epub']").attr("href");
    if (!epubLink) {
      throw new Error(".epub link not found on the page!");
    }

    console.log("Download link found:", epubLink);
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

    console.error("Error getting download link:", error.message);
    throw error;
  }
};

const downloadFile = async (downloadLink, retries = MAX_RETRIES) => {
  const fileName = getFileName(downloadLink);
  const downloadPath = path.join(DOWNLOAD_FOLDER, fileName);
  console.log(
    `downloadFile method running. path: ${DOWNLOAD_FOLDER}, fileName: ${fileName}, downloadPath: ${downloadPath}`
  );
  if (!fs.existsSync(DOWNLOAD_FOLDER)) {
    fs.mkdirSync(DOWNLOAD_FOLDER);
  }
  try {
    const writer = fs.createWriteStream(downloadPath);
    const response = await axios({
      url: downloadLink,
      method: "GET",
      responseType: "stream",
      headers: DOWNLOAD_HEADERS,
      maxContentLength: Infinity,
      maxBodyLength: Infinity,
    });
    response.data.pipe(writer);

    return new Promise((resolve, reject) => {
      writer.on("finish", () => {
        console.log("Download successful!");
        resolve({ fileName, downloadPath });
      });
      writer.on("error", reject);
    });
  } catch (error) {
    if (
      error.response &&
      (error.response.status === 525 || error.response.status === 503) &&
      retries > 0
    ) {
      console.log(
        `HTTP error. Retrying... (${MAX_RETRIES - retries + 1}/${MAX_RETRIES})`
      );
      await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY));
      return downloadFile(downloadLink, retries - 1); //this could be optimized (things outside try are unnecessarily executed on every try)
    }
    console.error("Error downloading the file:", error.message);
    throw error;
  }
};

export { downloadFile, getDownloadLink, getFileName };
