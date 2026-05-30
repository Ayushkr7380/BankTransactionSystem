import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { 
    getMyAccountsApi, 
    createAccountApi, 
    setPrimaryAccountApi, 
    searchByUpiApi,
    getAccountDetailApi,
    updateNicknameApi
} from '../api/account.api'


export const useGetMyAccounts = () => {
    return useQuery({
        queryKey: ['accounts'],
        queryFn: getMyAccountsApi,
        select: (data) => data.data.accounts
    })
}

export const useCreateAccount = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: createAccountApi,

        onSuccess: () => {
           
            queryClient.invalidateQueries(['accounts'])
        },

        onError: (error) => {
            console.log(error.response?.data?.message)
        }
    })
}

export const useSetPrimary = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: setPrimaryAccountApi,

        onSuccess: () => {
            queryClient.invalidateQueries(['accounts'])  
        }

        ,
        onError: (error) => {
           
            console.log(error.response?.data?.message)
        }
    })
}

export const useSearchUpi = (upiId) => {
    return useQuery({
        queryKey: ['upi-search', upiId],
        queryFn: () => searchByUpiApi(upiId),
        select: (data) => data.data,
        enabled: upiId?.length > 3  
    })
}

export const useAccountDetail = (accountId) => {
    return useQuery({
        queryKey: ['account', accountId],
        queryFn: () => getAccountDetailApi(accountId),
        select: (data) => data.data,
        enabled: !!accountId
    })
}

export const useUpdateNickname = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({ accountId, nickname }) => updateNicknameApi(accountId, nickname),

        onSuccess: (_, variables) => {
            queryClient.invalidateQueries(['account', variables.accountId])
            queryClient.invalidateQueries(['accounts'])
        }
    })
}