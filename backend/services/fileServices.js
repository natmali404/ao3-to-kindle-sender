import fs from "fs";

const fsPromises = fs.promises;

const removeDocument = async (filePath) => {
  try {
    await fsPromises.unlink(filePath);
    console.log("File removed from the server.");
  } catch (error) {
    console.error("Error removing file:", error);
  }
};
