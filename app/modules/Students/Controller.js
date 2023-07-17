const _ = require("lodash");
const i18n = require("i18n");
const Transaction = require("mongoose-transactions");
const CoursePurchases = require("../CoursePurchase/Schema").CoursePurchases;
const Controller = require("../Base/Controller");
const Students = require("./Schema").Students;
const Email = require("../../services/Email");
const Model = require("../Base/Model");
const userProjection = require("../Students/Projection.json");
const Globals = require("../../../configs/Globals");
const Config = require("../../../configs/configs");
const RequestBody = require("../../services/RequestBody");
const Authentication = require("../Authentication/Schema").Authtokens;
const CommonService = require("../../services/Common");
const StripeService = require("../../services/Stripe");
const Form = require("../../services/Form");
const File = require("../../services/File");
var FormData = require("form-data");
const DiscountCoupon = require("../DiscountModule/Schema").DiscountCoupon;
// const { Config } = require("custom-env");
const { PaymentHistoryStripe } = require("../CoursePurchase/Schema");
const { Admin } = require("../Admin/Schema");
const Invoice = require("../../services/Invoice");
const mongoose = require("mongoose");
const { EmailOTP } = require("./Schema");
const axios = require("axios").default;
const CourseSchema = require("../Courses/Schema").CourseSchema;
class StudentsController extends Controller {
  constructor() {
    super();
    this.invoice = new Invoice();
  }

  /********************************************************
   Purpose: user register
   Parameter:
      {
          "email":"john@doe.com",
          "password":"john"
          "firstname":"john",
          "lastname":"deo"
      }
   Return: JSON String
   ********************************************************/
  async register() {
    const transaction = new Transaction();
    try {
      let {publishableKey , clientSecret} = await Admin.findOne();
      let stripeDetail = {
        publishableKey:publishableKey,
        secretKey:clientSecret,
      };
      // check email is exist or not
      let filter = {
        $or: [{ email: this.req.body.email.toLowerCase() }],
      };
      const user = await Students.findOne(filter);
      //if user exist give error
      if (!_.isEmpty(user) && user.email) {
        return this.res.send({
          status: 0,
          message: i18n.__("DUPLICATE_EMAIL_"),
        });
      } else {
        let data = this.req.body;
        let isPasswordValid = await new CommonService().validatePassword({
          password: data["password"],
        });
        if (isPasswordValid && !isPasswordValid.status) {
          return this.res.send(isPasswordValid);
        }
        let password = await new CommonService().ecryptPassword({
          password: data["password"],
        });

        data = { ...data, password: password, role: "user" };
        data["email"] = data["email"].toLowerCase();

        // save new user
        let newUserId = await new Model(Students).store(data);

        // if empty not save user details and give error message.
        if (_.isEmpty(newUserId)) {
          return this.res.send({
            status: 0,
            message: i18n.__("USER_NOT_SAVED"),
          });
        } else {
          //magic registration starts here
          try {
            //static centreCode by shashi
            let centreCode = "IDPCENTRE";
            const schoolDetailsRes = await axios.get(
              `${Config.magicbox_host}/services//school/v1.1/getSchoolById?code=${centreCode}&token=${Config.magicbox_key}`
            );
            console.log(
              "\nschoolDetailsRes:\n",
              schoolDetailsRes,
              "\n--------\n"
            );
            const classDetailsRes = await axios.get(
              `${Config.magicbox_host}/services//school/v1.0/school/${schoolDetailsRes.data.data.schoolId}/classes?token=${Config.magicbox_key}`
            );
            console.log(
              "\nclassDetailsRes:\n",
              classDetailsRes,
              "\n--------\n"
            );
            const userRes = await axios.get(
              `${
                Config.magicbox_host
              }/services//user/v1.0/${data.email.toLowerCase()}?status=ACT&token=${
                Config.magicbox_key
              }`
            );
            console.log("\nuserRes:\n", userRes, "\n--------\n");
            if (userRes.data.response.responseCode === 200) {
              console.log("magic: student is already registerd");
            } else {
              let magicboxStudentPayload = {
                firstname: data.firstName,
                lastname: data.lastName,
                userName: data.email.toLowerCase(),
                // password: randomPwd,
                userType: "LEARNER",
                classId: [classDetailsRes.data.data.classList[0].classId],
                grade: [""],
                schoolId: classDetailsRes.data.data.schoolId,
                creator: classDetailsRes.data.data.schooladminlist[0].username,
                emailToUser: false,
                districtId: 0,
              };
              const studentRes = await axios.post(
                `${Config.magicbox_host}/services//user/v1.0/add?token=${Config.magicbox_key}`,
                magicboxStudentPayload
              );
              console.log(
                "\n------------magic registration success--------------\n",
                studentRes.data,
                "\n-------------------------------\n"
              );
            }
          } catch (e) {
            console.log(
              "magic registration error[NM-CC]-catch-block--------------\n",
              e,
              "\nmagic student register api error---------------"
            );
          }
          //magic registration ended
          const otp = Math.floor(100000 + Math.random() * 900000).toString();

          // Set the OTP expiry date (e.g., 10 minutes from now)
          const expiryDate = new Date(Date.now() + 10 * 60 * 1000);
      
          // Save the OTP entry to the database
          const otpEntry = await new Model(EmailOTP).store({ email : this.req.body.email, otp, expiryDate });
          let emailData = {
            emailId: newUserId.email,
            emailKey: 'otp_mail',
            replaceDataObj: { otp:otp}
        };

        const sendingMail = await new Email().sendMail(emailData);
        if (sendingMail) {
            if (sendingMail.status == 0) {
                return _this.res.send(sendingMail);
            } else if (!sendingMail.response) {
                return this.res.send({ status: 0, message: i18n.__("SERVER_ERROR") });
            }
        }
          return this.res.send({
            status: 1,
            message: i18n.__("REGISTRATION_SCUCCESS"),
            data: newUserId,
            // token: token,
            // refreshToken: refreshToken,
            stripeDetail
          });
        }
      }
    } catch (error) {
      console.log("error = ", error);
      // transaction.rollback();
      this.res.send({ status: 0, message: error });
    }
  }
  async verifyOtp(){
    try{
      const { email, otp } = this.req.body;

        // Find the OTP entry based on the provided email
        const otpEntry = await EmailOTP.findOne({ email }).lean();
        // Check if an OTP entry exists for the email
        if (!otpEntry) {
          return this.res.status(404).json({ status:0 , message: "OTP not found for the provided email" });
        }
    
        // Check if the OTP matches
        if (otpEntry.otp !== otp) {
          return this.res.status(400).json({ status:0 , message: "Invalid OTP" });
        }
    
        // Check if the OTP has expired
        if (otpEntry.expiryDate < new Date()) {
          return this.res.status(400).json({ status:0 , message: "OTP has expired" });
        }
        let newUserId = await Students.findOneAndUpdate({email:otpEntry.email},{isOtpVerfied:true})
        //now normal flow continue ignore code from here
                //STRIPE CUSTOMER REGISTERATION
                let stripeObj = await new StripeService().createStripeUser(newUserId.email);
                // console.log(stripeObj,"stripeObj");
                if(stripeObj && stripeObj.status==1 && stripeObj.data.id){
                  newUserId = await Students.findOneAndUpdate({_id:newUserId._id} , {stripeCustomerId:stripeObj.data.id },{new:true})
                }
                let { token, refreshToken } =
                  await new Globals().getTokenWithRefreshToken({ id: newUserId._id });
                  let emailData = {
                    emailId: newUserId.email,
                    emailKey: 'signup_mail',
                    replaceDataObj: { fullName: newUserId.firstName + " " + newUserId.lastName}
                };
      
                const sendingMail = await new Email().sendMail(emailData);
                if (sendingMail) {
                    if (sendingMail.status == 0) {
                        return _this.res.send(sendingMail);
                    } else if (!sendingMail.response) {
                        return this.res.send({ status: 0, message: i18n.__("SERVER_ERROR") });
                    }
                }
                let lastSeen = new Date();
                let updateLastSeen  = await Students.findOneAndUpdate({_id:newUserId._id},{lastSeen:lastSeen,isOtpVerfied:true}).lean()
                console.log(updateLastSeen);
                let deleteOtpFromDb = await EmailOTP.deleteOne({ email , otp });
                return this.res.send({status:1, token, refreshToken})
    }catch(e){
      console.log(e);
      return this.res.send({status:0, message:e})
    }
  }
  async resendOtp() {
    try {
      const { email } = this.req.body;
  
      // Delete any existing OTP entry for the same email
      await EmailOTP.deleteMany({ email });
  
      // Generate a new OTP
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
  
      // Set the OTP expiry date (e.g., 10 minutes from now)
      const expiryDate = new Date(Date.now() + 10 * 60 * 1000);
  
      // Save the OTP entry to the database
      const otpEntry = await new Model(EmailOTP).store({ email: email, otp, expiryDate });
  
      // Send the OTP to the user via email
      let emailData = {
        emailId: email,
        emailKey: 'otp_mail',
        replaceDataObj: { otp: otp }
      };
  
      const sendingMail = await new Email().sendMail(emailData);
  
      if (sendingMail) {
        if (sendingMail.status == 0) {
          return _this.res.send(sendingMail);
        } else if (!sendingMail.response) {
          return this.res.send({ status: 0, message: i18n.__("SERVER_ERROR") });
        }
      }
  
      return this.res.status(200).json({ status: 1, message: "OTP resent successfully" });
    } catch (e) {
      console.log(e);
      return this.res.status(500).json({ status: 0, message: "Internal server error" });
    }
  }
  
  
  /***********************************
        Purpose: students export
        Return: file path
     ********************************/
  async exportStudents() {
    const user = await Students.find().select({
      studentId: 1,
      studentName: 1,
      collegeName: 1,
      collegeCode: 1,
      institute: 1,
      branch: 1,
      semester: 1,
      createdAt: 1,
    });
    let columns = [
      "studentId",
      "studentName",
      "collegeCode",
      "collegeName",
      "institute",
      "branch",
      "semester",
      "createdAt",
    ];
    const file = await new File().convertJsonToCsv({
      jsonData: user,
      columns,
      fileName: `studentList-${new Date().toISOString().split("T")[0]}-`,
      ext: ".csv",
    });

    this.res.send({ status: 1, data: file });
  }
  /***TN GOVN REGISTRATION */
  async nmRegister() {
    const transaction = new Transaction();
    try {
      // check email is exist or not
      if (this.req.body.token !== "jahsdkashdjaskdjklasjdka") {
        return this.res.send({ status: 0, message: i18n.__("INVALID_TOKEN") });
      }

      // new
      // save new user
      let data = this.req.body;

      let filter = { studentId: this.req.body.studentId };

      const user = await Students.findOne(filter);
      //if user exist give error
      if (!_.isEmpty(user)) {
        return this.res.send({
          status: 0,
          message: i18n.__("DUPLICATE_STUDENT"),
        });
      }

      data = { ...data, role: "user" };
      const newUserId = await new Model(Students).store(data);

      // if empty not save user details and give error message.
      if (_.isEmpty(newUserId)) {
        return this.res.send({ status: 0, message: i18n.__("USER_NOT_SAVED") });
      } else {
        const token = await new Globals().generateToken(newUserId);
        //transaction.update('Student', newUserId, { verificationToken: token, verificationTokenCreationTime: new Date() });
        let updatedUser = await Students.findByIdAndUpdate(newUserId, {
          verificationToken: token,
          verificationTokenCreationTime: new Date(),
        }).select(userProjection.user);
        //await transaction.run();

        //magic registration starts here
        try {
          //defalut school id
          const schoolId = 15772;
          //default classId [288701] which we are used previously
          let classId = [];
          //get the class-list from magic from school-id
          const schoolData = await axios.get(
            `${Config.magicbox_host}/services//school/v1.0/school/15772/classes?token=${Config.magicbox_key}`
          );
          const classList = schoolData.data.data.classList;
          //check wether the class is present or not in the class list
          classList.forEach((e) => {
            if (
              data.collegeName.toLowerCase().trim() ==
              e.className.toLowerCase().trim()
            ) {
              // return e.classId
              classId = [e.classId];
              return;
            }
          });
          console.log(
            "\n-----------\n",
            classId,
            "\n----------classId from school data\n"
          );
          if (classId.length <= 0) {
            //if class not found we need to create a class with college name
            let addClassPayload = {
              className: data.collegeName,
              creator: "shashikala@cambridgeenglish.in",
              schoolId: schoolId,
            };
            let addClass = await axios.post(
              `${Config.magicbox_host}/services//school/v1.0/class/add?token=${Config.magicbox_key}`,
              addClassPayload
            );
            console.log(
              "\nnew class details\n",
              addClass.data,
              "\n-------new class details\n"
            );
            classId = [addClass.data.data.classId];
          }
          console.log(
            "\n-----------class details\n",
            classId,
            "\n----------class details\n"
          );
          let magicboxStudentPayload = {
            firstname: data.studentName ? data.studentName : "student",
            lastname: "-",
            userName: data.studentId,
            password: "",
            userType: "LEARNER",
            classId: classId,
            grade: [""],
            schoolId: schoolId,
            creator: "shashikala@cambridgeenglish.in",
            emailToUser: false,
            districtId: 0,
            parentemail: "",
          };
          console.log(
            "nm incoming data------\n",
            data,
            "\nnm incoming data-----"
          );
          const studentRes = await axios.post(
            `${Config.magicbox_host}/services//user/v1.0/add?token=${Config.magicbox_key}`,
            magicboxStudentPayload
          );

          if (studentRes.data.response.responseCode == 200) {
            console.log("registration success-------\n", studentRes.data.data);
          } else {
            console.log(
              "magic add user api error-[NM-CC]-------\n",
              studentRes,
              "\nmagic student register error--------"
            );
          }
        } catch (e) {
          console.log(
            "magic registration error[NM-CC]-catch-block--------------\n",
            e,
            "\nmagic student register api error---------------"
          );
        }
        //magic registration ended

        return this.res.send({
          status: 1,
          message: i18n.__("REGISTRATION_SCUCCESS_NM"),
          data: updatedUser,
        });
      }

      // old
      // let filter = { "studentId": this.req.body.studentId }
      // if (this.req.body.email) {
      //     filter = { "$or": [{ "email": this.req.body.email.toLowerCase() }, { "studentId": this.req.body.studentId }] }
      // }
      // const user = await Students.findOne(filter);
      // //if user exist give error
      // if (!_.isEmpty(user) && this.req.body.email && (user.email || user.studentId)) {
      //     return this.res.send({ status: 0, message: i18n.__("DUPLICATE_EMAIL_OR_STUDENT") });
      // }
      // else if (!_.isEmpty(user) && (user.email || user.studentId)) {
      //     return this.res.send({ status: 0, message: i18n.__("DUPLICATE_STUDENT") });
      // } else {
      //     let data = this.req.body;
      //     let isPasswordValid = await (new CommonService()).validatePassword({ password: data['password'] });
      //     if (isPasswordValid && !isPasswordValid.status) {
      //         return this.res.send(isPasswordValid)
      //     }
      //     let password = await (new CommonService()).ecryptPassword({ password: data['password'] });

      //     data = { ...data, password: password, role: 'user' };
      //     if (data['email']) {
      //         data['email'] = data['email'].toLowerCase()
      //         data['emailVerificationStatus'] = true
      //     }
      //     // save new user
      //     const newUserId = await new Model(Students).store(data);

      //     // if empty not save user details and give error message.
      //     if (_.isEmpty(newUserId)) {
      //         return this.res.send({ status: 0, message: i18n.__('USER_NOT_SAVED') })
      //     }
      //     else {
      //         const token = await new Globals().generateToken(newUserId);

      //         //sending mail to verify user
      //         // let emailData = {
      //         //     email: data['email'],
      //         //     emailKey: 'signup_mail',
      //         //     replaceDataObj: { fullName: data.firstname + " " + data.lastname, verificationLink: Config.rootUrl + '/Students/verifyUser?token=' + token }
      //         // };
      //         //const verifyResult = await new Email().verifySmtp()
      //         //const sendingMail = await new Email().sendMail(emailData);

      //         // console.log('sendingMail', sendingMail);
      //         // if (sendingMail && sendingMail.status == 0) {
      //         //     transaction.rollback();
      //         //     return this.res.send(sendingMail);
      //         // }
      //         // else if (sendingMail && !sendingMail.response) {
      //         //     transaction.rollback();
      //         //     return this.res.send({ status: 0, message: i18n.__('MAIL_NOT_SEND_SUCCESSFULLY') });
      //         // }

      //         //transaction.update('Student', newUserId, { verificationToken: token, verificationTokenCreationTime: new Date() });
      //         let updatedUser = await Students.findByIdAndUpdate(newUserId, { verificationToken: token, verificationTokenCreationTime: new Date() }).select(userProjection.user);
      //         //await transaction.run();

      //         return this.res.send({ status: 1, message: i18n.__('REGISTRATION_SCUCCESS_NM'), data: updatedUser });
      //     }
      // }
    } catch (error) {
      console.log("error = ", error);
      // transaction.rollback();
      this.res.send({ status: 0, message: error });
    }
  }

  // ssoValidate
  async ssoValidate() {
    try {
      const token = this.req.query.token;
      if (_.isEmpty(token)) {
        return this.res.send({ status: 0, message: "Please send token" });
      }

      const authenticate = new Globals();

      const tokenCheck = await authenticate.checkTokenInDB(token);
      if (!tokenCheck)
        return this.res
          .status(401)
          .json({ status: 0, message: i18n.__("INVALID_TOKEN.") });

      const tokenExpire = await authenticate.checkExpiration(token);
      if (!tokenExpire)
        return this.res
          .status(401)
          .json({ status: 0, message: i18n.__("TOKEN_EXPIRED") });

      let userExist;
      userExist = await authenticate.checkUserInDB(token);
      let output
      // console.log('117-userExistuserExist', userExist);
      if (!userExist) {
        // console.log('119-userExistuserExist', userExist);
        if (!userExist)
          return this.res
            .status(401)
            .json({ status: 0, message: i18n.__("USER_NOT_EXIST_OR_DELETED") });
      }
      else{
        // let output =  _.omit(userExist, ['password', 'emailVerificationStatus', 'isDeleted', 'previouslyUsedPasswords', 'failedAttempts', 'createdAt', 'updatedAt', 'verificationToken', 'verificationTokenCreationTime', 'lastSeen'])
      // output = {};
      output = userExist;
      console.log(userExist,"userExist 454");
      if (output && output.hasOwnProperty('password')) {
        delete output.password;
      }
      if (output && output.hasOwnProperty('emailId')) {
        delete output.email;
      }
      console.log(output);
      output.emailId = output.email;
      delete output.email;
      console.log("");
      return this.res.send({ status: 1, data: output });
      }
      console.log(userExist,"userExist 499")
      
    } catch (error) {
      console.log("error = ", error);
      // transaction.rollback();
      this.res.send({ status: 0, message: error });
    }
  }

  async ssoLogin() {
    try {
      console.log(this.req.headers.authorization);
      const token = this.req.headers.authorization;
      console.log(
        "\n---------------------Token for ssoLogin------------------\n",
        token,
        "\n-----------------------------\n"
      );
      if (_.isEmpty(token)) {
        return this.res.send({ status: 0, message: "Please send token" });
      }

      // else if (!student.emailVerificationStatus) {
      //     return this.res.send({ status: 0, message: i18n.__("VERIFY_EMAIL") });
      // }
      // else if (!user.password) {
      //     return this.res.send({ status: 0, message: i18n.__("SET_PASSWORD") });
      // }

      // let updatedStudent = await Students.findByIdAndUpdate(
      //   student._id,
      //   { lastSeen: new Date() },
      //   { new: true }
      // ).select(userProjection.user);
      let coursesPurchased = await CoursePurchases.find({
        studentId: this.req.currentUser._id,
      });
      let courseIds = coursesPurchased.map((course) => {
        return course.courseId;
      });
      let courses = await CourseSchema.find({ _id: { $in: courseIds } });
      let productIds = courses.map((course) => {
        return course.productId;
      });
      if (Config.useRefreshToken && Config.useRefreshToken == "true") {
        return this.res.send({
          status: 1,
          message: i18n.__("LOGIN_SUCCESS"),
          // access_token: token,
          // refreshToken: refreshToken,
          data: this.req.currentUser,
          productIds: productIds,
        });
      } else {
        return this.res.send({
          status: 1,
          message: i18n.__("LOGIN_SUCCESS"),
          // access_token: token,
          data: updatedStudent,
        });
      }
    } catch (error) {
      console.log(
        "\n-----------ssoLogin-error-catched-----------\n",
        error,
        "\n---------------------------------\n"
      );
      // transaction.rollback();
      return this.res.send({ status: 0, message: error });
    }
  }
  /********************************************************
    Purpose: to verify wether the student is exist at magic side or not
    Parameter:
        {
            "token":"JWT"
        }
    Return: JSON String
    type:GET
   ********************************************************/
  async validateMagicStudent() {
    try {
      const token = this.req.query.token;
      if (_.isEmpty(token)) {
        return this.res.send({ status: 0, message: "Please send token" });
      }
      const payload = { token: token };

      const response = await axios({
        method: "post",
        url: Config.NmValidationAPI,
        data: payload,
        // headers: { "Content-Type": "multipart/form-data" },
        // headers: { "Content-Type": "application/json" },
      });

      console.log("data", response.data);

      const student = await Students.findOne({
        studentId: response.data.studentId,
        isDeleted: false,
      });

      if (_.isEmpty(student)) {
        return this.res.send({
          status: 0,
          message: i18n.__("USER_NOT_EXIST_OR_DELETED"),
        });
      }

      let updatedStudent = await Students.findByIdAndUpdate(
        student._id,
        { lastSeen: new Date() },
        { new: true }
      ).select(userProjection.user);

      const magicStudentData = await axios.get(
        `${Config.magicbox_host}/services/user/v1.0/userdetails/${student.studentId}?token=${Config.magicbox_key}`
      );
      console.log(
        "\n--------------magic response for student data--------------\n",
        magicStudentData.data,
        "\n------------------------------\n"
      );
      if (magicStudentData.data.response.responseCode == 719) {
        //start pushing the student again to magic
        //magic registration starts here
        try {
          //defalut school id
          const schoolId = 15772;
          //default classId [288701] which we are used previously
          let classId = [];
          //get the class-list from magic from school-id
          const schoolData = await axios.get(
            `${Config.magicbox_host}/services//school/v1.0/school/15772/classes?token=${Config.magicbox_key}`
          );
          const classList = schoolData.data.data.classList;
          //check wether the class is present or not in the class list
          classList.forEach((e) => {
            if (
              student.collegeName.toLowerCase().trim() ==
              e.className.toLowerCase().trim()
            ) {
              // return e.classId
              classId = [e.classId];
              return;
            }
          });
          console.log(
            "\n-----------magicStudentValidate---------------\n",
            classId,
            "\n----------classId from school data------------\n"
          );
          if (classId.length <= 0) {
            //if class not found we need to create a class with college name
            let addClassPayload = {
              className: student.collegeName,
              creator: "shashikala@cambridgeenglish.in",
              schoolId: schoolId,
            };
            let addClass = await axios.post(
              `${Config.magicbox_host}/services//school/v1.0/class/add?token=${Config.magicbox_key}`,
              addClassPayload
            );
            console.log(
              "\n---------------new class details-magicStudentValidate--------------\n",
              addClass.data,
              "\n-------new class details------------\n"
            );
            classId = [addClass.data.data.classId];
          }
          console.log(
            "\n-----------class details-magicStudentValidate----------------\n",
            classId,
            "\n----------class details------------\n"
          );
          let magicboxStudentPayload = {
            firstname: student.studentName ? student.studentName : "student",
            lastname: "-",
            userName: student.studentId,
            password: "",
            userType: "LEARNER",
            classId: classId,
            grade: [""],
            schoolId: schoolId,
            creator: "shashikala@cambridgeenglish.in",
            emailToUser: false,
            districtId: 0,
            parentemail: "",
          };
          console.log(
            "\n-----------magicStudentValidate incoming data------\n",
            student,
            "\n--------re-register data-----\n"
          );
          const studentRes = await axios.post(
            `${Config.magicbox_host}/services//user/v1.0/add?token=${Config.magicbox_key}`,
            magicboxStudentPayload
          );

          if (studentRes.data.response.responseCode == 200) {
            console.log(
              "\n--------re-registration success-------\n",
              studentRes.data.data,
              "\n--------re-registration success-------\n"
            );
            // this.res.redirect(target='_blank','https://online.cambridgeconnect.org/security/cup/websso.htm?code='+token+'&source=CCNM');
            return this.res.send({ status: 1 });
          } else {
            console.log(
              "\n--------magic re-add user api error-[NM-CC]-------\n",
              studentRes,
              "\n--------magic student re-register error--------\n"
            );
            return this.res.send({ status: 1 });
          }
        } catch (e) {
          console.log(
            "\n------------magic re-registration error[NM-CC]-catch-block--------------\n",
            e,
            "\n------------magic student re-register api error---------------\n"
          );
          return this.res.send({ status: 1 });
        }
        //magic registration ended
      } else {
        // this.res.redirect(target='_blank','https://online.cambridgeconnect.org/security/cup/websso.htm?code='+token+'&source=CCNM');
        return this.res.send({ status: 1 });
      }
    } catch (error) {
      console.log(
        "\n-----------magic student validate-catched-----------\n",
        error,
        "\n---------------------------------\n"
      );
      return this.res.send({ status: 0, message: error });
    }
  }
  /********************************************************
    Purpose: Forgot password mail
    Parameter:
        {
            "email":"john@doe.com"
        }
    Return: JSON String
   ********************************************************/
  async forgotPasswordMail() {
    try {
      let email = this.req.body.email;
      let user = await Students.findOne({ email: email });
      if (_.isEmpty(user)) {
        return this.res.send({
          status: 0,
          message: i18n.__("REGISTERED_EMAIL"),
        });
      }
      let globalObj = new Globals();
      const token = await globalObj.generateToken(user._id);
      await Students.findByIdAndUpdate(user._id, {
        forgotToken: token,
        forgotTokenCreationTime: new Date(),
      });

      let emailData = {
        emailId: email,
        emailKey: "forgot_password_mail",
        replaceDataObj: {
          fullName: user.firstName + " " + user.lastName,
          resetPasswordLink: Config.setPassUrl + token,
        },
      };
      // console.log(Config.setPassUrl, "Config.setPassUrl");
      const sendingMail = await new Email().sendMail(emailData);
      if (sendingMail && sendingMail.status == 0) {
        return this.res.send(sendingMail);
      }
      if (sendingMail && !sendingMail.response) {
        return this.res.send({ status: 0, message: i18n.__("SERVER_ERROR") });
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
            "password":"123456",
            "token": "errrrwqqqsssfdfvfgfdewwwww"
        }
    Return: JSON String
   ********************************************************/
  async resetPassword() {
    try {
      const decoded = await Globals.decodeUserForgotToken(this.req.body.token);
      if (!decoded) {
        return this.res.send({ status: 0, message: i18n.__("LINK_EXPIRED") });
      }

      let user = await Students.findOne({ forgotToken: this.req.body.token });
      if (_.isEmpty(user)) {
        return this.res.send({ status: 0, message: i18n.__("INVALID_TOKEN") });
      }

      let isPasswordValid = await new CommonService().validatePassword({
        password: this.req.body.password,
      });
      console.log("isPasswordValid", isPasswordValid);
      if (isPasswordValid && !isPasswordValid.status) {
        return this.res.send(isPasswordValid);
      }
      let password = await new CommonService().ecryptPassword({
        password: this.req.body.password,
      });

      const updateUser = await Students.findByIdAndUpdate(
        user._id,
        { password: password },
        { new: true }
      );
      if (_.isEmpty(updateUser)) {
        return this.res.send({
          status: 0,
          message: i18n.__("PASSWORD_NOT_UPDATED"),
        });
      }
      await Students.findByIdAndUpdate(user._id, {
        forgotToken: "",
        forgotTokenCreationTime: "",
      });
      return this.res.send({
        status: 1,
        message: i18n.__("PASSWORD_UPDATED_SUCCESSFULLY"),
      });
    } catch (error) {
      console.log("error- ", error);
      this.res.send({ status: 0, message: error });
    }
  }

  /********************************************************
    Purpose: Login
    Parameter:
        {
            "email":"john@doe.com"
            "password":"123456",
            "deviceToken": "errrrwqqqsssfdfvfgfdewwwww",
            "device": "ios"
        }
    Return: JSON String
   ********************************************************/
  async login() {
    try {
      let {publishableKey , clientSecret} = await Admin.findOne();
      let stripeDetail = {
        publishableKey:publishableKey,
        secretKey:clientSecret,
      };
      let fieldsArray = ["email", "password"];
      let emptyFields = await new RequestBody().checkEmptyWithFields(
        this.req.body,
        fieldsArray
      );
      if (emptyFields && Array.isArray(emptyFields) && emptyFields.length) {
        return this.res.send({
          status: 0,
          message:
            i18n.__("SEND_PROPER_DATA") +
            " " +
            emptyFields.toString() +
            " fields required.",
        });
      }

      let data = await new RequestBody().processRequestBody(this.req.body, [
        "deviceToken",
        "device",
      ]);
      let user = await Students.findOne({
        email: this.req.body.email.toString().toLowerCase(),
        isDeleted: false,
        status:true
      });

      if (_.isEmpty(user)) {
        return this.res.send({
          status: 0,
          message: i18n.__("USER_NOT_EXIST_OR_DELETED"),
        });
      }
      if(!user.stripeCustomerId){
        let stripeObj = await new StripeService().createStripeUser(user.email);
          // console.log(stripeObj,"stripeObj");
          if(stripeObj && stripeObj.status==1 && stripeObj.data.id){
            user = await Students.findOneAndUpdate({_id:user._id} , {stripeCustomerId:stripeObj.data.id },{new:true})
          }
      }

      const status = await new CommonService().verifyPassword({
        password: this.req.body.password,
        savedPassword: user.password,
      });
      if (!status) {
        return this.res.send({
          status: 0,
          message: i18n.__("INVALID_PASSWORD"),
        });
      }

      data["lastSeen"] = new Date();
      let updatedUser = await Students.findByIdAndUpdate(user._id, data, {
        new: true,
      }).select(userProjection.user).lean();
      console.log(updatedUser,"updatedUser 893");
      console.log(updatedUser.isOtpVerfied,"updatedUser.isOtpVerfied");
      if (updatedUser  && updatedUser.isOtpVerfied!==true) {
        const otp = Math.floor(100000 + Math.random() * 900000).toString();

        // Set the OTP expiry date (e.g., 10 minutes from now)
        const expiryDate = new Date(Date.now() + 10 * 60 * 1000);
        //delete if older one exist so latest one deliver
        await EmailOTP.deleteMany({ email : this.req.body.email });

        // Save the OTP entry to the database
        const otpEntry = await new Model(EmailOTP).store({ email: this.req.body.email, otp, expiryDate });
        let emailData = {
          emailId: updatedUser.email,
          emailKey: 'otp_mail',
          replaceDataObj: { otp: otp }
        };

        const sendingMail = await new Email().sendMail(emailData);
        if (sendingMail) {
          if (sendingMail.status == 0) {
            return _this.res.send(sendingMail);
          } else if (!sendingMail.response) {
            return this.res.send({ status: 0, message: i18n.__("SERVER_ERROR") });
          }
        }
        return this.res.send({
          status: 1,
          message: i18n.__("OTP_SENT_TO_YOUR_MAIL"),
          // token: token,
          // refreshToken: refreshToken,
          data: updatedUser,
          isEmailVerified:false,
          stripeDetail
        });
      }

      if (Config.useRefreshToken && Config.useRefreshToken == "true") {
        let { token, refreshToken } =
          await new Globals().getTokenWithRefreshToken({ id: user._id });
        return this.res.send({
          status: 1,
          message: i18n.__("LOGIN_SUCCESS"),
          token: token,
          refreshToken: refreshToken,
          data: updatedUser,
          stripeDetail
        });
      } else {
        let token = await new Globals().getToken({ id: user._id });
        return this.res.send({
          status: 1,
          message: i18n.__("LOGIN_SUCCESS"),
          token: token,
          data: updatedUser,
          stripeDetail
        });
      }
    } catch (error) {
      console.log(error);
      this.res.send({ status: 0, message: i18n.__("SERVER_ERROR") });
    }
  }

  /********************************************************
    Purpose: Change Password
    Parameter:
        {
            "oldPassword":"password",
            "newPassword":"newpassword"
        }
    Return: JSON String
   ********************************************************/
  async changePassword() {
    try {
      const user = this.req.currentUser;
      if (user.password == undefined) {
        return this.res.send({
          status: 0,
          message: i18n.__("CANNOT_CHANGE_PASSWORD"),
        });
      }
      let passwordObj = {
        oldPassword: this.req.body.oldPassword,
        newPassword: this.req.body.newPassword,
        savedPassword: user.password,
      };
      let password = await new CommonService().changePasswordValidation({
        passwordObj,
      });
      if (typeof password.status !== "undefined" && password.status == 0) {
        return this.res.send(password);
      }

      let updateData = { password: password, passwordUpdatedAt: new Date() };
      if (
        Config.storePreviouslyUsedPasswords &&
        Config.storePreviouslyUsedPasswords == "true"
      ) {
        updateData = {
          password: password,
          $push: { previouslyUsedPasswords: user.password },
          passwordUpdatedAt: new Date(),
        };
      }

      const updatedUser = await Students.findByIdAndUpdate(
        user._id,
        updateData,
        { new: true }
      );
      return !updatedUser
        ? this.res.send({ status: 0, message: i18n.__("PASSWORD_NOT_UPDATED") })
        : this.res.send({
            status: 1,
            data: {},
            message: i18n.__("PASSWORD_UPDATED_SUCCESSFULLY"),
          });
    } catch (error) {
      console.log("error- ", error);
      return this.res.send({ status: 0, message: error });
    }
  }

  /********************************************************
    Purpose: Edit profile
    Parameter:
        {
            "firstname": "firstname",
            "lastname": "lastname",
            "username": "username",
            "photo": "photo"
        }
    Return: JSON String
   ********************************************************/
  async editUserProfile() {
    try {
      const currentUser =
        this.req.currentUser && this.req.currentUser._id
          ? this.req.currentUser._id
          : "";
      let fieldsArray = [
        "firstname",
        "lastname",
        "username",
        "photo",
        "mobile",
      ];
      let data = await new RequestBody().processRequestBody(
        this.req.body,
        fieldsArray
      );
      if (data.photo) {
        data.photo = _.last(data.photo.split("/"));
      }
      let isExist = await Students.findOne({
        _id: { $nin: [currentUser], username: data["username"] },
      });
      if (isExist) {
        return this.res.send({
          status: 0,
          message: i18n.__("DUPLICATE_USERNAME"),
        });
      }
      const updatedUser = await Students.findByIdAndUpdate(currentUser, data, {
        new: true,
      }).select(userProjection.user);
      return this.res.send({
        status: 1,
        message: i18n.__("USER_UPDATED_SUCCESSFULLY"),
        data: updatedUser,
      });
    } catch (error) {
      console.log("error = ", error);
      this.res.send({ status: 0, message: i18n.__("SERVER_ERROR") });
    }
  }

  /********************************************************
     Purpose: user details
     Parameter:
     {
        "uid": "5ad5d198f657ca54cfe39ba0"
     }
     Return: JSON String
     ********************************************************/
  async userProfile() {
    try {
      const currentUser =
        this.req.currentUser && this.req.currentUser._id
          ? this.req.currentUser._id
          : "";
      let user = await Students.findOne(
        { _id: currentUser },
        userProjection.user
      );
      return _.isEmpty(user)
        ? this.res.send({ status: 0, message: i18n.__("USER_NOT_EXIST") })
        : this.res.send({ status: 1, data: user });
    } catch (error) {
      console.log("error- ", error);
      this.res.send({ status: 0, message: error });
    }
  }

  /********************************************************
     Purpose: verified user
     Parameter:
     {
        token:""
     }
     Return: JSON String
     ********************************************************/
  async verifyUser() {
    let _this = this;
    try {
      let user = await Students.findOne({
        verificationToken: _this.req.query.token,
      });
      if (_.isEmpty(user)) {
        return _this.res.send({ status: 0, message: i18n.__("INVALID_TOKEN") });
      }

      const decoded = await Globals.decodeUserVerificationToken(
        this.req.query.token
      );
      if (!decoded) {
        return _this.res.send({ status: 0, message: i18n.__("LINK_EXPIRED") });
      }

      const updateUser = await Students.findByIdAndUpdate(
        user._id,
        { emailVerificationStatus: true },
        { new: true }
      );
      if (_.isEmpty(updateUser)) {
        return _this.res.send({
          status: 0,
          message: i18n.__("USER_NOT_UPDATED"),
        });
      }
      return _this.res.send({ status: 1, message: i18n.__("USER_VERIFIED") });
    } catch (error) {
      console.log("error = ", error);
      return _this.res.send({ status: 0, message: i18n.__("SERVER_ERROR") });
    }
  }

  /********************************************************
     Purpose: Logout User
     Parameter:
     {}
     Return: JSON String
     ********************************************************/
  async logout() {
    try {
      const currentUser = this.req.currentUser ? this.req.currentUser : {};
      if (currentUser && currentUser._id) {
        let params = { token: null };
        let filter = { userId: currentUser._id };
        await Authentication.update(filter, { $set: params });
        this.res.send({ status: 1, message: i18n.__("LOGOUT_SUCCESS") });
      } else {
        return this.res.send({ status: 0, message: i18n.__("USER_NOT_EXIST") });
      }
    } catch (error) {
      console.log("error", error);
      this.res.send({ status: 0, message: error });
    }
  }

  /********************************************************
     Purpose: Refresh AccessToken
     Parameter:
     {}
     Return: JSON String
     ********************************************************/
  async refreshAccessToken() {
    try {
      if (!this.req.headers.refreshtoken) {
        return this.res.send({
          status: 0,
          message: i18n.__("SEND_PROPER_DATA"),
        });
      }
      let token = await new Globals().refreshAccessToken(
        this.req.headers.refreshtoken
      );
      return this.res.send(token);
    } catch (error) {
      console.log("error = ", error);
      this.res.send({ status: 0, message: i18n.__("SERVER_ERROR") });
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
  async fileUpload() {
    try {
      let form = new Form(this.req);
      let formObject = await form.parse();
      if (_.isEmpty(formObject.files)) {
        return this.res.send({
          status: 0,
          message: i18n.__("%s REQUIRED", "File"),
        });
      }
      const file = new File(formObject.files);
      let filePath = "";
      if (Config.s3upload && Config.s3upload == "true") {
        filePath = file.uploadFileOnS3(formObject.files.file[0]);
      } else {
        let fileObject = await file.store();
        /***** uncommit this line to do manipulations in image like compression and resizing ****/
        // let fileObject = await file.saveImage();
        filePath = fileObject.filePath;
      }
      this.res.send({ status: 1, data: { filePath } });
    } catch (error) {
      console.log("error- ", error);
      this.res.send({ status: 0, message: error });
    }
  }

  /********************************************************
    Purpose: social Access (both signUp and signIn)
    Parameter:
        {
            "socialId":"12343434234",
            "socialKey":"fbId"
            "mobile":"987654321",
            "email":"john@grr.la"
            "firstname":"john",
            "lastname":"deo",
            "username":"john123",
            "device":" ",
            "deviceToken":" "
        }
    Return: JSON String
    ********************************************************/
  async socialAccess() {
    let _this = this;
    try {
      /***** storing every details coming from request body ********/
      let details = _this.req.body;
      let socialKey = details.socialKey;

      /****** dynamic socialKey (socialKey may be fbId, googleId, twitterId, instagramId) ********/
      details[socialKey] = details.socialId;

      /***** checking whether we are getting proper socialKey or not ******/
      let checkingSocialKey = _.includes(
        ["fbId", "googleId", "twitterId", "instagramId"],
        details.socialKey
      );
      if (!checkingSocialKey) {
        return _this.res.send({
          status: 0,
          message: i18n.__("PROPER_SOCIALKEY"),
        });
      }
      /****** query for checking socialId is existing or not *********/
      let filter = { [socialKey]: _this.req.body.socialId };

      /**** checking user is existing or not *******/
      let user = await Students.findOne(filter, userProjection.user);

      /**** if user not exists with socialId *****/
      if (_.isEmpty(user)) {
        if (_this.req.body.email) {
          /******** checking whether user is already exists with email or not *******/
          let userDetails = await Students.findOne(
            { email: _this.req.body.email },
            userProjection.user
          );

          /****** If user not exists with above email *******/
          if (_.isEmpty(userDetails)) {
            /******** This is the signUp process for socialAccess with email *****/
            let newUser = await this.createSocialUser(details);
            return _this.res.send(newUser);
          } else {
            /**** social access code *****/
            let updatedUser = await this.checkingSocialIdAndUpdate(
              userDetails,
              details
            );
            return _this.res.send(updatedUser);
          }
        } else {
          /******** This is the signUp process for socialAccess without email *****/
          let newUser = await this.createSocialUser(details);
          return _this.res.send(newUser);
        }
      } else {
        /****** if user exists with socialId ******/
        if (_this.req.body.email) {
          /******** to check whether is already exists with email or not *******/
          let userDetails = await Students.findOne({
            email: _this.req.body.email,
          });
          /****** If user not exists with above email *******/

          if (_.isEmpty(userDetails)) {
            /****** updating details in existing user with socialId details *****/
            let updatedUser = await this.updateSocialUserDetails(details);
            return _this.res.send(updatedUser);
          } else {
            /**** social access code *****/
            let updatedUser = await this.checkingSocialIdAndUpdate(
              userDetails,
              details
            );
            return _this.res.send(updatedUser);
          }
        } else {
          /****** updating details in existing user with email details ********/
          let updatedUser = await this.updateSocialUserDetails(details);
          return _this.res.send(updatedUser);
        }
      }
    } catch (error) {
      console.log(error);
      _this.res.send({ status: 0, message: error });
    }
  }

  /******** Create Students through socialIds ******/
  createSocialUser(details) {
    return new Promise(async (resolve, reject) => {
      try {
        let newUser = await new Model(Students).store(details);
        if (Config.useRefreshToken && Config.useRefreshToken == "true") {
          let { token, refreshToken } =
            await new Globals().getTokenWithRefreshToken({ id: newUser._id });
          resolve({
            status: 1,
            message: i18n.__("LOGIN_SUCCESS"),
            access_token: token,
            refreshToken: refreshToken,
            data: newUser,
          });
        } else {
          let token = await new Globals().getToken({ id: newUser._id });
          resolve({
            status: 1,
            message: i18n.__("LOGIN_SUCCESS"),
            access_token: token,
            data: newUser,
          });
        }
      } catch (error) {
        reject(error);
      }
    });
  }

  /******** Create Students through socialIds ******/
  updateSocialUserDetails(details) {
    return new Promise(async (resolve, reject) => {
      try {
        let updatedUser = await Students.findOneAndUpdate(
          { [details.socialKey]: details.socialId },
          details,
          { upsert: true, new: true }
        ).select(userProjection.user);
        if (Config.useRefreshToken && Config.useRefreshToken == "true") {
          let { token, refreshToken } =
            await new Globals().getTokenWithRefreshToken({
              id: updatedUser._id,
            });
          resolve({
            status: 1,
            message: i18n.__("LOGIN_SUCCESS"),
            access_token: token,
            refreshToken: refreshToken,
            data: updatedUser,
          });
        } else {
          let token = await new Globals().getToken({ id: updatedUser._id });
          resolve({
            status: 1,
            message: i18n.__("LOGIN_SUCCESS"),
            access_token: token,
            data: updatedUser,
          });
        }
      } catch (error) {
        reject(error);
      }
    });
  }

  /******** Create Students through socialIds ******/
  checkingSocialIdAndUpdate(userDetails, details) {
    return new Promise(async (resolve, reject) => {
      try {
        if (
          userDetails[details.socialKey] &&
          userDetails[details.socialKey] !== details.socialId
        ) {
          resolve({
            status: 0,
            message: i18n.__("LINK_WITH_ANOTHER_SOCIAL_ACCOUNT"),
          });
        }
        /****** updating details in existing user with email details ********/
        let updatedUser = await Students.findOneAndUpdate(
          { email: details.email },
          details,
          { upsert: true, new: true }
        ).select(userProjection.user);
        if (Config.useRefreshToken && Config.useRefreshToken == "true") {
          let { token, refreshToken } =
            await new Globals().getTokenWithRefreshToken({
              id: updatedUser._id,
            });
          resolve({
            status: 1,
            message: i18n.__("LOGIN_SUCCESS"),
            access_token: token,
            refreshToken: refreshToken,
            data: updatedUser,
          });
        } else {
          let token = await new Globals().getToken({ id: updatedUser._id });
          resolve({
            status: 1,
            message: i18n.__("LOGIN_SUCCESS"),
            access_token: token,
            data: updatedUser,
          });
        }
      } catch (error) {
        reject(error);
      }
    });
  }

  async assignCourse({ email, code, isbn }) {
    return new Promise(async (resolve, reject) => {
      try {
        const payload = {
          schoolCode: code,
          productCode: [isbn],
        };
        const res = await axios.post(
          `${Config.magicbox_host}/services//license/v1.0/poListBySchoolAndProducts/?token=${Config.magicbox_api_token}`,
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
          `${Config.magicbox_host}/services//license/v1.0/consumelicense?token=${Config.magicbox_api_token}`,
          qPayload
        );
        resolve(1);
      } catch (e) {
        console.log("error while assigning course to student", e);
        resolve(0);
      }
    });
  }

  async addCourse() {
    try {
      let userId = this.req.currentUser ? this.req.currentUser._id : "";
      let user = this.req.currentUser ? this.req.currentUser : {};
      let data = this.req.body;
      let code = "IDPCENTRE";
      //confirm that course is purchased or not
      let assignStatus = await this.assignCourse({
        email: user.email,
        code,
        isbn: data.isbn,
      });
      if (assignStatus) {
        return this.res.send({
          status: 1,
          message: "Course assigned successfully.",
        });
      } else {
        return this.res.send({
          status: 0,
          message: "Course assignment failed.",
        });
      }
    } catch (e) {
      console.log("error in assignign course", e);
      return this.res.send({
        status: 0,
        message: "Course assignment failed.",
      });
    }
  }
  async createIntent() {
    try {
      let products=[]
      let user = this.req.currentUser ? this.req.currentUser : {};
      let data = this.req.body;
      let result = [];
      let pdf  ;
      let finaliseInvoice ={};
      let {publishableKey , clientSecret} = await Admin.findOne();
      let client = {
        publishableKey:publishableKey,
        secretKey:clientSecret,
      };
      // let coupon ;
      //create payment intent
      data.currency = "INR";
      let paymentIntent = await new StripeService().createPaymentIntent(data);
      if(paymentIntent && paymentIntent.status){
        const customer = this.req.currentUser;
        //get products 
        const courseIds = data.courseDetails.map(courseDetail => courseDetail.courseId);


        let discountCoupon = await DiscountCoupon.findOne({
          isDeleted: false,
          discountCode: data.coupon,
          // startsAt: { $lte: new Date() }, // Check if the coupon starts before or at the current date and time
          // endsAt: { $gte: new Date() } // Check if the coupon ends on or after the current date and time
        }).lean();

        // console.log(discountCoupon,1498);
        let courses = await CourseSchema.find({ _id: { $in: courseIds } }).lean();
        for(let i=0 ; i<courses.length;i++){

          //discount flow left
          products.push({
            name: courses[i].title,
            qty: 1,//buying only once allowed because its course
            price: courses[i].price,
          })
        }      //invoice creation flow
        const invoiceData = {
          creationDate: new Date(),
          // invoiceNumber: "18R1",
          customerDetails: {
            name: customer.firstName + " " + customer.lastName,
            email: customer.email,
            phone: customer.phone,
          },
          sellerDetails: {
            name: Config.COMPANY_NAME ? Config.COMPANY_NAME : "Cambridge University Press & Assessment India Pvt Ltd.",
            address: Config.COMPANY_ADDRESS ? Config.COMPANY_ADDRESS :"Splendor Forum Jasola",
            CIN: Config.COMPANY_CIN ? Config.COMPANY_CIN :"U22122DL2004PTC124758",
            logo: Config.COMPANY_LOGO_URL ? Config.COMPANY_LOGO_URL :"https://d3h4xx6ax0fekr.cloudfront.net/ZKQN5",
            city: Config.COMPANY_CITY ? Config.COMPANY_CITY :"New Delhi",
            state: Config.COMPANY_STATE ? Config.COMPANY_STATE :"Delhi",
            country:Config.COMPANY_COUNTRY ? Config.COMPANY_COUNTRY : "India",
            contactNumber:Config.COMPANY_CONTACT_NUMBER ? Config.COMPANY_CONTACT_NUMBER : "9156254896",
            email:Config.COMPANY_EMAIL ? Config.COMPANY_EMAIL : "support@cambridgeconnect.org",
            GST: Config.COMPANY_GST ? Config.COMPANY_GST :"07AAGFF2194N1Z1",
          },
          products: products,
          discount: (discountCoupon && discountCoupon.discountPercentage) ? discountCoupon.discountPercentage : 0,
          sgst: Config.sgstrate ? Config.sgstrate : 9 ,
          cgst: Config.cgst ? Config.cgst : 9 ,
        };
        const invoiceLink = await this.invoice.generateInvoice(invoiceData);

        // console.log(1545,invoiceLink);
        const response = {
          status: 1,
          message: "SUCCESS",
          data: {
            clientSecret: paymentIntent.data.client_secret, // Add the value of paymentIntent.data.client_secret here
            client:client,
            pdfUrl: invoiceLink
          }
        };
        return this.res.send(response)
       }
      else{
        return this.res.send({status:0 , message:"Intent creation failed"})
      }
      } 
      
    catch (e) {
      console.log("error in stripe intent creation", e);
      return this.res.send({
        status: 0,
        message: "Payment intiation failed.",
      });
    }
  }

  invoiceData (){
    return {
      creationDate: new Date(),
      // invoiceNumber: "18R1",
      customerDetails: {
        name: customer.firstName + customer.lastName,
        email: customer.email,
        phone: customer.phone,
      },
      sellerDetails: {
        name: Config.COMPANY_NAME ? Config.COMPANY_NAME : "Cambridge University Press & Assessment India Pvt Ltd.",
        address: Config.COMPANY_ADDRESS ? Config.COMPANY_ADDRESS :"Splendor Forum Jasola",
        CIN: Config.COMPANY_CIN ? Config.COMPANY_CIN :"U22122DL2004PTC124758",
        logo: Config.COMPANY_LOGO_URL ? Config.COMPANY_LOGO_URL :"https://d3h4xx6ax0fekr.cloudfront.net/ZKQN5",
        city: Config.COMPANY_CITY ? Config.COMPANY_CITY :"New Delhi",
        state: Config.COMPANY_STATE ? Config.COMPANY_STATE :"Delhi",
        country:Config.COMPANY_COUNTRY ? Config.COMPANY_COUNTRY : "India",
        contactNumber:Config.COMPANY_CONTACT_NUMBER ? Config.COMPANY_CONTACT_NUMBER : "9156254896",
        email:Config.COMPANY_EMAIL ? Config.COMPANY_EMAIL : "support@cambridgeconnect.org",
        GST: Config.COMPANY_GST ? Config.COMPANY_GST :"07AAGFF2194N1Z1",
      },
      products: products,
      discount: (discountCoupon && discountCoupon.discountPercentage) ? discountCoupon.discountPercentage : 0,
      sgst: Config.sgstrate ? Config.sgstrate : 9 ,
      cgst: Config.cgst ? Config.cgst : 9 ,
    }
  }

  async validateDiscountCoupon(){
    try {
      const { discountCode } = this.req.body;
      if(!discountCode){
        return this.res.send({status:0, error:"Please send discount code"})
      }
      // Check if the discount code exists
      const coupon = await DiscountCoupon.findOne({ discountCode });
      if (!coupon) {
        return this.res.json({ status:0,valid: false, message: 'Invalid discount code' });
      }
  
      // Check if the coupon is active
      if (!coupon.status) {
        return this.res.json({ status:0,valid: false, message: 'Coupon is not active' });
      }
  
      // Check if the coupon is within the valid date range
      const currentDate = new Date();
      if (currentDate < coupon.startAt || currentDate > coupon.endsAt) {
        return this.res.json({ status:0,valid: false, message: 'Coupon is not valid at this time' });
      }
  
      // Return the discount percentage
      return this.res.json({ status:1,valid: true, discountPercentage: coupon.discountPercentage });
    } catch (error) {
      console.error(error);
      return this.res.status(500).json({ status:0,error: 'Internal server error' });
    }
  }


  async getEnrolledCoursesOfStudent() {
    try {
      if(!this.req.body.studentId){
        return this.res.status(500).json({ status: 0, message: 'studentId missing' });
      }
      const enrollmentHistory = await CoursePurchases.find({ studentId: this.req.body.studentId })
        .populate("courseId")
        .lean();
  
      const data = enrollmentHistory
        .filter(enrollment => enrollment.courseId) // Filter out any entries without courseId
        .map(enrollment => ({
          ...enrollment.courseId,
          purchasedAt: enrollment.createdAt,
          soldPrice: enrollment.price

        }));
  
      return this.res.send({ status: 1, data });
    } catch (error) {
      console.error(error);
      return this.res.status(500).json({ status: 0, error: 'Internal server error' });
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
        _id: body.productId,
      }).lean();
      let { productId, ...data } = body;
      data.description = productInfo?.description;
      data.metadata = {
        productId: productInfo?.productId,
        isbnNumber: productInfo?.isbnNumber,
        price: productInfo?.price,
        moduleType: productInfo?.moduleType,
        group: productInfo?.group,
      };
      // data.images = [productInfo?.picture];
      data.name = productInfo.title;
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
module.exports = StudentsController;
