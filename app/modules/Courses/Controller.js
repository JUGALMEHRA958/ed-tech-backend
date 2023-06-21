const _ = require("lodash");
const i18n = require("i18n");
const StripeService = require("../../services/Stripe");
const Controller = require("../Base/Controller");
const Model = require("../Base/Model");
const CommonService = require("../../services/Common");
const RequestBody = require("../../services/RequestBody");
const { CourseSchema, CartSchema } = require("./Schema");
const { CoursePurchases, PaymentHistoryStripe } = require("../CoursePurchase/Schema");
const axios=require("axios")
const config = require('../../../configs/configs');
const { Mongoose } = require("mongoose");
const mongoose = require("mongoose");

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
      let totalCount = await CourseSchema.count({
        isDeleted: false,
        status: true
      });
      
      let totalPages = Math.ceil(totalCount / data.pageSize);
      
      let courseData = await CourseSchema.find({
        isDeleted: false,
        status: true
      })
        .sort({ createdAt: -1 }) // Sort by timestamp in descending order
        .limit(data.pageSize)
        .skip((data.pageNumber - 1) * data.pageSize);
      
      return this.res.send({
        status: 1,
        data: courseData,
        totalEntries: totalCount,
        totalPages: totalPages,
        message: i18n.__('SUCCESS')
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
    // console.log("Now going with course",course._id , "student", user._id);
    const isCourseStarted = await CoursePurchases.findOne({
      studentId: user._id,
      courseId: course._id
    }).lean();
    // console.log(isCourseStarted,"isCourseStarted");
    if(isCourseStarted){return true}
    return false;
  };
  // const mongoose = require('mongoose');

  async  isAddedInCart(course, user) {
    let userCart = await CartSchema.findOne({ userId: user._id }).lean();
    if(!course || !userCart ){return false}
    const courseIdString = mongoose.Types.ObjectId(course._id).toString();
     return userCart.courseIds.some(courseId => {
      return mongoose.Types.ObjectId(courseId).equals(courseIdString);
    });
  }
  
  async getCategoryWise() {
    try {
      let fieldsArray = ["category"];
      let data = await new RequestBody().processRequestBody(
        this.req.body,
        fieldsArray
      );
  
      let responseArray = [];
  
      const testbankData = await CourseSchema.find({
        category: data.category,
        isDeleted: false,
        status: true,
        group: "testbank",
      }).lean();
      console.log(testbankData);
      if (testbankData.length > 0) {
        for (let i = 0; i < testbankData.length; i++) {
          let isStarted = await this.getCourseStatus(testbankData[i], this.req.currentUser);
          let isAddedInCart = await this.isAddedInCart(testbankData[i], this.req.currentUser);
          testbankData[i] = { ...testbankData[i], isStarted: isStarted ,isAddedInCart :isAddedInCart};
        }
        responseArray.push({ name: "testbank", data: testbankData });
      }
  
      const writeAndImprove = await CourseSchema.find({
        category: data.category,
        isDeleted: false,
        status: true,
        group: "writeAndImprove",
      }).lean();
  
      if (writeAndImprove.length > 0) {
        for (let i = 0; i < writeAndImprove.length; i++) {
          let isStarted = await this.getCourseStatus(writeAndImprove[i], this.req.currentUser);
          writeAndImprove[i] = { ...writeAndImprove[i], isStarted: isStarted };
        }
        responseArray.push({ name: "writeAndImprove", data: writeAndImprove });
      }
  
      const ieltsebook = await CourseSchema.find({
        category: data.category,
        isDeleted: false,
        status: true,
        group: "ieltsebook",
      }).lean();
  
      if (ieltsebook.length > 0) {
        for (let i = 0; i < ieltsebook.length; i++) {
          let isStarted = await this.getCourseStatus(ieltsebook[i], this.req.currentUser);
          ieltsebook[i] = { ...ieltsebook[i], isStarted: isStarted };
        }
        responseArray.push({ name: "ieltsebook", data: ieltsebook });
      }
  
      const praxis = await CourseSchema.find({
        category: data.category,
        isDeleted: false,
        status: true,
        group: "praxis",
      }).lean();
  
      if (praxis.length > 0) {
        for (let i = 0; i < praxis.length; i++) {
          let isStarted = await this.getCourseStatus(praxis[i], this.req.currentUser);
          praxis[i] = { ...praxis[i], isStarted: isStarted };
        }
        responseArray.push({ name: "praxis", data: praxis });
      }
  
      const printpractice = await CourseSchema.find({
        category: data.category,
        isDeleted: false,
        status: true,
        group: "printpractice",
      }).lean();
  
      if (printpractice.length > 0) {
        for (let i = 0; i < printpractice.length; i++) {
          let isStarted = await this.getCourseStatus(printpractice[i], this.req.currentUser);
          printpractice[i] = { ...printpractice[i], isStarted: isStarted };
        }
        responseArray.push({ name: "printpractice", data: printpractice });
      }
  
      return this.res.send({
        status: 1,
        data: responseArray,
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
      return this.res.status(404).json({ error: 'Course not found' });
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



async assignCourse({ email, code, isbn }) {
  return new Promise(async (resolve, reject) => {
    try {
      const payload = {
        schoolCode: code,
        productCode: [isbn],
      };
      const res = await axios.post(
        `${ config.magicbox_host}/services//license/v1.0/poListBySchoolAndProducts/?token=${config.magicbox_key}`,
        payload
      );
      const qPayload = {
        ponumber: res.data.poList[0].purchaseOrderNumber,
        username: email,
        productcode: [isbn],
        emailToUser: false,
        enableAccountProvisioning: false,
      };
      console.log("\nqPayload:-", qPayload, "\n--------\n");
      await axios.post(
        `${config.magicbox_host}/services//license/v1.0/consumelicense?token=${config.magicbox_key}`,
        qPayload
      );
      resolve(1);
    } catch (e) {
      console.log("error while assigning course to student", e);
      resolve(0);
    }
  });
}

async buyCourseInternally(course,currentUser){
  let newObject={
    courseId:course.courseId,
    studentId:this.req.currentUser,
    price:course.price
  }
  let savedData = await new Model(CoursePurchases).store(newObject);
  return;
}

  async buyCourseBulk (){
    let fieldsArray = [
      "paymentObject",
      "courseDetails",
      "paymentStatus",
      "totalPrice"
    ];
    let data = await new RequestBody().processRequestBody(
      this.req.body,
      fieldsArray
    );
    data['customer'] = this.req.currentUser.stripeCustomerId;
    let result = [];
    let pdf ;
    let finaliseInvoice ={};


    let detailsToStoreInPaymentHistory = {
      studentId: this.req.currentUser._id,
      courseDetails: data.courseDetails,
      paymentStatus: data.paymentStatus,
      totalPrice: data.totalPrice,
      paymentObject: data.paymentObject,
    };
    let paymentRecorder = await new Model(PaymentHistoryStripe).store(detailsToStoreInPaymentHistory);

    if(data.paymentStatus==="success" && data.paymentObject.status=="succeeded"){

      //buying internally
      await Promise.all(
        data.courseDetails.map(async (course) => {
          await this.buyCourseInternally(course,this.req.currentUser._id );
        })
      );
      //buying externally with magic

      await Promise.all(
        data.courseDetails.map(async (course) => {
          let courseFromDatabase = await CourseSchema.findById(course.courseId)
          let dataToSendToRegister = {
            email: this.req.currentUser.email , 
            code : "IDPCENTRE",
            isbn : courseFromDatabase.isbnNumber
     
           }
          await this.assignCourse(dataToSendToRegister);
        })
      );

        await this.updateCartAfterPurchase(this.req.currentUser , data.courseDetails.map((course)=>mongoose.Types.ObjectId(course.courseId) ));
      
    }
    return this.res.send({status:1 , message:"Saved"}) ; 

    //step 1
    //create invoice with following params:
    // {
    //   customer,
    //   collection_method: "charge_automatically",
    //   currency: "inr",
    //   auto_advance: true,
    //   description,
    //   metadata: {
    //     payment_intent_id: paymentIntent,
    //   }, //pi_3NIoWvSBikUvm25b1189EdwI
    //   custom_fields: [{ name: "IRN", value: "IRN NUMBER FROM GOVT" }],
    //   default_tax_rates: ["txr_1NI8DvSBikUvm25bYYeU7y9K"],
    // }
    // let objectToSendForInvoiceCreation = {
    //   customer : this.req.currentUser.stripeCustomerId,
    //   collection_method: "charge_automatically",
    //   currency: "inr",
    //   auto_advance: true,
    //   description : "description",
    //   metadata: {
    //         payment_intent_id: this.req.body.paymentObject.id,
    //       },
    //   default_tax_rates: ["txr_1NKyCISBikUvm25bmAO1wO1z"],    
    // }
    // let paymentInvoice = await new StripeService().createPaymentInvoice(objectToSendForInvoiceCreation);
    // // console.log(paymentInvoice);

    // //Step 2
    // //now we got payment invoice lets get all our products
    // let products = this.req.body.courseDetails.map((course)=>course.courseId)
    // // console.log(products,"products463")
    // //step3 starts check if paymentInvoice status is 1 then go further else return 
    // if (paymentInvoice.status) {
    //   //created invoice // add price and data
    //   CourseController.asyncForEach(products, async (productId, index) => {
    //     //create product // ignore if already exist
    //     let productStatus = await this.createProduct({
    //       productId,
    //     });
    //     let paymentItem = await new StripeService().createPaymentInvoiceItem({
    //       invoice: paymentInvoice.data.id,
    //       price: productStatus.data.metadata.priceId,
    //       customer: data.customer,
    //     });
    //     //generate invoice
    //     // console.log("480");
    //     result.push(paymentItem);
    //     // console.log("482" , paymentItem);
        
    //   }).then(async (e) => {
    //      finaliseInvoice = await new StripeService().finaliseInvoice(
    //       paymentInvoice.data.id
    //     );
        
    //      pdf = finaliseInvoice.invoice_pdf;
       
    //     return this.res.send({
    //       status: 1,
    //       message:i18n.__('SAVED_DETAILS'),
    //       data: pdf,
    //     });
    //   });
    // } else {
    //   // failed creation of payment invoice
    //   return this.res.send({
    //     status: 0,
    //     message: "Payment Invoice generation failed",
    //     data: paymentInvoice,
    //   });
    // }

    

    //step3 ends
    // console.log("globalpdf",finaliseInvoice);
    //   return this.res.send({
    //     status: 1,
    //     message:i18n.__('SAVED_DETAILS'),
    //     data: pdf,
    //   });
  }


  async  updateCartAfterPurchase(student, courseIds) {
    try {
      // Update the cart by pulling the courseIds
      const updatedCart = await CartSchema.findOneAndUpdate(
        { userId: student },
        { $pull: { courseIds: { $in: courseIds } } },
        { new: true }
      );
  
      if (!updatedCart) {
        // Cart not found for the student
        return;
      }
  
      console.log('Cart updated successfully');
    } catch (error) {
      console.error('Error updating cart:', error);
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
      let checkIfDeleted = await CourseSchema.findById(data.courseId);
      if(!checkIfDeleted || checkIfDeleted.isDeleted==true){
        return this.res.send({
          status: 0,
          message:i18n.__('COURSE_DELETED_CANT_BUY')
        });
      }
      if(checkIfDeleted.price>=1){
        return this.res.send({
          status: 0,
          message:i18n.__('SORRY_CANT_BUY_PAID_COURSE')
        });
      }
      let newObject={
        courseId:data.courseId,
        studentId:this.req.currentUser
      }
      let course = await CourseSchema.findById(data.courseId);
      let checkIfExist = await CoursePurchases.findOne(newObject).populate("courseId");
      if(checkIfExist){ return this.res.send({status:0, message:i18n.__("ALREADY_PURCHASED")})}
      let savedData = await new Model(CoursePurchases).store(newObject);
      console.log(savedData,"savedData");
      let dataToSendToRegister = {
       email: this.req.currentUser.email , 
       code : "IDPCENTRE",
       isbn : course.isbnNumber

      }
      await this.assignCourse(dataToSendToRegister)
      return this.res.send({
        status: 1,
        message:i18n.__('COURSE_PURCHASE_SAVED')
      });
      
    }catch(e){
      console.log("Error ",e);
      return this.res.send({status:0, error:e})
    }
  }
  static async asyncForEach(array, callback) {
    for (let index = 0; index < array.length; index++) {
      await callback(array[index], index, array);
    }
  }
  async createProduct(product) {
    try {
      let body = product;
      //create payment intent
      let productInfo = await CourseSchema.findOne({
        productId: body.productId,
      });
      let { productId, ...data } = body;
      data.description = productInfo?.description;
      data.metadata = {
        productId: productInfo?.productId,
        isbnNumber: productInfo?.isbnNumber,
        price: productInfo?.price,
        moduleType: productInfo?.moduleType,
        group: productInfo?.group,
      };
      data.images = [productInfo?.picture];
      data.name = productInfo?.title;
      // data.currency = "INR";
      //search product in stripe
      let productSearch = await new StripeService().listProducts({
        metadataKey: "productId",
        metadataValue: body.productId,
      });
      if (!productSearch.status) {
        let product = await new StripeService().createProduct(data);
        if (product.status) {
          //create price and attach
          let price = await new StripeService().createPrice({
            amount: productInfo.price,
            product: product.data.id,
          });
          //created product
          return {
            status: 1,
            message: "Product was created successfully.",
            data: price.data,
          };
        } else {
          //failed creation of payment intent
          return {
            status: 0,
            message: "Product failed to create",
            data: price.data,
          };
        }
      }
      return {
        status: 1,
        message: "already exist",
        data: productSearch.data,
      };
    } catch (e) {
      console.log("error in stripe product creation", e);
      return this.res.send({
        status: 0,
        message: "Product creation failed",
      });
    }
  }
}
module.exports = CourseController;
