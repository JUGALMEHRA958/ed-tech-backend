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
        "productId",
        "idpNumber",
        "picture",
        "category",
        "price",
        "type",
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
        
        let testbank = await CourseSchema.find({
          category:"testbank",
          status:true,
          isDeleted:false
        });
        let writeAndImprove = await CourseSchema.find({
          category:"writeAndImprove",
          status:true,
          isDeleted:false
        });;

        return this.res.send({
            status: 1,
            data : {testbank, writeAndImprove} ,
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
}
module.exports = CourseController;
