/****************************
 Validators
 ****************************/
const _ = require("lodash");
let i18n = require("i18n");
const { validationResult } = require('express-validator');
const { body, check, query, header, param } = require('express-validator');

class Validators {

    /********************************************************
     Purpose: Function for cms validator
     Parameter:
     {}
     Return: JSON String
     ********************************************************/
    static cmsValidator() {
        try {
            return [
                check('pageTitle').exists().withMessage(i18n.__("%s REQUIRED", 'CMS page title')),
                check('description').exists().withMessage(i18n.__("%s REQUIRED", 'CMS description')),
                check('metaTitle').exists().withMessage(i18n.__("%s REQUIRED", 'CMS meta title')),
                check('metaDescription').exists().withMessage(i18n.__("%s REQUIRED", 'CMS meta description')),
                check('metaKeyword').exists().withMessage(i18n.__("%s REQUIRED", 'CMS meta keyword'))
            ];
        } catch (error) {
            return error;
        }
    }
    /********************************************************
     Purpose: Function for listing validator
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
     Purpose: Function for listing validator
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
     Purpose: Function for detail validator
     Parameter:
     {}
     Return: JSON String
     ********************************************************/
    static detailValidator() {
        try {
            return [
                param('cmsId').exists().withMessage(i18n.__("%s REQUIRED", 'CMS Id')),
                param('cmsId').not().equals('undefined').withMessage(i18n.__("%s REQUIRED", 'Valid ' + 'CMS Id')),
                param('cmsId').not().equals('null').withMessage(i18n.__("%s REQUIRED", 'Valid ' + 'CMS Id')),
                param('cmsId').isAlphanumeric().withMessage(i18n.__("%s REQUIRED", 'Valid ' + 'CMS Id')),
                param('cmsId').not().isEmpty().withMessage(i18n.__("%s REQUIRED", 'Valid ' + 'CMS Id'))
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
                check('ids').isArray().withMessage(i18n.__("%s ARRAY", 'CMS ids')),
                check('ids').isLength({ min: 1 }).withMessage(i18n.__("%s ARRAY_LENGTH", 'CMS ids'))
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