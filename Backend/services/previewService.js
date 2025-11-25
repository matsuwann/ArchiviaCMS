// Backend/services/previewService.js
const { fromBuffer } = require('pdf2pic');
const sharp = require('sharp');
const fs = require('fs').promises;
const path = require('path');

exports.generatePreviews = async (pdfBuffer) => {
  try {
    // Configure pdf2pic to save to the temporary directory
    const options = {
      density: 100,
      saveFilename: "temp_preview",
      savePath: "/tmp", // Render allows writing here
      format: "png",
      width: 800,
      height: 1100
    };

    // Initialize converter
    const convert = fromBuffer(pdfBuffer, options);
    const processedBuffers = [];

    // Process Pages 1, 2, and 3
    for (let pageNum = 1; pageNum <= 5; pageNum++) {
      try {
        // 1. Convert PDF Page to Image File
        const result = await convert(pageNum, { responseType: "image" });
        
        // 'result' contains the path to the saved image
        const imagePath = result.path; 
        
        // 2. Read the image back into a buffer
        const imageBuffer = await fs.readFile(imagePath);

        // 3. Apply Blur using Sharp (if not page 1)
        let imagePipeline = sharp(imageBuffer);
        
        // Page 1 (pageNum === 1) is clear. Pages 2+ are blurred.
        if (pageNum > 5) {
          imagePipeline = imagePipeline.blur(15); 
        }

        const finalBuffer = await imagePipeline.png().toBuffer();

        processedBuffers.push({
          page: pageNum,
          buffer: finalBuffer,
          isBlurred: pageNum > 1
        });

        // Cleanup: Delete the temp file
        await fs.unlink(imagePath).catch(err => console.error("Temp delete error:", err));

      } catch (pageErr) {
        // Stop loop if page doesn't exist (e.g., 1-page document)
        break; 
      }
    }

    return processedBuffers;

  } catch (err) {
    console.error("Preview Service Error:", err);
    // Return empty array so the document upload still succeeds even if previews fail
    return []; 
  }
};