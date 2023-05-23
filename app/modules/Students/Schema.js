var mongoose = require('mongoose');
var Float = require('mongoose-float').loadType(mongoose);
var schema = mongoose.Schema;
const _ = require("lodash");

var student = new schema({
    firstname: { type: String },
    lastname: { type: String },
    studentId: { type: String, unique: true },
    studentRollNumber:{type:String},
    studentName:{type:String},
    collegeCode:{type:String},
    collegeName:{type:String},
    emailId: { type: String },
    password: { type: Buffer },
    photo: { type: String, required: false },
    emailVerificationStatus: { type: Boolean, default: false },
    isDeleted: { type: Boolean, default: false },
    status: { type: Boolean, default: true },
    mobile: { type: String, required: false },
    verificationToken: { type: String },
    verificationTokenCreationTime: { type: Date },
    institute: { type: String },
    degree: { type: String },
    branch: { type: String },
    semester: { type: String },
    district: { type: String },
    score: { type: Float },
    forgotToken: { type: String },
    forgotTokenCreationTime: { type: Date },
    deviceToken: { type: String },
    device: { type: String },
    role: { type: String },
    previouslyUsedPasswords: [{ type: Buffer }],
    passwordUpdatedAt: { type: Date },
    lastSeen: { type: Date },
    failedAttempts: [{ ip: { type: String }, attempts: { type: Number }, blockedDate: { type: Date }, isBlocked: { type: Boolean, default: false } }]
}, {
    timestamps: true
});


let Students = mongoose.model('Student', student);
module.exports = {
    Students,
    student
}