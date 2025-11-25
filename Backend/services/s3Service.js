const { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand } = require("@aws-sdk/client-s3");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");
const path = require("path");

const s3Client = new S3Client({
  region: process.env.AWS_BUCKET_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY,
    secretAccessKey: process.env.AWS_SECRET_KEY,
  },
});

const BUCKET_NAME = process.env.AWS_BUCKET_NAME;

exports.uploadToS3 = async (file, filename) => {
  // If file has .buffer use it (multer), otherwise it might be a raw buffer
  const body = file.buffer ? file.buffer : file;
  const contentType = file.mimetype ? file.mimetype : 'application/pdf';

  const params = {
    Bucket: BUCKET_NAME,
    Key: filename,
    Body: body,
    ContentType: contentType,
  };

  await s3Client.send(new PutObjectCommand(params));

  // Return the KEY (filename), not the full URL, so we can sign it later
  return filename;
};

// NEW FUNCTION: Generates a secure, temporary link
exports.getPresignedUrl = async (filename) => {
  const command = new GetObjectCommand({
    Bucket: BUCKET_NAME,
    Key: filename,
  });
  // Link expires in 1 hour (3600 seconds)
  return await getSignedUrl(s3Client, command, { expiresIn: 3600 });
};

exports.deleteFromS3 = async (filename) => {
  const params = {
    Bucket: BUCKET_NAME,
    Key: filename,
  };

  try {
    await s3Client.send(new DeleteObjectCommand(params));
    console.log(`Successfully deleted ${filename} from S3.`);
  } catch (err) {
    console.error("Error deleting file from S3:", err);
  }
};