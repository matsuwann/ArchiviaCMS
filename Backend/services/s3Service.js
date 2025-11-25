// Backend/services/s3Service.js
const { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand } = require("@aws-sdk/client-s3");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");

const s3Client = new S3Client({
  region: process.env.AWS_BUCKET_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY,
    secretAccessKey: process.env.AWS_SECRET_KEY,
  },
});

const BUCKET_NAME = process.env.AWS_BUCKET_NAME;

// Modified to accept a specific folder
exports.uploadToS3 = async (fileBuffer, filename, folder = 'documents', mimeType = 'application/pdf') => {
  const key = `${folder}/${filename}`;
  
  const params = {
    Bucket: BUCKET_NAME,
    Key: key,
    Body: fileBuffer,
    ContentType: mimeType,
    // content-disposition: inline allows viewing in browser
    ContentDisposition: 'inline' 
  };

  await s3Client.send(new PutObjectCommand(params));

  // If it's a preview, we return the public URL (Assuming you set up Bucket Policy for /previews)
  // If it's a document, we return the KEY to generate a signed URL later
  if (folder === 'previews') {
    return `https://${BUCKET_NAME}.s3.${process.env.AWS_BUCKET_REGION}.amazonaws.com/${key}`;
  }
  return key; // Return the KEY for private documents
};

// NEW: Generate a temporary secure link for logged-in users
exports.getPresignedUrl = async (fileKey) => {
  const command = new GetObjectCommand({
    Bucket: BUCKET_NAME,
    Key: fileKey,
  });
  // Link expires in 1 hour (3600 seconds)
  return await getSignedUrl(s3Client, command, { expiresIn: 3600 });
};

exports.deleteFromS3 = async (filename) => {
    // Logic to delete both original and previews would go here
    // For now, keeping your existing logic
    const params = { Bucket: BUCKET_NAME, Key: filename };
    try { await s3Client.send(new DeleteObjectCommand(params)); } 
    catch (err) { console.error("S3 Delete Error:", err); }
};