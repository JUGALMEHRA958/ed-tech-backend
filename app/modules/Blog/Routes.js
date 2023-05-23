module.exports = (app, express) => {

    const router = express.Router();

    const Globals = require("../../../configs/Globals");
    const BlogController = require('../Blog/Controller');
    const config = require('../../../configs/configs');
    const Validators = require("./Validator");

    router.post('/addUpdateblog', Globals.isAdminAuthorised(), Validators.blogValidator(), Validators.validate, (req, res, next) => {
        const blogObj = (new BlogController()).boot(req, res, next);
        return blogObj.addUpdateBlog();
    });

    router.get('/getBlogDetails/:blogId', Globals.isAdminAuthorised(), Validators.detailValidator(), Validators.validate, (req, res, next) => {
        const blogObj = (new BlogController()).boot(req, res, next);
        return blogObj.blogDetail();
    });

    router.post('/deleteBlog', Globals.isAdminAuthorised(), Validators.deleteValidator(), Validators.validate, (req, res, next) => {
        const blogObj = (new BlogController()).boot(req, res, next);
        return blogObj.blogDelete();
    });

    router.post('/listBlog', Globals.isAdminAuthorised(), Validators.listingValidator(), Validators.validate, (req, res, next) => {
        const blogObj = (new BlogController()).boot(req, res, next);
        return blogObj.blogList();
    });

    router.post('/searchBlog', Globals.isAdminAuthorised(), (req, res, next) => {
        const blogObj = (new BlogController()).boot(req, res, next);
        return blogObj.searchBlog();
    });

    router.post('/blogColumnSettings', Globals.isAdminAuthorised(), Validators.saveColumnValidator(), Validators.validate, (req, res, next) => {
        const userObj = (new BlogController()).boot(req, res);
        return userObj.saveColumnSettings();
    });

    router.post('/getBlogColumnValues', Globals.isAdminAuthorised(), Validators.getColumnValidator(), Validators.validate, (req, res, next) => {
        const userObj = (new BlogController()).boot(req, res);
        return userObj.getColumnValues();
    });

    app.use(config.baseApiUrl, router);
}