const expressFileUpload = require('express-fileupload');

module.exports = expressFileUpload({
    limits: { fileSize: 5 * 1024 * 1024 }, // Limite di 5MB
    abortOnLimit: true,
    createParentPath: true,
});