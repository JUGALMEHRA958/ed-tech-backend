var mongoose = require('mongoose');
var Float = require('mongoose-float').loadType(mongoose);
var schema = mongoose.Schema;
const _ = require("lodash");

var student = new schema({
    firstName: {
        type: String,
        required: true
    },
    lastName: {
        type: String,
        required: true
    },
    phone: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique:true
    },
    password: {
        type: String,
        required: true
    },
    isOtpVerfied:{
        type: Boolean,
        default:false
    },
    // testType: {
    //     type: String,
    //     enum: ['general', 'academic'],
    //     required: true
    // },
    isDeleted:{
        type:Boolean ,
        default:false
    },
    status:{
        type:Boolean ,
        default:true
    },
    lastSeen:{
        type:Date
    },
    studentId:{
        type:String,
        unique:false
    },
    forgotToken:{
        type:String,
    },
    forgotTokenCreationTime:{
        type:Date
    },
    stripeCustomerId:{
        type:String
    }
}, {
    timestamps: true
});
// EmailOTP schema
const emailOTPSchema = new schema(
    {
      email: { type: String, required: true },
      otp: { type: Number, required: true },
      expiryDate: { type: Date, required: true },
    },
    {
      timestamps: true,
    }
  );
  
  const EmailOTP = mongoose.model("EmailOTP", emailOTPSchema);

  

let Students = mongoose.model('Student', student);
module.exports = {
    Students,
    student,
    EmailOTP
};
