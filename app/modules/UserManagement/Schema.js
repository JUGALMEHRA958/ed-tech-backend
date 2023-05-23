const mongoose = require('mongoose');

const columnSettingsSchema = new mongoose.Schema({
    key: { type: String, unique: true },
    columns: [{ key: { type: String }, status: { type: Boolean } }],
}, {
    timestamps: true
});
let ColumnSettings = mongoose.model('columnSettings', columnSettingsSchema);


const filterSettingsSchema = new mongoose.Schema({
    key: { type: String },
    filterName: { type: String },
    filter: { type: Array },
}, {
    timestamps: true
});

filterSettingsSchema.index({ key: 1, filterName: 1 }, { unique: true });
let FilterSettings = mongoose.model('filterSettings', filterSettingsSchema);

module.exports = {
    ColumnSettings,
    FilterSettings
}