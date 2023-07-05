module.exports = (app, express) => {
  const router = express.Router();

  const Globals = require("../../../configs/Globals");
  const StudentsController = require("../Students/Controller");
  const config = require("../../../configs/configs");
  const Validators = require("./Validator");

  router.post(
    "/students/register",
    Validators.userSignupValidator(),
    Validators.validate,
    (req, res, next) => {
      const userObj = new StudentsController().boot(req, res);
      return userObj.register();
    }
  );

  router.post(
    "/students/login",
    Validators.loginValidator(),
    Validators.validate,
    (req, res, next) => {
      const userObj = new StudentsController().boot(req, res);
      return userObj.login();
    }
  );

  router.post(
    "/students/nmRegister",
    Validators.userSignupValidator(),
    Validators.validate,
    (req, res, next) => {
      const userObj = new StudentsController().boot(req, res);
      return userObj.nmRegister();
    }
  );
  //exporting students exportStudents()
  router.get("/students/export", (req, res, next) => {
    const userObj = new StudentsController().boot(req, res);
    return userObj.exportStudents();
  });
  // sso login for NM portal
  router.get("/students/ssoLogin", Globals.isAuthorised, (req, res, next) => {
    const userObj = new StudentsController().boot(req, res);
    return userObj.ssoLogin();
  });

  //magic-student validation and re-register if no data found
  router.get("/students/magicStudentCheck", (req, res, next) => {
    const userObj = new StudentsController().boot(req, res);
    return userObj.validateMagicStudent();
  });

  // validate toke from magixbox call
  router.get("/students/ssoValidate", (req, res, next) => {
    const userObj = new StudentsController().boot(req, res);
    return userObj.ssoValidate();
  });

  router.post(
    "/students/forgotPassword",
    Validators.emailValidator(),
    Validators.validate,
    (req, res, next) => {
      const userObj = new StudentsController().boot(req, res);
      return userObj.forgotPasswordMail();
    }
  );

  router.post(
    "/students/resetPassword",
    Validators.resetPasswordValidator(),
    Validators.validate,
    (req, res, next) => {
      const userObj = new StudentsController().boot(req, res);
      return userObj.resetPassword();
    }
  );

  router.post(
    "/students/changePassword",
    Globals.isAuthorised,
    Validators.changePasswordValidator(),
    Validators.validate,
    (req, res, next) => {
      const userObj = new StudentsController().boot(req, res);
      return userObj.changePassword();
    }
  );

  // router.post('/users/updateUserProfile', Globals.isAuthorised, Validators.updateUserValidator(), Validators.validate, (req, res, next) => {
  //     const userObj = (new StudentsController()).boot(req, res);
  //     return userObj.editUserProfile();
  // });

  // router.get('/users/profile', Globals.isAuthorised, (req, res, next) => {
  //     const userObj = (new StudentsController()).boot(req, res);
  //     return userObj.userProfile();
  // });

  router.get(
    "/students/verifyUser",
    Validators.verifyUserValidator(),
    Validators.validate,
    (req, res, next) => {
      const userObj = new StudentsController().boot(req, res);
      return userObj.verifyUser();
    }
  );

  router.get("/students/logout", Globals.isAuthorised, (req, res, next) => {
    const userObj = new StudentsController().boot(req, res);
    return userObj.logout();
  });

  router.get("/users/refreshAccessToken", Globals.isValid, (req, res, next) => {
    const userObj = new StudentsController().boot(req, res);
    return userObj.refreshAccessToken();
  });

  // router.post('/users/fileUpload', Globals.isAuthorised, (req, res, next) => {
  //     const userObj = (new StudentsController()).boot(req, res);
  //     return userObj.fileUpload();
  // });

  // router.post('/users/socialAccess', Validators.socialAccessValidator(), Validators.validate, (req, res, next) => {
  //     const userObj = (new StudentsController()).boot(req, res);
  //     return userObj.socialAccess();
  // });
  // validate toke from magixbox call
  router.post(
    "/students/assignCourse",
    Globals.isAuthorised,
    (req, res, next) => {
      const userObj = new StudentsController().boot(req, res);
      return userObj.addCourse();
    }
  );

  router.post(
    "/students/createPaymentIntent",
    Globals.isAuthorised,
    (req, res, next) => {
      const userObj = new StudentsController().boot(req, res);
      return userObj.createIntent();
    }
  );

  router.post(
    "/students/validateDiscountCoupon",
    Globals.isAuthorised,
    (req, res, next) => {
      const userObj = new StudentsController().boot(req, res);
      return userObj.validateDiscountCoupon();
    }
  );

  router.post(
    "/students/getEnrolledCoursesOfStudent",
    Validators.getEnrolledCoursesOfStudentValidator(),
    Globals.isAdminAuthorised(),
    (req, res, next) => {
      const userObj = new StudentsController().boot(req, res);
      return userObj.getEnrolledCoursesOfStudent();
    }
  );

  app.use(config.baseApiUrl, router);
};
