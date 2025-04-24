const multer = require('multer');
const path = require('path');

// Configure storage for profile pictures
const profileStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/profiles');
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    }
});

// Configure storage for CSV files
const csvStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/csv');
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    }
});

// File filters
const imageFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
        cb(null, true);
    } else {
        cb(new Error('Please upload only image files.'), false);
    }
};

const csvFilter = (req, file, cb) => {
    if (file.mimetype === 'text/csv') {
        cb(null, true);
    } else {
        cb(new Error('Please upload only CSV files.'), false);
    }
};

const uploadProfile = multer({
    storage: profileStorage,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB limit
    },
    fileFilter: imageFilter
});

const uploadCSV = multer({
    storage: csvStorage,
    fileFilter: csvFilter
});

module.exports = {
    uploadProfile: uploadProfile.single('profilePicture'),
    uploadCSV: uploadCSV.single('questions')
};