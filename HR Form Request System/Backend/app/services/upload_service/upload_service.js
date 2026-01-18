const multer = require('multer'); // require multer for file upload
const fs = require('fs');
const path = require('path');
const { UNSUPPORTED_MEDIA_TYPE} = require('../../constants/http/status_codes');
// Create folder for file uploads
const UPLOADS_DIR = path.join(__dirname, '..', '..', '..', 'storage');
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR);
}

const COURSE_COVER_DIR = path.join(UPLOADS_DIR, 'course_cover');
if (!fs.existsSync(COURSE_COVER_DIR)) {
  fs.mkdirSync(COURSE_COVER_DIR);
}

// // Set storage engine for multer
// const storage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, UPLOADS_DIR);
//   },
//   filename: (req, file, cb) => {
//    // cb(null, Date.now() + path.extname(file.originalname));
//    cb(null, `${file.fieldname}-${Date.now()}-${file.originalname}`);//${path.extname(file.originalname)}
//   }
// });
// Set storage engine for multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const userId = (req.user.id).toString(); // get user ID from request object
    const field_directory = path.join(UPLOADS_DIR, file.fieldname)
    if (!fs.existsSync(field_directory)) {
      fs.mkdirSync(field_directory);
    }

    const userUploadsDir = path.join(field_directory, userId);;
    if (!fs.existsSync(userUploadsDir)) {
      fs.mkdirSync(userUploadsDir);
    }
    cb(null, userUploadsDir);
  },
  // filename: (req, file, cb) => {
  //   cb(null, `${file.fieldname}-${Date.now()}-${file.originalname}`);
  // }
  // replace space with _ for Uploaded File Name
  filename: (req, file, cb) => {
    const originalname = file.originalname;
    const sanitizedFilename = originalname.replace(/ /g, '_'); // replace spaces with underscores
    cb(null, `${file.fieldname}-${Date.now()}-${sanitizedFilename}`);
  }
});

// Initialize multer upload middleware
const upload_service = multer({
  storage: storage,
  limits: { fileSize: 10000000000 },
  fileFilter: (req, file, cb) => {
    //this all extension file edit this for other uploads
    //const allowedFileTypes = /png|jpe?g|gif|pdf|mp4|avi|mkv|mov/;
    let configureFileType = null
    switch (file.fieldname) {
      case 'course_cover':
        configureFileType = /png|jpe?g|gif/;
        // no videos, images
        break;
      case 'profile_image':
        configureFileType = /png|jpe?g|gif/;
        // no videos, images
        break;
      case 'assignment_image':
        configureFileType = /png|jpe?g|gif/;
        // image
        break;
      case 'choices_image':
        configureFileType = /png|jpe?g|gif/;
        // image
        break;
      case 'class_file':
        configureFileType = /png|jpe?g|gif|pdf/;
        // documents, images, no videos
        break;
      case 'class_cover':
        configureFileType = /png|jpe?g|gif/;
        // images
        break;
      case 'course_file':
        configureFileType = /txt|docx|xlsx|ppt|png|jpe?g|gif|pdf|mp4|avi|mkv|mov/;
        // documents, images, videos
        break;
      case 'certificate_file':
        configureFileType = /pdf/;
        // pdf
        break;
      case 'course_video':
        configureFileType = /mp4|avi|mkv|mov/;
        // videos
        break;
      case 'interactive_path':
        configureFileType = /png|jpe?g|gif/;
        // TBD
        break;
      case 'menu_icon':
        configureFileType = /png|jpe?g|gif/;
        // image
        break;
      case 'page_content':
        configureFileType = /png|jpe?g|gif/;
        // documents, image, videos
        break;
      case 'task_image':
        configureFileType = /png|jpe?g|gif/;
        // image, documents
        break;
      case 'student_assignment':
        configureFileType = /txt|docx|xlsx|ppt|png|jpe?g|gif/;
        // image, documents
        break;
      case 'excel_file':
        configureFileType = /\.(xlsx|xls)$/;
        // image, documents
        break;
      case 'path_base':
        configureFileType =  /.*/
        break;
      default:
        configureFileType = /png|jpe?g|gif/;
        break;
    }
    //this only accept images
    const allowedFileTypes = configureFileType;
    //checking the extension name
    const extname = allowedFileTypes.test(path.extname(file.originalname).toLowerCase());
    const mimeType = allowedFileTypes.test(file.mimetype);
    if (mimeType && extname) {
      cb(null, true);
    } else {
      if (file.path) {
        fs.unlink(file.path, (err) => {
          if (err) {
            console.error('Error deleting file:', err);
          }
        });
      }
      //cb('Please select a valid file type');
      const error = {
        status: UNSUPPORTED_MEDIA_TYPE,
        message: 'Please select a valid file type',
      };
      cb(error)
    }
  },
  
})

module.exports = { upload_service }

