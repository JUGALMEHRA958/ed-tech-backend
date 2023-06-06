const mongoose = require("mongoose");
var Schema = require("mongoose").Schema;



const cartSchema = new Schema(
  {
    userId:{type: Schema.Types.ObjectId, ref: "students" , default:null},
    courseIds:[{type: Schema.Types.ObjectId, ref: "courses" , default:null}],
    createdBy:{type: Schema.Types.ObjectId, ref: "admins" , default:null},
    updatedBy:{type: Schema.Types.ObjectId, ref: "admins",default:null},
    status:{type: Boolean, default: true },
    isDeleted:{type: Boolean, default: false }
  },
  {
    timestamps: true,
  }
);











const courseSchema = new Schema(
  {
    title: { type: String, require: true },
    description: { type: String, require: true },
    productId: { type: String, require: true , unique:true},
    isbnNumber: { type: String, require: true },
    picture: { type: String, require: true },
    group: {
      type: String,
      require: true,
      enum: ["testbank", "writeAndImprove","ieltsebook","praxis","printpractice"],
      default: "testbank",
    },
    moduleType:{
      type: String,
      require: true,
      enum: ["listening", "reading","speaking","writing"],
      default: "listening",
    },
    price: { type: Number, require: true },
    category: {
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
let CartSchema = mongoose.model("cart", cartSchema);


module.exports = {
  CourseSchema,
  CartSchema
};
