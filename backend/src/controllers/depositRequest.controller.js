const depositRequestModel = require('../models/depositRequest.model')
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

        const depositRequest = await depositRequestModel.create({
            fromUser: req.user._id,
            toUser: systemUser._id,
            account,
            amount
        })


         emailService.sendDepositRequestEmail(
            systemUser.email,
            req.user.name,
            amount,
            depositRequest._id
        ).catch(err => console.error('Email failed:', err))


        return res.status(201).json({
            success: true,
            message: "Deposit request sent successfully",
            depositRequest
        })


       
        

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        })
    }
}

async function getPendingRequests(req, res) {
    try {
        const requests = await depositRequestModel
            .find({
                status: "PENDING"
            })
            .populate('fromUser', 'name email')
            .populate('account', 'upiId nickname accountNumber')
            .sort({ createdAt: -1 })

        return res.status(200).json({
            success: true,
            requests
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

        const depositRequest = await depositRequestModel
            .findById(notificationId)
            .populate('fromUser', 'name email')
            .populate('account', 'upiId nickname')

        if (!depositRequest) {
            return res.status(404).json({
                success: false,
                message: "Deposit request not found"
            })
        }

        if (depositRequest.status !== "PENDING") {
            return res.status(400).json({
                success: false,
                message: "Request already processed"
            })
        }

        await processSystemTransfer(
            req.user,
            depositRequest.account._id,
            depositRequest.amount
        )

        depositRequest.status = "APPROVED"
        depositRequest.processedAt = new Date()
        depositRequest.processedBy = req.user._id

        await depositRequest.save()

        emailService.sendDepositSuccessEmail(
            depositRequest.fromUser.email,
            depositRequest.fromUser.name,
            depositRequest.amount
        ).catch(err => console.error("Email failed:", err))

        return res.status(200).json({
            success: true,
            message: "Deposit approved successfully"
        })

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

        const depositRequest = await depositRequestModel
            .findById(notificationId)
            .populate('fromUser', 'name email')

        if (!depositRequest) {
            return res.status(404).json({
                success: false,
                message: "Deposit request not found"
            })
        }

        if (depositRequest.status !== "PENDING") {
            return res.status(400).json({
                success: false,
                message: "Request already processed"
            })
        }

        depositRequest.status = "REJECTED"
        depositRequest.processedAt = new Date()
        depositRequest.processedBy = req.user._id

        await depositRequest.save()

        emailService.sendDepositRejectedEmail(
            depositRequest.fromUser.email,
            depositRequest.fromUser.name,
            depositRequest.amount
        ).catch(err => console.log("Email failed", err))

        return res.status(200).json({
            success: true,
            message: "Deposit request rejected"
        })

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        })
    }


}

async function getMyDepositRequests(req, res) {
    try {

        const requests = await depositRequestModel
            .find({
                fromUser: req.user._id
            })
            .populate('account', 'upiId nickname')
            .sort({ createdAt: -1 })

        return res.status(200).json({
            success: true,
            requests
        })

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
    rejectDepositRequest,
    getMyDepositRequests,
    
}
