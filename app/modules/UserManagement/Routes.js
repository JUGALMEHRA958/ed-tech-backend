
module.exports = (app, express) => {

    const router = express.Router();

    const Globals = require("../../../configs/Globals");
    const UserManagementController = require('../UserManagement/Controller');
    const config = require('../../../configs/configs');
    const Users = require('../Students/Schema').Students;
    const CommonService = require("../../services/Common");
    const Validators = require("./Validator");

    let obj = { columnKey: "userListing", key: "userListing", model: Users };

    router.get('/user/userProfile/:userId', Globals.isAdminAuthorised(['user_view_list']), Validators.detailValidator(), Validators.validate, (req, res, next) => {
        req.model = obj.model;
        const userObj = (new UserManagementController()).boot(req, res);
        return userObj.userProfile();
    });

    router.post('/user/search', Globals.isAdminAuthorised(['user_view_list']), (req, res, next) => {
        req.body = { ...req.body, ...obj };
        const userObj = (new UserManagementController()).boot(req, res);
        return userObj.searchUser();
    });

    router.post('/user/uploadFile', Globals.isAdminAuthorised(), (req, res, next) => {
        req.model = obj.model;
        const userObj = (new UserManagementController()).boot(req, res);
        return userObj.csvToJson();
    });

    router.post('/user/deleteUsers', Globals.isAdminAuthorised(['user_delete']), Validators.deleteValidator(), Validators.validate, (req, res, next) => {
        req.body = { ...req.body, ...obj };
        const userObj = (new UserManagementController()).boot(req, res);
        return userObj.deleteUsers();
    });

    router.post('/user/changeStatus', Globals.isAdminAuthorised(['user_status_update']), Validators.statusValidator({ key: 'userIds' }), Validators.validate, (req, res, next) => {
        req.body = { ...req.body, ...obj };
        const userObj = (new UserManagementController()).boot(req, res);
        return userObj.changeStatus();
    });

    router.post('/user/saveFilter', Globals.isAdminAuthorised(), Validators.saveFilterValidator(), Validators.validate, (req, res, next) => {
        req.body = { ...req.body, ...obj };
        const userObj = (new UserManagementController()).boot(req, res);
        return userObj.saveFilter();
    });

    router.get('/user/getFilters', Globals.isAdminAuthorised(), (req, res, next) => {
        req.key = obj.key;
        const userObj = (new UserManagementController()).boot(req, res);
        return userObj.getFilters();
    });

    router.delete('/user/deleteFilter/:filterId', Globals.isAdminAuthorised(), Validators.detailValidator({ key: 'filterId' }), Validators.validate, (req, res, next) => {
        req.key = obj.key;
        const userObj = (new UserManagementController()).boot(req, res);
        return userObj.deleteFilter();
    });

    router.post('/user/columnSettings', Globals.isAdminAuthorised(), Validators.saveColumnValidator(), Validators.validate, (req, res, next) => {
        req.body = { ...req.body, ...obj };
        const userObj = (new UserManagementController()).boot(req, res);
        return userObj.saveColumnSettings();
    });

    router.post('/user/getColumnValues', Globals.isAdminAuthorised(), Validators.fieldsValidator(), Validators.validate, async (req, res, next) => {
        req.body = { ...req.body, ...obj };
        let result = await new CommonService().getColumnValues({ bodyData: req.body });
        return res.send(result);
    });

    router.post('/user/downloadCsv', Globals.isAdminAuthorised(['user_download']), (req, res, next) => {
        req.body = { ...req.body, ...obj };
        const userObj = (new UserManagementController()).boot(req, res);
        return userObj.downloadCsv();
    });

    router.post('/user/downloadExcel', Globals.isAdminAuthorised(['user_download']), (req, res, next) => {
        req.body = { ...req.body, ...obj };
        const userObj = (new UserManagementController()).boot(req, res);
        return userObj.downloadExcel();
    });
    router.post('/user/userListing', Globals.isAdminAuthorised(['user_view_list']), Validators.listingValidator(), Validators.validate, (req, res, next) => {
        req.body = { ...req.body, columnKey: "userListing", key: "userListing", model: Users };
        const userObj = (new UserManagementController()).boot(req, res);
        return userObj.userListing();
    });

    app.use(config.baseApiUrl, router);
}