const ObjectId = require('mongodb').ObjectID;
const _ = require("lodash");
const i18n = require("i18n");
const csvjson = require('csvjson');

const Controller = require("../Base/Controller");
const EmailTemplate = require('../EmailTemplate/Schema').EmailTemplate;
const EmailSettings = require('./Schema').EmailSettings;
const SettingsSchema = require('./Schema').SettingsSchema;
const RequestBody = require("../../services/RequestBody");
const Projection = require('./Projection');
const Model = require("../Base/Model");
const Form = require("../../services/Form");
const File = require("../../services/File");

class SettingsController extends Controller {

    constructor() {
        super();
    }
    /********************************************************
    Purpose:Email settings add /update
    Parameter:
    {
        "emailTemplateId": "5d25ecdf31f21b0f0ae96ba3",
        "fromEmail": "donotreply1@test.com",
        "adminEmail": "test@gmail.com"
    }
    Return: JSON String
    ********************************************************/
    async addEmailSettings() {
        try {
            let isTemplateExist = await EmailTemplate.findOne({ _id: this.req.body.emailTemplateId });
            if (isTemplateExist) {
                let filter = this.req.body._id ? { emailTemplateId: this.req.body.emailTemplateId, _id: { $ne: this.req.body._id } } : { emailTemplateId: this.req.body.emailTemplateId };
                const isSettingsExist = await EmailSettings.findOne(filter);
                if (isSettingsExist) {
                    return this.res.send({ status: 0, message: i18n.__("SETTINGS_EXIST") });
                }
                if (this.req.body._id) {
                    let id = this.req.body._id;
                    delete this.req.body._id;
                    await EmailSettings.findOneAndUpdate({ _id: id }, this.req.body, { new: true });

                } else {
                    await new Model(EmailSettings).store(this.req.body);
                }
                let emailSettings = await EmailSettings.find().select(Projection.settings);
                return this.res.send({ status: 1, data: emailSettings });
            } else {
                return this.res.send({ status: 0, message: i18n.__("EMAIL_TEMPLATE_NOT_FOUND") });
            }

        } catch (error) {
            console.log(error);
            this.res.send({ status: 0, message: error });
        }
    }
    /********************************************************
    Purpose: Delete Email settings
    Parameter:
    {
        "settingsId": "5d25ecdf31f21b0f0ae96ba3"
    }
    Return: JSON String
    ********************************************************/
    async deleteEmailSetting() {
        try {
            let result = await EmailSettings.remove({ _id: this.req.params.settingsId });
            this.res.send(result && result.deletedCount ? { status: 1, message: "Setting deleted successfully." } : result && result.n == 0 ? { status: 0, message: "Setting not found." } : { status: 0, message: "Setting not deleted." });
        } catch (error) {
            this.res.send({ status: 0, message: error });
        }
    }
    /********************************************************
     Purpose: Add default Email settings
    Parameter:
    {
        "defaultFromEmail": "test@gmail.com",
        "defaultAdminEmail": "admintest@gmail.com"
    }
    Return: JSON String
    ********************************************************/
    async addDefaultEmailSettings() {
        try {
            let defaultData = {
                defaultFromEmail: this.req.body.defaultFromEmail,
                defaultAdminEmail: this.req.body.defaultAdminEmail
            };
            await this.addDefaultSettings(defaultData);
            this.res.send({ status: 1, data: defaultData });
        } catch (error) {
            this.res.send({ status: 0, message: error });
        }
    }
    /********************************************************
     Purpose: Add Global settings
    Parameter:
    {
        "currency": "INR",
        "dateFormat": "DD/MM/YYYY",
        "metaTitle": "Title",
        "metaDescription": "Description",
        "metaKeyword": "Keyword"
    }
    Return: JSON String
    ********************************************************/
    async addGlobalSettings() {
        try {
            let fieldsArray = ['currency', 'dateFormat', 'metaTitle', 'metaDescription', 'metaKeyword'];
            let data = await (new RequestBody()).processRequestBody(this.req.body, fieldsArray);
            await this.addDefaultSettings(data);
            this.res.send({ status: 1, data: data });
        } catch (error) {
            this.res.send({ status: 0, message: error });
        }
    }
    /********************************************************
     Purpose: Add Global settings
    Parameter:
    {
        "currency": "INR",
        "dateFormat": "DD/MM/YYYY",
        "metaTitle": "Title",
        "metaDescription": "Description",
        "metaKeyword": "Keyword"
    }
    Return: JSON String
    ********************************************************/
    async getGlobalSettings() {
        try {
            let settings = await SettingsSchema.findOne().select(Projection.globalSettings);
            return this.res.send({ status: 1, data: settings });
        } catch (error) {
            console.log('error', error);
            this.res.send({ status: 0, message: error });
        }
    }
    /********************************************************
     Purpose:SMTP settings add /update
     Parameter:
     {
         "settings":{
                        "host": "5d25ecdf31f21b0f0ae96ba3",
                        "port": "donotreply1@test.com",
                        "username": "test@gmail.com",
                        "password": "test@gmail.com"
                    }
                    
     }
     Return: JSON String
     ********************************************************/
    async addSMTPSettings() {
        try {
            let smtpSettings = {
                smtp: {
                    host: this.req.body.host,
                    port: this.req.body.port,
                    username: this.req.body.username,
                    password: this.req.body.password
                }
            };
            await this.addDefaultSettings(smtpSettings);

            return this.res.send({ status: 1, data: smtpSettings });
        } catch (error) {
            console.log(error);
            this.res.send({ status: 0, message: error });
        }
    }
    /********************************************************
     Purpose: Get email settings
     Parameter:
     {}
     Return: JSON String
     ********************************************************/
    async getEmailSettings() {
        try {
            let emailSettings = await EmailSettings.find().populate('emailTemplateId', Projection.emailTemplate).select(Projection.settings);
            let defaultSettings = await SettingsSchema.findOne().select(Projection.defaultEmailSettings);
            return this.res.send({ status: 1, data: { emailSettings, defaultFromEmail: defaultSettings.defaultFromEmail ? defaultSettings.defaultFromEmail : "", defaultAdminEmail: defaultSettings.defaultAdminEmail ? defaultSettings.defaultAdminEmail : "" } });
        } catch (error) {
            console.log(error);
            this.res.send({ status: 0, message: error });
        }
    }
    /********************************************************
     Purpose: Get settings
     Parameter:
     {}
     Return: JSON String
     ********************************************************/
    async getSMTPSettings() {
        try {
            let settings = await SettingsSchema.findOne().select(Projection.smtp);
            return this.res.send({ status: 1, data: settings });
        } catch (error) {
            console.log(error);
            this.res.send({ status: 0, message: error });
        }
    }
    /********************************************************
     Purpose: Get email title
     Parameter:
     {}
     Return: JSON String
     ********************************************************/
    async getEmailTitle() {
        try {
            let emailTitles = await EmailTemplate.find({ isDeleted: false, status: true }).select(Projection.emailTemplate);
            return this.res.send({ status: 1, data: emailTitles });
        } catch (error) {
            console.log(error);
            this.res.send({ status: 0, message: error });
        }
    }
    /********************************************************
     Purpose: Function to add default settings
     Parameter:
     {
         settings:{}
     }
     Return: JSON String
     ********************************************************/
    async addDefaultSettings(settings) {
        return new Promise(async (resolve, reject) => {
            try {
                let defaultSettings = await SettingsSchema.findOne();
                if (defaultSettings) {
                    defaultSettings = await SettingsSchema.findOneAndUpdate({ _id: defaultSettings._id }, settings, { new: true });
                } else {
                    defaultSettings = await new Model(SettingsSchema).store(settings);
                }
                return resolve(defaultSettings);
            } catch (error) {
                return reject(error);
            }
        });
    }
    /********************************************************
     Purpose: Function to add all currency
     Parameter:
     {}
     Return: JSON String
     ********************************************************/
    async addAllCurrency() {
        try {
            let data = await this.processFile({ req: this.req });
            if (data.status == 0) {
                return this.res.send(data);
            }

            let currencies = await SettingsSchema.findOne().select({ 'allCurrency': 1 });
            let existingCurrency = _.map(currencies.allCurrency, 'code')
            let newcurrency = _.differenceWith(data, existingCurrency, _.isEqual);

            let allCurrency = [];
            _.map(newcurrency, (currencyData) => {
                allCurrency.push({ code: currencyData, status: true });
            });
            let currency = { $push: { allCurrency: allCurrency } };
            let settings = await this.addDefaultSettings(currency);

            return this.res.send({ status: 1, data: settings });
        } catch (error) {
            console.log(error);
            this.res.send({ status: 0, message: error });
        }
    }
    /********************************************************
     Purpose: Function to add all date format
     Parameter:
     {}
     Return: JSON String
     ********************************************************/
    async addAllDateFormat() {
        try {
            let data = await this.processFile({ req: this.req });
            if (data.status == 0) {
                return this.res.send(data);
            }

            let dateFormates = await SettingsSchema.findOne().select({ 'allDateFormat': 1 });
            let existingDateFormates = _.map(dateFormates.allDateFormat, 'format')
            let newDateFormat = _.differenceWith(data, existingDateFormates, _.isEqual);

            let allDateFormat = [];
            _.map(newDateFormat, (formatData) => {
                allDateFormat.push({ format: formatData, status: true });
            });
            let format = { $push: { allDateFormat: allDateFormat } };
            let settings = await this.addDefaultSettings(format);

            return this.res.send({ status: 1, data: settings });
        } catch (error) {
            console.log(error);
            this.res.send({ status: 0, message: error });
        }
    }
    /********************************************************
     Purpose: Function to get currency
     Parameter:
     {}
     Return: JSON String
     ********************************************************/
    async getCurrency() {
        try {
            let currencies = await SettingsSchema.findOne().select({ 'allCurrency': 1 });
            let allCurrency = _.filter(currencies.allCurrency, (currency) => { return currency.status });
            return this.res.send({ status: 1, data: allCurrency ? allCurrency : [] });
        } catch (error) {
            console.log(error);
            this.res.send({ status: 0, message: error });
        }
    }
    /********************************************************
     Purpose: Function to change currency status
     Parameter:
     {}
     Return: JSON String
     ********************************************************/
    async changeCurrencyStatus() {
        try {
            let currencyIds = this.req.body.ids;
            let status = this.req.body.status;
            let currencies = await SettingsSchema.findOne().select({ 'allCurrency': 1 });
            _.map(currencies.allCurrency, (currency) => {
                if (_.includes(currencyIds, currency._id.toString())) {
                    currency.status = status;
                }
            })
            await SettingsSchema.findOneAndUpdate({}, { $set: { 'allCurrency': currencies.allCurrency } });
            return this.res.send({ status: 1, data: currencies.allCurrency ? currencies.allCurrency : [] });
        } catch (error) {
            console.log(error);
            this.res.send({ status: 0, message: error });
        }
    }
    /********************************************************
     Purpose: Function to change currency status
     Parameter:
     {}
     Return: JSON String
     ********************************************************/
    async changeDateFormatStatus() {
        try {
            let formatIds = this.req.body.ids;
            let status = this.req.body.status;
            let dateFormates = await SettingsSchema.findOne().select({ 'allDateFormat': 1 });
            _.map(dateFormates.allDateFormat, (currency) => {
                if (_.includes(formatIds, currency._id.toString())) {
                    currency.status = status;
                }
            })
            await SettingsSchema.findOneAndUpdate({}, { $set: { 'allDateFormat': dateFormates.allDateFormat } });
            return this.res.send({ status: 1, data: dateFormates.allDateFormat ? dateFormates.allDateFormat : [] });
        } catch (error) {
            console.log(error);
            this.res.send({ status: 0, message: error });
        }
    }
    /********************************************************
     Purpose: Function to get all date format
     Parameter:
     {}
     Return: JSON String
     ********************************************************/
    async getDateFormat() {
        try {
            let dateFormates = await SettingsSchema.findOne().select({ 'allDateFormat': 1 });
            let allDateFormat = _.filter(dateFormates.allDateFormat, (dateFormat) => { return dateFormat.status });
            console.log('allDateFormat', allDateFormat.length);
            return this.res.send({ status: 1, data: allDateFormat });
        } catch (error) {
            console.log(error);
            this.res.send({ status: 0, message: error });
        }
    }
    /********************************************************
   Purpose:Email settings add /update
   Parameter:
   {
       "emailTemplateId": "5d25ecdf31f21b0f0ae96ba3",
       "fromEmail": "donotreply1@test.com",
       "adminEmail": "test@gmail.com"
   }
   Return: JSON String
   ********************************************************/
    async addUpdatePermissions() {
        try {
            let filter = this.req.body._id ? { emailTemplateId: this.req.body.emailTemplateId, _id: { $ne: this.req.body._id } } : { emailTemplateId: this.req.body.emailTemplateId };
            const isSettingsExist = await EmailSettings.findOne(filter);
            if (isSettingsExist) {
                return this.res.send({ status: 0, message: i18n.__("SETTINGS_EXIST") });
            }
            if (this.req.body._id) {
                let id = this.req.body._id;
                delete this.req.body._id;
                await EmailSettings.findOneAndUpdate({ _id: id }, this.req.body, { new: true });

            } else {
                await new Model(EmailSettings).store(this.req.body);
            }
            let emailSettings = await EmailSettings.find().select(Projection.settings);
            return this.res.send({ status: 1, data: emailSettings });


        } catch (error) {
            console.log(error);
            this.res.send({ status: 0, message: error });
        }
    }
    /********************************************************
     Purpose: Function to process file
     Parameter:
     {
         req object
     }
     Return: JSON String
     ********************************************************/
    async processFile(params) {
        return new Promise(async (resolve, reject) => {
            try {
                let form = new Form(params.req);
                let formObject = await form.parse();
                if (_.isEmpty(formObject.files)) {
                    return resolve({ status: 0, message: 'Please send file.' });
                }
                const file = new File(formObject.files);
                let data = await file.readFile(formObject.files.file[0].path);

                if (data.indexOf("\r\n") > -1) {
                    data = data.split("\r\n");
                } else if (data.indexOf("\r") > -1) {
                    data = data.split("\r");
                } else {
                    data = data.split("\n");
                }
                data = _.filter(data, _.size);
                console.log("data", data);
                return resolve(data);
            } catch (error) {
                return reject(error);
            }
        });
    }
    async asyncForEach(array, callback) {
        for (let index = 0; index < array.length; index++) {
            await callback(array[index], index, array);
        }
    }
}
module.exports = SettingsController;