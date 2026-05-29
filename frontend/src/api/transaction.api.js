import API from "./axios"

export const getMyTransactionsApi = () => API.get('/transactions/my')
export const getChat = (userId) => API.get(`/transactions/chat/${userId}`)
export const createTransactionApi = (data) => API.post('/transactions/create', data)