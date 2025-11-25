// Backend/services/previewService.js
const pdf2img = require('pdf-img-convert');
const sharp = require('sharp');

exports.generatePreviews = async (pdfBuffer) => {
  try {
    // 1. Convert PDF pages to Images
    // We process pages 1, 2, and 3
    const outputImages = await pdf2img.convert(pdfBuffer, {
      width: 800, 
      height: 1100,
      page_numbers: [1, 2, 3], 
      base64: false
    });

    const processedBuffers = [];

    // 2. Process each page
    for (let i = 0; i < outputImages.length; i++) {
      let imagePipeline = sharp(outputImages[i]);

      // Logic: Page 1 (index 0) is clear. Pages 2+ (index 1+) are blurred.
      if (i > 0) {
        imagePipeline = imagePipeline.blur(15); // Blur strength
      }

      const buffer = await imagePipeline.png().toBuffer();
      processedBuffers.push({
        page: i + 1,
        buffer: buffer,
        isBlurred: i > 0
      });
    }

    return processedBuffers;
  } catch (err) {
    console.error("Preview Generation Error:", err);
    // If preview generation fails, return empty array so upload doesn't fail entirely
    return []; 
  }
};