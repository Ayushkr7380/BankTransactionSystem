import API from "./axios";

export const registerAPI = (data) => API.post("/auth/register",data);

export const loginAPI = (data) =>API.post("/auth/login",data);


export const getMeApi = async() =>API.get("/auth/me");

export const logoutApi = () => API.post('/auth/logout')

