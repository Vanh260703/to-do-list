const mongoose = require('mongoose');
const mongooseDelete = require('mongoose-delete');
const Schema = mongoose.Schema;


const ActivityLogSchema = new Schema(
    {
        user: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
        action: String, // 'create', 'delete', 'update', 'edit'
        taskId: {type: mongoose.Schema.Types.ObjectId},
        message: String,
    }, 
    {
        timestamps: true,
    }
)

module.exports = mongoose.model('ActivityLog', ActivityLogSchema);