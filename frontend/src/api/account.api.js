import API from "./axios"
export const getMyAccountsApi = () => API.get('/account/my');
export const createAccountApi = (data)=> API.post("/account",data);
export const setPrimaryAccountApi = (accountId) =>API.patch(`/account/primary/${accountId}`)
export const searchByUpiApi = (upiId) => API.get(`/account/search?upiId=${upiId}`)
