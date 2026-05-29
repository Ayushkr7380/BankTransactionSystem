const mongoose = require("mongoose");
const ledgerModel = require("./ledger.model");
const accountSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",
        required: [true, "Account must be associated with a user."],
        index: true,
    },
    status: {
        type: String,
        enum: {
            values: ["ACTIVE", "FROZEN", "CLOSED"],
            message: "Status can be either ACTIVE, FROZEN or CLOSED.",
        },
        default: "ACTIVE"
    },
    currency: {
        type: String,
        required: [true, "Currency is required for creating an account"],
        default: "INR"
    },

    nickname: {
        type: String,
        required: [true, "Account nickname is required"],
        trim: true,
        maxLength: [30, "Nickname cannot exceed 30 characters"]
    },
    upiId: {
        type: String,
        unique: true,
        lowercase: true,
        trim: true,
        match: [/^[a-z0-9._]+@[a-z]+$/, "Invalid UPI ID format"]
    },
    accountNumber: {
        type: String,
        unique: true,
    },
    isPrimary: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
})
accountSchema.index({user:1,status:1});

accountSchema.pre('save', async function() {
    if(this.isPrimary) {
        await mongoose.model('account').updateMany(
            {
                user: this.user,
                _id: { $ne: this._id }  
            },
            { isPrimary: false }
        )
    }
})

accountSchema.methods.getBalance = async function(){
    const balanceData = await ledgerModel.aggregate([
        { $match :{ account:this._id}},
        {
            $group:{
                _id:null,
                totalDebit:{
                    $sum:{
                        $cond:[
                            { $eq :["$type","DEBIT"]},
                            "$amount",
                            0
                        ]
                    }
                },
                totalCredit:{
                    $sum:{
                        $cond:[
                            { $in: ["$type", ["CREDIT", "SYSTEM_CAPITAL"]] },
                            "$amount",
                            0
                        ]
                    }
                }
            }
        },
        {
            $project:{
                _id:0,
                balance:{
                    $subtract:[ "$totalCredit","$totalDebit"]
                }
            }
        }
    ])

    if(balanceData.length === 0){
        return 0
    }

    return balanceData[0].balance
}

const accountModel = mongoose.model("account",accountSchema);

module.exports = accountModel;



