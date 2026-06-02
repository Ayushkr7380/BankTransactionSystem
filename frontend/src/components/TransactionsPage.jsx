import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Skeleton from "./Skeleton";
import { useDashboard } from "../hooks/useDashboard";

function TransactionsPage() {
    const navigate = useNavigate();
    const [filter, setFilter] = useState("ALL");

    const {
        transactions,
        myAccountIds,
        isLoading
    } = useDashboard();

    const filteredTxns = transactions.filter(txn => {
        if (filter === "ALL") return true;
        return txn.status === filter;
    });

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-50">

                <div className="bg-white border-b border-gray-100 px-5 h-14 flex items-center gap-3">
                    <Skeleton className="w-8 h-8 rounded-lg" />
                    <Skeleton className="h-4 w-32" />
                    <div className="ml-auto">
                        <Skeleton className="h-4 w-16" />
                    </div>
                </div>

                <div className="p-5 max-w-lg mx-auto flex flex-col gap-3">

                    <div className="flex gap-2">
                        <Skeleton className="h-8 w-16 rounded-full" />
                        <Skeleton className="h-8 w-24 rounded-full" />
                        <Skeleton className="h-8 w-20 rounded-full" />
                        <Skeleton className="h-8 w-16 rounded-full" />
                    </div>

                    <Skeleton className="h-20 rounded-xl" />
                    <Skeleton className="h-20 rounded-xl" />
                    <Skeleton className="h-20 rounded-xl" />
                    <Skeleton className="h-20 rounded-xl" />

                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">

            {/* Navbar */}
            <nav className="bg-white border-b border-gray-100 px-5 h-14 flex items-center gap-3">
                <button
                    onClick={() => navigate(-1)}
                    className="w-8 h-8 border border-gray-100 rounded-lg flex items-center justify-center"
                >
                    ←
                </button>

                <span className="text-sm font-medium text-gray-900">
                    All Transactions
                </span>

                <span className="text-xs text-gray-400 ml-auto">
                    {transactions.length} total
                </span>
            </nav>

            <div className="p-5 max-w-lg mx-auto flex flex-col gap-3">

                {/* Filters */}
                <div className="flex gap-2">
                    {["ALL", "COMPLETED", "PENDING", "FAILED"].map(f => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={`text-xs px-3 py-1.5 rounded-full transition ${
                                filter === f
                                    ? "bg-gray-900 text-white"
                                    : "bg-white border border-gray-200 text-gray-500"
                            }`}
                        >
                            {f}
                        </button>
                    ))}
                </div>

                {filteredTxns.length === 0 && (
                    <div className="bg-white border border-gray-100 rounded-xl px-4 py-8 text-center">
                        <p className="text-sm text-gray-400">
                            No transactions found
                        </p>
                    </div>
                )}

                <div className="flex flex-col rounded-xl overflow-hidden border border-gray-100">

                    {filteredTxns.map(txn => {

                        const isSent = myAccountIds.includes(
                            txn.fromAccount?._id
                        );

                        return (
                            <div
                                key={txn._id}
                                className="bg-white px-4 py-3 flex justify-between items-center border-b border-gray-50 last:border-0"
                            >
                                <div className="flex items-center gap-3">

                                    <div
                                        className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${
                                            isSent
                                                ? "bg-red-50 text-red-500"
                                                : "bg-green-50 text-green-600"
                                        }`}
                                    >
                                        {isSent ? "↑" : "↓"}
                                    </div>

                                    <div>
                                        <p className="text-sm font-medium text-gray-900">
                                            {isSent
                                                ? txn.toAccount?.upiId
                                                : txn.fromAccount?.upiId}
                                        </p>

                                        <p className="text-xs text-gray-400">
                                            {new Date(
                                                txn.createdAt
                                            ).toLocaleDateString("en-IN")}
                                        </p>
                                    </div>
                                </div>

                                <div className="text-right">

                                    <p
                                        className={`text-sm font-medium ${
                                            isSent
                                                ? "text-red-500"
                                                : "text-green-600"
                                        }`}
                                    >
                                        {isSent ? "−" : "+"} ₹
                                        {txn.amount.toLocaleString("en-IN")}
                                    </p>

                                    <span
                                        className={`text-xs px-1.5 py-0.5 rounded-full ${
                                            txn.status === "COMPLETED"
                                                ? "bg-green-50 text-green-600"
                                                : txn.status === "PENDING"
                                                ? "bg-yellow-50 text-yellow-600"
                                                : "bg-red-50 text-red-500"
                                        }`}
                                    >
                                        {txn.status}
                                    </span>

                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}

export default TransactionsPage;