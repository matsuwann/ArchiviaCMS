const multer = require('multer');

const fileFilter = (req, file, cb) => {
  if (file.mimetype === 'application/pdf') {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only PDF documents are accepted.'), false);
  }
};

const storage = multer.memoryStorage();

exports.upload = multer({ 
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 25 * 1024 * 1024 } 
});

// --- NEW ICON UPLOAD CONFIGURATION ---

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
    // Overwrites the existing favicon
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

const imageFileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only images are accepted.'), false);
  }
};

// Storage for Background Image
const bgImageStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    const dest = path.join(__dirname, '..', '..', 'Frontend', 'public');
    cb(null, dest);
  },
  filename: function (req, file, cb) {
    // Saves as public/system-background.ext (e.g., .jpg, .png)
    cb(null, 'system-background' + path.extname(file.originalname)); 
  }
});

// Storage for Brand Icon
const brandIconStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    const dest = path.join(__dirname, '..', '..', 'Frontend', 'public');
    cb(null, dest);
  },
  filename: function (req, file, cb) {
    // Saves as public/system-brand-icon.ext (e.g., .png, .svg)
    cb(null, 'system-brand-icon' + path.extname(file.originalname)); 
  }
});

exports.uploadBgImage = multer({ 
  storage: bgImageStorage,
  fileFilter: imageFileFilter
});

exports.uploadBrandIcon = multer({ 
  storage: brandIconStorage,
  fileFilter: imageFileFilter
});