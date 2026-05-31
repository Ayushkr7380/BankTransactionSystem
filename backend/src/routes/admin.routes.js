const router = require('express').Router()
const {
    getStats,
    getAllUsers,
    getUserDetail,
    getAllAccounts,
    getAccountDetail,
    getAllTransactions
} = require('../controllers/admin.controller')
const { authSystemUserMiddleware } = require("../middleware/auth.middleware")

router.get('/stats', authSystemUserMiddleware, getStats)
router.get('/users', authSystemUserMiddleware, getAllUsers)
router.get('/users/:userId', authSystemUserMiddleware, getUserDetail)
router.get('/accounts', authSystemUserMiddleware, getAllAccounts)
router.get('/accounts/:accountId', authSystemUserMiddleware, getAccountDetail)
router.get('/transactions', authSystemUserMiddleware, getAllTransactions)

module.exports = router