/****************************
 Validators
 ****************************/
 const _ = require("lodash");
 let i18n = require("i18n");
 const { validationResult } = require('express-validator');
 const { check } = require('express-validator');
 
 var commonlyUsedPasswords = require('../../../configs/commonlyUsedPassword').passwords;
 
 class Validators {
 
     /********************************************************
      Purpose:Function for login validator
      Parameter:
      {}
      Return: JSON String
      ********************************************************/
     static loginValidator() {
         try {
             return [
                 ...this.emailValidator(),
                 ...this.passwordValidator({ key: 'password' })
             ];
         } catch (error) {
             throw new Error(error);
         }
     }
     /********************************************************
      Purpose:Function for reset password validator
      Parameter:
      {}
      Return: JSON String
      ********************************************************/
     static resetPasswordValidator() {
         try {
             return [
                 check('token').exists().withMessage(i18n.__("%s REQUIRED", 'Token')),
                 ...this.passwordValidator({ key: 'password' })
             ];
         } catch (error) {
             return error;
         }
     }
     static purchaseHistoryValidator() {
         try {
             return [
                 check('pageNumber').exists().isNumeric().withMessage(i18n.__("%s REQUIRED", 'pageNumber')),
                 check('pageSize').isNumeric().exists().withMessage(i18n.__("%s REQUIRED", 'pageSize'))
             ];
         } catch (error) {
             return error;
         }
     }
     static getVoucherValidator() {
         try {console.log("getVoucherValidator");
             return [
                 check('pageNumber').exists().isNumeric().withMessage(i18n.__("%s REQUIRED", 'pageNumber')),
                 check('pageSize').isNumeric().exists().withMessage(i18n.__("%s REQUIRED", 'pageSize'))
             ];
         } catch (error) {
             return error;
         }
     }
     static createGroupValidator() {
         try {
             return [
                 check('title').exists().isString().withMessage(i18n.__("%s REQUIRED", 'title'))
                 // check('description').isString().exists().withMessage(i18n.__("%s REQUIRED", 'description'))
             ];
         } catch (error) {
             return error;
         }
     }
     static createDiscountGroupValidator() {
         try {
             return [
                 check('discountCode').exists().isString().withMessage(i18n.__("%s REQUIRED", 'discountCode')),
                 check('startAt').exists().isString().withMessage(i18n.__("%s REQUIRED", 'startAt')),
                 check('endsAt').exists().isString().withMessage(i18n.__("%s REQUIRED", 'endsAt')),
                 check('discountPercentage').exists().isNumeric().withMessage(i18n.__("%s REQUIRED", 'discountPercentage')),
                 check('isValidForAll').exists().isBoolean().withMessage(i18n.__("%s REQUIRED", 'isValidForAll')),
                 // check('courseId').exists().isString().withMessage(i18n.__("%s REQUIRED", 'courseId')),
 
                 // check('maximumDiscount').exists().isNumeric().withMessage(i18n.__("%s REQUIRED", 'maximumDiscount')),
 
             ];
         } catch (error) {
             return error;
         }
     }
     static getGroupByIdValidator() {
         try {
             return [
                 check('groupId').exists().isString().withMessage(i18n.__("%s REQUIRED", 'GROUP_ID_REUQUIRE'))
             ];
         } catch (error) {
             return error;
         }
     }
     static getDiscountGroupByIdValidator() {
         try {
             return [
                 check('id').exists().isString().withMessage(i18n.__("%s REQUIRED", 'id'))
             ];
         } catch (error) {
             return error;
         }
     }
     /********************************************************
      Purpose:Function for password validator
      Parameter:
      {}
      Return: JSON String
      ********************************************************/
     static passwordValidator(keyObj = { key: 'password' }) {
         try {
             return [
                 check(keyObj.key)
                     .not().isIn(commonlyUsedPasswords).withMessage(i18n.__("COMMONLY_USED_PASSWORD"))
                     .isLength({ min: 8 }).withMessage(i18n.__("PASSWORD_VALIDATION_LENGTH"))
                     .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d].*/).withMessage(i18n.__("PASSWORD_VALIDATION"))
             ];
         } catch (error) {
             return error;
         }
     }
     /********************************************************
      Purpose:Function for email validator
      Parameter:
      {}
      Return: JSON String
      ********************************************************/
     static emailValidator() {
         try {
             return [check('emailId').isEmail().withMessage(i18n.__("VALID_EMAIL"))];
         } catch (error) {
             return error;
         }
     }
     static getValidator() {
         try {
             return [
                 check('pageNumber').exists().isNumeric().withMessage(i18n.__("%s REQUIRED", 'pageNumber')),
                 check('pageSize').isNumeric().exists().withMessage(i18n.__("%s REQUIRED", 'pageSize'))
             ];
         } catch (error) {
             return error;
         }
     }
     static idValidator() {
         try {
             return [
                 check('testType').exists().withMessage(i18n.__("%s REQUIRED", 'testType'))
             ];
         } catch (error) {
             return error;
         }
     }
     /********************************************************
      Purpose: Function for change password validator
      Parameter:
      {}
      Return: JSON String
      ********************************************************/
     static changePasswordValidator() {
         try {
             return [
                 check('oldPassword').exists().withMessage(i18n.__("%s REQUIRED", 'Current password')),
                 ...this.passwordValidator({ key: 'newPassword' })
             ];
         } catch (error) {
             return error;
         }
     }
     /********************************************************
      Purpose:Function for update user validator
      Parameter:
      {}
      Return: JSON String
      ********************************************************/
     static updateAdminValidator() {
         try {
             return [
                 check('firstname').exists().withMessage(i18n.__("%s REQUIRED", 'Firstname')),
                 check('lastname').exists().withMessage(i18n.__("%s REQUIRED", 'Lastname')),
                 check('mobile').exists().withMessage(i18n.__("%s REQUIRED", 'username'))
             ];
         } catch (error) {
             return error;
         }
     }
     static validate(req, res, next) {
         try {
             const errors = validationResult(req);
             if (!errors.isEmpty()) {
                 return res.status(422).json({ status: 0, message: errors.array() });
             }
             next();
         } catch (error) {
             return res.send({ status: 0, message: error });
         }
     }
 }
 
 module.exports = Validators;
 