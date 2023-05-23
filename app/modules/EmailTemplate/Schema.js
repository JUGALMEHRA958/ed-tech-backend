const mongoose = require('mongoose');

const emailSchema = new mongoose.Schema({
    emailTitle: { type: String, required: true },
    emailKey: { type: String, required: true, unique: true },
    emailContent: { type: String, required: true },
    subject: { type: String, required: true },
    gjsHtml: { type: String },
    gjsCss: { type: String },
    gjsAssets: { type: String },
    gjsStyles: { type: String },
    gjsComponents: { type: String },
    status: { type: Boolean, default: true },
    isDeleted: { type: Boolean, default: false }
}, {
    timestamps: true
});
let EmailTemplate = mongoose.model('emailTemplate', emailSchema);
module.exports = {
    EmailTemplate
}