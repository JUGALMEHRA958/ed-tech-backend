const mongoose = require('mongoose');
var Schema = require('mongoose').Schema;

const roleSchema = new mongoose.Schema({
    role: { type: String },
    permissions: [{ type: Schema.Types.ObjectId, ref: 'Permissions', required: true }],
    status: { type: Boolean, default: true },
    isDeleted: { type: Boolean, default: false }
}, {
    timestamps: true
});

let RolesSchema = mongoose.model('Roles', roleSchema);

const permissionSchema = new mongoose.Schema({
    permission: { type: String },
    permissionKey: { type: String, unique: true },
    categoryId: { type: Schema.Types.ObjectId, ref: 'PermissionCategory', required: true },
    status: { type: Boolean, default: true }
}, {
    timestamps: true
});

// permissionSchema.index({ permissionKey: 1, categoryId: 1 }, { unique: true });
let PermissionsSchema = mongoose.model('Permissions', permissionSchema);

const permissionCategorySchema = new mongoose.Schema({
    category: { type: String, unique: true },
    status: { type: Boolean, default: true }
}, {
    timestamps: true
});

let PermissionCategorysSchema = mongoose.model('PermissionCategory', permissionCategorySchema);

module.exports = {
    PermissionsSchema,
    RolesSchema,
    roleSchema,
    PermissionCategorysSchema
}