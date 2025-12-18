import React, { useState } from 'react';

const TransactionList = ({ filteredTransactions, currentFilter, setCurrentFilter, deleteTransaction, darkMode }) => {
    const [deleteModal, setDeleteModal] = useState(null);
    const [notifications, setNotifications] = useState([]);

    const formatNumber = (number) => {
        return new Intl.NumberFormat('en-PH', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(number);
    };

    const showNotification = (message, type = 'info') => {
        const id = Date.now();
        setNotifications(prev => [...prev, { id, message, type }]);
        setTimeout(() => removeNotification(id), 3000);
    };

    const removeNotification = (id) => {
        setNotifications(prev => prev.filter(n => n.id !== id));
    };

    // FIX: Idinagdag itong function para gumana ang pag-click sa delete icon
    const handleDeleteClick = (transaction) => {
        setDeleteModal(transaction);
    };

    const confirmDelete = () => {
        if (deleteModal) {
            deleteTransaction(deleteModal.id);
            showNotification(`Your Transaction"${deleteModal.description} is Successfully Deleted"`, 'success');
            setDeleteModal(null);
        }
    };

    const getNotificationConfig = (type) => {
        const icons = {
            success: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>,
            error: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
        };
        return type === 'success' 
            ? { bgColor: 'bg-green-600', borderColor: 'border-green-800', icon: icons.success }
            : { bgColor: 'bg-red-600', borderColor: 'border-red-800', icon: icons.error };
    };

    return (
        <>
            {/* Toast Notifications */}
            <div className="fixed top-5 right-5 z-[100] flex flex-col gap-3 pointer-events-none">
                {notifications.map((n) => {
                    const config = getNotificationConfig(n.type);
                    return (
                        <div key={n.id} className={`pointer-events-auto w-72 ${config.bgColor} text-white p-3 rounded-lg shadow-2xl border-l-4 ${config.borderColor} animate-slide-in-right`}>
                            <div className="flex items-start gap-3">
                                {config.icon}
                                <div className="flex-1 italic text-sm">{n.message}</div>
                                <button onClick={() => removeNotification(n.id)} className="opacity-70">×</button>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Modal Confirmation */}
            {deleteModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className={`w-full max-w-sm rounded-2xl p-6 shadow-2xl ${darkMode ? 'bg-gray-900 border border-gray-800 text-white' : 'bg-white text-gray-900'}`}>
                        <h3 className="text-xl font-bold mb-4 text-center">Confirm Delete</h3>
                        <p className={`text-sm mb-6 text-center ${darkMode ? 'opacity-70' : 'text-gray-600'}`}>Are you sure you want to delete "{deleteModal.description}"?</p>
                        <div className="flex gap-3">
                            <button onClick={() => setDeleteModal(null)} className="flex-1 py-2 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-bold hover:bg-gray-200 transition-colors">Cancel</button>
                            <button onClick={confirmDelete} className="flex-1 py-2 rounded-xl bg-red-600 text-white font-bold hover:bg-red-700 transition-colors shadow-lg shadow-red-500/30">Delete</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Main Card */}
            <div className={`rounded-2xl p-6 transition-all duration-300 ${darkMode ? 'bg-gray-800/50 border border-gray-700 shadow-none' : 'bg-white border border-gray-200 shadow-sm'}`}>
                
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                    <h3 className={`text-xl sm:text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>Recent Transactions</h3>
                    
                    {/* FILTER BUTTONS: Inayos para sa Light Mode */}
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
                        <div className={`text-center py-10 italic text-sm ${darkMode ? 'opacity-40' : 'text-gray-400'}`}>Walang nahanap na transaction.</div>
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