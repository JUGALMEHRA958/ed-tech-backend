const i18n = require("i18n");
const _ = require('lodash');

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
const CoursePurchases = require("../CoursePurchase/Schema").CoursePurchases;
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
            let fieldsArray = ['pageNumber', 'pageSize'];
            let userData = await (new RequestBody()).processRequestBody(this.req.body, fieldsArray);
            if(!userData.pageNumber || !userData.pageNumber ){
                return this.res.send({ status: 0, message: i18n.__("PAGENUMBER_PAGESIZE_MISSING") });
            }
            // Extract pageNumber and pageSize from the userData object
            const { pageNumber, pageSize } = userData;
            
            // Query the database to get the total count of documents
            const totalCount = await Students.count({});
            // Calculate the skip value based on the pageNumber and pageSize
            const skip = (pageNumber - 1) * pageSize;
            
            // Query the database with pagination
            let students = await Students.aggregate([
                { $skip: skip },
                { $limit: pageSize },
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
                },
                {
                    $sort: { courseCount: -1 } // 1 for ascending order, -1 for descending order
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
      
          const totalCount = await CoursePurchases.count();
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
      
          let newArray = [];
          for (let i = 0; i < details.length; i++) {
            let { amountBeforeTax, tax } = this.calculateGST(details[i].courseId.price);
            newArray.push({
              studentId: details[i].studentId,
              courseIsbn: details[i].courseId.isbnNumber,
              courseName: details[i].courseId.title,
              category: details[i].courseId.category,
              purchaseDate: details[i].createdAt,
              amountBeforeTax: amountBeforeTax,
              tax: tax,
              total: details[i].courseId.price ? details[i].courseId.price : 0,
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
            const file = new File(formObject.files);
            let filePath = "";
            let imagePath = config.s3ImagePath;
            if (config.s3upload && config.s3upload == 'true') {
                console.log(formObject.files);
                filePath = await file.uploadFileOnS3(formObject.files.file[0]);
            } else {
                let fileObject = await file.store();
                /***** uncommit this line to do manipulations in image like compression and resizing ****/
                // let fileObject = await file.saveImage();
                filePath = fileObject.filePath;
            }
            console.log(filePath,"filePath");
            let extension = this.getFileExtension(formObject.files.file[0].originalFilename);
            console.log(extension);
            let path = config.s3ImagePath + "/" + filePath.key ;
            return this.res.send({ status: 1, data: path});
        } catch (error) {
            console.log("error- ", error);
            this.res.send({ status: 0, message: error });
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