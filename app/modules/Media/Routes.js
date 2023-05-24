module.exports = (app, express) => {

    const router = express.Router();
    const Globals = require("../../../configs/Globals");
    const MediaController = require('./Controller');
    const config = require('../../../configs/configs');
    const Validators = require("./Validator");
    // const express = require('express');
    const multer = require('multer');
    const path = require('path');
    const crypto = require('crypto');
// const path = require('path');
    
    // Set the storage destination and file name for multer
    const storage = multer.diskStorage({
        destination: (req, file, cb) => {
          cb(null, 'images');
        },
        filename: (req, file, cb) => {
          const randomString = crypto.randomBytes(3).toString('hex'); // Generate a random 5-letter string
          const extension = path.extname(file.originalname); // Get the file extension
          const fileName = `${randomString}${extension}`;
          cb(null, fileName);
        },
      });
    
    // Initialize multer with the storage configuration
    const upload = multer({ storage });
    
    
    // Define a route to handle file uploads
    router.post('/upload', upload.single('file'), (req, res) => {
        if (!req.file) {
          res.status(400).send('No file uploaded.');
        } else {
          const filePath = req.file.path;
          res.send(`${config.serverUrl}${filePath}`);
        }
      });
      
    

    
    router.post('/addUpdateMedia', Globals.isAdminAuthorised(), Validators.mediaValidator(), Validators.validate, (req, res, next) => {
        const mediaObj = (new MediaController()).boot(req, res, next);
        return mediaObj.addUpdateMedia();
    });

    router.get('/getMediaDetails/:mediaId', Globals.isAdminAuthorised(), Validators.detailValidator(), Validators.validate, (req, res, next) => {
        const mediaObj = (new MediaController()).boot(req, res, next);
        return mediaObj.mediaDetail();
    });

    router.post('/deleteMedia', Globals.isAdminAuthorised(), Validators.deleteValidator(), Validators.validate, (req, res, next) => {
        const mediaObj = (new MediaController()).boot(req, res, next);
        return mediaObj.mediaDelete();
    });

    router.post('/listMedia', Globals.isAdminAuthorised(), Validators.listingValidator(), Validators.validate, (req, res, next) => {
        const mediaObj = (new MediaController()).boot(req, res, next);
        return mediaObj.mediaList();
    });

    router.post('/searchMedia', Globals.isAdminAuthorised(), (req, res, next) => {
        const mediaObj = (new MediaController()).boot(req, res, next);
        return mediaObj.searchMedia();
    });

    router.post('/mediaColumnSettings', Globals.isAdminAuthorised(), Validators.saveColumnValidator(), Validators.validate, (req, res, next) => {
        const userObj = (new MediaController()).boot(req, res);
        return userObj.saveColumnSettings();
    });

    router.post('/getMediaColumnValues', Globals.isAdminAuthorised(), Validators.getColumnValidator(), Validators.validate, (req, res, next) => {
        const userObj = (new MediaController()).boot(req, res);
        return userObj.getColumnValues();
    });

    app.use(config.baseApiUrl, router);
}