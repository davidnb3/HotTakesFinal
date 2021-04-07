const multer = require('multer');


const mimeTypes = {
    'image/jpg': 'jpg',
    'image/jpeg': 'jpg',
    'image/png': 'png',
};


const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'images');
    },
    filename: (req, file, cb) => {
        const name = file.originalname.split('.');
        const newName = name[0].split(' ').join('_');
        const extension = mimeTypes[file.mimetype];
        cb(null, newName + '-' + Date.now() + '.' + extension);
    }
});

module.exports = multer({storage: storage}).single('image');