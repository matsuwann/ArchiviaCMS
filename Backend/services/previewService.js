const cloudinary = require('cloudinary').v2;
const streamifier = require('streamifier');
const { PDFDocument } = require('pdf-lib'); // Import pdf-lib

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

exports.generatePreviews = async (pdfBuffer, filename) => {
  // 1. Get Accurate Page Count using pdf-lib
  let detectedPages = 0;
  try {
    // Load the PDF to count pages (ignore encryption for speed if possible)
    const pdfDoc = await PDFDocument.load(pdfBuffer, { ignoreEncryption: true });
    detectedPages = pdfDoc.getPageCount();
    console.log(`[Preview Service] pdf-lib detected ${detectedPages} pages.`);
  } catch (err) {
    console.error("[Preview Service] Failed to count pages locally:", err.message);
  }

  return new Promise((resolve, reject) => {
    // Clean filename for Cloudinary public_id
    const publicId = `previews/${filename.replace(/\.[^/.]+$/, "")}`;

    // 2. Upload PDF to Cloudinary
    const uploadStream = cloudinary.uploader.upload_stream(
      { 
        resource_type: 'image', 
        public_id: publicId
        // format: 'png' REMOVED to ensure the file is stored as a PDF, preserving all pages
      },
      (error, result) => {
        if (error) {
            console.error("Cloudinary Upload Error:", error);
            return resolve([]); 
        }

        // 3. Determine Page Count
        // Use detected pages from pdf-lib. If that failed, use Cloudinary's result. Default to 1.
        const totalPages = detectedPages || result.pages || 1;
        
        // Limit to MAX 4 pages (3 Clear + 1 Blurred)
        const limit = Math.min(totalPages, 4);
        
        console.log(`[Preview Service] Generating links for ${limit} pages.`);

        const previewUrls = [];

        // 4. Generate URLs
        for (let i = 1; i <= limit; i++) {
          // Blur Logic: Only blur if it's Page 4
          const isTeaserPage = (i === 4);
          
          // Cloudinary Transformation
          const transformation = isTeaserPage ? [{ effect: "blur:1500" }] : [];

          const url = cloudinary.url(result.public_id, {
            page: i,
            resource_type: 'image',
            format: 'png', // Convert to PNG on retrieval
            transformation: transformation,
            secure: true 
          });
          
          previewUrls.push(url);
        }

        resolve(previewUrls);
      }
    );

    streamifier.createReadStream(pdfBuffer).pipe(uploadStream);
  });
};