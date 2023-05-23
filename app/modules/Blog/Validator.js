/****************************
 Validators
 ****************************/
const _ = require("lodash");
let i18n = require("i18n");
const { validationResult } = require('express-validator');
const { body, check, query, header, param } = require('express-validator');

class Validators {

    /********************************************************
     Purpose:Function for blog validator
     Parameter:
     {}
     Return: JSON String
     ********************************************************/
    static blogValidator() {
        try {
            return [
                check('blogTitle').exists().withMessage(i18n.__("%s REQUIRED", 'Blog title')),
                check('blogContent').exists().withMessage(i18n.__("%s REQUIRED", 'Blog content')),
                check('blogCategory').exists().withMessage(i18n.__("%s REQUIRED", 'Blog category'))
            ];
        } catch (error) {
            return error;
        }
    }
    /********************************************************
     Purpose:Function for listing validator
     Parameter:
     {}
     Return: JSON String
     ********************************************************/
    static listingValidator() {
        try {
            return [
                check('page').isNumeric().withMessage(i18n.__("%s REQUIRED", 'Page')),
                check('pagesize').isNumeric().withMessage(i18n.__("%s REQUIRED", 'Pagesize'))
            ];
        } catch (error) {
            return error;
        }
    }
    /********************************************************
     Purpose:Function for listing validator
     Parameter:
     {}
     Return: JSON String
     ********************************************************/
    static getColumnValidator() {
        try {
            return [
                check('page').isNumeric().withMessage(i18n.__("%s REQUIRED", 'Page')),
                check('pagesize').isNumeric().withMessage(i18n.__("%s REQUIRED", 'Pagesize')),
                check('column').exists().withMessage(i18n.__("%s REQUIRED", 'Column'))
            ];
        } catch (error) {
            return error;
        }
    }
    /********************************************************
     Purpose:Function for listing validator
     Parameter:
     {}
     Return: JSON String
     ********************************************************/
    static saveColumnValidator() {
        try {
            return [
                check('columns').isArray().withMessage(i18n.__("%s ARRAY", 'Columns')),
                check('columns').isLength({ min: 1 }).withMessage(i18n.__("%s ARRAY_LENGTH", 'Columns'))
            ];
        } catch (error) {
            return error;
        }
    }
    /********************************************************
     Purpose:Function for detail validator
     Parameter:
     {}
     Return: JSON String
     ********************************************************/
    static detailValidator() {
        try {
            return [
                param('blogId').exists().withMessage(i18n.__("%s REQUIRED", 'Blog Id')),
                param('blogId').not().equals('undefined').withMessage(i18n.__("%s REQUIRED", 'Valid ' + 'Blog Id')),
                param('blogId').not().equals('null').withMessage(i18n.__("%s REQUIRED", 'Valid ' + 'Blog Id')),
                param('blogId').isAlphanumeric().withMessage(i18n.__("%s REQUIRED", 'Valid ' + 'Blog Id')),
                param('blogId').not().isEmpty().withMessage(i18n.__("%s REQUIRED", 'Valid ' + 'Blog Id'))
            ];
        } catch (error) {
            return error;
        }
    }
    /********************************************************
     Purpose:Function for delete validator
     Parameter:
     {}
     Return: JSON String
     ********************************************************/
    static deleteValidator() {
        try {
            return [
                check('ids').isArray().withMessage(i18n.__("%s ARRAY", 'Blog ids')),
                check('ids').isLength({ min: 1 }).withMessage(i18n.__("%s ARRAY_LENGTH", 'Blog ids'))
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