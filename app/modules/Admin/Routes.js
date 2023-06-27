module.exports = (app, express) => {

    const router = express.Router();
    const rateLimit = require("express-rate-limit");

    const Globals = require("../../../configs/Globals");
    const Validators = require("./Validator");
    const AdminController = require('./Controller');
    const config = require('../../../configs/configs');

    const apiRequestLimiter = rateLimit({
        windowMs: 15 * 60 * 1000, // 15 minute window
        max: 50, // start blocking after 50 requests
        message: { status: 0, message: "Too many requests from this IP for this api, please try again after an hour" }
    });

    router.post('/admin/getAllStudents',Globals.isAdminAuthorised(), apiRequestLimiter, (req, res, next) => {
        const adminObj = new AdminController().boot(req, res);
        return adminObj.getAllUsers();
    });

    router.post('/admin/getStudentById', Globals.isAdminAuthorised(),Validators.idValidator(), apiRequestLimiter, (req, res, next) => {
        const adminObj = new AdminController().boot(req, res);
        return adminObj.getstudentById();
    });

    router.post('/admin/forgotPassword', Validators.emailValidator(), Validators.validate, (req, res, next) => {
        const adminObj = (new AdminController()).boot(req, res);
        return adminObj.adminForgotPasswordMail();
    });
    router.post('/admin/resetPassword', Validators.resetPasswordValidator(), Validators.validate, (req, res, next) => {
        const adminObj = (new AdminController()).boot(req, res);
        return adminObj.resetPasswordAdmin();
    });

    router.post('/admin/login', Validators.loginValidator(), Validators.validate, (req, res, next) => {
        const adminObj = new AdminController().boot(req, res);
        return adminObj.adminLogin();
    });

    router.get('/admin/profile', Globals.isAdminAuthorised(), apiRequestLimiter, (req, res, next) => {
        const adminObj = new AdminController().boot(req, res);
        return adminObj.profile();
    });

    router.post('/admin/editProfile', Globals.isAdminAuthorised(),  Validators.validate, (req, res, next) => {
        const adminObj = new AdminController().boot(req, res);
        return adminObj.editProfile();
    });

    router.post('/admin/changePassword', Globals.isAdminAuthorised(), Validators.changePasswordValidator(), Validators.validate, (req, res, next) => {
        const adminObj = new AdminController().boot(req, res);
        return adminObj.changePassword();
    });
    router.get('/admin/logout', Globals.isAdminAuthorised(), (req, res, next) => {
        const adminObj = (new AdminController()).boot(req, res);
        return adminObj.logout();
    });

    router.post('/admin/fileUpload', (req, res, next) => {
        const adminObj = new AdminController().boot(req, res);
        return adminObj.fileUpload();
    });

    router.get('/admin/getMetaText', Globals.isAdminAuthorised(), (req, res, next) => {
        const adminObj = new AdminController().boot(req, res);
        return adminObj.getMetaText();
    });

    router.post('/admin/setPassword', Validators.resetPasswordValidator(), Validators.validate, (req, res, next) => {
        const adminObj = (new AdminController()).boot(req, res);
        return adminObj.resetPasswordAdmin();
    });

    router.post('/admin/getPurchaseHistory', Validators.purchaseHistoryValidator(), Validators.validate, (req, res, next) => {
        const adminObj = (new AdminController()).boot(req, res);
        return adminObj.getPurchaseHistory();
    });

    router.post('/admin/getSales', Validators.purchaseHistoryValidator(), Validators.validate, (req, res, next) => {
        const adminObj = (new AdminController()).boot(req, res);
        return adminObj.getSales();
    });


    //GROUP CRUD starts

    
    router.post('/admin/createGroup', Globals.isAdminAuthorised(),Validators.createGroupValidator(), Validators.validate, (req, res, next) => {
        const adminObj = (new AdminController()).boot(req, res);
        return adminObj.createGroup();
    });

    router.post('/admin/getGroupById', Globals.isAdminAuthorised(),Validators.getGroupByIdValidator(), Validators.validate, (req, res, next) => {
        const adminObj = (new AdminController()).boot(req, res);
        return adminObj.readGroupById();
    });

    router.get('/admin/getAllGroups', Globals.isAdminAuthorised(),Validators.validate, (req, res, next) => {
        const adminObj = (new AdminController()).boot(req, res);
        return adminObj.getAllGroups();
    });

    router.post('/admin/updateGroup', Globals.isAdminAuthorised(),Validators.getGroupByIdValidator(), Validators.validate, (req, res, next) => {
        const adminObj = (new AdminController()).boot(req, res);
        return adminObj.updateGroupById();
    });

    router.delete('/admin/deleteGroupById', Globals.isAdminAuthorised(),Validators.getDiscountGroupByIdValidator(), Validators.validate, (req, res, next) => {
        const adminObj = (new AdminController()).boot(req, res);
        return adminObj.deleteGroupById();
    });


    //apis for discount code start
    router.post('/admin/createDiscountGroup', Globals.isAdminAuthorised(),Validators.createDiscountGroupValidator(), Validators.validate, (req, res, next) => {
        const adminObj = (new AdminController()).boot(req, res);
        return adminObj.createDiscountGroup();
    });

    router.post('/admin/getDiscountGroupById', Globals.isAdminAuthorised(),Validators.getDiscountGroupByIdValidator(), Validators.validate, (req, res, next) => {
        const adminObj = (new AdminController()).boot(req, res);
        return adminObj.readDiscountGroupById();
    });

    router.post('/admin/getAllDiscountGroups', Globals.isAdminAuthorised(),Validators.getValidator(),Validators.validate, (req, res, next) => {
        const adminObj = (new AdminController()).boot(req, res);
        return adminObj.getAllDiscountGroups();
    });

    router.post('/admin/updateDiscountGroup', Globals.isAdminAuthorised(),Validators.getDiscountGroupByIdValidator(), Validators.validate, (req, res, next) => {
        const adminObj = (new AdminController()).boot(req, res);
        return adminObj.updateDiscountGroupById();
    });

    router.delete('/admin/deleteDiscountGroupById', Globals.isAdminAuthorised(),Validators.getDiscountGroupByIdValidator(), Validators.validate, (req, res, next) => {
        const adminObj = (new AdminController()).boot(req, res);
        return adminObj.deleteDiscountGroupById();
    });

    app.use(config.baseApiUrl, router);
}
