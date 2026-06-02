const mongoose = require("mongoose");

const depositRequestSchema = new mongoose.Schema(
    {
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
            required: true,
            min: 1
        },

        status: {
            type: String,
            enum: ["PENDING", "APPROVED", "REJECTED"],
            default: "PENDING"
        },

        processedAt: {
            type: Date,
            default: null
        },

        remarks: {
            type: String,
            default: ""
        }
    },
    {
        timestamps: true
    }
);

const depositRequestModel = mongoose.model(
    "depositRequest",
    depositRequestSchema
);

module.exports = depositRequestModel;