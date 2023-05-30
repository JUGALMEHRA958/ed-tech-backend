const mongoose = require("mongoose");
var Schema = require("mongoose").Schema;

const purchaseSchema = new Schema(
  {
    courseId:{type: Schema.Types.ObjectId, ref: "courses" , default:null},
    studentId:{type: Schema.Types.ObjectId, ref: "Student" , default:null},
    createdBy:{type: Schema.Types.ObjectId, ref: "admins" , default:null},
    updatedBy:{type: Schema.Types.ObjectId, ref: "admins",default:null},
    status:{type: Boolean, default: true },
    isDeleted:{type: Boolean, default: false }
  },
  {
    timestamps: true,
  }
);

let CoursePurchases = mongoose.model("purchases", purchaseSchema);

module.exports = {
    CoursePurchases,
};
