import { useMutation } from "@tanstack/react-query"
import { registerAPI } from "../api/auth.api"
import { useNavigate } from "react-router-dom"
import { loginAPI } from '../api/auth.api'
import { logoutApi } from '../api/auth.api'
import { useQueryClient } from "@tanstack/react-query"

export const useRegister = ()=>{

    const navigate = useNavigate();

    const mutated = useMutation({
        mutationFn:registerAPI,
        onSuccess:(data)=>{
            console.log(data);
            navigate("/auth/Me");

        },

        onError :(error)=>{
            console.log(error.response?.data?.message)
        }
    })
    return mutated;
}



export const useLogin = () => {
    const navigate = useNavigate()

    return useMutation({
        mutationFn: loginAPI,

        onSuccess: (data) => {
            const user = data.data.user

            
            if (user.isSystemUser) {
                navigate('/system/dashboard')
            } else {
                navigate('/auth/Me')
            }
        },

        onError: (error) => {
            console.log(error.response?.data?.message || error.message)
        }
    })
}


export const useLogout = () => {
    const navigate = useNavigate()
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: logoutApi,

        onSuccess: () => {
            queryClient.clear()  
            navigate('/auth/login')
        },

        onError: (error) => {
            console.log(error.response?.data?.message || error.message)
        }
    })
}

