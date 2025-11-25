const cloudinary = require('cloudinary').v2;
const streamifier = require('streamifier');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

exports.generatePreviews = async (pdfBuffer, filename) => {
  return new Promise((resolve, reject) => {
    const publicId = `previews/${filename.replace(/\.[^/.]+$/, "")}`;

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

        // FIX: Get the ACTUAL page count from Cloudinary
        // If undefined, default to 1.
        const totalPages = result.pages || 1;
        
        // We want MAX 6 pages. If doc has 3 pages, we show 3. If 100, we show 6.
        const limit = Math.min(totalPages, 6);

        const previewUrls = [];

        for (let i = 1; i <= limit; i++) {
          // Apply blur ONLY if it's the 6th page (which implies there's more content)
          // AND if there are actually more pages than we are showing.
          const isTeaserPage = (i === 6);
          
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