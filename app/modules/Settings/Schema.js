const mongoose = require('mongoose');
var Schema = require('mongoose').Schema;

const emailSettingsSchema = new mongoose.Schema({
    emailTemplateId: { type: Schema.Types.ObjectId, ref: 'emailTemplate', unique: true },
    fromEmail: { type: String },
    adminEmail: { type: String }
}, {
    timestamps: true
});

let EmailSettings = mongoose.model('emailSettings', emailSettingsSchema);

const settingsSchema = new mongoose.Schema({
    defaultFromEmail: { type: String },
    defaultAdminEmail: { type: String },
    allCurrency: [{ code: { type: String, unique: true }, status: { type: Boolean, default: true } }],
    allDateFormat: [{ format: { type: String, unique: true }, status: { type: Boolean, default: true } }],
    currency: { type: String },
    dateFormat: { type: String },
    metaTitle: { type: String },
    metaKeyword: { type: String },
    metaDescription: { type: String },
    smtp: { host: { type: String }, port: { type: Number }, username: { type: String }, password: { String: String } }
}, {
    timestamps: true
});

let SettingsSchema = mongoose.model('settings', settingsSchema);

module.exports = {
    EmailSettings,
    SettingsSchema
}