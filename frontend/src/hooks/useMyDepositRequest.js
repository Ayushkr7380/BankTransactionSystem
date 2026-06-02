import { useQuery } from '@tanstack/react-query'
import API from '../api/axios'

export const useMyDepositRequests = () => {
    return useQuery({
        queryKey: ['my-deposit-requests'],
        queryFn: () => API.get('/depositRequest/my-requests'),
        select: (res) => res.data.requests,
        staleTime: 30 * 1000
    })
}