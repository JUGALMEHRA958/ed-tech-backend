const mongoose = require('mongoose');

const metaSchema = new mongoose.Schema({
    name: { type: String },
    imageUrl: { type: String },
    isDeleted: { type: Boolean, default: false },
}, {
    timestamps: true
});

const Media = mongoose.model('media', metaSchema);
module.exports = {
    Media
}