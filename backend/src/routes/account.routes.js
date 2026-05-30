const express = require("express");


const authMiddleware = require("../middleware/auth.middleware");


const accountController = require("../controllers/account.controller");


const router = express.Router();



router.post("/",authMiddleware.authMiddleware,accountController.createAccountController);

router.get("/my", authMiddleware.authMiddleware, accountController.getUserAccountsController)

router.get(
   "/search",
   authMiddleware.authMiddleware,
   accountController.searchAccountByUpiController
);

router.patch('/primary/:accountId', authMiddleware.authMiddleware, accountController.setPrimaryAccount)


router.patch('/nickname/:accountId', authMiddleware.authMiddleware, accountController.updateNickname)


router.get('/:accountId', authMiddleware.authMiddleware, accountController.getAccountDetail)


router.get("/balance/:accountId", authMiddleware.authMiddleware, accountController.getAccountBalanceController);








module.exports = router;