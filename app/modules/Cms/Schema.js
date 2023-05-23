const mongoose = require('mongoose');

const cmsSchema = new mongoose.Schema({
    pageTitle: { type: String, required: true },
    description: { type: String, required: true },
    gjsCss: { type: String },
    gjsHtml: { type: String },
    gjsAssets: { type: String },
    gjsComponents: { type: String },
    gjsStyles: { type: String },
    isDeleted: { type: Boolean, default: false },
    pageId: { type: String, required: true, unique: true },
    metaTitle: { type: String, required: true },
    metaDescription: { type: String, required: true },
    metaKeyword: { type: String, required: true }
}, {
    timestamps: true
});
let CmsData = mongoose.model('cmsdata', cmsSchema);
module.exports = {
    CmsData
}