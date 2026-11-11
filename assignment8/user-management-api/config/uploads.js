// config/uploads.js
// One place for the upload folder and size limit, shared by the upload middleware,
// the controller and the static /images route (so they can never disagree).
const path = require('path');
const fs = require('fs');

const uploadDir = path.join(__dirname, '..', 'uploads', 'images');
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB

fs.mkdirSync(uploadDir, { recursive: true });

module.exports = { uploadDir, MAX_FILE_SIZE };
