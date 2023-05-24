/****************************
 Validators
 ****************************/
 const _ = require("lodash");
 let i18n = require("i18n");
 const { validationResult } = require('express-validator');
 const { body, check, query, header, param } = require('express-validator');
 
 class Validators {
 
    
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