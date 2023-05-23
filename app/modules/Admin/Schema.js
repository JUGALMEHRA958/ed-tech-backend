var mongoose = require('mongoose');
var schema = mongoose.Schema;
const _ = require("lodash");

var roleSchema = require('../Roles/Schema').roleSchema;

var admin = new schema({
    firstname: { type: String, required: true },
    lastname: { type: String, required: true },
    username: { type: String },
    emailId: { type: String, required: true, unique: true },
    password: { type: Buffer },
    photo: { type: String, required: false },
    emailVerificationStatus: { type: Boolean, default: true },
    isDeleted: { type: Boolean, default: false },
    status: { type: Boolean, default: true },
    mobile: { type: String },
    verificationToken: { type: String },
    verificationTokenCreationTime: { type: Date },
    fbId: { type: String },
    twitterId: { type: String },
    instagramId: { type: String },
    forgotToken: { type: String },
    forgotTokenCreationTime: { type: Date },
    deviceToken: { type: String },
    device: { type: String },
    addedBy: { type: schema.Types.ObjectId, ref: 'Admin' },
    role: roleSchema
}, {
    timestamps: true
});

let models = mongoose.modelNames();
let Admin = !_.includes(models, 'Admin') ? mongoose.model('Admin', admin) : mongoose.models['Admin'];
module.exports = {
    Admin,
    admin
}