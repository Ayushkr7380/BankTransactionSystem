const accountModel = require('../models/account.model')
const transactionModel = require('../models/transaction.model')
const ledgerModel = require('../models/ledger.model')
const generateIdempotencyKey = require('../utils/generateIdempotencyKey')
const mongoose = require('mongoose')

async function processSystemTransfer(systemUser, toAccount, amount) {
    const fromUserAccount = await accountModel.findOne({
        user: systemUser._id,
        status: "ACTIVE"
    })

    if (!fromUserAccount) throw new Error("System account not found")

    const systemBalance = await fromUserAccount.getBalance()
    if (systemBalance < amount) throw new Error("Insufficient system balance")

    const idempotencyKey = generateIdempotencyKey(fromUserAccount._id, toAccount)

    const session = await mongoose.startSession()
    session.startTransaction()

    try {
        const result = await transactionModel.create([{
            fromAccount: fromUserAccount._id,
            toAccount,
            amount,
            idempotencyKey,
            status: "PENDING"
        }], { session })

        const transaction = result[0]

        await ledgerModel.create([{
            account: fromUserAccount._id,
            amount,
            transaction: transaction._id,
            type: "DEBIT"
        }], { session })

        await ledgerModel.create([{
            account: toAccount,
            amount,
            transaction: transaction._id,
            type: "CREDIT"
        }], { session })

        await transactionModel.findOneAndUpdate(
            { _id: transaction._id },
            { status: "COMPLETED" },
            { session }
        )

        await session.commitTransaction()
        session.endSession()

        return transaction

    } catch (error) {
        await session.abortTransaction()
        session.endSession()
        throw error
    }
}

module.exports = { processSystemTransfer }