const mongoose = require('mongoose');
const mongooseDelete = require('mongoose-delete');
const Schema = mongoose.Schema;

const ToDoSchema = new Schema(
    {
        content: { type: String, required: true },
        completed: { type: Boolean, default: false },
        completedAt: Date,
        deadline: Date,
        inDay: Boolean,
        inWeek: Boolean,
        inMonth: Boolean,
        isValid: Boolean,
        status: String, // 'pending', 'complete', 'overdue', etc
        deleted: {type: Boolean, default: false },
        deletedReason: String,
    },
    {
        timestamps: true,
    }
)

const UserSchema = new Schema(
    {
        fullname: { type: String, required: true },
        username: { type: String, required: true },
        email: { type: String, required: true},
        password: { type: String, required: true },
        phonenumber: String,
        bio: String,
        gender: String,
        birthdate: Date,
        todos: [ToDoSchema],
    },
    {
        timestamps: true,
    },
);

// UserSchema.plugin(mongooseDelete, {
//     deleted: true,
//     overrideMethods: 'all',
// });

module.exports = mongoose.model('User', UserSchema);