import React, { useState } from 'react';

const TransactionList = ({ filteredTransactions, currentFilter, setCurrentFilter, deleteTransaction, darkMode }) => {
    const [deleteModal, setDeleteModal] = useState(null);
    const [notifications, setNotifications] = useState([]);

    // Format number with commas
    const formatNumber = (number) => {
        return new Intl.NumberFormat('en-PH', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(number);
    };

    // Show notification function
    const showNotification = (message, type = 'info') => {
        const id = Date.now();
        const newNotification = {
            id,
            message,
            type,
            timestamp: new Date().getTime()
        };
        
        setNotifications(prev => [...prev, newNotification]);
        
        // Auto-remove notification after 3 seconds
        setTimeout(() => {
            removeNotification(id);
        }, 3000);
    };

    const removeNotification = (id) => {
        setNotifications(prev => prev.filter(notification => notification.id !== id));
    };

    const handleDeleteClick = (transaction) => {
        setDeleteModal(transaction);
    };

    const confirmDelete = () => {
        if (deleteModal) {
            deleteTransaction(deleteModal.id);
            showNotification(
                `Successfully deleted transaction "${deleteModal.description}"`,
                'success'
            );
            setDeleteModal(null);
        }
    };

    const cancelDelete = () => {
        setDeleteModal(null);
    };

    const getNotificationConfig = (type) => {
        switch(type) {
            case 'error':
                return {
                    bgColor: 'bg-red-500',
                    borderColor: 'border-red-700',
                    icon: (
                        <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                        </svg>
                    ),
                    title: 'Error'
                };
            case 'success':
                return {
                    bgColor: 'bg-green-500',
                    borderColor: 'border-green-700',
                    icon: (
                        <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                        </svg>
                    ),
                    title: 'Success'
                };
            case 'warning':
                return {
                    bgColor: 'bg-yellow-500',
                    borderColor: 'border-yellow-700',
                    icon: (
                        <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L4.732 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
                        </svg>
                    ),
                    title: 'Warning'
                };
            default: // info
                return {
                    bgColor: 'bg-blue-500',
                    borderColor: 'border-blue-700',
                    icon: (
                        <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                        </svg>
                    ),
                    title: 'Info'
                };
        }
    };

    return (
        <>
            {/* Notification Container */}
            <div className="fixed top-4 right-4 z-50 space-y-3 w-full max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg xl:max-w-xl px-4 sm:px-0">
                {notifications.map((notification) => {
                    const config = getNotificationConfig(notification.type);
                    return (
                        <div 
                            key={notification.id}
                            className={`animate-slide-in-right ${config.bgColor} text-white px-4 sm:px-5 md:px-6 py-3 sm:py-4 rounded-lg shadow-xl border-l-4 ${config.borderColor} transform transition-all duration-300 hover:scale-[1.02]`}
                        >
                            <div className="flex items-start justify-between">
                                <div className="flex items-start flex-1">
                                    <div className="mr-3 mt-0.5 flex-shrink-0">
                                        {config.icon}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-semibold text-sm sm:text-base md:text-lg">{config.title}</p>
                                        <p className="text-xs sm:text-sm md:text-base mt-1 text-white/90 leading-relaxed break-words">
                                            {notification.message}
                                        </p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => removeNotification(notification.id)}
                                    className="ml-3 text-white/80 hover:text-white transition-colors flex-shrink-0 mt-0.5"
                                    aria-label="Close notification"
                                >
                                    <svg className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                                    </svg>
                                </button>
                            </div>
                            {/* Progress bar - using Tailwind animation */}
                            <div className="mt-3 h-1 bg-white/30 rounded-full overflow-hidden">
                                <div 
                                    className={`h-full ${config.bgColor.replace('500', '300')}`}
                                    style={{
                                        animation: 'progress 3s linear forwards',
                                        animationDelay: '0s'
                                    }}
                                />
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Delete Confirmation Modal */}
            {deleteModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-fade-in" onClick={(e) => e.target === e.currentTarget && cancelDelete()}>
                    <div className={`rounded-2xl shadow-2xl max-w-md w-full transform transition-all duration-300 animate-scale-in ${darkMode ? 'bg-gray-900' : 'bg-white'}`}>
                        <div className="p-6 sm:p-8">
                            {/* Warning Icon */}
                            <div className="mx-auto w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mb-4">
                                <svg className="w-8 h-8 sm:w-10 sm:h-10 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L4.732 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
                                </svg>
                            </div>
                            
                            <h3 className={`text-xl sm:text-2xl font-bold text-center mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                                Delete Transaction
                            </h3>
                            
                            <p className={`text-sm sm:text-base text-center mb-6 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                                Are you sure you want to delete this transaction?
                            </p>
                            
                            {/* Transaction Details */}
                            <div className={`rounded-xl p-4 mb-6 ${darkMode ? 'bg-gray-800' : 'bg-gray-50'}`}>
                                <div className="flex items-center justify-between mb-2">
                                    <span className={`font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Description:</span>
                                    <span className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                                        {deleteModal.description}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between mb-2">
                                    <span className={`font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Amount:</span>
                                    <span className={`font-bold ${deleteModal.type === 'income' ? 'text-green-500' : 'text-red-500'}`}>
                                        {deleteModal.type === 'income' ? '+' : '-'}₱{formatNumber(deleteModal.amount)}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className={`font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Date:</span>
                                    <span className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                        {new Date(deleteModal.date).toLocaleDateString()}
                                    </span>
                                </div>
                            </div>
                            
                            {/* Action Buttons */}
                            <div className="flex flex-col sm:flex-row gap-3">
                                <button
                                    onClick={cancelDelete}
                                    className={`flex-1 py-3 px-4 rounded-xl font-medium text-sm sm:text-base transition-all duration-200 ${darkMode ? 'bg-gray-800 hover:bg-gray-700 text-gray-300' : 'bg-gray-200 hover:bg-gray-300 text-gray-700'}`}
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={confirmDelete}
                                    className="flex-1 py-3 px-4 bg-red-600 hover:bg-red-700 text-white rounded-xl font-medium text-sm sm:text-base transition-all duration-200 transform hover:scale-[1.02] shadow-lg hover:shadow-xl"
                                >
                                    Delete Transaction
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Main Transaction List */}
            <div className={`rounded-xl shadow-lg p-5 sm:p-6 md:p-8 ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 sm:mb-6 gap-3">
                    <h3 className={`text-xl sm:text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>Recent Transactions</h3>
                    <div className="flex gap-2 overflow-x-auto pb-2 sm:pb-0">
                        {/* All Button */}
                        <button
                            onClick={() => setCurrentFilter('all')}
                            className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium whitespace-nowrap transition-all duration-200 ${currentFilter === 'all' ? 'bg-indigo-600 text-white shadow-lg' : darkMode ? 'bg-gray-700 hover:bg-gray-600 text-gray-300' : 'bg-gray-200 hover:bg-gray-300 text-gray-700'}`}>
                            All
                        </button>

                        {/* Income Button */}
                        <button
                            onClick={() => setCurrentFilter('income')}
                            className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium whitespace-nowrap transition-all duration-200 ${currentFilter === 'income' ? 'bg-green-600 text-white shadow-lg' : darkMode ? 'bg-gray-700 hover:bg-gray-600 text-gray-300' : 'bg-gray-200 hover:bg-gray-300 text-gray-700'}`}>
                            Income
                        </button>

                        {/* Expenses Button */}
                        <button
                            onClick={() => setCurrentFilter('expense')}
                            className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium whitespace-nowrap transition-all duration-200 ${currentFilter === 'expense' ? 'bg-red-600 text-white shadow-lg' : darkMode ? 'bg-gray-700 hover:bg-gray-600 text-gray-300' : 'bg-gray-200 hover:bg-gray-300 text-gray-700'}`}>
                            Expenses
                        </button>
                    </div>
                </div>

                {/* Responsive Scroll Container */}
                <div className="relative">
                    <div className={`space-y-3 max-h-[300px] sm:max-h-[350px] md:max-h-[400px] lg:max-h-[450px] overflow-y-auto pr-2 scrollbar-thin ${darkMode ? 'scrollbar-thumb-gray-600 scrollbar-track-gray-800' : 'scrollbar-thumb-gray-300 scrollbar-track-gray-100'}`}>
                        {filteredTransactions.length === 0 ? (
                            <div className={`text-center py-8 rounded-xl ${darkMode ? 'bg-gray-900/50' : 'bg-gray-50'}`}>
                                <svg className="w-12 h-12 mx-auto mb-3 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path>
                                </svg>
                                <p className={`text-sm sm:text-base ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>No transactions yet. Add your first transaction above!</p>
                            </div>
                        ) : (
                            filteredTransactions.map(transaction => (
                                <div 
                                    key={transaction.id} 
                                    className={`p-3 sm:p-4 rounded-lg border-l-4 transition-all duration-200 hover:shadow-lg hover:transform hover:scale-[1.02] ${transaction.type === 'income' ? 'border-green-500' : 'border-red-500'} ${darkMode ? transaction.type === 'income' ? 'bg-green-900/30 hover:bg-green-900/50' : 'bg-red-900/30 hover:bg-red-900/50' : transaction.type === 'income' ? 'bg-green-50 hover:bg-green-100' : 'bg-red-50 hover:bg-red-100'}`}
                                >
                                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                                        <div className="flex-1 w-full sm:w-auto">
                                            <div className="flex flex-wrap items-center gap-2 mb-1">
                                                <span className={`font-semibold text-sm sm:text-base ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                                                    {transaction.description}
                                                </span>
                                                <span className={`text-xs px-2 py-0.5 sm:py-1 rounded-full transition-colors ${darkMode ? 'bg-gray-700 hover:bg-gray-600 text-gray-300' : 'bg-white hover:bg-gray-100 text-gray-600'}`}>
                                                    {transaction.category}
                                                </span>
                                            </div>
                                            <p className={`text-xs sm:text-sm flex items-center gap-1 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                                                </svg>
                                                {new Date(transaction.date).toLocaleDateString()}
                                            </p>
                                        </div>

                                        <div className="flex items-center justify-between sm:justify-end gap-3 w-full sm:w-auto">
                                            <span className={`text-lg sm:text-xl font-bold ${transaction.type === 'income' ? 'text-green-500' : 'text-red-500'}`}>
                                                {transaction.type === 'income' ? '+' : '-'}₱{formatNumber(transaction.amount)}
                                            </span>
                                            <button 
                                                onClick={() => handleDeleteClick(transaction)} 
                                                className="p-1.5 sm:p-2 text-red-500 hover:bg-red-500/10 rounded-lg transition-all duration-200 hover:scale-110 group"
                                                aria-label="Delete transaction"
                                            >
                                                <svg className="w-4 h-4 sm:w-5 sm:h-5 group-hover:rotate-12 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                                                </svg>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </>
    );
};

export default TransactionList;