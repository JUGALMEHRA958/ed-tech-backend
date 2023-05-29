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

    router.post('/courses/getAllCourses', Validators.getCourseValidatior(),Globals.isAdminAuthorised(),Validators.validate, (req, res, next) => {
        const courseObj = (new CourseController()).boot(req, res, next);
        return courseObj.get();
    });  

    router.get('/courses/getAllCoursesCategoryWise',Globals.isAuthorised,Validators.validate, (req, res, next) => {
        const courseObj = (new CourseController()).boot(req, res, next);
        return courseObj.getCategoryWise();
    });  

    router.post('/courses/edit', Validators.editdeleteCourseValidator(),Globals.isAdminAuthorised(),Validators.validate, (req, res, next) => {
        const courseObj = (new CourseController()).boot(req, res, next);
        return courseObj.editCourse();
    });  

    router.delete('/courses/delete',Validators.editdeleteCourseValidator(), Globals.isAdminAuthorised(),Validators.validate, (req, res, next) => {
        const courseObj = (new CourseController()).boot(req, res, next);
        return courseObj.deleteCourse();
    });  

    router.post('/courses/getCourseById',Validators.editdeleteCourseValidator(), Globals.isAdminAuthorised(),Validators.validate, (req, res, next) => {
        const courseObj = (new CourseController()).boot(req, res, next);
        return courseObj.getCourseById();
    }); 

    router.get('/courses/buyCourse', Validators.purchaseValidator(),Globals.isAuthorised,Validators.validate, (req, res, next) => {
        const courseObj = (new CourseController()).boot(req, res, next);
        return courseObj.buyCourse();
    }); 

    app.use(config.baseApiUrl, router);
}