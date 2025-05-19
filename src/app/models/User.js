const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ToDoSchema = new Schema(
    {
        content: { type: String, required: true },
        completed: { type: Boolean, default: false },
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
        todos: [ToDoSchema],
    },
    {
        timestamps: true,
    },
);

module.exports = mongoose.model('User', UserSchema);