const mongoose = require("mongoose");
var Schema = require("mongoose").Schema;

const purchaseSchema = new Schema(
  {
    courseId:{type: Schema.Types.ObjectId, ref: "courses" , default:null},
    studentId:{type: Schema.Types.ObjectId, ref: "Student" , default:null},
    createdBy:{type: Schema.Types.ObjectId, ref: "admins" , default:null},
    updatedBy:{type: Schema.Types.ObjectId, ref: "admins",default:null},
    status:{type: Boolean, default: true },
    isDeleted:{type: Boolean, default: false },
    price:{type: Number, default: 0 },
    stripePaymentObj:{type: Object, default: {} }

  },
  {
    timestamps: true,
  }
);

const paymentHistoryStripeSchema = new Schema(
  { 
    studentId: { type: Schema.Types.ObjectId, ref: "Student" ,required: true},
    courseDetails: { type: Object, ref: "courses" ,required: true},
    paymentObject :{type: Object, require:true},
    totalPrice:{type: Number, require:true},
    paymentStatus:{type: String, require:true},
    invoiceLink : {type: String}
  },
  {
    timestamps: true,
  }
);

const PaymentHistoryStripe = mongoose.model("paymenthistorystripe", paymentHistoryStripeSchema);

const courseStartSchema = new Schema(
  { 
    studentId: { type: Schema.Types.ObjectId, ref: "Student" ,required: true},
    courseId: { type: Object, ref: "courses" ,required: true}
  },
  {
    timestamps: true,
  }
);

const CourseStart = mongoose.model("CourseStart", courseStartSchema);



let CoursePurchases = mongoose.model("purchases", purchaseSchema);

module.exports = {
    CoursePurchases,
    PaymentHistoryStripe,CourseStart
};
