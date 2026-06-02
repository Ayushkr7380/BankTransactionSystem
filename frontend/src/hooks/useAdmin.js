import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import API from '../api/axios'

// Stats
export const useAdminStats = () => {
    return useQuery({
        queryKey: ['admin-stats'],
        queryFn: () => API.get('/admin/stats'),
        select: (res) => res.data.stats,
        staleTime: 30 * 1000
    })
}

// All users
export const useAdminUsers = () => {
    return useQuery({
        queryKey: ['admin-users'],
        queryFn: () => API.get('/admin/users'),
        select: (res) => res.data.users,
        staleTime: 30 * 1000
    })
}

// Single user detail
export const useAdminUserDetail = (userId) => {
    return useQuery({
        queryKey: ['admin-user', userId],
        queryFn: () => API.get(`/admin/users/${userId}`),
        select: (res) => res.data,
        enabled: !!userId,
        staleTime: 30 * 1000
    })
}

// All accounts
export const useAdminAccounts = () => {
    return useQuery({
        queryKey: ['admin-accounts'],
        queryFn: () => API.get('/admin/accounts'),
        select: (res) => res.data.accounts,
        staleTime: 30 * 1000
    })
}

// Single account detail
export const useAdminAccountDetail = (accountId) => {
    return useQuery({
        queryKey: ['admin-account', accountId],
        queryFn: () => API.get(`/admin/accounts/${accountId}`),
        select: (res) => res.data,
        enabled: !!accountId,
        staleTime: 30 * 1000
    })
}

// All transactions
export const useAdminTransactions = () => {
    return useQuery({
        queryKey: ['admin-transactions'],
        queryFn: () => API.get('/admin/transactions'),
        select: (res) => res.data.transactions,
        staleTime: 30 * 1000
    })
}

// Pending notifications
export const useAdminPendingRequests = () => {
    return useQuery({
        queryKey: ['pending-requests'],
        queryFn: () => API.get('/depositRequest/pending'),
        select: (res) => res.data.requests,
        staleTime: 30 * 1000,
        refetchInterval: 30 * 1000
    })
}

// Approve deposit
export const useApproveDeposit = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (notificationId) =>
            API.post(`/depositRequest/approve/${notificationId}`),

        onSuccess: () => {
            queryClient.invalidateQueries(['pending-requests'])
            queryClient.invalidateQueries(['admin-stats'])
        }
    })
}

// Reject deposit
export const useRejectDeposit = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (notificationId) =>
            API.post(`/depositRequest/reject/${notificationId}`),

        onSuccess: () => {
            queryClient.invalidateQueries(['pending-requests'])
        }
    })
}

export const useFreezeAccount = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (accountId) =>
            API.patch(`/admin/accounts/${accountId}/freeze`),

        onSuccess: (_, accountId) => {
            queryClient.invalidateQueries(['admin-account', accountId])
            queryClient.invalidateQueries(['admin-accounts'])
        }
    })
}

export const useUnfreezeAccount = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (accountId) =>
            API.patch(`/admin/accounts/${accountId}/unfreeze`),

        onSuccess: (_, accountId) => {
            queryClient.invalidateQueries(['admin-account', accountId])
            queryClient.invalidateQueries(['admin-accounts'])
        }
    })
}

export const useAdminDepositRequests = () => {
    return useQuery({
        queryKey: ['admin-deposit-requests'],
        queryFn: () => API.get('/admin/deposit-requests'),
        select: (res) => res.data.requests,
        staleTime: 30 * 1000
    })
}