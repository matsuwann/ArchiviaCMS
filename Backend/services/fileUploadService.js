const multer = require('multer');
const path = require('path');

const fileFilter = (req, file, cb) => {
  if (file.mimetype === 'application/pdf') {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only PDF documents are accepted.'), false);
  }
};

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

exports.upload = multer({ 
  storage: storage,
  fileFilter: fileFilter
});
/**
 * File filter for icons (accepts png, svg, ico)
 */
const iconFileFilter = (req, file, cb) => {
  if (file.mimetype === 'image/png' || file.mimetype === 'image/svg+xml' || file.mimetype === 'image/vnd.microsoft.icon' || file.mimetype === 'image/x-icon') {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only PNG, SVG, or ICO are accepted.'), false);
  }
};

/**
 * Storage configuration for the icon.
 * This saves the file to a static name, overwriting the old one.
 */
const iconStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    // This path goes up from /Backend, into /Frontend/public
    const dest = path.join(__dirname, '..', '..', 'Frontend', 'public');
    cb(null, dest);
  },
  filename: function (req, file, cb) {
    // This will overwrite the 'favicon.ico' in your /public folder
    //
    // Note: The file in /app is for build-time, /public is for run-time
    cb(null, 'favicon.ico'); 
  }
});

/**
 * Multer instance for icon uploads
 */
exports.uploadIcon = multer({ 
  storage: iconStorage,
  fileFilter: iconFileFilter
});