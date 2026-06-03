const userModel = require('../models/user.model')
const accountModel = require('../models/account.model')
const transactionModel = require('../models/transaction.model')
const ledgerModel = require('../models/ledger.model')
const depositRequestModel = require('../models/depositRequest.model')


async function getStats(req, res) {
    try {
        const [totalUsers, totalAccounts, totalTransactions , totalDepositRequests] = await Promise.all([
            userModel.countDocuments({ systemUser: false }),
            accountModel.countDocuments({ user: { $ne: req.user._id } }),
            transactionModel.countDocuments(),
            depositRequestModel.countDocuments()
        ])

        
        const systemAccount = await accountModel.findOne({
            user: req.user._id,
            status: "ACTIVE"
        })
        const systemBalance = systemAccount 
            ? await systemAccount.getBalance() 
            : 0

        return res.status(200).json({
            success: true,
            stats: {
                totalUsers,
                totalAccounts,
                totalTransactions,
                systemBalance,
                totalDepositRequests
            }
        })
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        })
    }
}


async function getAllUsers(req, res) {
    try {
        const users = await userModel
            .find({ systemUser: false })
            .select('name email createdAt')
            .sort({ createdAt: -1 })

        
        const usersWithAccounts = await Promise.all(
            users.map(async (user) => {
                const accountCount = await accountModel.countDocuments({
                    user: user._id
                })
                return {
                    _id: user._id,
                    name: user.name,
                    email: user.email,
                    createdAt: user.createdAt,
                    accountCount
                }
            })
        )

        return res.status(200).json({
            success: true,
            users: usersWithAccounts
        })
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        })
    }
}

async function getUserDetail(req, res) {
    try {
        const { userId } = req.params

        const user = await userModel
            .findById(userId)
            .select('name email createdAt')

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            })
        }

        const accounts = await accountModel.find({ user: userId })

        const accountsWithBalance = await Promise.all(
            accounts.map(async (acc) => ({
                _id: acc._id,
                nickname: acc.nickname,
                upiId: acc.upiId,
                accountNumber: acc.accountNumber,
                status: acc.status,
                currency: acc.currency,
                isPrimary: acc.isPrimary ?? false,
                createdAt: acc.createdAt,
                balance: await acc.getBalance()
            }))
        )

        const userAccountIds = accountsWithBalance.map(acc => acc._id)

        const transactions = await transactionModel
            .find({
                $or: [
                    { fromAccount: { $in: userAccountIds } },
                    { toAccount: { $in: userAccountIds } }
                ]
            })
            .populate('fromAccount', 'upiId nickname')
            .populate('toAccount', 'upiId nickname')
            .sort({ createdAt: -1 })

        const totalBalance = accountsWithBalance.reduce(
            (sum, acc) => sum + acc.balance, 0
        )

        return res.status(200).json({
            success: true,
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                createdAt: user.createdAt
            },
            accounts: accountsWithBalance,
            totalBalance,
            transactions
        })
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        })
    }
}


async function getAllAccounts(req, res) {
    try {
        const accounts = await accountModel
            .find({ user: { $ne: req.user._id } })  // System account exclude
            .populate('user', 'name email')
            .sort({ createdAt: -1 })

        const accountsWithBalance = await Promise.all(
            accounts.map(async (acc) => ({
                _id: acc._id,
                nickname: acc.nickname,
                upiId: acc.upiId,
                accountNumber: acc.accountNumber,
                status: acc.status,
                currency: acc.currency,
                isPrimary: acc.isPrimary ?? false,
                createdAt: acc.createdAt,
                user: acc.user,
                balance: await acc.getBalance()
            }))
        )

        return res.status(200).json({
            success: true,
            accounts: accountsWithBalance
        })
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        })
    }
}


async function getAccountDetail(req, res) {
    try {
        const { accountId } = req.params

        const account = await accountModel
            .findById(accountId)
            .populate('user', 'name email')

        if (!account) {
            return res.status(404).json({
                success: false,
                message: "Account not found"
            })
        }

        const balance = await account.getBalance()

        const transactions = await ledgerModel
            .find({ account: accountId })
            .populate({
                path: 'transaction',
                select: '-idempotencyKey',
                populate: [
                    {
                        path: 'fromAccount',
                        select: 'upiId nickname'
                    },
                    {
                        path: 'toAccount',
                        select: 'upiId nickname'
                    }
                ]
            })
            .sort({ createdAt: -1 })
            .limit(50)

        return res.status(200).json({
            success: true,
            account: {
                _id: account._id,
                nickname: account.nickname,
                upiId: account.upiId,
                accountNumber: account.accountNumber,
                status: account.status,
                currency: account.currency,
                isPrimary: account.isPrimary ?? false,
                createdAt: account.createdAt,
                user: account.user,
                balance
            },
            transactions
        })
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        })
    }
}


async function getAllTransactions(req, res) {
    try {
        const transactions = await transactionModel
            .find()
            .populate('fromAccount', 'upiId nickname user')
            .populate('toAccount', 'upiId nickname user')
            .sort({ createdAt: -1 })
            .limit(100)

        return res.status(200).json({
            success: true,
            transactions
        })
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        })
    }
}

async function freezeAccount(req, res) {
    try {
        const { accountId } = req.params

        const account = await accountModel.findById(accountId)

        if (!account) {
            return res.status(404).json({
                success: false,
                message: "Account not found"
            })
        }

        if (account.status === "FROZEN") {
            return res.status(400).json({
                success: false,
                message: "Account is already frozen"
            })
        }

        account.status = "FROZEN"
        await account.save()

        return res.status(200).json({
            success: true,
            message: "Account frozen successfully",
            account
        })

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        })
    }
}

async function unfreezeAccount(req, res) {
    try {
        const { accountId } = req.params

        const account = await accountModel.findById(accountId)

        if (!account) {
            return res.status(404).json({
                success: false,
                message: "Account not found"
            })
        }

        if (account.status === "ACTIVE") {
            return res.status(400).json({
                success: false,
                message: "Account is already active"
            })
        }

        account.status = "ACTIVE"
        await account.save()

        return res.status(200).json({
            success: true,
            message: "Account unfrozen successfully",
            account
        })

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        })
    }
}

async function getAllDepositRequests(req, res) {
    try {

        const requests = await depositRequestModel
            .find()
            .populate('fromUser', 'name email')
            .populate('account', 'nickname upiId')
            .populate('processedBy', 'name email')
            .sort({ createdAt: -1 });


        
        return res.status(200).json({
            success: true,
            requests
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
}


module.exports = {
    getStats,
    getAllUsers,
    getUserDetail,
    getAllAccounts,
    getAccountDetail,
    getAllTransactions,
    freezeAccount,
    unfreezeAccount,
    getAllDepositRequests,
}