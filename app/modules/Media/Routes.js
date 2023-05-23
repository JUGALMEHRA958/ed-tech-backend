module.exports = (app, express) => {

    const router = express.Router();

    const Globals = require("../../../configs/Globals");
    const MediaController = require('./Controller');
    const config = require('../../../configs/configs');
    const Validators = require("./Validator");

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