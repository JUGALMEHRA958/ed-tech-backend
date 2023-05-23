const i18n = require("i18n");
const _ = require('lodash');

const Controller = require('../Base/Controller');
const Globals = require('../../../configs/Globals');
const Admin = require('./Schema').Admin;
const Email = require('../../services/Email');
const Form = require("../../services/Form");
const File = require("../../services/File");
const CommonService = require("../../services/Common");
const RoleService = require("../Roles/Service");
const RequestBody = require("../../services/RequestBody");
const Authentication = require('../Authentication/Schema').Authtokens;
const adminProjection = require('../Admin/Projection');
const config = require('../../../configs/configs');

class AdminController extends Controller {

    constructor() {
        super();
    }
    /********************************************************
     Purpose: Get Admin profile details
     Parameter:
     {}
     Return: JSON String
     ********************************************************/
    async profile() {
        try {
            const currentUser = this.req.currentUser && this.req.currentUser._id ? this.req.currentUser._id : "";
            const admin = await Admin.findOne({ _id: currentUser }, adminProjection.admin);
            return _.isEmpty(admin) ? this.res.send({ status: 0, message: i18n.__("USER_NOT_EXIST") }) : this.res.send({ status: 1, data: admin });
        } catch (error) {
            console.log('error', error);
            this.res.send({ status: 0, message: error });
        }
    }
    /********************************************************
     Purpose: Update admin profile details
     Parameter:
     {
            "photo":"abc.jpg"
            "mobile":"987654321",
            "firstname":"john",
            "lastname":"deo"
     }
     Return: JSON String
     ********************************************************/
    async editProfile() {
        try {
            const currentUser = this.req.currentUser && this.req.currentUser._id ? this.req.currentUser._id : "";
            let fieldsArray = ['firstname', 'lastname', 'mobile', 'photo'];
            let userData = await (new RequestBody()).processRequestBody(this.req.body, fieldsArray);
            if (userData.photo) {
                userData.photo = _.last(userData.photo.split("/"));
            }
            const updatedAdmin = await Admin.findByIdAndUpdate(currentUser, userData, { new: true }).select(adminProjection.admin);
            return _.isEmpty(updatedAdmin) ? this.res.send({ status: 0, message: i18n.__("USER_NOT_EXIST") }) : this.res.send({ status: 1, data: updatedAdmin });
        } catch (error) {
            console.log(error);
            this.res.send({ status: 0, message: error });
        }
    }
    /********************************************************
     Purpose: Change password
     Parameter:
     {
        "oldPassword":"test123",
        "newPassword":"test123"
     }
     Return: JSON String
     ********************************************************/
    async changePassword() {
        try {
            const user = this.req.currentUser;
            let passwordObj = {
                oldPassword: this.req.body.oldPassword,
                newPassword: this.req.body.newPassword,
                savedPassword: user.password
            };
            let password = await (new CommonService()).changePasswordValidation({ passwordObj });
            if (typeof password.status !== 'undefined' && password.status == 0) {
                return this.res.send(password);
            }
            const updatedUser = await Admin.findByIdAndUpdate(user._id, { password: password }, { new: true });
            return !updatedUser ? this.res.send({ status: 0, message: i18n.__("PASSWORD_NOT_UPDATED") }) : this.res.send({ status: 1, message: i18n.__("PASSWORD_UPDATED_SUCCESSFULLY") });
        } catch (error) {
            console.log("error- ", error);
            this.res.send({ status: 0, message: error });
        }
    }
    /********************************************************
     Purpose: Forgot password
     Parameter:
     {
            "oldPassword":"test123",
            "newPassword":"test123"
     }
     Return: JSON String
     ********************************************************/
    async adminForgotPasswordMail() {
        try {
            let emailId = this.req.body.emailId;
            let user = await Admin.findOne({ emailId: emailId });
            if (_.isEmpty(user)) {
                return this.res.send({ status: 0, message: i18n.__("REGISTERED_EMAIL") })
            }

            const token = await (new Globals()).generateToken(user._id);
            await Admin.findByIdAndUpdate(user._id, { forgotToken: token, forgotTokenCreationTime: new Date() });

            let emailData = {
                emailId: emailId,
                emailKey: 'forgot_password_mail',
                replaceDataObj: { fullName: user.firstname + " " + user.lastname, resetPasswordLink: config.frontUrl + '/resetPassword?token=' + token, resetPasswordLinkAngular: config.frontUrlAngular + '/reset-password?token=' + token }
            };

            const sendingMail = await new Email().sendMail(emailData);
            if (sendingMail) {
                if (sendingMail.status == 0) {
                    return _this.res.send(sendingMail);
                } else if (!sendingMail.response) {
                    return this.res.send({ status: 0, message: i18n.__("SERVER_ERROR") });
                }
            }
            return this.res.send({ status: 1, message: i18n.__("CHECK_EMAIL") });
        } catch (error) {
            console.log("error- ", error);
            this.res.send({ status: 0, message: error });
        }
    }
    /********************************************************
     Purpose: Reset password
     Parameter:
     {
            "token": "",
            "password":""
     }
     Return: JSON String
     ********************************************************/
    async resetPasswordAdmin() {
        try {
            let user = await Admin.findOne({ forgotToken: this.req.body.token });
            if (_.isEmpty(user)) {
                return this.res.send({ status: 0, message: i18n.__("INVALID_TOKEN") });
            }

            const decoded = await Globals.decodeAdminForgotToken(this.req.body.token);
            if (!decoded) {
                return this.res.send({ status: 0, message: i18n.__("LINK_EXPIRED") });
            }

            let isPasswordValid = await (new CommonService()).validatePassword({ password: this.req.body.password });
            if (isPasswordValid && !isPasswordValid.status) {
                return this.res.send(isPasswordValid);
            }
            let password = await (new CommonService()).ecryptPassword({ password: this.req.body.password });

            const updateUser = await Admin.findByIdAndUpdate(user._id, { password: password }, { new: true });
            if (_.isEmpty(updateUser)) {
                return this.res.send({ status: 0, message: i18n.__("PASSWORD_NOT_UPDATED") });
            }
            await Admin.findByIdAndUpdate(user._id, { forgotToken: "", forgotTokenCreationTime: "" });
            return this.res.send({ status: 1, message: i18n.__("PASSWORD_UPDATED_SUCCESSFULLY") });
        } catch (error) {
            console.log("error- ", error);
            this.res.send({ status: 0, message: error });
        }
    }
    /********************************************************
     Purpose: Login
     Parameter:
     {
            "emailId": "",
            "password":""
     }
     Return: JSON String
     ********************************************************/
    async adminLogin() {
        try {
            let fieldsArray = ["emailId", "password"];
            let emptyFields = await (new RequestBody()).checkEmptyWithFields(this.req.body, fieldsArray);
            if (emptyFields && Array.isArray(emptyFields) && emptyFields.length) {
                return this.res.send({ status: 0, message: i18n.__('SEND_PROPER_DATA') + " " + emptyFields.toString() + " fields required." });
            }
            fieldsArray = [...fieldsArray, "deviceToken", "device"];
            let data = await (new RequestBody()).processRequestBody(this.req.body, fieldsArray);

            const user = await Admin.findOne({ emailId: data.emailId.toString().toLowerCase() });
            if (_.isEmpty(user)) {
                return this.res.send({ status: 0, message: i18n.__("USER_NOT_EXIST") });
            }
            if (!user.emailVerificationStatus) {
                return this.res.send({ status: 0, message: i18n.__("VERIFY_EMAIL") });
            }
            if (!user.password) {
                return this.res.send({ status: 0, message: i18n.__("SET_PASSWORD") });
            }
            const status = await (new CommonService()).verifyPassword({ password: data.password, savedPassword: user.password });
            if (!status) {
                return this.res.send({ status: 0, message: i18n.__("INVALID_PASSWORD") });
            }

            let tokenData = { id: user._id };
            let obj = { lastSeen: new Date() };

            tokenData['ipAddress'] = this.req.ip;
            let token = await (new Globals()).AdminToken(tokenData);
            let updatedUser = await Admin.findByIdAndUpdate(user._id, obj, { new: true }).select(adminProjection.admin);

            // Logic to get role permission
            let userData = JSON.parse(JSON.stringify(updatedUser));
            userData['rolePermission'] = await (new RoleService()).getPermissionsOfUser({ roleId: updatedUser.role._id ? updatedUser.role._id : updatedUser.role });
            return this.res.send({ status: 1, message: i18n.__("LOGIN_SUCCESS"), access_token: token, data: userData });

        } catch (error) {
            console.log("error", error);
            return this.res.send({ status: 0, message: i18n.__('SERVER_ERROR') });
        }
    }
    /********************************************************
     Purpose: Single File uploading
     Parameter:
     {
            "file":
     }
     Return: JSON String
     ********************************************************/
    async fileUpload() {
        try {
            let form = new Form(this.req);
            let formObject = await form.parse();
            if (_.isEmpty(formObject.files)) {
                return this.res.send({ status: 0, message: i18n.__("%s REQUIRED", 'File') });
            }
            const file = new File(formObject.files);
            let filePath = "";
            if (config.s3upload && config.s3upload == 'true') {
                filePath = file.uploadFileOnS3(formObject.files.file[0]);
            }
            else {
                let fileObject = await file.store();
                /***** uncommit this line to do manipulations in image like compression and resizing ****/
                // let fileObject = await file.saveImage();
                filePath = fileObject.filePath;
            }
            this.res.send({ status: 1, data: { filePath } });
        } catch (error) {
            console.log("error- ", error);
            this.res.send({ status: 0, message: error });
        }
    }
    async getMetaText() {
        let data = [
            "Lorem ipsum is placeholder text commonly used in the graphic, print, and publishing industries for previewing layouts and visual mockups.",
            "Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur",

            "Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum."
        ]
        this.res.send({ status: 1, data })
    }
    /********************************************************
     Purpose: Logout Admin
     Parameter:
     {}
     Return: JSON String
     ********************************************************/
    async logout() {
        try {
            const currentUser = this.req.currentUser && this.req.currentUser._id ? this.req.currentUser._id : "";
            await Authentication.update({ adminId: currentUser, ipAddress: this.req.body.ip }, { $set: { token: null } });
            this.res.send({ status: 1, message: i18n.__("LOGOUT_SUCCESS"), data: {} });
        } catch (error) {
            console.log('error', error);
            this.res.send({ status: 0, message: error });
        }

    }
}


module.exports = AdminController