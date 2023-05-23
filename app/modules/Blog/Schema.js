const mongoose = require('mongoose');

const blogSchema = new mongoose.Schema({
    blogTitle: { type: String },
    blogContent: { type: String },
    metaTitle: { type: String },
    metaKeyword: { type: String },
    metaDescription: { type: String },
    blogCategory: { type: String },
    image: { type: String },
    status: { type: String, default: 'Active' },
    isDeleted: { type: Boolean, default: false },
}, {
    timestamps: true
});

const Blogs = mongoose.model('blogs', blogSchema);
module.exports = {
    Blogs
}