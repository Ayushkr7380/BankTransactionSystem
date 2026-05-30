const {Router } = require("express");
const { authMiddleware } = require("../middleware/auth.middleware");
const transactionController = require("../controllers/transaction.controller");



const transactionRoutes = Router();


/** 
 * - POST /api/transaction
 * - Create a new transaction
 */

transactionRoutes.post("/create",authMiddleware,transactionController.createTransaction);

/**
 * - GET /api/tramsaction
 * - fetch all transcation
*/

transactionRoutes.get("/my",authMiddleware,transactionController.getMyTransactions);


// /**
//  * - POST /api/transactions/system/initial-funds
//  * - Create initial funds transaction from system user
//  */
// transactionRoutes.post("/system/initial-funds", authSystemUserMiddleware, transactionController.createInitialFundsTransaction);


transactionRoutes.get('/chat/:userId', authMiddleware, transactionController.getChatTransactions)


module.exports = transactionRoutes;