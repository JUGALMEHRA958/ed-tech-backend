/****************************
 Validators
 ****************************/
 const _ = require("lodash");
 let i18n = require("i18n");
 const { validationResult } = require('express-validator');
 const { body, check, query, header, param } = require('express-validator');
 
 class Validators {
 

    static addCourseValidator() {
        try {
            return [
                check('title').exists().withMessage(i18n.__("%s REQUIRED", 'title')),
                check('productId').exists().withMessage(i18n.__("%s REQUIRED", 'productId')),
                check('idpNumber').exists().withMessage(i18n.__("%s REQUIRED", 'idpNumber')),
                check('picture').exists().withMessage(i18n.__("%s REQUIRED", 'picture')),
                check('category').exists().withMessage(i18n.__("%s REQUIRED", 'category')),
                check('price').exists().withMessage(i18n.__("%s REQUIRED", 'price')),
                check('type').exists().withMessage(i18n.__("%s REQUIRED", 'type')),
                check('description').exists().withMessage(i18n.__("%s REQUIRED", 'description')),
                check('moduleType').exists().withMessage(i18n.__("%s REQUIRED", 'moduleType')),


            ];
        } catch (error) {
            return error;
        }
    }

    static getCourseValidatior() {
        try {
            return [
                check('pageNumber').exists().withMessage(i18n.__("%s REQUIRED", 'pageNumber')),
                check('pageSize').exists().withMessage(i18n.__("%s REQUIRED", 'pageSize'))


            ];
        } catch (error) {
            return error;
        }
    }

    static getCategoryWiseValidator() {
        try {
            return [
                check('type').exists().withMessage(i18n.__("%s REQUIRED", 'type'))

            ];
        } catch (error) {
            return error;
        }
    }

    static editdeleteCourseValidator() {
        try {
            return [
                check('id').exists().withMessage(i18n.__("%s REQUIRED", 'id'))

            ];
        } catch (error) {
            return error;
        }
    }

    static purchaseValidator() {
        try {
            return [
                check('courseId').exists().withMessage(i18n.__("%s REQUIRED", 'courseId'))

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