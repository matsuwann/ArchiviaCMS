const cloudinary = require('cloudinary').v2;
const streamifier = require('streamifier');
const pdfModule = require('pdf-parse'); 
const pdfParse = pdfModule.default || pdfModule; 

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

exports.generatePreviews = async (pdfBuffer, filename) => {
  // 1. Get Accurate Page Count using pdf-parse
  let detectedPages = 0;
  try {
    const data = await pdfParse(pdfBuffer);
    detectedPages = data.numpages;
    console.log(`[Preview Service] Document has ${detectedPages} pages.`);
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
        public_id: publicId,
        format: 'png'
      },
      (error, result) => {
        if (error) {
            console.error("Cloudinary Upload Error:", error);
            return resolve([]); 
        }

        // 3. Determine Page Count (Prioritize local count, fallback to Cloudinary, then 1)
        const totalPages = detectedPages || result.pages || 1;
        
        // Limit to MAX 6 pages (5 Clear + 1 Blurred)
        const limit = Math.min(totalPages, 6);
        
        console.log(`[Preview Service] Generating ${limit} preview images.`);

        const previewUrls = [];

        // 4. Generate URLs
        for (let i = 1; i <= limit; i++) {
          // Blur Logic: Only blur if it's Page 6
          const isTeaserPage = (i === 6);
          
          // Cloudinary Transformation
          const transformation = isTeaserPage ? [{ effect: "blur:1500" }] : [];

          const url = cloudinary.url(result.public_id, {
            page: i,
            resource_type: 'image',
            format: 'png',
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