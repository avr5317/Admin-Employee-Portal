// middleware/upload.js
// The upload is kept in memory first. The controller checks the real file type (magic
// bytes), finds the target user, and only then writes the file under a server-generated
// name. Nothing the client sends (file name, MIME type, email) is used for the stored name,
// and a rejected request never touches the disk.
const multer = require('multer');
const { MAX_FILE_SIZE } = require('../config/uploads');

const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: MAX_FILE_SIZE, // 5MB
        files: 1,
        fields: 10
    }
});

module.exports = upload;
