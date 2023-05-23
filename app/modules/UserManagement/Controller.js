const _ = require("lodash");
const i18n = require("i18n");
const csvjson = require('csvjson');

const Controller = require("../Base/Controller");
const Users = require('../Students/Schema').Students;
const Model = require("../Base/Model");
const Form = require("../../services/Form");
const File = require("../../services/File");
const CommonService = require("../../services/Common");
const userProjection = require('./Projection');

class UserManagementController extends Controller {

    constructor() {
        super();
    }
    /********************************************************
    Purpose: user listing
    Parameter:
    {
       page:1,
       pagesize:10,
       "filter": [{"firstname": ["Neha","Madhuri"]},{"lastname":["Bhavsar","Dodla"]}]
       OR 
       "filter": [{"role": ["5d5a8746d9a42e120e2d9700"]}]
    }
    Return: JSON String
    ********************************************************/
    async userListing() {
        try {
            let data = {
                bodyData: this.req.body,
                selectObj: userProjection.user
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
     Purpose: single and multiple user delete
     Parameter:
     {
        "userIds":["5ad5d198f657ca54cfe39ba0","5ad5da8ff657ca54cfe39ba3"]
     }
     Return: JSON String
     ********************************************************/
    async deleteUsers() {
        try {
            let model = this.req.body.model ? this.req.body.model : Users;
            let msg = 'User not deleted.';
            const updatedUser = await model.updateMany({ _id: { $in: this.req.body.userIds }, isDeleted: false }, { $set: { isDeleted: true } });
            if (updatedUser) {
                msg = updatedUser.nModified ? updatedUser.nModified + ' user deleted.' : updatedUser.n == 0 ? i18n.__("USER_NOT_EXIST") : msg;
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
            let model = this.req.model ? this.req.model : Users;
            let msg = 'User not updated.';
            const updatedUser = await model.updateMany({ _id: { $in: this.req.body.userIds } }, { $set: { status: this.req.body.status } });
            if (updatedUser) {
                msg = updatedUser.nModified ? updatedUser.nModified + ' user updated.' : updatedUser.n == 0 ? i18n.__("USER_NOT_EXIST") : msg;
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
            let model = this.req.model ? this.req.model : Users;
            let user = await model.findOne({ _id: this.req.params.userId }, userProjection.user);
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
        let _this = this;
        try {
            let form = new Form(this.req);
            let formObject = await form.parse();
            let model = this.req.model ? this.req.model : Users;
            console.log(formObject.files)
            if (_.isEmpty(formObject.files))
                return _this.res.send({ status: 0, message: 'Please send file.' });

            const file = new File(formObject.files);

            let data = await file.readFile(formObject.files.csv[0].path);
            let options = {
                delimiter: ',', // optional
                quote: '"' // optional
            }
            console.log(data, "-------data--------");
            let jsonData = csvjson.toObject(data, options);
            console.log(jsonData);
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
            const result = await new Model(model).bulkInsert(newData);

            _this.res.send({ status: 1, message: 'User saved successfully.', data: result });

        } catch (error) {
            console.log("error- ", error);
            _this.res.send({ status: 0, message: 'Internal server error.' });
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
                key: this.req.key ? this.req.key : 'userListing',
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
                // model: Users,
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
                // model: Users,
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
}
module.exports = UserManagementController;