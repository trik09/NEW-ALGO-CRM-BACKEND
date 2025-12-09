
// 👇This is use on basis of employee document file upload conditions 
const multer = require('multer');
const path = require('path');

// Configure memory storage
const storage = multer.memoryStorage();

// File filter
const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only JPEG, PNG, JPG, and PDF are allowed.'), false);
  }
};

// Create upload configuration
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 2 * 1024 * 1024, // 2MB
    files: 3 // Total files allowed
  }
});

// Middleware for employee documents
const uploadEmployeeDocuments = upload.fields([
  { name: 'photo', maxCount: 1 },
  { name: 'aadharImage', maxCount: 1 },
  { name: 'panCardImage', maxCount: 1 }
]);

// Error handler middleware
const multerErrorHandler = (err, req, res, next) => {
  if (err) {
    if (err instanceof multer.MulterError) {
      // Multer error (file size, too many files, etc.)
      return res.status(400).json({
        success: false,
        message: err.code === 'LIMIT_FILE_SIZE' 
          ? 'File size too large. Max 2MB allowed.'
          : err.message
      });
    } else if (err.message.includes('Invalid file type')) {
      // File type error
      return res.status(400).json({
        success: false,
        message: err.message
      });
    }
    // Other errors
    return res.status(500).json({
      success: false,
      message: 'File upload failed'
    });
  }
  next();
};

module.exports = {
  uploadEmployeeDocuments,
  multerErrorHandler
};