const { config } = require("dotenv");
config();
const userModel = require("../models/user.model")
const jwt = require("jsonwebtoken");
const emailService = require("../services/email.service");
const accountModel = require("../models/account.model");
const ledgerModel = require("../models/ledger.model");
const mongoose = require("mongoose");
const tokenBlackListModel = require("../models/blackList.model");

const cookieOption = {
    httpOnly: true, 
    secure: true, 
    sameSite: "lax",
    maxAge: 2 * 24 * 60 * 60 * 1000 
}

const userRegisterController = async(req,res)=>{
    try{
        const { email , password , name , systemUser , systemSecretKey } = req.body;

        if(!email || !password || !name){
            return res.status(400).json({
                success:false,
                message:"All fields are required."
            })
        }

        if(systemUser){
            if(systemSecretKey !== process.env.SYSTEM_SECRET_KEY){
                return res.status(400).json({
                    success:false,
                    message:"System user registration failed."
                })
            }
        }

        const isExists = await userModel.findOne({email:email});

        if(isExists){
            return res.status(422).json({
                message:"User already exists with email.",
                status:false,
            })
        }

        const user = await userModel.create({
            email,
            password,   
            name,
            systemUser: systemUser ?? false
        });

        const systemWithUser = await userModel.findById(user._id).select("+systemUser");



        if(systemWithUser.systemUser){
            
           const session = await mongoose.startSession();
           session.startTransaction();

            try{
                const systemUserAccount = await accountModel.create([{
                    user: user._id,
                    nickname: "System Bank Account",
                    upiId: "system.bank@ledger",       
                    accountNumber: `ACC${Date.now().toString().slice(-7)}`, 
                }],{session})

                await ledgerModel.create([{
                    account:systemUserAccount[0]._id,
                    amount:Number(process.env.SYSTEM_INITIAL_FUND),
                    type:"SYSTEM_CAPITAL",
                    description:"Initial Bank Capital"
                }],{session})

                await session.commitTransaction();
                session.endSession();
            }catch(error){
                await session.abortTransaction()
                session.endSession()
                throw error
            }
            

        }



        const token = jwt.sign(
            {userId :user._id},
            process.env.JWT_SECRET,
            {expiresIn:"3d"}
        );

        if(!token){
            res.status(404).json({
                message:"Failed to generate token",
                success:false,
            })
        }

        res.cookie("token",token,cookieOption);

        res.status(201).json({
            user:{
                _id:user._id,
                email:user.email,
                name:user.name
            }
        })

         await emailService.sendRegistrationEmail(user.email, user.name)
    }
    catch(error){
        res.status(500).json({
            success:false,
            message:error.message
        })
    }
} 

const userLoginController = async(req,res)=>{
    const {email , password } = req.body;
    if(!email || !password){
        return res.status(400).json({
            success:false,
            message:"All fields are required."
        })
    }


    const user = await userModel.findOne({email}).select("+password");

    if(!user){
        return res.status(401).json({
            success:false,
            message:"Email or Password is INVALID."
        })
    }

    const isValidPassword = await user.comparePassword(password);

    if(!isValidPassword){
        return res.status(401).json({
            message:"Email or Password is INVALID.",
            success:false
        })
    }

    const token = jwt.sign(
        {userId:user._id},
        process.env.JWT_SECRET,
        {expiresIn : "2d"}
    );

    res.cookie("token",token,cookieOption);

    res.status(200).json({
        user: {
            _id: user._id,
            email: user.email,
            name: user.name
        },
    })

}

async function userLogoutController(req, res) {
    try {
        
    
        const token = req.cookies.token || req.headers.authorization?.split(" ")[ 1 ]

        if (!token) {
            return res.status(200).json({
                message: "User logged out successfully"
            })
        }



        await tokenBlackListModel.create({
            token: token
        })

        res.clearCookie("token")

        res.status(200).json({
            message: "User logged out successfully"
        })
    } catch (error) {
        res.status(500).json({
             success: false,
              message: error.message
         });
    }

}

async function userMeController(req,res){
    try {
        
        const  userId  = req.user._id;

        console.log(req.user._id);
        console.log(userId);
    
        const user = await userModel.findById(userId).select("-password");

        if(!user){
            return res.status(404).json({
                success:false,
                message:"User not found."
            })
        }

        res.status(200).json({
            success:true,
            message:"User fetched successfully",
            user:user
        })
    } catch (error) {
        res.status(500).json({
             success: false,
              message: error.message
         });
    }

}

module.exports = {
    userRegisterController,
    userLoginController,
    userLogoutController,
    userMeController

}