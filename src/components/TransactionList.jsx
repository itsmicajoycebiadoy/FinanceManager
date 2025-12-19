import React, { useState } from 'react';

const TransactionList = ({ filteredTransactions, currentFilter, setCurrentFilter, deleteTransaction, darkMode, showNotification }) => {
    const [deleteModal, setDeleteModal] = useState(null);

    const formatNumber = (number) => {
        return new Intl.NumberFormat('en-PH', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(number);
    };

    const handleDeleteClick = (transaction) => {
        setDeleteModal(transaction);
    };

    const confirmDelete = () => {
        if (deleteModal) {
            deleteTransaction(deleteModal.id);
            
            if (showNotification) {
                showNotification(`Your Transaction "${deleteModal.description}" is Successfully Deleted`, 'success');
            }
            
            setDeleteModal(null);
        }
    };

    return (
        <>
            {/* Modal Confirmation */}
            {deleteModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] p-6">
                    <div className={`w-full max-w-[300px] rounded-2xl p-5 shadow-2xl transform transition-all animate-in zoom-in-95 duration-200 ${darkMode ? 'bg-gray-900 border border-gray-800 text-white' : 'bg-white text-gray-900'}`}>
                        <div className="flex justify-center mb-3">
                            <div className="bg-red-100 dark:bg-red-900/20 p-2 rounded-full">
                                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                </svg>
                            </div>
                        </div>
                        <h3 className="text-lg font-bold mb-1 text-center">Delete Transaction?</h3>
                        <p className={`text-xs mb-5 text-center px-2 leading-relaxed ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                            Are you sure you want to delete <span className="font-bold text-red-500">"{deleteModal.description}"</span>?
                        </p>
                        <div className="flex gap-2">
                            <button 
                                onClick={() => setDeleteModal(null)} 
                                className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all active:scale-95 ${darkMode ? 'bg-gray-800 text-gray-300 hover:bg-gray-700' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                            >
                                Cancel
                            </button>
                            <button 
                                onClick={confirmDelete} 
                                className="flex-1 py-2 rounded-xl bg-red-600 text-white text-xs font-bold hover:bg-red-700 transition-all shadow-md shadow-red-500/20 active:scale-95"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Main Card */}
            <div className={`rounded-2xl p-6 transition-all duration-300 ${darkMode ? 'bg-gray-800' : 'bg-white'}`}> 
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                    
                    <h3 className={`text-xl sm:text-2xl font-bold flex items-center gap-2 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                        <span className="w-1.5 h-6 bg-indigo-600 rounded-full"></span>
                        Recent Transactions
                    </h3>
                    
                    <div className={`flex p-1 rounded-xl border ${darkMode ? 'bg-gray-900 border-gray-700' : 'bg-gray-100 border-gray-200'}`}>
                        {['all', 'income', 'expense'].map((filter) => (
                            <button
                                key={filter}
                                onClick={() => setCurrentFilter(filter)}
                                className={`px-4 py-1.5 rounded-lg text-xs font-bold capitalize transition-all duration-200 
                                    ${currentFilter === filter 
                                        ? 'bg-indigo-600 text-white shadow-md scale-105' 
                                        : 'text-gray-500 hover:text-indigo-600 dark:hover:text-indigo-400'
                                    }`}
                            >
                                {filter}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="space-y-3 overflow-y-auto max-h-[450px] pr-2 custom-scrollbar">
                    {filteredTransactions.length === 0 ? (
                        <div className={`text-center py-10 italic text-sm text-gray-300 ${darkMode ? 'opacity-30' : 'text-gray-300'}`}>No transactions yet.</div>
                    ) : (
                        filteredTransactions.map(transaction => (
                            <div 
                                key={transaction.id} 
                                className={`group flex items-center justify-between p-4 rounded-xl transition-all border-l-4 shadow-sm hover:translate-x-1
                                    ${transaction.type === 'income' 
                                        ? (darkMode ? 'border-green-500 bg-green-500/5' : 'border-green-500 bg-green-50') 
                                        : (darkMode ? 'border-red-500 bg-red-500/5' : 'border-red-500 bg-red-50')
                                    } `}
                            >
                                <div className="min-w-0 flex-1">
                                    <h4 className={`text-sm font-bold truncate ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                                        {transaction.description}
                                    </h4>
                                    <div className="flex items-center gap-2 mt-1">
                                        <span className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase ${darkMode ? 'bg-gray-700 text-gray-400' : 'bg-gray-200 text-gray-600'}`}>
                                            {transaction.category}
                                        </span>
                                        <span className="text-[10px] text-gray-400">
                                            {new Date(transaction.date).toLocaleDateString()}
                                        </span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <span className={`text-sm font-black ${transaction.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                                        {transaction.type === 'income' ? '+' : '-'}₱{formatNumber(transaction.amount)}
                                    </span>
                                    <button 
                                        onClick={() => handleDeleteClick(transaction)} 
                                        className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-100 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </>
    );
};

export default TransactionList;