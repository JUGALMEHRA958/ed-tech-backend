const i18n = require("i18n");
const _ = require('lodash');
const ObjectId = require('mongodb').ObjectID;

const Controller = require('../Base/Controller');
const Model = require("../Base/Model");
const Media = require('./Schema').Media;
const RequestBody = require("../../services/RequestBody");
const CommonService = require("../../services/Common");

class MediaController extends Controller {
    constructor() {
        super();
    }

    /********************************************************
     Purpose:Media insert and update
     Parameter:
     {
        "name":"",
        "imageUrl":""
     }
     Return: JSON String
     ********************************************************/
    async addUpdateMedia() {
        try {
            let fieldsArray = ['name', 'imageUrl'];
            let data = await (new RequestBody()).processRequestBody(this.req.body, fieldsArray);

            if (this.req.body.id) {
                const mediaData = await Media.findByIdAndUpdate(this.req.body.id, data, { new: true });
                if (_.isEmpty(mediaData)) {
                    return this.res.send({ status: 0, message: "Media is not Updated." })
                }
                return this.res.send({ status: 1, message: i18n.__('MEDIA_UPDATED'), metaData })

            } else {
                const mediaData = await (new Model(Media)).store(data);
                if (_.isEmpty(mediaData)) {
                    return this.res.send({ status: 0, message: "Media is not saved." })
                }
                return this.res.send({ status: 1, message: i18n.__('MEDIA_SAVED'), data });
            }

        } catch (error) {
            console.log("error- ", error);
            return this.res.send({ status: 0, message: error });
        }
    }
    /********************************************************
     Purpose:Media description
     Parameter:
     {
           "mediaId":"1"
     }
     Return: JSON String
     ********************************************************/
    async mediaDetail() {
        try {
            const mediaData = await Media.findOne({ _id: ObjectId(this.req.params.mediaId), isDeleted: false }, { __v: 0 });
            return this.res.send(_.isEmpty(mediaData) ? { status: 0, message: i18n.__('MEDIA_NOT_FOUND') } : { status: 1, data: mediaData });
        } catch (error) {
            console.log("error- ", error);
            this.res.send({ status: 0, message: error });
        }
    }
    /********************************************************
     Purpose:Media delete
     Parameter:
     {
           "mid":"1",

     }
     Return: JSON String
     ********************************************************/
    async mediaDelete() {
        try {
            let msg = i18n.__("MEDIA_NOT_DELETED");
            const updatedMedia = await Media.updateMany({ _id: { $in: this.req.body.ids }, isDeleted: false }, { $set: { isDeleted: true } });
            if (updatedMedia) {
                msg = updatedMedia.nModified ? updatedMedia.nModified + ' media deleted.' : updatedMedia.n == 0 ? i18n.__("MEDIA_NOT_FOUND") : msg;
            }
            return this.res.send({ status: 1, message: msg });
        } catch (error) {
            console.log("error- ", error);
            this.res.send({ status: 0, message: error });
        }
    }
    /********************************************************
     Purpose:Media list
     Parameter:
     {
           "page":1,
            "pagesize":10
     }
     Return: JSON String
     ********************************************************/
    async mediaList() {
        try {
            this.req.body['model'] = Media;
            this.req.body['columnKey'] = 'mediaListing';
            let result = await new CommonService().listing({ bodyData: this.req.body });
            return this.res.send(result);
        } catch (error) {
            console.log("error- ", error);
            this.res.send({ status: 0, message: error });
        }
    }
    /********************************************************
    Purpose:Meta serach
    Parameter:
    {
        "filter":{
            "keywords":"web"
        }
    }
    Return: JSON String
    ********************************************************/
    async searchMedia() {
        try {
            this.req.body['model'] = Media;
            let result = await new CommonService().search({ bodyData: this.req.body });
            return this.res.send(result);
        } catch (error) {
            console.log("error- ", error);
            this.res.send({ status: 0, message: error });
        }
    }
    /********************************************************
     Purpose: Save column settings
     Parameter:
     {
        columns: [{key : 'name', status: false}, {key : 'imageUrl', status: false}]
     }
     Return: JSON String
     ********************************************************/
    async saveColumnSettings() {
        try {
            this.req.body['key'] = 'mediaListing';
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
            this.req.body['model'] = Media;
            let result = await new CommonService().getColumnValues({ bodyData: this.req.body });
            return this.res.send(result);
        }
        catch (error) {
            console.log(error);
            this.res.send({ status: 0, message: error });
        }
    }
}
module.exports = MediaController;