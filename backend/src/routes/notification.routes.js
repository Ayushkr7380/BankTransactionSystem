const router = require('express').Router()
const {
    createDepositRequest,
    getPendingRequests,
    approveDepositRequest,
    rejectDepositRequest
} = require('../controllers/notification.controller')

const  authMiddleware  = require("../middleware/auth.middleware");

router.post('/deposit-request', authMiddleware.authMiddleware, createDepositRequest)
router.get('/pending', authMiddleware.authSystemUserMiddleware, getPendingRequests)
router.post('/approve/:notificationId', authMiddleware.authSystemUserMiddleware, approveDepositRequest)
router.post('/reject/:notificationId', authMiddleware.authSystemUserMiddleware, rejectDepositRequest)

module.exports = router