const accountModel = require("../models/account.model")

async function createAccountController(req,res){
    try {
        const { nickname, upiId } = req.body

        if (!nickname || !upiId) {
            return res.status(400).json({
                message: "Nickname and UPI ID are required"
            })
        }

         const accountCount = await accountModel.countDocuments({
            user: req.user._id
        })

        if (accountCount >= 3) {
            return res.status(400).json({
                success: false,
                message: "Maximum 3 accounts allowed per user"
            })
        }

        const upiExists = await accountModel.findOne({ upiId })
        if (upiExists) {
            return res.status(400).json({
                message: "UPI ID already taken, choose another"
            })
        }

        
        const accountNumber = `ACC${Date.now().toString().slice(-7)}`

        const account = await accountModel.create({
            user: req.user._id,
            nickname,
            upiId: upiId.toLowerCase(),
            accountNumber,
            currency:"INR"
        })

        return res.status(201).json({
            success: true,
            account
        })
      } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        })
    }
}

async function getUserAccountsController(req,res){
    try {
        const accounts = await accountModel.find({
            user: req.user._id,
            status: "ACTIVE"
        })

       
        const accountsWithBalance = await Promise.all(
            accounts.map(async (acc) => ({
                _id: acc._id,
                nickname:acc.nickname,
                upiId : acc.upiId,
                status: acc.status,
                currency: acc.currency,
                createdAt: acc.createdAt,
                balance: await acc.getBalance(),
                isPrimary: acc.isPrimary ?? false, 
                user: acc.user, 
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

async function getAccountBalanceController(req,res){
    const {accountId} = req.params;

    const account  = await accountModel.findOne({
        _id:accountId,
        user:req.user._id
    })

    if(!account){
        return res.status(400).json({
            message:"Account not found."
        })
    }

    const balance = await account.getBalance();

    res.status(200).json({
        accountId : account._id,
        balance: balance
    })
}

async function searchAccountByUpiController(req, res) {
    try {

            const { upiId } = req.query

            const account = await accountModel
                .findOne({ upiId })
                .populate('user', 'name email _id')  // ← user populate karo

            if (!account) {
                return res.status(404).json({
                    message: "No account found with this UPI ID"
                })
            }

            if (account.user._id.toString() === req.user._id.toString()) {
                return res.status(400).json({
                    message: "Cannot pay yourself"
                })
            }

            return res.status(200).json({
                account: {
                    _id: account._id,
                    upiId: account.upiId,
                    nickname: account.nickname,
                    userId: account.user._id,      
                    userName: account.user.name,
                    isPrimary: account.isPrimary,
                }
            })

    } catch (error) {

        return res.status(500).json({
            success: false,
            message: error.message
        })
    }
}

async function setPrimaryAccount(req, res) {
    try {
        const { accountId } = req.params

      
        const account = await accountModel.findOne({
            _id: accountId,
            user: req.user._id
        })

        if(!account) {
            return res.status(404).json({
                success: false,
                message: "Account not found"
            })
        }

        if(account.isPrimary) {
            return res.status(400).json({
                success: false,
                message: "Account is already primary"
            })
        }

      
        account.isPrimary = true
        await account.save()

        return res.status(200).json({
            success: true,
            message: "Primary account updated successfully",
            account
        })

    } catch(error) {
        return res.status(500).json({
            success: false,
            message: error.message
        })
    }
}

module.exports = {

    createAccountController,
    getUserAccountsController,
    getAccountBalanceController,
    searchAccountByUpiController,
    setPrimaryAccount
}