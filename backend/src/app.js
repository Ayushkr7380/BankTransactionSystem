const express = require("express");
const cookieParser = require("cookie-parser");
const cors = require("cors");


const authRouter = require("./routes/auth.routes") 
const accountRouter = require("./routes/account.routes")
const transactionRoutes = require("./routes/transaction.routes")
const notificationRoutes = require("./routes/notification.routes")
const adminRoutes = require('./routes/admin.routes')

const app = express();

const corsOptions = {
    origin: process.env.FRONTEND_URL,
    credentials:true
}
app.use(cors(corsOptions));
app.use(express.json());
app.use(cookieParser());


app.get("/",(req,res)=>{
    res.send("Ledger service is up and running.");
})


app.use("/api/auth",authRouter);
app.use("/api/account",accountRouter);
app.use("/api/transactions", transactionRoutes)
app.use("/api/notifications", notificationRoutes)
app.use('/api/admin', adminRoutes)



module.exports = app;