const i18n = require("i18n");
const csvjson = require('csvjson');
const _ = require("lodash");
const Transaction = require('mongoose-transactions');

const Controller = require("../Base/Controller");
const Admin = require('../Admin/Schema').Admin;
const AdminSchema = require('../Admin/Schema').admin;
const RolesSchema = require('../Roles/Schema').RolesSchema;
const Model = require("../Base/Model");
const Form = require("../../services/Form");
const File = require("../../services/File");
const CommonService = require("../../services/Common");
const userProjection = require('./Projection');
const Globals = require('../../../configs/Globals');
const config = require('../../../configs/configs');
const Email = require('../../services/Email');
const RequestBody = require("../../services/RequestBody");

class AdminManagementController extends Controller {

    constructor() {
        super();
    }
    /********************************************************
     Purpose: single and multiple user delete
     Parameter:
     {
        "userIds":["5ad5d198f657ca54cfe39ba0","5ad5da8ff657ca54cfe39ba3"]
     }
     Return: JSON String
     ********************************************************/
    async deleteUsers() {
        try {
            let msg = i18n.__("USER_NOT_DELETED");
            const updatedUser = await Admin.updateMany({ _id: { $in: this.req.body.userIds }, isDeleted: false }, { $set: { isDeleted: true } });
            if (updatedUser) {
                msg = updatedUser.nModified ? updatedUser.nModified + i18n.__("USER_DELETED") : updatedUser.n == 0 ? i18n.__("USER_NOT_EXIST") : msg;
            }
            return this.res.send({ status: 1, message: msg });
        } catch (error) {
            console.log("error- ", error);
            this.res.send({ status: 0, message: error });
        }
    }
    /********************************************************
     Purpose: single and multiple user 's change status
     Parameter:
     {
        "userIds":["5ad5d198f657ca54cfe39ba0","5ad5da8ff657ca54cfe39ba3"],
        "status":true
     }
     Return: JSON String
     ********************************************************/
    async changeStatus() {
        try {
            let msg = i18n.__("USER_NOT_UPDATED");
            const updatedUser = await Admin.updateMany({ _id: { $in: this.req.body.userIds } }, { $set: { status: this.req.body.status } });
            if (updatedUser) {
                msg = updatedUser.nModified ? updatedUser.nModified + i18n.__("USER_UPDATED") : updatedUser.n == 0 ? i18n.__("USER_NOT_EXIST") : msg;
            }
            return this.res.send({ status: 1, message: msg });
        } catch (error) {
            console.log("error- ", error);
            this.res.send({ status: 0, message: error });
        }
    }
    /********************************************************
     Purpose: user details
     Parameter:
     {
        "uid": "5ad5d198f657ca54cfe39ba0"
     }
     Return: JSON String
     ********************************************************/
    async userProfile() {
        try {
            let user = await Admin.findOne({ _id: this.req.params.userId }, userProjection.user);
            return this.res.send(_.isEmpty(user) ? { status: 0, message: i18n.__("USER_NOT_EXIST") } : { status: 1, data: user });
        } catch (error) {
            console.log("error- ", error);
            this.res.send({ status: 0, message: error });
        }
    }
    /********************************************************
     Purpose: search based on column (user listing)
     Parameter:
     {
        "filter":{
            "firstname":"Bhu"
        }
     }
     Return: JSON String
     ********************************************************/
    async searchUser() {
        try {
            let result = await new CommonService().search({ bodyData: this.req.body });
            return this.res.send(result);
        } catch (error) {
            console.log("error- ", error);
            this.res.send({ status: 0, message: error });
        }
    }
    /********************************************************
     Purpose: Upload csv file path and covert into json and save user in database with unique emailId
     Parameter:
     {

     }
     Return: JSON String
     ********************************************************/
    async csvToJson() {
        try {
            let form = new Form(this.req);
            let formObject = await form.parse();
            console.log(formObject.files)
            if (_.isEmpty(formObject.files)) {
                return this.res.send({ status: 0, message: i18n.__("%s REQUIRED", 'File') });
            }
            const file = new File(formObject.files);

            let data = await file.readFile(formObject.files.csv[0].path);
            let options = {
                delimiter: ',', // optional
                quote: '"' // optional
            }
            console.log(data, "-------data--------");

            let jsonData = csvjson.toObject(data, options);
            let newData = []
            let da = new Date();
            jsonData.filter((d) => {
                d.emailVerificationStatus = true
                d.isDeleted = false
                d.status = true
                d.createdAt = da
                d.updatedAt = da
                newData.push(d);
            });
            const result = await new Model(Admin).bulkInsert(newData);
            this.res.send({ status: 1, data: result });
        } catch (error) {
            console.log("error- ", error);
            this.res.send({ status: 0, message: i18n.__("SERVER_ERROR") });
        }
    }
    /********************************************************
     Purpose: Save column settings
     Parameter:
     {
        key: 'userListing',
        columns: [{key : 'firstName', status: false}, {key : 'lastName', status: false},{key : 'emailId', status: true}]
     }
     Return: JSON String
     ********************************************************/
    async saveColumnSettings() {
        try {
            let result = await new CommonService().saveColumnSettings({ bodyData: this.req.body });
            return this.res.send(result);
        }
        catch (error) {
            console.log(error);
            this.res.send({ status: 0, message: error });
        }
    }
    /********************************************************
     Purpose: Save filter
     Parameter:
     {
        "filterName": "firstNameFilter",
        "filter": [{"firstname": ["Neha","mad"]},{"lastname":["dodla"]}]
     }
     Return: JSON String
     ********************************************************/
    async saveFilter() {
        try {
            let result = await new CommonService().saveFilter({ bodyData: this.req.body });
            return this.res.send(result);
        }
        catch (error) {
            console.log(error);
            this.res.send({ status: 0, message: error });
        }
    }
    /********************************************************
     Purpose: Get Filters
     Parameter:
     {
        "filterName": "firstNameFilter",
        "filter": [{"firstname": ["Neha","mad"]},{"lastname":["dodla"]}]
     }
     Return: JSON String
     ********************************************************/
    async getFilters() {
        try {
            let result = await new CommonService().getFilters({ key: this.req.key });
            return this.res.send(result);
        }
        catch (error) {
            console.log(error);
            this.res.send({ status: 0, message: error });
        }
    }
    /********************************************************
     Purpose: Get Filters
     Parameter:
     {
        "filterId": ""
     }
     Return: JSON String
     ********************************************************/
    async deleteFilter() {
        try {
            let data = {
                key: this.req.key ? this.req.key : 'adminListing',
                filterId: this.req.params.filterId
            };
            let result = await new CommonService().deleteFilter(data);
            return this.res.send(result);
        }
        catch (error) {
            console.log(error);
            this.res.send({ status: 0, message: error });
        }
    }
    /********************************************************
    Purpose: download csv file (get Unique user data json form and create csv file )
    Parameter:
    {}
    Return: JSON String
    ********************************************************/
    async downloadCsv() {
        try {
            let data = {
                bodyData: this.req.body,
                selectObj: userProjection.csv,
                ext: ".csv"
            };
            let result = await new CommonService().downloadFile(data);
            return this.res.send(result);
        } catch (error) {
            console.log("error- ", error);
            this.res.send({ status: 0, message: error });
        }
    }
    /********************************************************
     Purpose: download csv file (get Unique user data json form and create csv file )
     Parameter:
     {}
     Return: JSON String
     ********************************************************/
    async downloadExcel() {
        try {
            let data = {
                bodyData: this.req.body,
                selectObj: userProjection.csv,
                ext: ".xls"
            };
            let result = await new CommonService().downloadFile(data);
            return this.res.send(result);
        } catch (error) {
            console.log("error- ", error);
            this.res.send({ status: 0, message: error });
        }
    }
    /********************************************************
       Purpose: user listing
       Parameter:
       {
          page:1,
          pagesize:10,
          "filter": [{"firstname": ["Neha","mad"]},{"lastname":["dodla"]}]
       }
       Return: JSON String
       ********************************************************/
    async adminUserListing() {
        try {
            let data = {
                bodyData: this.req.body,
                staticFilter: { 'role.role': { $nin: ['Super Admin'] } },
                selectObj: userProjection.user,
                schema: AdminSchema
            };
            let result = await new CommonService().listing(data);
            return this.res.send(result);
        }
        catch (error) {
            console.log(error);
            this.res.send({ status: 0, message: error });
        }
    }
    /********************************************************
     Purpose: Add admin user
     Parameter:
     {
          "email":"john@doe.com",
          "password":"john",
          "mobile":"987654321",
          "firstname":"john",
          "lastname":"deo",
          "role": "manager"
      }
     Return: JSON String
     ********************************************************/
    async addAdminUser() {
        const transaction = new Transaction();
        try {

            // check emailId is exist or not
            let filter = { "$or": [{ "emailId": this.req.body.emailId.toLowerCase() }] }
            const admin = await Admin.findOne(filter);

            //if admin exist give error
            if (!_.isEmpty(admin) && (admin.emailId)) {
                return this.res.send({ status: 0, message: i18n.__("DUPLICATE_EMAIL_OR_USERNAME") });
            } else {
                let fieldsArray = ["emailId", "firstname", "lastname", "mobile", "role", "photo", "username"]
                let data = await (new RequestBody()).processRequestBody(this.req.body, fieldsArray);
                let role = await RolesSchema.findOne({ _id: data['role'] }, userProjection.roleList);
                if (!role) {
                    return this.res.send({ status: 0, message: i18n.__("ROLE_NOT_FOUND") });
                }
                data['role'] = role;
                data = { ...data, emailVerificationStatus: true, addedBy: this.req.currentUser._id }
                data['emailId'] = data['emailId'].toLowerCase();

                // save new admin

                var newUser = new Admin(data);
                newUser.validate(async (err) => {
                    if (err) {
                        console.log('validation error', err);
                        return this.res.send({ status: 0, message: err })
                    }
                    else {
                        console.log('pass validate');
                        // const newUser = await new Model(Admin).store(data);
                        const newUserId = transaction.insert('Admin', data);
                        console.log('newUser', newUserId);
                        // if empty not save admin details and give error message.
                        if (_.isEmpty(newUserId)) {
                            return this.res.send({ status: 0, message: i18n.__('USER_NOT_SAVED') })
                        }
                        else {
                            const token = await new Globals().generateToken(newUserId);
                            // await Admin.findByIdAndUpdate(newUserId, { forgotToken: token, forgotTokenCreationTime: new Date() });
                            transaction.update('Admin', newUserId, { forgotToken: token, forgotTokenCreationTime: new Date() });
                            //sending mail to verify admin
                            let emailData = {
                                emailId: data['emailId'],
                                emailKey: 'admin_invite_mail',
                                replaceDataObj: { role: data['role'], fullName: data.firstname + " " + data.lastname, verificationLink: config.frontUrl + '/setPassword?token=' + token, verificationLinkAngular: config.frontUrlAngular + '/set-password?token=' + token }
                            };
                            const sendingMail = await new Email().sendMail(emailData);
                            console.log('sendingMail', sendingMail);
                            if (sendingMail && sendingMail.status == 0) {
                                transaction.rollback();
                                return this.res.send(sendingMail);
                            }
                            else if (sendingMail && !sendingMail.response) {
                                transaction.rollback();
                                return this.res.send({ status: 0, message: i18n.__('MAIL_NOT_SEND_SUCCESSFULLY') });
                            }
                            let res = await transaction.run();
                            console.log('res', res);
                            return this.res.send({ status: 1, message: i18n.__('USER_ADDED_SUCCESSFULLY') });
                        }
                    }
                });
            }
        } catch (error) {
            console.log("error = ", error);
            transaction.rollback();
            this.res.send({ status: 0, message: error });
        }
    }
    /********************************************************
     Purpose: update admin user
     Parameter:
     {
        "userId":"5ad5d198f657ca54cfe39ba0",
        "password":"john",
        "mobile":"987654321",
        "firstname":"john",
        "lastname":"deo",
        "status":true
     }
     Return: JSON String
     ********************************************************/
    async updateUser() {
        try {
            let fieldsArray = ["firstname", "lastname", "mobile", "role", "userId", "photo", "username"];
            let data = await (new RequestBody()).processRequestBody(this.req.body, fieldsArray);
            let role = await RolesSchema.findOne({ _id: data['role'] }, userProjection.roleList);
            if (role) {
                console.log('role', role);
                data['role'] = role;
                // check emailId is exist or not
                let admin = await Admin.findOne({ _id: data['userId'] });

                //if admin not exist give error
                if (_.isEmpty(admin)) {
                    return this.res.send({ status: 0, message: i18n.__("USER_NOT_EXIST") });
                } else {
                    let userId = data['userId'];
                    delete data['userId'];
                    admin = await Admin.findOneAndUpdate({ _id: userId }, data, { new: true }).select(userProjection.user);
                }
                return this.res.send({ status: 1, data: admin });
            } else {
                return this.res.send({ status: 0, message: i18n.__("ROLE_NOT_FOUND") });
            }

        } catch (error) {
            console.log("error- ", error);
            this.res.send({ status: 0, message: error });
        }
    }

}
module.exports = AdminManagementController;