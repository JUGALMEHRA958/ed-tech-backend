var mongoose = require('mongoose');
var Float = require('mongoose-float').loadType(mongoose);
var Schema = mongoose.Schema;
const _ = require("lodash");

var discountCouponSchema = new Schema({
    discountCode: {
        type: String,
        required: true,
        unique: true
    },
    startAt: {
        type: Date,
        required: true
    },
    endsAt: {
        type: Date,
        required: true
    },
    discountPercentage: {
        type: Float,
        required: true
    },
    // maximumDiscount: {
    //     type: Float,
    //     required: true
    // },
    stripeCouponCode: {
        type: String,
        required: true
    },
    createdBy:{type: Schema.Types.ObjectId, ref: "admins" , default:null},
    updatedBy:{type: Schema.Types.ObjectId, ref: "admins",default:null},
    status:{type: Boolean, default: true },
    isDeleted:{type: Boolean, default: false }
}, {
    timestamps: true
});

var vourcher = new Schema({
    voucherCode: {
        type: String,
        required: true,
        unique: true
    },
    isDeleted:{type: Boolean , default:false},
    status:{type: Boolean , default:true}

}, {
    timestamps: true
})

let VoucherCode = mongoose.model("Vouchers", vourcher);
let DiscountCoupon = mongoose.model('DiscountCoupon', discountCouponSchema);
module.exports = {
    DiscountCoupon,
    VoucherCode
};
