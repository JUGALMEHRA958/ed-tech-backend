module.exports = (app, express) => {

    const router = express.Router();

    const Globals = require("../../../configs/Globals");
    const CmsController = require('../Cms/Controller');
    const config = require('../../../configs/configs');
    const Validators = require("./Validator");

    router.post('/addUpdateCMS', Globals.isAdminAuthorised(['cms_pages_edit', 'cms_pages_create']), Validators.cmsValidator(), Validators.validate, (req, res, next) => {
        const cmsObj = (new CmsController()).boot(req, res);
        return cmsObj.addUpdateCMS();
    });

    router.post('/cmsDelete', Globals.isAdminAuthorised(['cms_pages_delete']), Validators.deleteValidator(), Validators.validate, (req, res, next) => {
        const cmsObj = (new CmsController()).boot(req, res);
        return cmsObj.deleteCMS();
    });

    router.post('/cmsList', Globals.isAdminAuthorised(['cms_pages_view_list']), Validators.listingValidator(), Validators.validate, (req, res, next) => {
        const cmsObj = (new CmsController()).boot(req, res);
        return cmsObj.listCms();
    });

    router.get('/cmsDetail/:cmsId', Globals.isAdminAuthorised(['cms_pages_view_list']), Validators.detailValidator(), Validators.validate, (req, res, next) => {
        const cmsObj = (new CmsController()).boot(req, res);
        return cmsObj.detailCms();
    });

    router.post('/searchCms', Globals.isAdminAuthorised(), (req, res, next) => {
        const cmsObj = (new CmsController()).boot(req, res);
        return cmsObj.searchCms();
    });

    router.post('/cmsColumnSettings', Globals.isAdminAuthorised(), Validators.saveColumnValidator(), Validators.validate, (req, res, next) => {
        const userObj = (new CmsController()).boot(req, res);
        return userObj.saveColumnSettings();
    });

    router.post('/getCmsColumnValues', Globals.isAdminAuthorised(), Validators.getColumnValidator(), Validators.validate, (req, res, next) => {
        const userObj = (new CmsController()).boot(req, res);
        return userObj.getColumnValues();
    });

    app.use(config.baseApiUrl, router);
}