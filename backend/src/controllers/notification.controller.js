const notificationModel = require('../models/notification.model')
const userModel = require('../models/user.model')
const accountModel = require('../models/account.model')
const emailService = require('../services/email.service')
const { processSystemTransfer } = require('../services/transaction.service')

async function createDepositRequest(req, res) {
    try {
        const { account, amount } = req.body

        if (!account || !amount) {
            return res.status(400).json({
                success: false,
                message: "Account and amount are required"
            })
        }

        if (amount <= 0) {
            return res.status(400).json({
                success: false,
                message: "Amount must be greater than 0"
            })
        }

        const userAccount = await accountModel.findOne({
            _id: account,
            user: req.user._id
        })

        if (!userAccount) {
            return res.status(404).json({
                success: false,
                message: "Account not found"
            })
        }

        if (userAccount.status !== "ACTIVE") {
            return res.status(403).json({
                success: false,
                message: "Frozen account cannot request a deposit"
            })
        }

        const systemUser = await userModel.findOne({ systemUser: true }).select('+systemUser')

        if (!systemUser) {
            return res.status(404).json({
                success: false,
                message: "System user not found"
            })
        }

        const notification = await notificationModel.create({
            type: "DEPOSIT_REQUEST",
            fromUser: req.user._id,
            toUser: systemUser._id,
            account,
            amount
        })


        return res.status(201).json({
            success: true,
            message: "Deposit request sent successfully",
            notification
        })


        emailService.sendDepositRequestEmail(
            systemUser.email,
            req.user.name,
            amount,
            notification._id
        ).catch(err => console.error('Email failed:', err))

        

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        })
    }
}

async function getPendingRequests(req, res) {
    try {
        const notifications = await notificationModel
            .find({
                toUser: req.user._id,
                status: "PENDING"
            })
            .populate('fromUser', 'name email')
            .populate('account', 'upiId nickname accountNumber')
            .sort({ createdAt: -1 })

        return res.status(200).json({
            success: true,
            notifications
        })

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        })
    }
}


async function approveDepositRequest(req, res) {
    try {
        const { notificationId } = req.params

        const notification = await notificationModel
            .findById(notificationId)
            .populate('fromUser', 'name email')
            .populate('account', 'upiId nickname')

        if (!notification) {
            return res.status(404).json({
                success: false,
                message: "Notification not found"
            })
        }

        if (notification.status !== "PENDING") {
            return res.status(400).json({
                success: false,
                message: "Request already processed"
            })
        }

        await processSystemTransfer(
            req.user,
            notification.account._id,
            notification.amount
        )

        await notificationModel.findByIdAndDelete(notificationId)

        

        return res.status(200).json({
            success: true,
            message: "Deposit approved successfully"
        })

        emailService.sendDepositSuccessEmail(
            notification.fromUser.email,
            notification.fromUser.name,
            notification.amount
        ).catch(err => console.error('Email failed:', err))

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        })
    }
}

async function rejectDepositRequest(req, res) {
    try {
        const { notificationId } = req.params

        const notification = await notificationModel
            .findById(notificationId)
            .populate('fromUser', 'name email')

        if (!notification) {
            return res.status(404).json({
                success: false,
                message: "Notification not found"
            })
        }

        if (notification.status !== "PENDING") {
            return res.status(400).json({
                success: false,
                message: "Request already processed"
            })
        }

        await notificationModel.findByIdAndDelete(notificationId)

        

        return res.status(200).json({
            success: true,
            message: "Deposit request rejected"
        })

        emailService.sendDepositRejectedEmail(
            notification.fromUser.email,
            notification.fromUser.name,
            notification.amount
        ).catch(err=>console.log("Email failed",err))

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        })
    }
}

module.exports = {
    createDepositRequest,
    getPendingRequests,
    approveDepositRequest,
    rejectDepositRequest
}
