const generateIdempotencyKey = (fromAccount, toAccount) => {
    const timestamp = Date.now()

    const random = Math.random().toString(36).slice(2, 8)
    return `${fromAccount}-${toAccount}-${timestamp}-${random}`
}


module.exports = generateIdempotencyKey