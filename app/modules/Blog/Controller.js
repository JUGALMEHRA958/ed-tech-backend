const _ = require('lodash');
const i18n = require("i18n");

const Controller = require('../Base/Controller');
const Blogs = require('./Schema').Blogs;
const Model = require("../Base/Model");
const CommonService = require("../../services/Common");

class BlogController extends Controller {

    constructor() {
        super();
    }

    /********************************************************
     Purpose:Blog list
     Parameter:
     {
            page:1,
            pagesize:10
     }
     Return: JSON String
     ********************************************************/
    async blogList() {
        try {
            this.req.body['model'] = Blogs;
            this.req.body['columnKey'] = 'blogListing';
            let result = await new CommonService().listing({ bodyData: this.req.body });
            return this.res.send(result);
        }
        catch (error) {
            console.log(error);
            this.res.send({ status: 0, message: error });
        }
    }
    /********************************************************
     Purpose:Blog add/ update
     Parameter:
     {
            "blogTitle": "blog 1",
            "blogContent": "content",
            "blogCategory": "content",
            "metaDescription": "content",
            "metaKeyword": "content",
            "metaTitle": "metaTitle",
            "image": "image",
            "status": "Active",
     }
     Return: JSON String
     ********************************************************/
    async addUpdateBlog() {
        try {
            if (this.req.body.id) {
                let updatedBlog = await Blogs.findByIdAndUpdate(this.req.body.id, this.req.body, { new: true });
                return this.res.send({ status: 1, message: i18n.__('BLOG_UPDATED'), data: updatedBlog });
            } else {
                let savedBlog = await (new Model(Blogs)).store(this.req.body);
                return this.res.send({ status: 1, message: i18n.__('BLOG_SAVED'), data: savedBlog });
            }
        } catch (error) {
            console.log(error);
            return this.res.send({ status: 0, message: error });
        }
    }
    /********************************************************
     Purpose:Blog details
     Parameter:
     {}
     Return: JSON String
     ********************************************************/
    async blogDetail() {
        try {
            const blog = await Blogs.findOne({ _id: this.req.params.blogId, isDeleted: false });
            return this.res.send(_.isEmpty(blog) ? { status: 0, message: i18n.__("BLOG_NOT_FOUND") } : { status: 1, data: blog });
        } catch (error) {
            console.log(error);
            return this.res.send({ status: 0, message: error });
        }
    }
    /********************************************************
     Purpose:blog delete
     Parameter:
     {
           ids:['ewr8947w23904','237409dcjlsd']
     }
     Return: JSON String
     ********************************************************/
    async blogDelete() {
        try {
            const blogDeleted = await Blogs.updateMany({ _id: { $in: this.req.body.ids }, isDeleted: false }, { $set: { isDeleted: true } });
            let message = 'Blog not deleted.';
            if (blogDeleted) {
                message = blogDeleted.nModified ? blogDeleted.nModified + ' blog deleted.' : blogDeleted.n == 0 ? i18n.__('BLOG_NOT_FOUND') : message;
            }
            return this.res.send({ status: 1, message: message });
        } catch (error) {
            console.log(error);
            return this.res.send({ status: 0, message: error });
        }
    }
    /********************************************************
    Purpose:blog serach
    Parameter:
    {
        "filter":{
            "keywords":"web"

        }
    }
     Return: JSON String
     ********************************************************/
    async searchBlog() {
        try {
            this.req.body['model'] = Blogs;
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
        columns: [{key : 'blogTitle', status: false}, {key : 'blogContent', status: false},{key : 'blogCategory', status: true}]
     }
     Return: JSON String
     ********************************************************/
    async saveColumnSettings() {
        try {
            this.req.body['key'] = 'blogListing';
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
        "column": "blogTitle"
    }
    Return: JSON String
    ********************************************************/
    async getColumnValues() {
        try {
            this.req.body['model'] = Blogs;
            let result = await new CommonService().getColumnValues({ bodyData: this.req.body });
            return this.res.send(result);
        }
        catch (error) {
            console.log(error);
            this.res.send({ status: 0, message: error });
        }
    }
}
module.exports = BlogController;