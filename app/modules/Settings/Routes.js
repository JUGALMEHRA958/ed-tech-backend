module.exports = (app, express) => {

    const router = express.Router();

    const Globals = require("../../../configs/Globals");
    const Controller = require('./Controller');
    const config = require('../../../configs/configs');
    const Validators = require("./Validator");

    router.post('/addEmailSettings', Globals.isAdminAuthorised(['email_settings_create', 'email_settings_edit']), Validators.emailSettingsValidator(), Validators.validate, (req, res, next) => {
        const emjObj = (new Controller()).boot(req, res);
        return emjObj.addEmailSettings();
    });
    router.post('/addDefaultEmailSettings', Globals.isAdminAuthorised(['email_settings_edit_default_settings']), Validators.defaultEmailSettingsValidator(), Validators.validate, (req, res, next) => {
        const emjObj = (new Controller()).boot(req, res);
        return emjObj.addDefaultEmailSettings();
    });
    router.post('/addGlobalSettings', Globals.isAdminAuthorised(), (req, res, next) => {
        const emjObj = (new Controller()).boot(req, res);
        return emjObj.addGlobalSettings();
    });
    router.post('/addSMTPSettings', Globals.isAdminAuthorised(), Validators.smtpSettingsValidator(), Validators.validate, (req, res, next) => {
        const emjObj = (new Controller()).boot(req, res);
        return emjObj.addSMTPSettings();
    });
    router.post('/addAllCurrency', Globals.isAdminAuthorised(), (req, res, next) => {
        const emjObj = (new Controller()).boot(req, res);
        return emjObj.addAllCurrency();
    });
    router.get('/getCurrency', Globals.isAdminAuthorised(), (req, res, next) => {
        const emjObj = (new Controller()).boot(req, res);
        return emjObj.getCurrency();
    });
    router.post('/addAllDateFormat', Globals.isAdminAuthorised(), (req, res, next) => {
        const emjObj = (new Controller()).boot(req, res);
        return emjObj.addAllDateFormat();
    });
    router.post('/changeCurrencyStatus', Validators.changeStatusValidator(), Validators.validate, Globals.isAdminAuthorised(), (req, res, next) => {
        const emjObj = (new Controller()).boot(req, res);
        return emjObj.changeCurrencyStatus();
    });
    router.post('/changeDateFormatStatus', Validators.changeStatusValidator(), Validators.validate, Globals.isAdminAuthorised(), (req, res, next) => {
        const emjObj = (new Controller()).boot(req, res);
        return emjObj.changeDateFormatStatus();
    });
    router.get('/getDateFormat', Globals.isAdminAuthorised(), (req, res, next) => {
        const emjObj = (new Controller()).boot(req, res);
        return emjObj.getDateFormat();
    });
    router.get('/getEmailSettings', Globals.isAdminAuthorised(['email_settings_view_list']), (req, res, next) => {
        const emjObj = (new Controller()).boot(req, res);
        return emjObj.getEmailSettings();
    });
    router.get('/getSMTPSettings', Globals.isAdminAuthorised(), (req, res, next) => {
        const emjObj = (new Controller()).boot(req, res);
        return emjObj.getSMTPSettings();
    });
    router.get('/getGlobalSettings', Globals.isAdminAuthorised(), (req, res, next) => {
        const emjObj = (new Controller()).boot(req, res);
        return emjObj.getGlobalSettings();
    });
    router.get('/getEmailTitle', Globals.isAdminAuthorised(), (req, res, next) => {
        const emjObj = (new Controller()).boot(req, res);
        return emjObj.getEmailTitle();
    });
    router.delete('/deleteEmailSetting/:settingsId', Globals.isAdminAuthorised(['email_settings_delete']), Validators.deleteEmailSettingsValidator(), Validators.validate, (req, res, next) => {
        const emjObj = (new Controller()).boot(req, res);
        return emjObj.deleteEmailSetting();
    });


    app.use(config.baseApiUrl, router);
}