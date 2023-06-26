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
            let sendInvoiceMail = {
                "emailTitle": "Invoice from cambridge connect",
                'emailKey': "invoice_mail",
                'subject': "Invoice mail",
                'emailContent':`<p><span style="color: rgb(0,0,0);font-size: 13px;font-family: Arial;">Hi , {{{name}}},<br>Thanks for shopping with cambridge. <br> <a href="{{{pdfUrl}}}" target="_self"><span style="color: rgb(0,0,0);font-size: 13px;font-family: Arial;">Click link to download your invoice</span></a> </p>`
            };
            let isKeyExistOfsendInvoiceMail = await EmailTemplate.findOne({ emailKey: sendInvoiceMail['emailKey'] }).select({ "_id": 1 });
            if (!isKeyExistOfsendInvoiceMail) {
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
            let forgotPasswordMail = {
                "emailTitle": "Reset password",
                'emailKey': "forgot_password_mail",
                'subject': "Password Reset | IELTS Prep Programme",
                'emailContent': "<p><span style=\"color: rgb(0,0,0);font-size: 13px;font-family: Arial;\">Dear {{{fullName}}},<br><br> We have received your request for a reset password. </span><br><br><a href=\"{{{resetPasswordLink}}}\" target=\"_self\"><span style=\"color: rgb(0,0,0);font-size: 13px;font-family: Arial;\">Please click here to reset your password</span></a><br>Regards,<br><b>Cambridge University Press & Assessment<b></p>"
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