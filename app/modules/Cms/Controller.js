const i18n = require("i18n");
const _ = require('lodash');

const Controller = require('../Base/Controller');
const ObjectId = require('mongodb').ObjectID;
const CmsData = require('./Schema').CmsData;
const Model = require("../Base/Model");
const RequestBody = require("../../services/RequestBody");
const CommonService = require("../../services/Common");

class CmsController extends Controller {

    constructor() {
        super();
    }
    /********************************************************
     Purpose:Cms list
     Parameter:
     {
            page:1,
            pagesize:10
     }
     Return: JSON String
     ********************************************************/
    async listCms() {
        try {
            this.req.body['model'] = CmsData;
            this.req.body['columnKey'] = 'cmsListing';
            let result = await new CommonService().listing({ bodyData: this.req.body });
            return this.res.send(result);
        }
        catch (error) {
            console.log(error);
            this.res.send({ status: 0, message: error });
        }
    }
    /********************************************************
     Purpose: Add cms data based on unique pageId
     Parameter:
     {
        "metaDescription":"terms"
        "metaKeyword":"terms"
        "metaTitle":"terms"
        "pageId":"terms"
        "title":"terms"
     }
     Return: JSON String
     ********************************************************/
    async addUpdateCMS() {
        try {
            let fieldsArray = ['pageTitle', 'description', 'metaTitle', 'metaDescription', 'metaKeyword', '_id', 'gjsHtml', 'gjsCss'];
            let data = await (new RequestBody()).processRequestBody(this.req.body, fieldsArray);
            data['pageId'] = data['pageTitle'].replace(/[^a-zA-Z0-9]/g, "_").toLowerCase();
            let filter = data['_id'] ? { pageId: data['pageId'], _id: { $nin: [ObjectId(data['_id'])] } } : { pageId: data['pageId'] };

            const cmsDetail = await CmsData.findOne(filter);
            if (_.isEmpty(cmsDetail)) {
                if (data['_id']) {
                    let cmsDetailData = await CmsData.findOne({ _id: data._id });
                    if (_.isEmpty(cmsDetailData)) {
                        return this.res.send({ status: 0, message: i18n.__("CMS_NOT_FOUND") });
                    }
                    const updatedCMS = await CmsData.findByIdAndUpdate(cmsDetailData._id, data, { new: true });
                    return this.res.send({ status: 1, message: i18n.__("CMS_UPDATED_SUCCESSFULLY"), data: updatedCMS });
                } else {
                    const addedCMS = await new Model(CmsData).store(data);
                    return this.res.send({ status: 1, message: i18n.__("CMS_ADDED_SUCCESSFULLY"), data: addedCMS });
                }
            }
            return this.res.send({ status: 0, message: i18n.__("CMS_EXIST") });
        }
        catch (error) {
            console.log(error);
            this.res.send({ status: 0, message: error });
        }
    }
    /********************************************************
     Purpose: delete cms data based on _id
     Parameter:
     {
            ids:[]
     }
     Return: JSON String
     ********************************************************/
    async deleteCMS() {
        try {
            const cmsupdated = await CmsData.updateMany({ _id: { $in: this.req.body.ids }, isDeleted: false }, { $set: { isDeleted: true } });
            let message = i18n.__('CMS_NOT_DELETED_SUCCESSFULLY');
            if (cmsupdated) {
                message = cmsupdated.nModified ? cmsupdated.nModified + ' CMS deleted.' : cmsupdated.n == 0 ? i18n.__("CMS_NOT_FOUND") : message;
            }
            return this.res.send({ status: 1, message: message });
        } catch (error) {
            this.res.send({ status: 0, message: error });
        }
    }
    /********************************************************
     Purpose: Add cms data based on unique _id
     Parameter:
     {}
     Return: JSON String
     ********************************************************/
    async detailCms() {
        try {
            const cmsData = await CmsData.findOne({ _id: this.req.params.cmsId, isDeleted: false });
            return this.res.send(_.isEmpty(cmsData) ? { status: 0, message: i18n.__("CMS_NOT_FOUND") } : { status: 1, data: cmsData });
        } catch (error) {
            console.log(error);
            this.res.send({ status: 0, message: error });
        }
    }
    /********************************************************
     Purpose:CMS serach
     Parameter:
     {
        "filter":{
            "keywords":"web"

        }
        }
     Return: JSON String
     ********************************************************/
    async searchCms() {
        try {
            this.req.body['model'] = CmsData;
            let result = await new CommonService().search({ bodyData: this.req.body });
            return this.res.send(result);
        } catch (error) {
            console.log("error- ", error);
            return this.res.send({ status: 0, message: error });
        }
    }
    /********************************************************
     Purpose: Save column settings
     Parameter:
     {
        columns: [{key : 'title', status: false}, {key : 'pageId', status: false},{key : 'metaDescription', status: true}]
     }
     Return: JSON String
     ********************************************************/
    async saveColumnSettings() {
        try {
            this.req.body['key'] = 'cmsListing';
            let result = await new CommonService().saveColumnSettings({ bodyData: this.req.body });
            return this.res.send(result);
        }
        catch (error) {
            console.log(error);
            this.res.send({ status: 0, message: error });
        }
    }
    /********************************************************
    Purpose: Get column values
    Parameter:
    {
        "page": 1,
        "pagesize": 20,
        "column": "pageId"
    }
    Return: JSON String
    ********************************************************/
    async getColumnValues() {
        try {
            this.req.body['model'] = CmsData;
            let result = await new CommonService().getColumnValues({ bodyData: this.req.body });
            return this.res.send(result);
        }
        catch (error) {
            console.log(error);
            this.res.send({ status: 0, message: error });
        }
    }
}

module.exports = CmsController;