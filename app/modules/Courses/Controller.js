const _ = require("lodash");
const i18n = require("i18n");

const Controller = require("../Base/Controller");
const Model = require("../Base/Model");
const CommonService = require("../../services/Common");
const RequestBody = require("../../services/RequestBody");
const { CourseSchema } = require("./Schema");

class CourseController extends Controller {
  constructor() {
    super();
  }

  async add() {
    try {
      let fieldsArray = [
        "title",
        "description",
        "productId",
        "idpNumber",
        "picture",
        "category",
        "price",
        "type",
        "moduleType"
      ];
      let data = await new RequestBody().processRequestBody(
        this.req.body,
        fieldsArray
      );

      let savedData = await new Model(CourseSchema).store({...data , createdBy:this.req.currentUser._id});
      return this.res.send({
        status: 1,
        message:i18n.__('COURSE_SAVED')
      });
    } catch (e) {
      console.log(e);
      return this.res.send({
        status: 0,
        message:i18n.__('COURSE_NOT_SAVED'),
        error: e,
      });
    }
  }

  async get(){
    try{
      let fieldsArray = [
        "pageNumber",
        "pageSize"
      ];
      let data = await new RequestBody().processRequestBody(
        this.req.body,
        fieldsArray
      );
        let courseData = await CourseSchema.find({
          isDeleted:false,
          status:true
        }).limit(data.pageSize).skip((data.pageNumber-1)*data.pageSize);

        return this.res.send({
            status: 1,
            data : courseData ,
            message:i18n.__('SUCCESS')
          });


    }catch(e){
    console.log(e);
      return this.res.send({
        status: 0,
        message:i18n.__('SOME_ERROR_OCCOURED_WHILE_FETCHING_COURSES'),
        error: e,
      });
    }
  }

  async editCourse  ()  {
    try {
      const courseId = this.req.body.id;
      const courseData = this.req.body;
      const updatedCourse = await CourseSchema.findOneAndUpdate({_id:courseId , status:true,isDeleted:false}, courseData, {
        new: true,
      });
      if (!updatedCourse) {
        throw new Error('Course not found');
      }
      return this.res.json({status:1,updatedCourse:updatedCourse});
    } catch (error) {
      console.log(error)
      return  this.res.status(400).json({status:0, error: error.message });
    }
  };

  async deleteCourse  ()  {
    try {
      const courseId = this.req.body.id;
      const deletedCourse = await CourseSchema.findByIdAndUpdate(
        courseId,
        { isDeleted: true , status:false},
        { new: true }
      );
      if (!deletedCourse) {
        throw new Error('Course not found');
      }
      return this.res.json({status:1,deletedCourse:deletedCourse});
    } catch (error) {
      return this.res.status(400).json({ status:0,error: error.message });
    }
  };

  async getCourseById (){
    try {
      const courseId = this.req.body.id;
      const course = await CourseSchema.findById(courseId);
      if (!course) {
        throw new Error('Course not found');
      }
      return this.res.json({status:1, course:course});
    } catch (error) {
      return this.res.status(400).json({status:0, error: error.message });
    }
  };
  
}
module.exports = CourseController;
