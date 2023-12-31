const i18n = require("i18n");
const _ = require('lodash');
const multer = require('multer');
const xlsx = require("xlsx");
const csv = require('csv-parser');
const Model = require("../Base/Model");
const Controller = require('../Base/Controller');
const Globals = require('../../../configs/Globals');
const Admin = require('./Schema').Admin;
const Email = require('../../services/Email');
const Form = require("../../services/Form");
const File = require("../../services/File");
const CommonService = require("../../services/Common");
const RoleService = require("../Roles/Service");
const RequestBody = require("../../services/RequestBody");
const Authentication = require('../Authentication/Schema').Authtokens;
const adminProjection = require('../Admin/Projection');
const config = require('../../../configs/configs');
const { Students } = require("../Students/Schema");
const { GroupSchema } = require("../Courses/Schema");
const { PaymentHistoryStripe } = require("../CoursePurchase/Schema");
const DiscountCoupon = require("../DiscountModule/Schema").DiscountCoupon;
const VoucherCode = require("../DiscountModule/Schema").VoucherCode;
const StripeService = require("../../services/Stripe");
const CoursePurchases = require("../CoursePurchase/Schema").CoursePurchases;
const fs = require('fs');
const { log } = require("console");
class AdminController extends Controller {

    constructor() {
        super();
    }
    /********************************************************
     Purpose: Get Admin profile details
     Parameter:
     {}
     Return: JSON String
     ********************************************************/
    async profile() {
        try {
            const currentUser = this.req.currentUser && this.req.currentUser._id ? this.req.currentUser._id : "";
            const admin = await Admin.findOne({ _id: currentUser }, adminProjection.admin);
            return _.isEmpty(admin) ? this.res.send({ status: 0, message: i18n.__("USER_NOT_EXIST") }) : this.res.send({ status: 1, data: admin });
        } catch (error) {
            console.log('error', error);
            this.res.send({ status: 0, message: error });
        }
    }

    async getAllUsers() {
      try {
        let fieldsArray = ['pageNumber', 'pageSize', 'sortBy'];
        let userData = await (new RequestBody()).processRequestBody(this.req.body, fieldsArray);
    
        // Check if pageNumber and pageSize are present in userData
        if (!userData.pageNumber || !userData.pageSize) {
          return this.res.send({ status: 0, message: i18n.__("PAGENUMBER_PAGESIZE_MISSING") });
        }
    
        // Extract pageNumber and pageSize from the userData object
        const { pageNumber, pageSize, sortBy } = userData;
    
        // Query the database to get the total count of documents
        const totalCount = await Students.count({});
    
        // Calculate the skip value based on the pageNumber and pageSize
        const skip = (pageNumber - 1) * pageSize;
    
        // Determine the sort order based on the sortBy value
        // const sortDirection = sortBy && sortBy.toLowerCase() === "descending" ? -1 : 1;
    
        // Query the database with pagination and sorting
        let students = await Students.aggregate([
          { $sort: { createdAt: sortBy==='descending' ? -1 : 1 } },
          { $skip: skip },
          { $limit: pageSize },
          // { $sort: { createdAt: sortBy==='descending' ? -1 : 1 } },
          {
            $lookup: {
              from: 'purchases',
              localField: '_id',
              foreignField: 'studentId',
              as: 'courseCount'
            }
          },
          {
            $addFields: {
              courseCount: { $size: '$courseCount' }
            }
          }
        ]);
    
        const totalPages = Math.ceil(totalCount / pageSize);
    
        return this.res.send({
          status: 1,
          students: students,
          totalEntries: totalCount,
          totalPages: totalPages,
        });
    
      } catch (error) {
        console.log('error', error);
        this.res.send({ status: 0, message: error });
      }
    }
    

    async getstudentById() {
        if(!this.req.body.id){
            return this.res.send({status:0, message:"Please send id in request body"})
        }
        let id = this.req.body.id ;
        try {
            let students = await Students.findOne({_id:id});
            return this.res.send({status:1,studentDetail:students})
        } catch (error) {
            console.log('error', error);
            this.res.send({ status: 0, message: error });
        }
    }
    /********************************************************
     Purpose: Update admin profile details
     Parameter:
     {
            "photo":"abc.jpg"
            "mobile":"987654321",
            "firstname":"john",
            "lastname":"deo"
     }
     Return: JSON String
     ********************************************************/
    async editProfile() {
        try {
            const currentUser = this.req.currentUser && this.req.currentUser._id ? this.req.currentUser._id : "";
              let fieldsArray = ['firstname', 'lastname', 'mobile', 'photo','publishableKey','clientSecret'];
            let userData = await (new RequestBody()).processRequestBody(this.req.body, fieldsArray);
            if (userData.photo) {
                userData.photo = _.last(userData.photo.split("/"));
            }
            const updatedAdmin = await Admin.findByIdAndUpdate(currentUser, userData, { new: true }).select(adminProjection.admin);
            return _.isEmpty(updatedAdmin) ? this.res.send({ status: 0, message: i18n.__("USER_NOT_EXIST") }) : this.res.send({ status: 1, data: updatedAdmin });
        } catch (error) {
            console.log(error);
            this.res.send({ status: 0, message: error });
        }
    }
    /********************************************************
     Purpose: Change password
     Parameter:
     {
        "oldPassword":"test123",
        "newPassword":"test123"
     }
     Return: JSON String
     ********************************************************/
    async changePassword() {
        try {
            const user = this.req.currentUser;
            let passwordObj = {
                oldPassword: this.req.body.oldPassword,
                newPassword: this.req.body.newPassword,
                savedPassword: user.password
            };
            let password = await (new CommonService()).changePasswordValidation({ passwordObj });
            if (typeof password.status !== 'undefined' && password.status == 0) {
                return this.res.send(password);
            }
            const updatedUser = await Admin.findByIdAndUpdate(user._id, { password: password }, { new: true });
            return !updatedUser ? this.res.send({ status: 0, message: i18n.__("PASSWORD_NOT_UPDATED") }) : this.res.send({ status: 1, message: i18n.__("PASSWORD_UPDATED_SUCCESSFULLY") });
        } catch (error) {
            console.log("error- ", error);
            this.res.send({ status: 0, message: error });
        }
    }
    /********************************************************
     Purpose: Forgot password
     Parameter:
     {
            "oldPassword":"test123",
            "newPassword":"test123"
     }
     Return: JSON String
     ********************************************************/
    async adminForgotPasswordMail() {
        try {
            let emailId = this.req.body.emailId;
            let user = await Admin.findOne({ emailId: emailId });
            if (_.isEmpty(user)) {
                return this.res.send({ status: 0, message: i18n.__("REGISTERED_EMAIL") })
            }

            const token = await (new Globals()).generateToken(user._id);
            await Admin.findByIdAndUpdate(user._id, { forgotToken: token, forgotTokenCreationTime: new Date() });

            let emailData = {
                emailId: emailId,
                emailKey: 'forgot_password_mail',
                replaceDataObj: { fullName: user.firstname + " " + user.lastname, resetPasswordLink: config.frontUrl + '/resetPassword?token=' + token, resetPasswordLinkAngular: config.frontUrlAngular + '/reset-password?token=' + token }
            };

            const sendingMail = await new Email().sendMail(emailData);
            if (sendingMail) {
                if (sendingMail.status == 0) {
                    return _this.res.send(sendingMail);
                } else if (!sendingMail.response) {
                    return this.res.send({ status: 0, message: i18n.__("SERVER_ERROR") });
                }
            }
            return this.res.send({ status: 1, message: i18n.__("CHECK_EMAIL") });
        } catch (error) {
            console.log("error- ", error);
            this.res.send({ status: 0, message: error });
        }
    }
    /********************************************************
     Purpose: Reset password
     Parameter:
     {
            "token": "",
            "password":""
     }
     Return: JSON String
     ********************************************************/
    async resetPasswordAdmin() {
        try {
            let user = await Admin.findOne({ forgotToken: this.req.body.token });
            if (_.isEmpty(user)) {
                return this.res.send({ status: 0, message: i18n.__("INVALID_TOKEN") });
            }

            const decoded = await Globals.decodeAdminForgotToken(this.req.body.token);
            if (!decoded) {
                return this.res.send({ status: 0, message: i18n.__("LINK_EXPIRED") });
            }

            let isPasswordValid = await (new CommonService()).validatePassword({ password: this.req.body.password });
            if (isPasswordValid && !isPasswordValid.status) {
                return this.res.send(isPasswordValid);
            }
            let password = await (new CommonService()).ecryptPassword({ password: this.req.body.password });

            const updateUser = await Admin.findByIdAndUpdate(user._id, { password: password }, { new: true });
            if (_.isEmpty(updateUser)) {
                return this.res.send({ status: 0, message: i18n.__("PASSWORD_NOT_UPDATED") });
            }
            await Admin.findByIdAndUpdate(user._id, { forgotToken: "", forgotTokenCreationTime: "" });
            return this.res.send({ status: 1, message: i18n.__("PASSWORD_UPDATED_SUCCESSFULLY") });
        } catch (error) {
            console.log("error- ", error);
            this.res.send({ status: 0, message: error });
        }
    }
        /********************************************************
     Purpose: get purchase history
     Parameter:
     {
            
     }
     Return: JSON String
     ********************************************************/
     async getPurchaseHistory() {
        try {
          let pageNumber = this.req.body.pageNumber ? this.req.body.pageNumber : 1;
          let pageSize = this.req.body.pageSize ? this.req.body.pageSize : 10;
          let filter = this.req.body.filter ? this.req.body.filter : [];
          let filterCond = await this.constructFilter(filter);
          let filterMatch = {};
      
          if (!_.isEmpty(filterCond.categoryArray)) {
            filterMatch['courseId.category'] = { $in: filterCond.categoryArray };
          }
          if (!_.isEmpty(filterCond.dateRange)) {
            const startDate = new Date(filterCond.dateRange.startDate);
            const endDate = new Date(filterCond.dateRange.endDate);
            filterMatch['createdAt'] = { $gte: startDate, $lte: endDate };
          }
          if (!_.isEmpty(filterCond.priceArray)) {
            filterMatch['courseId.price'] = { $gte: filterCond.priceArray[0].$gt, $lte: filterCond.priceArray[0].$lt };
          }
      
          const totalCount = await CoursePurchases.count(filterMatch);
          const totalPages = Math.ceil(totalCount / pageSize);
          const skipCount = (pageNumber - 1) * pageSize;
      
          let details = await CoursePurchases.aggregate([
            {
              $lookup: {
                from: "courses",
                localField: "courseId",
                foreignField: "_id",
                as: "courseId",
              },
            },
            {
              $unwind: {
                path: "$courseId",
              },
            },
            {
              $match: filterMatch,
            },
            {
              $sort: { createdAt: 1 },
            },
            {
              $skip: skipCount,
            },
            {
              $limit: pageSize,
            },
          ]);
          console.log(details,306);
          let newArray = [];
          for (let i = 0; i < details.length; i++) {
            let studentDetail = await Students.findById( details[i].studentId);
            // let { amountBeforeTax, tax } = this.calculateGST(details[i].courseId.price);
            let tax = (18/100)*details[i].price  ; 
            newArray.push({
              studentId: details[i].studentId,
              courseIsbn: details[i].courseId.isbnNumber,
              productId:details[i].courseId.productId,
              studentName: studentDetail ? studentDetail.firstName + " " + studentDetail.lastName : "",
              studentEmail: studentDetail ?  studentDetail.email :"",
              studentPhone: studentDetail ?  studentDetail.phone :"",
              couponCode: details[i].couponCode ? details[i].couponCode :"",
              discountPercentage: details[i].discountPercentage ? details[i].discountPercentage : "",
              courseName: details[i].courseId.title,
              category: details[i].courseId.category,
              purchaseDate: details[i].createdAt,
              amountBeforeTax: details[i].price,
              tax: tax,
              total: details[i].price + tax
            });
          }
      
          return this.res.send({
            status: 1,
            data: newArray,
            pageNumber: pageNumber,
            pageSize: pageSize,
            totalPages: totalPages,
            totalCount: totalCount,
          });
        } catch (error) {
          console.log("error- ", error);
          return this.res.send({ status: 0, message: error });
        }
      }
      async getSales() {
        try {
          let pageNumber = this.req.body.pageNumber ? this.req.body.pageNumber : 1;
          let pageSize = this.req.body.pageSize ? this.req.body.pageSize : 10;
          let filter = this.req.body.filter ? this.req.body.filter : [];
          let filterCond = await this.constructFilter(filter);
          let filterMatch = {};
          if (!_.isEmpty(filterCond.dateRange)) {
            const startDate = new Date(filterCond.dateRange.startDate);
            const endDate = new Date(filterCond.dateRange.endDate);
            filterMatch['createdAt'] = { $gte: startDate, $lte: endDate };
          }
          
          const totalCount = await PaymentHistoryStripe.count(filterMatch);
          const totalPages = Math.ceil(totalCount / pageSize);
          const skipCount = (pageNumber - 1) * pageSize;
          console.log(filterMatch,344);
          let details = await PaymentHistoryStripe.find(filterMatch).sort({ createdAt: -1 }).skip(skipCount).limit(pageSize).populate('studentId').lean();
          console.log("details start",details,"details");
          let newArray = [];
          for (let i = 0; i < details.length; i++) {
            const taxRate = 0.18; // 18% tax rate
            const total = (details[i].totalPrice); // Total amount including tax

            let amountBeforeTax = total / (1 + taxRate); // Calculate amount before tax
            let taxAmount = total - amountBeforeTax; // Calculate tax amount
            amountBeforeTax = amountBeforeTax.toFixed(2);
            taxAmount = taxAmount.toFixed(2);  
            
            newArray.push({
              paymentStatus:details[i].paymentStatus,
              id: details[i]._id,
              timeOfPurchase :details[i].createdAt ,
              studentId: details[i].studentId._id,
              studentEmail: details[i].studentId.email,
              invoiceLink: details[i].invoiceLink,
              paymentId: details[i].paymentObject.id,
              amountBeforeTax: amountBeforeTax,
              taxAmount: taxAmount,
              total: total,
            });
          }
          
          
          
          
          // for (let i = 0; i < details.length; i++) {
          //   const taxRate = config.taxRate ? config.taxRate : 0.18; // 18% tax rate
          //   const total = details[i].paymentObject.amount / 100; // Total amount including tax
          
          //   const amountBeforeTax = total / (1 + taxRate); // Calculate amount before tax
          //   const taxAmount = total - amountBeforeTax; // Calculate tax amount
          
          //   newArray.push({
          //     studentId: details[i].studentId._id,
          //     studentEmail: details[i].studentId.email,
          //     invoiceLink: details[i].invoiceLink,
          //     paymentId: details[i].paymentObject.id,
          //     amountBeforeTax: amountBeforeTax,
          //     taxAmount: taxAmount,
          //     total: total,
          //   });
          // }
          
      
          return this.res.send({
            status: 1,
            data: newArray,
            pageNumber: pageNumber,
            pageSize: pageSize,
            totalPages: totalPages,
            totalCount: totalCount,
          });
        } catch (error) {
          console.log("error- ", error);
          return this.res.send({ status: 0, message: error });
        }
      }

      async createGroup() {
        try {
          let fieldsArray = ["title"];
          let emptyFields = await (new RequestBody()).checkEmptyWithFields(this.req.body, fieldsArray);
          if (emptyFields && Array.isArray(emptyFields) && emptyFields.length) {
              return this.res.send({ status: 0, message: i18n.__('SEND_PROPER_DATA') + " " + emptyFields.toString() + " fields required." });
          }
          fieldsArray = [...fieldsArray];
          let data = await (new RequestBody()).processRequestBody(this.req.body, fieldsArray);
          console.log("Data",data);  
          let saveDataInDb  = GroupSchema.create({...data , createdBy: this.req.currentUser})  ; 
          return this.res.send({ status: 1, message: i18n.__('SAVED_YOUR_GROUP')  });

        }catch (error) {
          console.log("error- ", error);
          return this.res.send({ status: 0, message: error });
        }
      }
      
      
      async  readGroupById(req, res) {
        try {
          let fieldsArray = ["groupId"];
          let emptyFields = await (new RequestBody()).checkEmptyWithFields(this.req.body, fieldsArray);
          if (emptyFields && Array.isArray(emptyFields) && emptyFields.length) {
              return this.res.send({ status: 0, message: i18n.__('SEND_PROPER_DATA') + " " + emptyFields.toString() + " fields required." });
          }
          fieldsArray = [...fieldsArray];
          let data = await (new RequestBody()).processRequestBody(this.req.body, fieldsArray);
          const groupId = data.groupId;
          let checkIfDeleted = await GroupSchema.findOne({_id:groupId , isDeleted:false}) ;
          if(!checkIfDeleted){return this.res.send({ status: 0, message: i18n.__("GROUP_DELETED_BY_ADMIN") });}

          const group = await GroupSchema.findById(groupId).lean();
          if (!group) {
            return this.res.send({ status: 0, message: "Group not found." });
          }
          return this.res.send({ status: 1, message: "Group found.", group });
        } catch (error) {
          console.log("error - ", error);
          return this.res.send({ status: 0, message: error });
        }
      }

      async  getAllGroups(req, res) {
        try {
          const groups = await GroupSchema.find({isDeleted:false}).lean();
          return this.res.send({ status: 1, message: "All groups", groups });
        } catch (error) {
          console.log("error - ", error);
          return this.res.send({ status: 0, message: error });
        }
      }

      // Update a group by ID
async  updateGroupById(req, res) {
  try {
    let fieldsArray = ["groupId"];
    let emptyFields = await (new RequestBody()).checkEmptyWithFields(this.req.body, fieldsArray);
    if (emptyFields && Array.isArray(emptyFields) && emptyFields.length) {
        return this.res.send({ status: 0, message: i18n.__('SEND_PROPER_DATA') + " " + emptyFields.toString() + " fields required." });
    }
    fieldsArray = [...fieldsArray , "title" , "description"];
    let data = await (new RequestBody()).processRequestBody(this.req.body, fieldsArray);
    const groupId = data.groupId;
    let checkIfDeleted = await GroupSchema.findOne({_id:groupId , isDeleted:false}) ;
    if(!checkIfDeleted){return this.res.send({ status: 0, message: i18n.__("CAN_NOT_UPDATE_DELETED_GROUP" )});}
    let dataToUpdate  = {...data  , updatedBy : this.req.currentUser}
    const updatedGroup = await GroupSchema.findByIdAndUpdate(groupId, dataToUpdate, { new: true }).lean();
    if (!updatedGroup) {
      return this.res.send({ status: 0, message: "Group not found." });
    }
    return this.res.send({ status: 1, message: "Group updated.", group: updatedGroup });
  } catch (error) {
    console.log("error - ", error);
    return this.res.send({ status: 0, message: error });
  }
}

async  deleteGroupById(req, res) {
  try {
    let fieldsArray = ["groupId"];
    let emptyFields = await (new RequestBody()).checkEmptyWithFields(this.req.body, fieldsArray);
    if (emptyFields && Array.isArray(emptyFields) && emptyFields.length) {
        return this.res.send({ status: 0, message: i18n.__('SEND_PROPER_DATA') + " " + emptyFields.toString() + " fields required." });
    }
    fieldsArray = [...fieldsArray];
    let data = await (new RequestBody()).processRequestBody(this.req.body, fieldsArray);
    const groupId = data.groupId;
    let checkIfDeleted = await GroupSchema.findOne({_id:groupId , isDeleted:false}) ;
    if(!checkIfDeleted){return this.res.send({ status: 0, message: i18n.__("CAN_NOT_DELETE_GROUP_NOT_FOUND") });}
    const deletedGroup = await GroupSchema.findByIdAndUpdate(groupId , {isDeleted:true, updatedBy:this.req.currentUser});
    if (!deletedGroup) {
      return this.res.send({ status: 0, message: "Group not found." });
    }
    return this.res.send({ status: 1, message: "Group deleted." });
  } catch (error) {
    console.log("error - ", error);
    return this.res.send({ status: 0, message: error });
  }
}

async createDiscountGroup() {
  try {
    let fieldsArray = ["discountCode" , "startAt" , "endsAt" , "discountPercentage" , "isValidForAll" , "courseId"];
    let emptyFields = await (new RequestBody()).checkEmptyWithFields(this.req.body, fieldsArray);
    if (emptyFields && Array.isArray(emptyFields) && emptyFields.length) {
        return this.res.send({ status: 0, message: i18n.__('SEND_PROPER_DATA') + " " + emptyFields.toString() + " fields required." });
    }
    fieldsArray = [...fieldsArray];
    let data = await (new RequestBody()).processRequestBody(this.req.body, fieldsArray);
    console.log("Data",data);  
    let checkIfDiscountCodeExist = await DiscountCoupon.findOne({discountCode:data.discountCode , isDeleted:false});
    if(checkIfDiscountCodeExist){return this.res.send({ status: 0, message: "Duplicate discount code" });}
    // let couponCodeFromStripe = await new StripeService().createDiscountCoupon(data.discountCode , data.discountPercentage);
    // console.log(couponCodeFromStripe);
    let saveDataInDb  = await DiscountCoupon.create({...data , createdBy: this.req.currentUser})  ; 

    return this.res.send({ status: 1, message: i18n.__('SAVED_YOUR_DISCOUNT_GROUP') , data:saveDataInDb  });

  }catch (error) {
    console.log("error- ", error);
    return this.res.send({ status: 0, message: error });
  }
}


async  readDiscountGroupById(req, res) {
  try {
    let fieldsArray = ["id"];
    let emptyFields = await (new RequestBody()).checkEmptyWithFields(this.req.body, fieldsArray);
    if (emptyFields && Array.isArray(emptyFields) && emptyFields.length) {
        return this.res.send({ status: 0, message: i18n.__('SEND_PROPER_DATA') + " " + emptyFields.toString() + " fields required." });
    }
    fieldsArray = [...fieldsArray];
    let data = await (new RequestBody()).processRequestBody(this.req.body, fieldsArray);
    // const groupId = data.groupId;
    let checkIfDeleted = await DiscountCoupon.findOne({_id:data.id , isDeleted:false}) ;
    if(!checkIfDeleted){return this.res.send({ status: 0, message: i18n.__("GROUP_DELETED_BY_ADMIN") });}

    const group = await DiscountCoupon.findById({_id:data.id}).lean();
    if (!group) {
      return this.res.send({ status: 0, message: "Discount Group not found." });
    }
    return this.res.send({ status: 1, message: "Discount Group found.", DiscountGroup : group });
  } catch (error) {
    console.log("error - ", error);
    return this.res.send({ status: 0, message: error });
  }
}

async getAllDiscountGroups(req, res) {
  try {
    let { pageNumber, pageSize } = this.req.body;
    pageNumber = parseInt(pageNumber);
    pageSize = parseInt(pageSize);

    const totalGroups = await DiscountCoupon.count({ isDeleted: false });
    const totalPages = Math.ceil(totalGroups / pageSize);

    let groups = await DiscountCoupon.find({ isDeleted: false })
      .skip((pageNumber - 1) * pageSize)
      .limit(pageSize)
      .lean().populate('courseId');  
    const totalEnteries = await DiscountCoupon.count();
    return this.res.send({
      status: 1,
      message: "All groups",
      groups,
      pageNumber,
      pageSize,
      totalPages,
      totalEnteries
    });
  } catch (error) {
    console.log("error - ", error);
    return this.res.send({ status: 0, message: error });
  }
}

async  updateDiscountGroupById(req, res) {
  try {
    let fieldsArray = ["id"];
    let emptyFields = await (new RequestBody()).checkEmptyWithFields(this.req.body, fieldsArray);
    if (emptyFields && Array.isArray(emptyFields) && emptyFields.length) {
        return this.res.send({ status: 0, message: i18n.__('SEND_PROPER_DATA') + " " + emptyFields.toString() + " fields required." });
    }
    fieldsArray = [...fieldsArray , "startAt" , "endsAt" ];
    let data = await (new RequestBody()).processRequestBody(this.req.body, fieldsArray);
    const groupId = data.id;
    let checkIfDiscountCodeExist = await DiscountCoupon.findOne({discountCode:data.groupId , isDeleted:false});
    if(checkIfDiscountCodeExist){return this.res.send({ status: 0, message: "Duplicate discount code" });}
 
    let checkIfDeleted = await DiscountCoupon.findOne({_id:groupId , isDeleted:false}) ;
    if(!checkIfDeleted){return this.res.send({ status: 0, message: i18n.__("CAN_NOT_UPDATE_DELETED_GROUP" )});}
    let dataToUpdate  = {...data  , updatedBy : this.req.currentUser}
    const updatedGroup = await DiscountCoupon.findByIdAndUpdate(groupId, dataToUpdate, { new: true }).lean();
    if (!updatedGroup) {
      return this.res.send({ status: 0, message: "Group not found." });
    }
    return this.res.send({ status: 1, message: "Group updated.", group: updatedGroup });
  } catch (error) {
    console.log("error - ", error);
    return this.res.send({ status: 0, message: error });
  }
}

async  deleteDiscountGroupById(req, res) {
  try {
    let fieldsArray = ["id"];
    let emptyFields = await (new RequestBody()).checkEmptyWithFields(this.req.body, fieldsArray);
    if (emptyFields && Array.isArray(emptyFields) && emptyFields.length) {
        return this.res.send({ status: 0, message: i18n.__('SEND_PROPER_DATA') + " " + emptyFields.toString() + " fields required." });
    }
    fieldsArray = [...fieldsArray];
    let data = await (new RequestBody()).processRequestBody(this.req.body, fieldsArray);
    const groupId = data.id;
    let checkIfDeleted = await DiscountCoupon.findOne({_id:groupId , isDeleted:false}) ;
    if(!checkIfDeleted){return this.res.send({ status: 0, message: i18n.__("CAN_NOT_DELETE_GROUP_NOT_FOUND") });}
    const deletedGroup = await DiscountCoupon.findByIdAndUpdate(groupId , {isDeleted:true, updatedBy:this.req.currentUser});
    if (!deletedGroup) {
      return this.res.send({ status: 0, message: "Discount Group not found." });
    }
    return this.res.send({ status: 1, message: "Discount Group deleted." });
  } catch (error) {
    console.log("error - ", error);
    return this.res.send({ status: 0, message: error });
  }
}


      
       constructFilter(filter) {
        return new Promise(async (resolve, reject) => {
          try {
            let categoryArray = [];
            let dateRange = {};
            let priceArray = [];
      
            for (let i = 0; i < filter.length; i++) {
              if (filter[i].key === 'category') {
                categoryArray.push(filter[i].value);
              }
              if (filter[i].key === 'createdAt') {
                dateRange = filter[i].value;
              }
              if (filter[i].key === 'price') {
                const priceValue = filter[i].value;
                const startValue = priceValue.startValue;
                const endValue = priceValue.endValue;
      
                const priceFilter = {
                  $gt: startValue,
                  $lt: endValue,
                };
      
                priceArray.push(priceFilter);
              }
            }
      
            resolve({ categoryArray, dateRange, priceArray });
          } catch (error) {
            reject(error);
          }
        });
      }
      

       calculateGST(totalAmount) {
        totalAmount = totalAmount ? totalAmount : 0
        const taxRate = 0.18;
        const amountBeforeTax = Math.floor(totalAmount / (1 + taxRate));
        const tax = Math.floor(totalAmount - amountBeforeTax);
        
        return {
          amountBeforeTax,
          tax,
          total: totalAmount ? totalAmount : 0
        };
      }
      
      
      
      
    /********************************************************
     Purpose: Login
     Parameter:
     {
            "emailId": "",
            "password":""
     }
     Return: JSON String
     ********************************************************/
    async adminLogin() {
        try {
            let fieldsArray = ["emailId", "password"];
            let emptyFields = await (new RequestBody()).checkEmptyWithFields(this.req.body, fieldsArray);
            if (emptyFields && Array.isArray(emptyFields) && emptyFields.length) {
                return this.res.send({ status: 0, message: i18n.__('SEND_PROPER_DATA') + " " + emptyFields.toString() + " fields required." });
            }
            fieldsArray = [...fieldsArray, "deviceToken", "device"];
            let data = await (new RequestBody()).processRequestBody(this.req.body, fieldsArray);

            const user = await Admin.findOne({ emailId: data.emailId.toString().toLowerCase() });
            if (_.isEmpty(user)) {
                return this.res.send({ status: 0, message: i18n.__("USER_NOT_EXIST") });
            }
            if (!user.emailVerificationStatus) {
                return this.res.send({ status: 0, message: i18n.__("VERIFY_EMAIL") });
            }
            if (!user.password) {
                return this.res.send({ status: 0, message: i18n.__("SET_PASSWORD") });
            }
            const status = await (new CommonService()).verifyPassword({ password: data.password, savedPassword: user.password });
            if (!status) {
                return this.res.send({ status: 0, message: i18n.__("INVALID_PASSWORD") });
            }

            let tokenData = { id: user._id };
            let obj = { lastSeen: new Date() };

            tokenData['ipAddress'] = this.req.ip;
            let token = await (new Globals()).AdminToken(tokenData);
            let updatedUser = await Admin.findByIdAndUpdate(user._id, obj, { new: true }).select(adminProjection.admin);

            // Logic to get role permission
            let userData = JSON.parse(JSON.stringify(updatedUser));
            userData['rolePermission'] = await (new RoleService()).getPermissionsOfUser({ roleId: updatedUser.role._id ? updatedUser.role._id : updatedUser.role });
            return this.res.send({ status: 1, message: i18n.__("LOGIN_SUCCESS"), access_token: token, data: userData });

        } catch (error) {
            console.log("error", error);
            return this.res.send({ status: 0, message: i18n.__('SERVER_ERROR') });
        }
    }
    /********************************************************
     Purpose: Single File uploading
     Parameter:
     {
            "file":
     }
     Return: JSON String
     ********************************************************/
      getFileExtension(filename) {
        return filename.slice((filename.lastIndexOf(".") - 1 >>> 0) + 2);
      }
     async fileUpload() {
        try {
            let form = new Form(this.req);
            let formObject = await form.parse();
            if (_.isEmpty(formObject.files)) {
                return this.res.send({ status: 0, message: i18n.__("%s REQUIRED", 'File') });
            }
            const file = new File();
            let filePath = "";
            let imagePath = config.s3ImagePath;
            if (config.s3upload && config.s3upload == 'true') {
                console.log(formObject.files);
                filePath = await file.uploadFileOnS3(formObject.files.file[0]);
                console.log(filePath,"filePath 769");
            } else {
                let fileObject = await file.store();
                /***** uncommit this line to do manipulations in image like compression and resizing ****/
                // let fileObject = await file.saveImage();
                filePath = fileObject.filePath;
                console.log(filePath,"filePath 775");

            }
            // console.log(filePath,"filePath");
            // let extension = this.getFileExtension(formObject.files.file[0].originalFilename);
            // console.log(extension);
            // let path = config.s3ImagePath + "/" + filePath.key ;
            return this.res.send({ status: 1, data: filePath});
        } catch (error) {
            console.log("error- ", error);
            this.res.send({ status: 0, message: error });
        }
    }


    async readVoucherData() {
      try {
        if (!this.req.file) {
          return this.res.send({ status: 0, message: "File not found" });
        }
    
        const allowedMimeTypes = ["text/csv", "application/vnd.ms-excel", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"];
        const { mimetype, buffer } = this.req.file;
    
        if (!allowedMimeTypes.includes(mimetype)) {
          return this.res.send({ status: 0, message: "Invalid file type" });
        }
    
        let fileData = buffer.toString(); // Convert buffer to string
    
        if (mimetype !== "text/csv") {
          const workbook = xlsx.read(buffer, { type: "buffer" });
          const worksheet = workbook.Sheets[workbook.SheetNames[0]];
          fileData = xlsx.utils.sheet_to_csv(worksheet);
        }
    
        const results = [];
        const voucherCodes = fileData.split("\n"); // Split by newline characters
    
        for (const voucherCode of voucherCodes) {
          const trimmedCode = voucherCode.trim().replace(/"/g, ''); 
          if (trimmedCode && !/[a-z]/.test(trimmedCode)) {
            const existingVoucher = await VoucherCode.findOne({
              voucherCode: trimmedCode,
              isDeleted: false,
              status: true
            });
    
            if (!existingVoucher) {
              const voucher = await new Model(VoucherCode).store({ voucherCode: trimmedCode });
              await voucher.save();
              results.push(voucher);
            }
          }
        }
    
        return this.res.send({ status: 1, message: "Saved" });
      } catch (e) {
        console.log(e);
        return this.res.send({ status: 0, message: "Internal server error" });
      }
    }
    
    
    
    
    
     
    async fetchVoucherData() {
      try {
        const { pageNumber, pageSize } = this.req.body;
        const parsedPageNumber = parseInt(pageNumber) || 1;
        const parsedPageSize = parseInt(pageSize) || 10;
    
        const count = await VoucherCode.count({isDeleted:false,status:true});
        const totalPages = Math.ceil(count / parsedPageSize);
    
        const skip = (parsedPageNumber - 1) * parsedPageSize;
    
        let data = await VoucherCode.find({isDeleted:false , status:true})
          .skip(skip)
          .limit(parsedPageSize)
          .lean();
    
        return this.res.send({
          status: 1,
          totalEntries: count,
          totalPages: totalPages,
          currentPage: parsedPageNumber,
          pageSize: parsedPageSize,
          data: data
        });
      } catch (e) {
        console.log(e, "error");
        return this.res.send({ status: 0, error: e });
      }
    }
    
    
    

    
    async getMetaText() {
        let data = [
            "Lorem ipsum is placeholder text commonly used in the graphic, print, and publishing industries for previewing layouts and visual mockups.",
            "Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur",

            "Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum."
        ]
        this.res.send({ status: 1, data })
    }
    /********************************************************
     Purpose: Logout Admin
     Parameter:
     {}
     Return: JSON String
     ********************************************************/
    async logout() {
        try {
            const currentUser = this.req.currentUser && this.req.currentUser._id ? this.req.currentUser._id : "";
            await Authentication.update({ adminId: currentUser, ipAddress: this.req.body.ip }, { $set: { token: null } });
            this.res.send({ status: 1, message: i18n.__("LOGOUT_SUCCESS"), data: {} });
        } catch (error) {
            console.log('error', error);
            this.res.send({ status: 0, message: error });
        }

    }
}


module.exports = AdminController
