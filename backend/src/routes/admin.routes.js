const router = require('express').Router()
const { getAllDepositRequests } = require('../controllers/admin.controller')
const {
    getStats,
    getAllUsers,
    getUserDetail,
    getAllAccounts,
    getAccountDetail,
    getAllTransactions,
    freezeAccount,
    unfreezeAccount
} = require('../controllers/admin.controller')

const { authSystemUserMiddleware } = require("../middleware/auth.middleware")

router.get('/stats', authSystemUserMiddleware, getStats)
router.get('/users', authSystemUserMiddleware, getAllUsers)
router.get('/users/:userId', authSystemUserMiddleware, getUserDetail)
router.get('/accounts', authSystemUserMiddleware, getAllAccounts)
router.get('/accounts/:accountId', authSystemUserMiddleware, getAccountDetail)
router.get('/transactions', authSystemUserMiddleware, getAllTransactions)

router.patch('/accounts/:accountId/freeze', authSystemUserMiddleware, freezeAccount)
router.patch('/accounts/:accountId/unfreeze', authSystemUserMiddleware, unfreezeAccount)

router.get('/deposit-requests',authSystemUserMiddleware,getAllDepositRequests);


module.exports = router