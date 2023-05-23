
module.exports = (app, express) => {

    const router = express.Router();

    const Globals = require("../../../configs/Globals");
    const UserManagementController = require('./Controller');
    const config = require('../../../configs/configs');
    const Admin = require('../Admin/Schema').Admin;
    const AdminSchema = require('../Admin/Schema').admin;
    const CommonService = require("../../services/Common");
    const Validators = require("./Validator");

    let obj = { columnKey: "adminListing", key: "adminListing", model: Admin, schema: AdminSchema };

    router.get('/admin/userProfile/:userId', Globals.isAdminAuthorised(['admin_user_view_list']), Validators.detailValidator(), Validators.validate, (req, res, next) => {
        const userObj = (new UserManagementController()).boot(req, res);
        return userObj.userProfile();
    });

    router.post('/admin/search', Globals.isAdminAuthorised(['admin_user_view_list']), (req, res, next) => {
        req.body = { ...req.body, ...obj };
        const userObj = (new UserManagementController()).boot(req, res);
        return userObj.searchUser();
    });

    router.post('/admin/uploadFile', Globals.isAdminAuthorised(), (req, res, next) => {
        const userObj = (new UserManagementController()).boot(req, res);
        return userObj.csvToJson();
    });

    router.post('/admin/deleteUsers', Globals.isAdminAuthorised(['admin_user_delete']), Validators.deleteValidator(), Validators.validate, (req, res, next) => {
        const userObj = (new UserManagementController()).boot(req, res);
        return userObj.deleteUsers();
    });

    router.post('/admin/changeStatus', Globals.isAdminAuthorised(['admin_user_status_update']), Validators.statusValidator({ key: 'userIds' }), Validators.validate, (req, res, next) => {
        const userObj = (new UserManagementController()).boot(req, res);
        return userObj.changeStatus();
    });

    router.post('/admin/saveFilter', Globals.isAdminAuthorised(), Validators.saveFilterValidator(), Validators.validate, (req, res, next) => {
        req.body = { ...req.body, ...obj };
        const userObj = (new UserManagementController()).boot(req, res);
        return userObj.saveFilter();
    });

    router.get('/admin/getFilters', Globals.isAdminAuthorised(), (req, res, next) => {
        req.key = obj.key;
        const userObj = (new UserManagementController()).boot(req, res);
        return userObj.getFilters();
    });

    router.delete('/admin/deleteFilter/:filterId', Globals.isAdminAuthorised(), Validators.detailValidator({ key: 'filterId' }), Validators.validate, (req, res, next) => {
        req.key = obj.key;
        const userObj = (new UserManagementController()).boot(req, res);
        return userObj.deleteFilter();
    });

    router.post('/admin/columnSettings', Globals.isAdminAuthorised(), Validators.saveColumnValidator(), Validators.validate, (req, res, next) => {
        req.body = { ...req.body, ...obj };
        const userObj = (new UserManagementController()).boot(req, res);
        return userObj.saveColumnSettings();
    });

    router.post('/admin/getColumnValues', Globals.isAdminAuthorised(), Validators.fieldsValidator(), Validators.validate, async (req, res, next) => {
        req.body = { ...req.body, ...obj };
        let result = await new CommonService().getColumnValues({ bodyData: req.body });
        return res.send(result);
    });

    router.post('/admin/downloadCsv', Globals.isAdminAuthorised(['admin_user_download']), (req, res, next) => {
        req.body = { ...req.body, ...obj };
        const userObj = (new UserManagementController()).boot(req, res);
        return userObj.downloadCsv();
    });

    router.post('/admin/downloadExcel', Globals.isAdminAuthorised(['admin_user_download']), (req, res, next) => {
        req.body = { ...req.body, ...obj };
        const userObj = (new UserManagementController()).boot(req, res);
        return userObj.downloadExcel();
    });
    router.post('/admin/userListing', Globals.isAdminAuthorised(['admin_user_view_list']), Validators.listingValidator(), Validators.validate, (req, res, next) => {
        req.body = { ...req.body, columnKey: "adminListing", key: "adminListing", model: Admin };
        const userObj = (new UserManagementController()).boot(req, res);
        return userObj.adminUserListing();
    });

    router.post('/admin/updateUser', Globals.isAdminAuthorised(['admin_user_edit']), Validators.updateAdminUserValidator(), Validators.validate, (req, res, next) => {
        const userObj = (new UserManagementController()).boot(req, res);
        return userObj.updateUser();
    });

    router.post('/admin/addAdminUser', Globals.isAdminAuthorised(['admin_user_create']), Validators.addAdminValidator(), Validators.validate, (req, res, next) => {
        const adminObj = new UserManagementController().boot(req, res);
        return adminObj.addAdminUser();
    });

    app.use(config.baseApiUrl, router);
}