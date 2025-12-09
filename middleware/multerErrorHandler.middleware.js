// // middlewares/multerErrorHandler.js
// const multer = require('multer');

// const multerErrorHandler = (err, req, res, next) => {
//   if (err instanceof multer.MulterError) {
//     // Handle Multer-specific errors
//     let message = 'File upload error';
//     switch (err.code) {
//       case 'LIMIT_FILE_SIZE':
//         message = 'File is too large. Max size is 2MB.';
//         break;
//       case 'LIMIT_UNEXPECTED_FILE':
//         message = 'Invalid file type. Only JPEG and PNG and PDF are allowed.';
//         break;
//       // Add other cases as needed
//     }

//     return res.status(400).json({success:false, message: message });
//   }

//   // Pass non-Multer errors to next error handler
//   next(err);
// };

// module.exports = multerErrorHandler;





// const multer = require('multer');
// // middlewares/uploadErrorHandler.js
// const multerErrorHandler = (err, req, res, next) => {
//   if (!err) return next();
  
//   // Handle specific Multer error codes
//   switch (err.code) {
//     case 'LIMIT_FILE_SIZE':
//       return res.status(413).json({
//         success: false,
//         message: `File too large. Maximum size is ${err.limit / (1024 * 1024)}MB`,
//         field: err.field
//       });

//     case 'LIMIT_FILE_COUNT':
//       return res.status(400).json({
//         success: false,
//         message: `Too many files. Maximum ${err.limit} allowed`,
//         field: err.field
//       });

//     case 'LIMIT_UNEXPECTED_FILE':
//       return res.status(400).json({
//         success: false,
//         message: `Unexpected file field: ${err.field}`,
//         acceptedFields: req.routeConfig?.acceptedFields || []
//       });

//     case 'LIMIT_FIELD_KEY':
//       return res.status(400).json({
//         success: false,
//         message: `Field name too long. Maximum ${err.limit} characters`,
//         field: err.field
//       });

//     case 'LIMIT_FIELD_VALUE':
//       return res.status(400).json({
//         success: false,
//         message: `Field value too long. Maximum ${err.limit} bytes`,
//         field: err.field
//       });

//     case 'LIMIT_FIELD_COUNT':
//       return res.status(400).json({
//         success: false,
//         message: `Too many fields. Maximum ${err.limit} allowed`
//       });

//     case 'LIMIT_PART_COUNT':
//       return res.status(400).json({
//         success: false,
//         message: `Too many parts. Maximum ${err.limit} allowed`
//       });

//     default:
//       // Handle custom file filter errors
//       if (err.message.includes('Invalid file type')) {
//         return res.status(415).json({
//           success: false,
//           message: err.message,
//           acceptedTypes: req.routeConfig?.acceptedTypes || []
//         });
//       }
//       return next(err); // Forward to general error handler
//   }
// };

// module.exports = multerErrorHandler;