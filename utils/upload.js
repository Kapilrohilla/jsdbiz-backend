const multer = require('multer');

// Use memory storage to allow custom validation and saving via FileStorageService
const storage = multer.memoryStorage();

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
});

module.exports = upload;


