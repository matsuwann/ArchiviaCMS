const multer = require('multer');
const path = require('path'); // <--- THIS WAS THE MISSING LINE
const fs = require('fs'); // <-- This one was correct

/**
 * Helper function to ensure a directory exists before saving a file to it.
 * @param {string} dirPath - The directory path to check/create.
 * @param {function} cb - The callback function from multer.
 */
const ensureDir = (dirPath, cb) => {
  // Use { recursive: true } to create parent directories if they don't exist
  fs.mkdir(dirPath, { recursive: true }, (err) => {
    if (err) return cb(err); // Pass error to multer
    cb(null, dirPath); // Pass path to multer
  });
};

// --- Document Upload (Original) ---
const fileFilter = (req, file, cb) => {
  if (file.mimetype === 'application/pdf') {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only PDF documents are accepted.'), false);
  }
};

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const dest = 'uploads/';
    ensureDir(dest, (err) => cb(err, dest));
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

// --- Icon Upload (Favicon) ---
const iconFileFilter = (req, file, cb) => {
  if (file.mimetype === 'image/png' || file.mimetype === 'image/svg+xml' || file.mimetype === 'image/vnd.microsoft.icon' || file.mimetype === 'image/x-icon') {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only PNG, SVG, or ICO are accepted.'), false);
  }
};

const iconStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    const dest = path.join(__dirname, '..', '..', 'Frontend', 'public');
    ensureDir(dest, (err) => cb(err, dest));
  },
  filename: function (req, file, cb) {
    cb(null, 'favicon.ico'); 
  }
});

exports.uploadIcon = multer({ 
  storage: iconStorage,
  fileFilter: iconFileFilter
});

// --- NEW IMAGE UPLOAD CONFIGURATIONS ---
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
    ensureDir(dest, (err) => cb(err, dest));
  },
  filename: function (req, file, cb) {
    cb(null, 'system-background' + path.extname(file.originalname)); 
  }
});

// Storage for Brand Icon
const brandIconStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    const dest = path.join(__dirname, '..', '..', 'Frontend', 'public');
    ensureDir(dest, (err) => cb(err, dest));
  },
  filename: function (req, file, cb) {
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