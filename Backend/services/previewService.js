const { fromBuffer } = require('pdf2pic');
const sharp = require('sharp');
const fs = require('fs').promises;
const path = require('path');

exports.generatePreviews = async (pdfBuffer) => {
  try {
    const options = {
      density: 100,
      saveFilename: "temp_preview",
      savePath: "/tmp", 
      format: "png",
      width: 800,
      height: 1100
    };

    const convert = fromBuffer(pdfBuffer, options);
    const processedBuffers = [];

    // MODIFIED: Loop through pages 1 to 6 (5 Clear + 1 Blurred)
    for (let pageNum = 1; pageNum <= 6; pageNum++) {
      try {
        const result = await convert(pageNum, { responseType: "image" });
        if (!result || !result.path) continue;

        const imageBuffer = await fs.readFile(result.path);
        let imagePipeline = sharp(imageBuffer);

        // MODIFIED LOGIC: Pages 1-5 are clear. Page 6+ are blurred.
        if (pageNum > 5) {
          imagePipeline = imagePipeline.blur(15); 
        }

        const finalBuffer = await imagePipeline.png().toBuffer();

        processedBuffers.push({
          page: pageNum,
          buffer: finalBuffer,
          isBlurred: pageNum > 5 // Mark true only if page > 5
        });

        await fs.unlink(result.path).catch(() => {});

      } catch (pageErr) {
        break; // Stop if document has fewer than 6 pages
      }
    }

    return processedBuffers;

  } catch (err) {
    console.error("Preview Service Error:", err);
    return []; 
  }
};