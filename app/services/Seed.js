/****************************
 SEED DATA
 ****************************/
 const _ = require("lodash");

 const EmailTemplate = require('../modules/EmailTemplate/Schema').EmailTemplate;
 const PermissionCategorysSchema = require('../modules/Roles/Schema').PermissionCategorysSchema;
 const PermissionsSchema = require('../modules/Roles/Schema').PermissionsSchema;
 const RolesSchema = require('../modules/Roles/Schema').RolesSchema;
 const Admin = require('../modules/Admin/Schema').Admin;
 const Model = require("../modules/Base/Model");
 const CommonService = require("./Common");
 
 class Seed {
 
     constructor() { }
 
     async seedData() {
         try {
             this.addEmailTemplate();
             this.addPermissionCategories();
             // this.addAdmin();
         } catch (error) {
             console.log('error', error);
         }
     }
     async addEmailTemplate() {
         try {
             let writeAndImproveSpecialMail = {
                 "emailTitle": "Write and improve special code",
                 'emailKey': "write_and_improve_special",
                 'subject': "Purchase confirmation Write and improve",
                 'emailContent':`<!DOCTYPE HTML PUBLIC "-//W3C//DTD XHTML 1.0 Transitional //EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
                 <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:v="urn:schemas-microsoft-com:vml" xmlns="http://www.w3.org/1999/xhtml">
                    <head>
                      
                       <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
                       <meta name="viewport" content="width=device-width, initial-scale=1.0">
                       <meta name="x-apple-disable-message-reformatting">
                 
                       <meta http-equiv="X-UA-Compatible" content="IE=edge">
                    
                       <title>Email Template</title>
                       <!-- End title -->
                       <!-- Start stylesheet -->
                       <style type="text/css">
                          a,a[href] {
                          color: #1b1b1b;
                          
                          }
                          a:hover{
                          text-decoration: none!important;
                          color: #7b7b7b;
                          }
                          .link {
                          text-decoration: underline!important;
                          }
                          p, p:visited {
                          font-size:15px;
                          line-height:24px;
                          font-family:'Helvetica', Arial, sans-serif;
                          text-decoration:none;
                          color: #2d2d2d;
                          }
                          h1 {
                          font-size:22px;
                          line-height:24px;
                          font-family:'Helvetica', Arial, sans-serif;
                          font-weight:normal;
                          text-decoration:none;
                          color: #5f5f5f;
                          }
                          ul{
                           list-style: auto;
                          }
                          li{
                           margin-bottom: 10px;
                           color: #272727;
                          }
                         
                       </style>
                    </head>
                    <body align="center" style="text-align: center; margin: 0; padding-top: 10px; padding-bottom: 10px; padding-left: 0; padding-right: 0; -webkit-text-size-adjust: 100%;background-color: #f2f4f6; color: #000000">
                     <div style="text-align: center; ;margin: 0 auto; max-width: 600px;width: 100%;">
                        <table align="center" style="text-align: center;vertical-align: top;width: 600px;max-width: 600px;background: #ffebc2;" width="100%">
                           <tbody>
                              <tr>
                                 <td style="width: 596px;vertical-align: top;padding-left: 0;padding-right: 0;padding-top: 15px;padding-bottom: 15px;background: #ffebc2;" width="596">
                                    <img style="width: 180px; max-width: 180px; height: 40px; max-height: 85px; text-align: center; color: #ffffff;" alt="Logo" src="https://d3h4xx6ax0fekr.cloudfront.net/ZKQN5" align="center" width="180" height="85">
                                 </td>
                              </tr>
                           </tbody>
                        </table>
                        <div style="background-color: #ffffff;">
                           <table align="center" style="text-align: center; vertical-align: top;  " width="100%">
                              <tbody>
                                 <tr>
                                    <td style="width: 596px; vertical-align: top; padding-left: 20px; padding-right: 20px; padding-top: 20px; padding-bottom: 30px;" width="596">
                                       <div style="color: #303030; font-size: 15px;">
                                          <span id="" style="font-family: 'Roboto', sans-serif;text-align: left;">
                                             <h1 style="color:#000000;"><span style="font-size: 16px;font-weight:600;background-color: transparent;  vertical-align: baseline; white-space-collapse: preserve;">Hello,</span></h1>
                                             <br>
                                             <p style="margin:0px;">Thank you for buying the Write & Improve pack! Here is your voucher code:<b>"{{{voucherCode}}}"</b></p>
                                             <p style="margin:0px;">Please follow these simple steps to access the product:</p>
                                             <ul>
                                                <li>Go to <a href="https://writeandimprove.com/" target="_self">https://writeandimprove.com </a></li>
                                                <li>Click on ‘Create profile’ on the top right-hand corner of the page</li>
                                                <li>Fill in the form with the required details including your email ID</li>
                                                <li>Click ‘Continue’</li>
                                                <li>You will receive an email to confirm your subscription</li>
                                                <li>Click on ‘Click here’ within the email and you will be taken to the workbook page</li>
                                                <li>After you have signed in, click on ‘+Test Zone’ in the menu on the left</li>
                                                <li>Click on the exam you want to practice for</li>
                                                <li>Then click on the blue ‘Subscribe’ button on the top of the screen</li>
                                                <li>Read all the information and click on ‘Subscribe to +Test Zone’</li>
                                                <li>Click on ‘Do you have a voucher code’</li>
                                                <li>Enter the voucher code in the box provided and click ‘Confirm’</li>
                                                <li>You will receive an email from Write &  Improve which tells you when your subscription</li>
                                                <li>Now you are ready to start practicing for your exam!</li>
                                             </ul>
                                             <p style="margin-top: 26px;"><span style="font-size: 16px;font-weight:600;background-color: transparent; font-variant-numeric: normal; font-variant-east-asian: normal; font-variant-alternates: normal; vertical-align: baseline; white-space-collapse: preserve;">Good luck with your IELTS Test Practice!</span></p>
                                             <p style="margin:0px;"><span style="font-size: 16px;font-weight:600;background-color: transparent; font-variant-numeric: normal; font-variant-east-asian: normal; font-variant-alternates: normal; vertical-align: baseline; white-space-collapse: preserve;"><a href="{{{pdfUrl}}}"target="_self" style="">Click here to download your invoice</a></span></p>
 
                                             <br>
                                          </span>
                                       </div>
                                    </td>
                                 </tr>
                              </tbody>
                           </table>
                        </div>
                        <table style="text-align: center;vertical-align: top;background: #ffebc2;" width="600">
                           <tbody>
                              <tr>
                                 <td style="width: 596px; vertical-align: top; padding-left: 30px; padding-right: 30px; padding-top: 30px; padding-bottom: 30px;" width="596">
                                    <p style="font-size: 15px;line-height: 15px;font-family: 'Helvetica', Arial, sans-serif;text-decoration: none;color: #5c5c5c;margin: 0px;font-weight: 600;">
                                       Cambridge University Press &amp; Assessment India Private Limited
                                    </p>
                                 </td>
                              </tr>
                           </tbody>
                        </table>
                     </div>
                  </body>
                 </html>`
             };
             let isKeyExistOfwriteAndImproveSpecialMail = await EmailTemplate.findOne({ emailKey: writeAndImproveSpecialMail['emailKey'] }).select({ "_id": 1 });
             if (!isKeyExistOfwriteAndImproveSpecialMail) {
                 // console.log("hrere");
                 await new Model(EmailTemplate).store(writeAndImproveSpecialMail);
             }
             let sendInvoiceMail = {
                 "emailTitle": "Invoice from cambridge connect",
                 'emailKey': "invoice_mail",
                 'subject': "Purchase confirmation",
                 'emailContent':`<!DOCTYPE HTML PUBLIC "-//W3C//DTD XHTML 1.0 Transitional //EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
                 <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:v="urn:schemas-microsoft-com:vml" xmlns="http://www.w3.org/1999/xhtml">
                    <head>
                      
                       <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
                       <meta name="viewport" content="width=device-width, initial-scale=1.0">
                       <meta name="x-apple-disable-message-reformatting">
                 
                       <meta http-equiv="X-UA-Compatible" content="IE=edge">
                    
                       <title>Email Template</title>
                       <!-- End title -->
                       <!-- Start stylesheet -->
                       <style type="text/css">
                          a,a[href] {
                          color: #1b1b1b;
                          
                          }
                          a:hover{
                          text-decoration: none!important;
                          color: #7b7b7b;
                          }
                          .link {
                          text-decoration: underline!important;
                          }
                          p, p:visited {
                          font-size:15px;
                          line-height:24px;
                          font-family:'Helvetica', Arial, sans-serif;
                          text-decoration:none;
                          color: #2d2d2d;
                          }
                          h1 {
                          font-size:22px;
                          line-height:24px;
                          font-family:'Helvetica', Arial, sans-serif;
                          font-weight:normal;
                          text-decoration:none;
                          color: #5f5f5f;
                          }
                          ul{
                           list-style: auto;
                          }
                          li{
                           margin-bottom: 10px;
                           color: #272727;
                          }
                         
                       </style>
                    </head>
                    <body align="center" style="text-align: center; margin: 0; padding-top: 10px; padding-bottom: 10px; padding-left: 0; padding-right: 0; -webkit-text-size-adjust: 100%;background-color: #f2f4f6; color: #000000">
                     <div style="text-align: center; ;margin: 0 auto; max-width: 600px;width: 100%;">
                        <table align="center" style="text-align: center;vertical-align: top;background: #ffebc2;" width="100%">
                           <tbody>
                              <tr>
                                 <td style="width: 596px;vertical-align: top;padding-left: 0;padding-right: 0;padding-top: 15px;padding-bottom: 15px;background: #ffebc2;" width="596">
                                    <img style="width: 180px; max-width: 180px; height: 40px; max-height: 85px; text-align: center; color: #ffffff;" alt="Logo" src="https://d3h4xx6ax0fekr.cloudfront.net/ZKQN5" align="center" width="180" height="85">
                                 </td>
                              </tr>
                           </tbody>
                        </table>
                        <div style=" background-color: #ffffff;">
                           <table align="center" style="text-align: center; vertical-align: top; " width="100%">
                              <tbody>
                                 <tr>
                                    <td style="width: 596px; vertical-align: top; padding-left: 20px; padding-right: 20px; padding-top: 20px; padding-bottom: 30px;" width="596">
                                       <div style="color: #303030; font-size: 15px;">
                                          <span id="" style="font-family: 'Roboto', sans-serif;text-align: left;">
                                             <h1 style="color:#000000;"><span style="font-size: 16px;font-weight:600;background-color: transparent;  vertical-align: baseline; white-space-collapse: preserve;">Hello,</span></h1>
                                             <br>
                                             <p style="margin:0px;">Thank you for buying this Cambridge resource for your IELTS preparation! Please follow these steps to access the same:</p>
                                             <ul>
                                                <li>Please login to ielts.cambridgeconnect.org with your registered credentials</li>
                                                <li>Go to the ‘Buy it’ section</li>
                                                <li>Click on the ‘START’ button against the product</li>
                                                <li>You will now be able to access the online component.</li>
                                             </ul>
                                             <p style="margin-top: 26px;"><span style="font-size: 16px;font-weight:600;background-color: transparent; font-variant-numeric: normal; font-variant-east-asian: normal; font-variant-alternates: normal; vertical-align: baseline; white-space-collapse: preserve;">Good luck with your IELTS Test Practice!</span></p>
                                             <p style="margin:0px;"><span style="font-size: 16px;font-weight:600;background-color: transparent; font-variant-numeric: normal; font-variant-east-asian: normal; font-variant-alternates: normal; vertical-align: baseline; white-space-collapse: preserve;"><a href="{{{pdfUrl}}}"target="_self" style="">Click here to download your invoice</a></span></p>
                                             <br>
                                             <p>Course name : {{{courseName}}}</p>
                                          </span>
                                       </div>
                                    </td>
                                 </tr>
                              </tbody>
                           </table>
                        </div>
                        <table style="text-align: center;vertical-align: top;background: #ffebc2;" width="600">
                           <tbody>
                              <tr>
                                 <td style="width: 596px; vertical-align: top; padding-left: 30px; padding-right: 30px; padding-top: 30px; padding-bottom: 30px;" width="596">
                                    <p style="font-size: 15px;line-height: 15px;font-family: 'Helvetica', Arial, sans-serif;text-decoration: none;color: #5c5c5c;margin: 0px;font-weight: 600;">
                                       Cambridge University Press &amp; Assessment India Private Limited
                                    </p>
                                 </td>
                              </tr>
                           </tbody>
                        </table>
                     </div>
                  </body>
                 </html>`
             };
             let isKeyExistOfsendInvoiceMail = await EmailTemplate.findOne({ emailKey: sendInvoiceMail['emailKey'] }).select({ "_id": 1 });
             if (!isKeyExistOfsendInvoiceMail) {
                 // console.log("hrere");
                 await new Model(EmailTemplate).store(sendInvoiceMail);
             }
             let registerMail = {
                 "emailTitle": "Signup mail",
                 'emailKey': "signup_mail",
                 'subject': "Welcome to IELTS Prep Programme",
                 'emailContent': "<p><span style=\"color: rgb(0,0,0);font-size: 13px;font-family: Arial;\">Hello {{{fullName}}},<br> <br> Thank you for registering. We hope our official Cambridge preparation material helps you reach your desired IELTS band score.<br><br>Happy learning!  <br>Cambridge University Press & Assessment</b></p>"
             };
             let isKeyExist = await EmailTemplate.findOne({ emailKey: registerMail['emailKey'] }).select({ "_id": 1 });
             if (!isKeyExist) {
                 await new Model(EmailTemplate).store(registerMail);
             }
             let otpMail = {
                 "emailTitle": "OTP mail",
                 'emailKey': "otp_mail",
                 'subject': "Cambridge Prep | OTP verification",
                 'emailContent': `<!DOCTYPE HTML PUBLIC "-//W3C//DTD XHTML 1.0 Transitional //EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
                 <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:v="urn:schemas-microsoft-com:vml" xmlns="http://www.w3.org/1999/xhtml">
                   <head>
                     <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
                     <meta name="viewport" content="width=device-width, initial-scale=1.0">
                     <meta name="x-apple-disable-message-reformatting">
                     <meta http-equiv="X-UA-Compatible" content="IE=edge">
                     <title>Email Template</title>
                     <!-- End title -->
                     <!-- Start stylesheet -->
                     <style type="text/css">
                       a,a[href] {
                         color: #1b1b1b;
                       }
                       a:hover{
                         text-decoration: none!important;
                         color: #7b7b7b;
                       }
                       .link {
                         text-decoration: underline!important;
                       }
                       p, p:visited {
                         font-size:15px;
                         line-height:24px;
                         font-family:'Helvetica', Arial, sans-serif;
                         text-decoration:none;
                         color: #2d2d2d;
                       }
                       h1 {
                         font-size:22px;
                         line-height:24px;
                         font-family:'Helvetica', Arial, sans-serif;
                         font-weight:normal;
                         text-decoration:none;
                         color: #5f5f5f;
                       }
                       ul{
                         list-style: auto;
                       }
                       li{
                         margin-bottom: 10px;
                         color: #272727;
                       }
                     </style>
                   </head>
                   <body style="text-align: left; margin: 0; padding-top: 10px; padding-bottom: 10px; padding-left: 0; padding-right: 0; -webkit-text-size-adjust: 100%;background-color: #f2f4f6; color: #000000">
                     <div style="text-align: left; ;margin: 0 auto; max-width: 600px;width: 100%;">
                       <table align="center" style="text-align: center;vertical-align: top;width: 600px;max-width: 600px;background: #ffebc2;" width="100%">
                         <tbody>
                           <tr>
                             <td style="width: 596px;vertical-align: top;padding-left: 0;padding-right: 0;padding-top: 15px;padding-bottom: 15px;background: #ffebc2;" width="596">
                               <img style="width: 180px; max-width: 180px; height: 40px; max-height: 85px; text-align: center; color: #ffffff;" alt="Logo" src="https://d3h4xx6ax0fekr.cloudfront.net/ZKQN5" align="center" width="180" height="85">
                             </td>
                           </tr>
                         </tbody>
                       </table>
                       <h5>Dear {{{name}}},</h5>
                       <p>Please verify your Cambridge Prep account using OTP {{{otp}}}</p>
                       <p>Thanks</p>
                       <p style="font-size: 15px;line-height: 15px;font-family: 'Helvetica', Arial, sans-serif;text-decoration: none;color: #5c5c5c;margin: 0px;font-weight: 600;">
                         Cambridge University Press & Assessment India Private Limited
                       </p><br><br><br><br>
                     </div>
                                          <table align="center" style="text-align: center;vertical-align: top;width: 600px;max-width: 600px;background: #ffebc2;" width="100%">
                                           <tbody>
                                              <tr>
                                                 <td style="width: 596px; vertical-align: top; padding-left: 30px; padding-right: 30px; padding-top: 30px; padding-bottom: 30px;" width="596">
                                                    <p style="font-size: 15px;line-height: 15px;font-family: 'Helvetica', Arial, sans-serif;text-decoration: none;color: #5c5c5c;margin: 0px;font-weight: 600;">
                                                       Cambridge University Press &amp; Assessment India Private Limited
                                                    </p>
                                                 </td>
                                              </tr>
                                           </tbody>
                                        </table>
                                     </div>
                                  </body>
                                 </html>
                 `
             };
             let isKeyExistOfotpMail = await EmailTemplate.findOne({ emailKey: otpMail['emailKey'] }).select({ "_id": 1 });
             if (!isKeyExistOfotpMail) {
                 await new Model(EmailTemplate).store(otpMail);
             }
             let forgotPasswordMail = {
                 "emailTitle": "Reset password",
                 'emailKey': "forgot_password_mail",
                 'subject': "Password Reset | IELTS Prep Programme",
                 'emailContent': "<p><span style=\"color: rgb(0,0,0);font-size: 13px;font-family: Arial;\">Dear {{{fullName}}},<br><br> We have received your request for a reset password. </span><br><br><a href=\"{{{resetPasswordLink}}}\" target=\"_self\"><span style=\"color: rgb(0,0,0);font-size: 13px;font-family: Arial;\">Please click here to reset your password</span></a><br><br>Regards,<br><b>Cambridge University Press & Assessment<b></p>"
             };
             isKeyExist = await EmailTemplate.findOne({ emailKey: forgotPasswordMail['emailKey'] }).select({ "_id": 1 });
             if (!isKeyExist) {
                 await new Model(EmailTemplate).store(forgotPasswordMail);
             }
             let adminUserInviteMail = {
                 "emailTitle": "Admin invite mail",
                 'emailKey': "admin_invite_mail",
                 'subject': "Admin Welcome Message",
                 'emailContent': "<p><span style=\"color: rgb(0,0,0);font-size: 13px;font-family: Arial;\">Dear {{{fullName}}} . You were added as {{{role}}}. </span><br><br><a href=\"{{{verificationLink}}}\" target=\"_self\"><span style=\"color: rgb(0,0,0);font-size: 13px;font-family: Arial;\">Click link to set password for your account</span></a><br><br></p>"
             };
             isKeyExist = await EmailTemplate.findOne({ emailKey: adminUserInviteMail['emailKey'] }).select({ "_id": 1 });
             if (!isKeyExist) {
                 await new Model(EmailTemplate).store(adminUserInviteMail);
             }
             return;
         } catch (error) {
             console.log('error', error);
             return;
         }
     }
     async addPermissionCategories() {
         try {
             let categoryPermission = [
                 {
                     category: 'User',
                     permission: [
                         { permission: 'View List', permissionKey: 'user_view_list' },
                         { permission: 'Delete', permissionKey: 'user_delete' },
                         { permission: 'Status Update', permissionKey: 'user_status_update' },
                         { permission: 'View Details', permissionKey: 'user_view_details' },
                         { permission: "Download", permissionKey: "user_download" }
                     ]
                 }, {
                     category: 'Admin User',
                     permission: [
                         { permission: 'View List', permissionKey: 'admin_user_view_list' },
                         { permission: 'Download', permissionKey: 'admin_user_download' },
                         { permission: 'Create', permissionKey: 'admin_user_create' },
                         { permission: 'Edit', permissionKey: 'admin_user_edit' },
                         { permission: 'Delete', permissionKey: 'admin_user_delete' },
                         { permission: 'Status Update', permissionKey: 'admin_user_status_update' }
                     ]
                 },
                 {
                     category: 'Cms Pages',
                     permission: [
                         { permission: 'View List', permissionKey: 'cms_pages_view_list' },
                         { permission: 'Create', permissionKey: 'cms_pages_create' },
                         { permission: 'Edit', permissionKey: 'cms_pages_edit' },
                         { permission: 'Delete', permissionKey: 'cms_pages_delete' }
                     ]
                 },
                 {
                     category: 'Roles',
                     permission: [
                         { permission: 'View List', permissionKey: 'roles_view_list' },
                         { permission: 'Create', permissionKey: 'roles_create' },
                         { permission: 'Edit', permissionKey: 'roles_edit' },
                         { permission: 'Status Update', permissionKey: 'roles_status_update' }
                     ]
                 },
                 {
                     category: 'Email Template',
                     permission: [
                         { permission: 'View List', permissionKey: 'email_template_view_list' },
                         { permission: 'Create', permissionKey: 'email_template_create' },
                         { permission: 'Edit', permissionKey: 'email_template_edit' },
                         { permission: 'Delete', permissionKey: 'email_template_delete' },
                         { permission: 'Status Update', permissionKey: 'email_template_status_update' }
                     ]
                 },
                 {
                     category: 'Email Settings',
                     permission: [
                         { permission: "Edit Default Settings", permissionKey: "email_settings_edit_default_settings" },
                         { permission: "View List", permissionKey: "email_settings_view_list" },
                         { permission: "Create", permissionKey: "email_settings_create" },
                         { permission: "Edit", permissionKey: "email_settings_edit" },
                         { permission: "Delete", permissionKey: "email_settings_delete" }
                     ]
                 },
             ];
             let superAdminPermissions = [];
             await this.asyncForEach(categoryPermission, async (categoryObj) => {
                 let category = await PermissionCategorysSchema.findOneAndUpdate({ category: categoryObj.category }, { category: categoryObj.category, status: true }, { upsert: true, new: true });
                 if (category && category._id) {
                     await this.asyncForEach(categoryObj.permission, async (permissionObj) => {
                         let permission = await PermissionsSchema.findOneAndUpdate({ categoryId: category._id, permissionKey: permissionObj.permissionKey }, permissionObj, { upsert: true, new: true });
                         if (permission && permission._id) {
                             superAdminPermissions.push(permission._id);
                         }
                     });
                 }
             });
 
             let role = await RolesSchema.findOneAndUpdate({ role: 'Super Admin' }, { role: 'Super Admin', status: true, isDeleted: false, permissions: superAdminPermissions }, { upsert: true, new: true });
             if (role && role._id) {
                 let admin = await Admin.findOne({ "emailId": "seed_admin@grr.la" });
                 if (!admin) {
                     let password = "Test1234";
                     password = await (new CommonService()).ecryptPassword({ password: password });
                     let data = {
                         "firstname": "Admin",
                         "lastname": "Admin",
                         "mobile": "+91-0000000000",
                         "emailId": "seed_admin@grr.la",
                         "password": password,
                         "role": { _id: role._id, role: role.role },
                         "status": true,
                         "emailVerificationStatus": true,
                     };
                     await new Model(Admin).store(data);
                 }
             }
             return;
         } catch (error) {
             console.log('error', error);
             return;
         }
     }
     async addAdmin() {
         try {
             let admin = await Admin.findOne({ "emailId": "seed_admin@grr.la" });
             if (!admin) {
                 let password = "Test1234";
                 password = await (new CommonService()).ecryptPassword({ password: password });
                 let data = {
                     "firstname": "Admin",
                     "lastname": "Admin",
                     "mobile": "+91-0000000000",
                     "emailId": "seed_admin@grr.la",
                     "password": password,
                     "role": "admin",
                     "status": true,
                     "emailVerificationStatus": true,
                 };
                 await new Model(Admin).store(data);
             }
             return;
         } catch (error) {
             console.log('error', error);
             return;
         }
     }
     async asyncForEach(array, callback) {
         for (let index = 0; index < array.length; index++) {
             await callback(array[index], index, array);
         }
     }
 }
 
 module.exports = Seed;