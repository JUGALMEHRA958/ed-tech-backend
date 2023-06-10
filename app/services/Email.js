/****************************
 EMAIL HANDLING OPERATIONS
 ****************************/
 let nodemailer = require('nodemailer');
 const Mustache = require('mustache');
 
 const config = require("../../configs/configs");
 const EmailTemplate = require('../modules/EmailTemplate/Schema').EmailTemplate;
 const EmailSettings = require('../modules/Settings/Schema').EmailSettings;
 const DefaultSettings = require('../modules/Settings/Schema').SettingsSchema;
 
 let smtpTransport = nodemailer.createTransport({
     // host: "smtpout.secureserver.net",
     // port: 465,
     // host: "smtp.gmail.com",
     // port: 587,
     // secureConnection: true,
     // auth: {
     //   // user: "support@cambridgeconnect.org",
     //   // pass: "Cambridge@123",
     //   // user: "kuljeet.kaur@indianic.com",
     //   // pass: "India@12",
     //   user: "ampm.profile@indianic.com",
     //   pass: "Indianic@123",
     // },
     // debug: true,
     pool: true,
     host: config.emailHost,
     port: config.emailPort ? config.emailPort : 587, //587
     secure: false, // use TLS,
     auth: {
       user: config.defaultEmailId,
       pass: "tlrapxuynjuboqiy" ,
     },
     //debug: true
    //  tls: {
    //    rejectUnauthorized: false,
    //    ciphers: "SSLv3",
    //  },
   });
 
 // const smtpTransport = nodemailer.createTransport({
 //     host: 'smtp.mail.yahoo.com',
 //     port: 587,
 //     secure: false, // Set to false to use STARTTLS
 //     requireTLS: true, // Enable TLS
 //     auth: {
 //       user: "testcambridge1@yahoo.com",
 //       pass: "jigarjani@12"
 //     }
 //   });
 
 class Email {
 
     send(mailOption) {
         return new Promise(async (resolve, reject) => {
             smtpTransport.sendMail(mailOption, (err, result) => {
                 if (err) {
                     console.log("er =", err);
                     return reject({ sattus: 0, message: err });
                 }
                 return resolve(result);
             });
         });
     }
 
     sendMail(mailData) {
         return new Promise(async (resolve, reject) => {
             try {
                 let emailTemplate = await EmailTemplate.findOne({ emailKey: mailData['emailKey'] });
                 if (emailTemplate) {
                     await DefaultSettings.findOne().select({ defaultFromEmail: 1, defaultAdminEmail: 1 });
                     await EmailSettings.findOne({ emailTemplateId: emailTemplate._id });
                     let mailOptions = {
                         from: config.defaultEmailId,
                         to: mailData.emailId ? mailData.emailId : [],
                         subject: emailTemplate.subject ? emailTemplate.subject : "Subject",
                         html: Mustache.render(emailTemplate.emailContent, mailData.replaceDataObj)
                     }
                     console.log('mailOptions', mailOptions);
                     const result = await new Email().send(mailOptions);
                     return resolve(result);
                 } else {
                     return resolve({ status: 0, message: "Template not found." })
                 }
             } catch (error) {
                 return reject(error);
             }
         });
     }
 
     verifySmtp() {
         // verify connection configuration
         smtpTransport.verify(function (error, success) {
             if (error) {
                 console.log(error);
             } else {
                 console.log('Server is ready to take our messages');
             }
         });
 
     }
 }
 
 module.exports = Email;