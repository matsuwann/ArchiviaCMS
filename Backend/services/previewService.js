// Backend/services/previewService.js
const cloudinary = require('cloudinary').v2;
const streamifier = require('streamifier');

// Configure Cloudinary with your credentials
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

exports.generatePreviews = async (pdfBuffer, filename) => {
  return new Promise((resolve, reject) => {
    // 1. Create a unique ID for Cloudinary (remove extension)
    const publicId = `previews/${filename.replace(/\.[^/.]+$/, "")}`;

    // 2. Upload the PDF to Cloudinary
    const uploadStream = cloudinary.uploader.upload_stream(
      { 
        resource_type: 'image', // Important: Treat PDF as a set of images
        public_id: publicId,
        format: 'png'           // Convert pages to PNG
      },
      (error, result) => {
        if (error) {
            console.error("Cloudinary Upload Error:", error);
            return resolve([]); // Return empty array so main upload doesn't fail
        }

        const previewUrls = [];

        // 3. Generate URLs for Pages 1 to 6
        // Page 1-5: Clear
        // Page 6: Blurred
        for (let i = 1; i <= 6; i++) {
          // Apply blur transformation ONLY if page > 5
          const transformation = i > 5 ? [{ effect: "blur:1500" }] : [];

          const url = cloudinary.url(result.public_id, {
            page: i,
            resource_type: 'image',
            format: 'png',
            transformation: transformation,
            secure: true // Force HTTPS
          });
          
          previewUrls.push(url);
        }

        resolve(previewUrls);
      }
    );

    // Pipe the file buffer to the upload stream
    streamifier.createReadStream(pdfBuffer).pipe(uploadStream);
  });
};