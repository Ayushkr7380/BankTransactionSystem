const router = require('express').Router()
const {
    createDepositRequest,
    getPendingRequests,
    approveDepositRequest,
    rejectDepositRequest,
    getMyDepositRequests
} = require('../controllers/depositRequest.controller')

const  authMiddleware  = require("../middleware/auth.middleware");

router.post('/deposit-request', authMiddleware.authMiddleware, createDepositRequest)
router.get('/pending', authMiddleware.authSystemUserMiddleware, getPendingRequests)
router.post('/approve/:notificationId', authMiddleware.authSystemUserMiddleware, approveDepositRequest)
router.post('/reject/:notificationId', authMiddleware.authSystemUserMiddleware, rejectDepositRequest)
router.get('/my-requests',authMiddleware.authMiddleware,getMyDepositRequests);

module.exports = router