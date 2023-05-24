module.exports = (app, express) => {

    const router = express.Router();
    const CourseController = require("./Controller")
    const Globals = require("../../../configs/Globals");
    const config = require('../../../configs/configs');
    const Validators = require("./Validator")
    
    router.post('/courses', Validators.addCourseValidator() ,Globals.isAdminAuthorised(),Validators.validate, (req, res, next) => {
        const courseObj = (new CourseController()).boot(req, res, next);
        return courseObj.add();
    }); 

    router.get('/courses/getAllCategoryWise', Globals.isAdminAuthorised(),Validators.validate, (req, res, next) => {
        const courseObj = (new CourseController()).boot(req, res, next);
        return courseObj.get();
    });  

    app.use(config.baseApiUrl, router);
}