import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { getMyTransactionsApi, getChat, createTransactionApi } from "../api/transaction.api"

export const useMyTransactions = () => {
    return useQuery({
        queryKey: ['transactions'],
        queryFn: getMyTransactionsApi,
        select: (data) => data.data
    })
}

export const useChatTransactions = (userId) => {
    return useQuery({
        queryKey: ['chat', userId],
        queryFn: () => getChat(userId), 
        select: (data) => data.data,
        enabled: !!userId
    })
}

export const useCreateTransaction = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: createTransactionApi,

        onSuccess: (_, variables) => {
            queryClient.invalidateQueries(['chat', variables.toUserId])
            queryClient.invalidateQueries(['accounts'])
            queryClient.invalidateQueries(['transactions'])
        }
    })
}