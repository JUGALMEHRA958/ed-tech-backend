const mongoose = require("mongoose");
var Schema = require("mongoose").Schema;

const courseSchema = new Schema(
  {
    title: { type: String, require: true },
    productId: { type: String, require: true , unique:true},
    idpNumber: { type: String, require: true },
    picture: { type: String, require: true },
    category: {
      type: String,
      require: true,
      enum: ["testbank", "writeAndImprove"],
      default: "testbank",
    },
    price: { type: Number, require: true },
    type: {
      type: String,
      require: true,
      enum: ["paid", "free","sample"],
      default: "sample",
    },
    createdBy:{type: Schema.Types.ObjectId, ref: "admins" , default:null},
    updatedBy:{type: Schema.Types.ObjectId, ref: "admins",default:null},
    status:{type: Boolean, default: true },
    isDeleted:{type: Boolean, default: false }
  },
  {
    timestamps: true,
  }
);

let CourseSchema = mongoose.model("courses", courseSchema);

module.exports = {
  CourseSchema,
};
