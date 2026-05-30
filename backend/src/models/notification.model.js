const mongoose = require('mongoose')

const notificationSchema = new mongoose.Schema({
    type: {
        type: String,
        enum: ["DEPOSIT_REQUEST"],
        required: true
    },
    fromUser: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",
        required: true
    },
    toUser: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",
        required: true
    },
    account: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "account",
        required: true
    },
    amount: {
        type: Number,
        required: true
    },
    status: {
        type: String,
        enum: ["PENDING", "APPROVED", "REJECTED"],
        default: "PENDING"
    }
}, {
    timestamps: true
})

const notificationModel = mongoose.model('notification', notificationSchema)
module.exports = notificationModel