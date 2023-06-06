const _ = require("lodash");
const i18n = require("i18n");

const Controller = require("../Base/Controller");
const Model = require("../Base/Model");
const CommonService = require("../../services/Common");
const RequestBody = require("../../services/RequestBody");
const { CourseSchema, CartSchema } = require("./Schema");
const { CoursePurchases } = require("../CoursePurchase/Schema");

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
        "picture",
        "category",
        "price",
        "group",
        "moduleType",
        "isbnNumber"
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
  async getCourseStatus  (course,user) {
    const isCourseStarted = await CoursePurchases.findOne({
      studentId: user.id,
      courseId: course._id
    });
    if(isCourseStarted){return true}
    return false;
  };
  async getCategoryWise() {
    try {
      let fieldsArray = ["type"];
      let data = await new RequestBody().processRequestBody(
        this.req.body,
        fieldsArray
      );
  
      const testbankData = await CourseSchema.find({
        type: data.type,
        isDeleted: false,
        status: true,
        category: "testbank",
      }).lean();
  
      const writeAndImprove = await CourseSchema.find({
        type: data.type,
        isDeleted: false,
        status: true,
        category: "writeAndImprove",
      }).lean();

      const ieltsebook = await CourseSchema.find({
        type: data.type,
        isDeleted: false,
        status: true,
        category: "ieltsebook",
      }).lean();

      const praxis = await CourseSchema.find({
        type: data.type,
        isDeleted: false,
        status: true,
        category: "praxis",
      }).lean();

      const printpractice = await CourseSchema.find({
        type: data.type,
        isDeleted: false,
        status: true,
        category: "printpractice",
      }).lean();
  
      for(let i=0;i<testbankData.length;i++){
        let isStarted = await this.getCourseStatus(testbankData[i], this.req.currentUser);
        testbankData[i]={...testbankData[i], isStarted:isStarted}
      }
      for(let i=0;i<writeAndImprove.length;i++){
        let isStarted = await this.getCourseStatus(writeAndImprove[i], this.req.currentUser);
        writeAndImprove[i]={...writeAndImprove[i], isStarted:isStarted}
      }
      for(let i=0;i<ieltsebook.length;i++){
        let isStarted = await this.getCourseStatus(ieltsebook[i], this.req.currentUser);
        ieltsebook[i]={...ieltsebook[i], isStarted:isStarted}
      }
      for(let i=0;i<praxis.length;i++){
        let isStarted = await this.getCourseStatus(praxis[i], this.req.currentUser);
        praxis[i]={...praxis[i], isStarted:isStarted}
      }
      for(let i=0;i<printpractice.length;i++){
        let isStarted = await this.getCourseStatus(printpractice[i], this.req.currentUser);
        printpractice[i]={...printpractice[i], isStarted:isStarted}
      }
  
      return this.res.send({
        status: 1,
        data: [
          { name: "testbank", data: testbankData },
          { name: "writeAndImprove", data: writeAndImprove },
          { name: "ieltsebook", data: ieltsebook },
          { name: "praxis", data: praxis },
          { name: "printpractice", data: printpractice },
        ],
        message: i18n.__("SUCCESS"),
      });
    } catch (e) {
      console.log(e);
      return this.res.send({
        status: 0,
        message: i18n.__("SOME_ERROR_OCCOURED_WHILE_FETCHING_COURSES"),
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
      return this.res.json({status:1,updatedCourse:updatedCourse,message:"Success"});
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
  async addToCart (){
    try {
      let fieldsArray = [
        "courseId"
      ];
      let data = await new RequestBody().processRequestBody(
        this.req.body,
        fieldsArray
      );
       // Check if the course exists
    const course = await CourseSchema.findById(data.courseId);
    if (!course) {
      return res.status(404).json({ error: 'Course not found' });
    }
    let cart = await CartSchema.findOne({userId:this.req.currentUser._id});
    if (!cart) {
      // Create a new cart if it doesn't exist for the user
      cart = new CartSchema({ userId:this.req.currentUser._id, courseIds: [data.courseId] });
    } else {
      cart.courseIds.addToSet(data.courseId);
    }
    await cart.save();
    return this.res.send({status:1, message:"Added"})
    } catch (error) {
      console.log(error);
      return this.res.status(400).json({status:0, error: error.message });
    }
  };
  // Remove from cart
  async removeFromCart() {
  try {
    let fieldsArray = [
      "courseId"
    ];
    let data = await new RequestBody().processRequestBody(
      this.req.body,
      fieldsArray
    );

    // Remove the course from the user's cart
    const cart = await CartSchema.findOneAndUpdate(
      { userId: this.req.currentUser._id },
      { $pull: { courseIds: data.courseId } },
      { new: true }
    ).populate('courseIds');

    if (!cart) {
      return this.res.status(404).json({ error: 'Cart not found' });
    }

    return this.res.send({ status: 1, message: "Removed" });
  } catch (error) {
    console.log(error);
    return this.res.status(400).json({ status: 0, error: error.message });
  }
}
// Get cart
async getCart() {
  try {
    // Find the user's cart or create a new one if not found
    let cart = await CartSchema.findOne({ userId: this.req.currentUser._id }).populate('courseIds');

    if (!cart) {
      // Create an empty cart for the user if not found
      cart = new CartSchema({ userId: this.req.currentUser._id });
      await cart.save();
    }

    return this.res.send({ status: 1, cart });
  } catch (error) {
    console.log(error);
    return this.res.status(400).json({ status: 0, error: error.message });
  }
}

  async buyCourse(){
    try{
      let fieldsArray = [
        "courseId"
      ];
      let data = await new RequestBody().processRequestBody(
        this.req.body,
        fieldsArray
      );
      let checkIfDeleted = await CourseSchema.findOne({_id:data.courseId});
      if(checkIfDeleted.isDeleted==true){
        return this.res.send({
          status: 1,
          message:i18n.__('COURSE_DELETED_CANT_BUY')
        });
      }
      let newObject={
        courseId:data.courseId,
        studentId:this.req.currentUser,
      }
      let checkIfExist = await CoursePurchases.findOne(newObject);
      if(checkIfExist){ return this.res.send({status:0, message:i18n.__("ALREADY_PURCHASED")})}
      let savedData = await new Model(CoursePurchases).store(newObject);
      console.log(savedData,"savedData");
      return this.res.send({
        status: 1,
        message:i18n.__('COURSE_PURCHASE_SAVED')
      });
      
    }catch(e){
      console.log("Error ",e);
      return this.res.send({status:0, error:e})
    }
  }
}
module.exports = CourseController;
