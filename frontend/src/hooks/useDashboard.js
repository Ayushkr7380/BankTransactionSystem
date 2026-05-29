// hooks/useDashboard.js
import { useQuery } from '@tanstack/react-query'
import { getMyAccountsApi } from '../api/account.api'
import { getMyTransactionsApi } from '../api/transaction.api'
import { getMeApi } from '../api/auth.api'

export const useDashboard = () => {

    const { data: userData } = useQuery({
        queryKey: ['me'],
        queryFn: getMeApi
    })

    console.log(userData);

    const { data: accountsData, isLoading: accountsLoading } = useQuery({
        queryKey: ['accounts'],
        queryFn: getMyAccountsApi
    })
    console.log(accountsData);

    const { data: txnData, isLoading: txnLoading } = useQuery({
        queryKey: ['transactions'],
        queryFn: getMyTransactionsApi
    })

    console.log(txnData);
    

    const accounts = accountsData?.data?.accounts ?? []
    const transactions = txnData?.data?.transactions ?? []
    // console.log("ds",transactions);
    
    const myAccountIds = txnData?.data?.myAccountIds ?? []
    const user = userData?.data?.user

    // Total balance
    const totalBalance = accounts.reduce((sum, acc) =>
        sum + acc.balance, 0)

    // This month filter
    const now = new Date()
    const thisMonthTxns = transactions.filter(txn => {
        const d = new Date(txn.createdAt)
        return d.getMonth() === now.getMonth() &&
               d.getFullYear() === now.getFullYear()
    })

    // Sent amount
    const sentThisMonth = thisMonthTxns
        .filter(txn => myAccountIds.includes(txn.fromAccount?._id))
        .reduce((sum, txn) => sum + txn.amount, 0)

    // Received amount
    const receivedThisMonth = thisMonthTxns
        .filter(txn => myAccountIds.includes(txn.toAccount?._id))
        .reduce((sum, txn) => sum + txn.amount, 0)

    return {
        user,
        accounts,
        transactions,
        myAccountIds,
        totalBalance,
        sentThisMonth,
        receivedThisMonth,
        isLoading: accountsLoading || txnLoading
    }
}