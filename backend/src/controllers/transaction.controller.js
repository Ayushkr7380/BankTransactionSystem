const transactionModel = require("../models/transaction.model");
const ledgerModel = require("../models/ledger.model");
const accountModel = require("../models/account.model");
const mongoose = require("mongoose");
const userModel = require("../models/user.model");
const emailService = require("../services/email.service");
// const generateIdempotencyKey = require("../utils/generateIdempotencyKey");


/**
 * - Create a new transaction
 * THE 10-STEP TRANSFER FLOW:
     * 1. Validate request
     * 2. Validate idempotency key
     * 3. Check account status
     * 4. Derive sender balance from ledger
     * 5. Create transaction (PENDING)
     * 6. Create DEBIT ledger entry
     * 7. Create CREDIT ledger entry
     * 8. Mark transaction COMPLETED
     * 9. Commit MongoDB session
     * 10. Send email notification
 */


async function createTransaction(req,res){
    /**
    * 1. Validate request
    */

    const { fromAccount , toAccount , amount , idempotencyKey } = req.body;
    
    if(!fromAccount || !toAccount || !amount || !idempotencyKey){
        return res.status(400).json({
            message:"FromAccount , toAccount , amount and idempotencyKey are required."
        })
    }

    const fromUserAccount = await accountModel.findOne({
        _id:fromAccount,
    })
    

    const toUserAccount = await accountModel.findOne({
        _id:toAccount,
    }).populate('user', 'systemUser')

    if(!fromUserAccount || !toUserAccount){
        return res.status(400).json({
            message:"Invalid fromAccount or toAccount"
        })
    }
    
    if (toUserAccount.user.systemUser) {
    return res.status(400).json({
             message: "Cannot transfer to system account"
        })
    }
    
    /**
     * 2. Validate idempotency Key
     */

    const isTransactionAlreadyExists = await transactionModel.findOne({
        idempotencyKey:idempotencyKey
    });

    if(isTransactionAlreadyExists){
        if(isTransactionAlreadyExists.status === "COMPLETED"){
            return res.status(200).json({
                message:"Transaction already processed.",
                transaction:isTransactionAlreadyExists
            })
        }

        if(isTransactionAlreadyExists.status === "PENDING"){
            return res.status(200).json({
                message:"Transaction is still processing.",
            })
        }

        if(isTransactionAlreadyExists.status === "FAILED"){
            return res.status(500).json({
                message:"Transaction processing failed , please retry."
            })
        }

        if(isTransactionAlreadyExists.status === "REVERSED"){
            return res.status(500).json({
                message:"Transaction was reversed , please retry."
            })
        }
    }

    /**
     * 3. Check account status
     */

    if(fromUserAccount.status !== "ACTIVE" || toUserAccount.status !== "ACTIVE"){
        return res.status(400).json({
            message:"Both fromAccount and toAccount must be ACTIVE to process transaction."
        })
    }

    /**
     * 4. Derive sender balance from ledger
     */

    const balance = await fromUserAccount.getBalance();


    if(balance < amount ){
        return res.status(400).json({
            message:"Insufficient balance ."
        })
    }

    /**
      
     * 5. Create transaction (PENDING)
     */

    let transaction;
    let session; 
    try{
        const session = await mongoose.startSession();

        session.startTransaction();

        result = await transactionModel.create([
            {
                fromAccount,
                toAccount,
                amount,
                idempotencyKey,
                status:"PENDING"
            }
        ],
        {
            session
        })
        transaction = result[0]
        
        /**
         * 6. Create debit ledger entry
         */

        const debitLedgerEntry = await ledgerModel.create([
            {
                account:fromAccount,
                amount:amount,
                transaction:transaction._id,
                type:"DEBIT"
            }
        ],
        {
            session
        })

        /**
         * 7. Create credit ledger entry
         */

        const creditLedgerEntry = await ledgerModel.create([
            {
                account:toAccount,
                amount:amount,
                transaction:transaction._id,
                type:"CREDIT"
            }
        ],
        {
            session
        })

        /**
         * 8. Mark transaction completed
         */

        await transactionModel.findOneAndUpdate(
            {
            _id:transaction._id
            },
            {
                status:"COMPLETED"
            },
            {
                session
            }
        )

        /**
         * 9. Commit mongoDB session
         */

        await session.commitTransaction();

        session.endSession();
    }
    catch(error){
        await session.abortTransaction()
        session.endSession()
        return res.status(400).json({
            message: "Transaction is Pending due to some issue, please retry after sometime",
        })
    }

    /**
     * 10. Send email notification
     */

    await emailService.sendTransactionEmail(req.user.email , req.user.name , amount , toUserAccount.upiId);



    return res.status(201).json({
        message: "Transaction completed successfully",
        transaction: transaction
    })
    

}

async function createInitialFundsTransaction(req, res) {

    
    const { toAccount, amount, idempotencyKey } = req.body

    if (!toAccount || !amount || !idempotencyKey) {
        return res.status(400).json({
            message: "toAccount, amount and idempotencyKey are required"
        })
    }

    const toUserAccount = await accountModel.findOne({
        _id: toAccount,
    })

    if (!toUserAccount) {
        return res.status(400).json({
            message: "Invalid toAccount"
        })
    }

    const fromUserAccount = await accountModel.findOne({
        user: req.user._id,
        status: "ACTIVE"
    })

    if (!fromUserAccount) {
        return res.status(400).json({
            message: "System user account not found"
        })
    }


    const session = await mongoose.startSession()
    session.startTransaction()

    const transaction = new transactionModel({
        fromAccount: fromUserAccount._id,
        toAccount,
        amount,
        idempotencyKey,
        status: "PENDING"
    })

    const debitLedgerEntry = await ledgerModel.create([ {
        account: fromUserAccount._id,
        amount: amount,
        transaction: transaction._id,
        type: "DEBIT"
    } ], { session })

    const creditLedgerEntry = await ledgerModel.create([ {
        account: toAccount,
        amount: amount,
        transaction: transaction._id,
        type: "CREDIT"
    } ], { session })

    transaction.status = "COMPLETED"
    await transaction.save({ session })

    await session.commitTransaction()
    session.endSession()

    return res.status(201).json({
        message: "Initial funds transaction completed successfully",
        transaction: transaction
    })

}

async function getMyTransactions(req, res) {
    try {
        
        const myAccounts = await accountModel.find({
            user: req.user._id
        })

        const myAccountIds = myAccounts.map(acc => acc._id)

        const transactions = await transactionModel.find({
            $or: [
                { fromAccount: { $in: myAccountIds } },
                { toAccount: { $in: myAccountIds } }
            ],
            status: "COMPLETED"
        })
        .populate('fromAccount', 'user currency upiId nickname')
        .populate('toAccount', 'user currency upiId nickname ')
        .sort({ createdAt: -1 })  
        .limit(20)                

        return res.status(200).json({
            success: true,
            transactions,
            myAccountIds   
        })

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        })
    }
}

async function getChatTransactions(req, res) {
    try {
        const { userId } = req.params

        const myAccounts = await accountModel.find({ user: req.user._id })
        const myAccountIds = myAccounts.map(acc => acc._id)

        const theirAccounts = await accountModel.find({ user: userId })
        const theirAccountIds = theirAccounts.map(acc => acc._id)

       
        const theirPrimaryAccount = theirAccounts.find(acc => acc.isPrimary)
            ?? theirAccounts[0]

        
        const otherUser = await userModel.findById(userId).select('name')

        const transactions = await transactionModel.find({
            $or: [
                {
                    fromAccount: { $in: myAccountIds },
                    toAccount: { $in: theirAccountIds }
                },
                {
                    fromAccount: { $in: theirAccountIds },
                    toAccount: { $in: myAccountIds }
                }
            ],
            status: "COMPLETED"
        })
        .populate('fromAccount', 'upiId nickname user')
        .populate('toAccount', 'upiId nickname user')
        .sort({ createdAt: 1 })

        return res.status(200).json({
            success: true,
            transactions,
            myAccountIds,
            theirPrimaryAccountId: theirPrimaryAccount?._id,
            otherUserName: otherUser?.name,          
            otherUserUpi: theirPrimaryAccount?.upiId  
        })

    } catch(error) {
        return res.status(500).json({
            success: false,
            message: error.message
        })
    }
}
module.exports = {
    createTransaction,
    createInitialFundsTransaction,
    getMyTransactions,
    getChatTransactions
}