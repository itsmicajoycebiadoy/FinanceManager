import React, { useState, useEffect, useRef } from 'react';

const ArchiveModal = ({ isOpen, onClose, deletedTransactions, restoreTransaction, permanentDelete, darkMode, emptyAllTransactions }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showDeleteAllConfirm, setShowDeleteAllConfirm] = useState(false);
  const modalRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return;

    const handleScroll = () => {
      const footer = document.querySelector('footer');
      if (!footer) return;

      const footerRect = footer.getBoundingClientRect();
      const isFooterVisible = footerRect.top < window.innerHeight;
      const isAtBottom = window.innerHeight + window.scrollY >= document.body.offsetHeight - 50;
      
      if (isFooterVisible || isAtBottom) {
        onClose();
      }
    };

    window.addEventListener('scroll', handleScroll);
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Get unique categories from deleted transactions
  const categories = ['all', ...new Set(deletedTransactions.map(t => t.category))];

  // Filter transactions based on search and category
  const filteredTransactions = deletedTransactions.filter(transaction => {
    const matchesSearch = transaction.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         transaction.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || transaction.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const getTimeSinceDeletion = (deletedAt) => {
    const diffMs = new Date() - new Date(deletedAt);
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMinutes = Math.floor(diffMs / (1000 * 60));

    if (diffDays > 0) return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
    if (diffHours > 0) return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
    if (diffMinutes > 0) return `${diffMinutes} minute${diffMinutes !== 1 ? 's' : ''} ago`;
    return 'just now';
  };

  const getDaysUntilPermanent = (deletedAt) => {
    const deletedDate = new Date(deletedAt);
    const permanentDate = new Date(deletedDate.getTime() + (30 * 24 * 60 * 60 * 1000));
    const daysLeft = Math.ceil((permanentDate - new Date()) / (1000 * 60 * 60 * 24));
    return Math.max(0, daysLeft);
  };

  const handleEmptyBinClick = () => {
    if (deletedTransactions.length === 0) return;
    setShowDeleteAllConfirm(true);
  };

  const confirmDeleteAll = () => {
    if (deletedTransactions.length > 0) {
      if (emptyAllTransactions && typeof emptyAllTransactions === 'function') {
        emptyAllTransactions();
        // No notification shown
      }
    }
    setShowDeleteAllConfirm(false);
  };

  const cancelDeleteAll = () => {
    setShowDeleteAllConfirm(false);
  };

  const handleRestoreClick = (transaction) => {
    if (restoreTransaction && typeof restoreTransaction === 'function') {
      restoreTransaction(transaction.id);
      // No notification shown - just the transaction is restored
    }
  };

  const handlePermanentDeleteClick = (transaction) => {
    if (permanentDelete && typeof permanentDelete === 'function') {
      permanentDelete(transaction.id);
      // No notification shown - just the transaction is permanently deleted
    }
  };

  return (
    <>
      {/* Delete All Confirmation Modal */}
      {showDeleteAllConfirm && (
        <div className="fixed inset-0 z-[9998] bg-black/50 flex items-center justify-center p-4 animate-fade-in" onClick={cancelDeleteAll}>
          <div 
            className={`rounded-2xl shadow-2xl max-w-md w-full transform transition-all duration-300 animate-scale-in ${darkMode ? 'bg-gray-900' : 'bg-white'}`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 sm:p-8">
              {/* Warning Icon */}
              <div className="mx-auto w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mb-4">
                <span className="text-3xl">⚠️</span>
              </div>
              
              <h3 className={`text-xl sm:text-2xl font-bold text-center mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                Empty Archive
              </h3>
              
              <p className={`text-sm sm:text-base text-center mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                Are you sure you want to permanently delete ALL {deletedTransactions.length} transactions from the archive?
              </p>
              
              <p className={`text-xs sm:text-sm text-center mb-6 ${darkMode ? 'text-red-400' : 'text-red-600'} font-medium`}>
                ⚠️ This action cannot be undone!
              </p>
              
              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={cancelDeleteAll}
                  className={`flex-1 py-3 px-4 rounded-xl font-medium text-sm sm:text-base transition-all duration-200 hover:scale-[1.02] ${
                    darkMode 
                      ? 'bg-gray-800 hover:bg-gray-700 text-gray-300 border border-gray-700' 
                      : 'bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-300'
                  }`}
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDeleteAll}
                  className="flex-1 py-3 px-4 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white rounded-xl font-medium text-sm sm:text-base transition-all duration-200 transform hover:scale-[1.02] shadow-lg hover:shadow-xl"
                >
                  Delete All {deletedTransactions.length} Items
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Archive Modal */}
      <>
        {/* Overlay - Semi-transparent backdrop */}
        <div 
          className="fixed inset-0 z-40 bg-black/20 md:bg-transparent"
          onClick={onClose}
        />
        
        {/* Modal - Sidebar style */}
        <div 
          ref={modalRef}
          className={`fixed top-0 right-0 h-full w-80 md:w-96 shadow-2xl z-50 overflow-hidden transform transition-transform duration-300 ease-out ${
            darkMode 
              ? 'bg-gradient-to-b from-gray-900 to-gray-800 text-white' 
              : 'bg-gradient-to-b from-white to-gray-50'
          }`}
          style={{
            transform: isOpen ? 'translateX(0)' : 'translateX(100%)'
          }}
        >
          <div className="h-full flex flex-col">
            {/* Modal Header */}
            <div className={`p-4 sm:p-6 border-b ${
              darkMode 
                ? 'border-gray-700 bg-gradient-to-r from-gray-800 to-gray-900' 
                : 'border-gray-200 bg-gradient-to-r from-gray-800 to-gray-900 text-white'
            } flex-shrink-0`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">🗑️</span>
                  <h2 className="text-xl font-bold text-white">Deleted Transactions</h2>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors text-white"
                  aria-label="Close archive"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                  </svg>
                </button>
              </div>
              <p className="text-sm text-gray-300 mt-2">
                {deletedTransactions.length} deleted item{deletedTransactions.length !== 1 ? 's' : ''} • 30-day retention
              </p>
            </div>

            {/* Modal Content */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6">
              {/* Filter Controls */}
              <div className="mb-4">
                <div className="relative mb-3">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">🔍</span>
                  <input
                    type="text"
                    placeholder="Search deleted transactions..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className={`w-full pl-10 pr-4 py-2.5 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm ${
                      darkMode 
                        ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-400 focus:bg-gray-700' 
                        : 'border border-gray-300 focus:bg-white'
                    } transition-all duration-200`}
                  />
                </div>
                
                <div className="flex gap-2">
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className={`flex-1 px-3 py-2.5 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm ${
                      darkMode 
                        ? 'bg-gray-800 border-gray-700 text-white focus:bg-gray-700' 
                        : 'border border-gray-300 focus:bg-white'
                    } transition-all duration-200`}
                  >
                    {categories.map(cat => (
                      <option key={cat} value={cat} className={darkMode ? 'bg-gray-800' : ''}>
                        {cat === 'all' ? 'All Categories' : cat.charAt(0).toUpperCase() + cat.slice(1)}
                      </option>
                    ))}
                  </select>
                  
                  {deletedTransactions.length > 0 && (
                    <button
                      onClick={handleEmptyBinClick}
                      className="px-4 py-2.5 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white rounded-lg transition-all duration-200 hover:scale-[1.02] text-sm font-medium whitespace-nowrap shadow-lg hover:shadow-xl"
                    >
                      Empty All
                    </button>
                  )}
                </div>
              </div>

              {/* Transactions List */}
              <div className="min-h-[200px]">
                {filteredTransactions.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12">
                    <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 ${
                      darkMode ? 'bg-gray-800' : 'bg-gray-100'
                    }`}>
                      <span className="text-2xl">🗑️</span>
                    </div>
                    <h4 className={`font-bold mb-2 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                      Archive is Empty
                    </h4>
                    <p className={`text-center ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      Deleted transactions will appear here.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {filteredTransactions.map(transaction => {
                      const daysLeft = getDaysUntilPermanent(transaction.deletedAt);
                      
                      return (
                        <div 
                          key={transaction.id} 
                          className={`p-3 sm:p-4 rounded-xl border-l-4 transition-all duration-200 hover:scale-[1.02] hover:shadow-lg ${
                            transaction.type === 'income' 
                              ? darkMode 
                                ? 'border-green-400 bg-gradient-to-r from-green-900/20 to-green-900/10' 
                                : 'border-green-300 bg-gradient-to-r from-green-50 to-green-100' 
                              : darkMode 
                                ? 'border-red-400 bg-gradient-to-r from-red-900/20 to-red-900/10' 
                                : 'border-red-300 bg-gradient-to-r from-red-50 to-red-100'
                          } ${daysLeft <= 3 ? 'border-dashed animate-pulse' : ''}`}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex-1">
                              <div className="flex flex-wrap items-center gap-2 mb-1">
                                <span className={`font-semibold text-sm line-through ${
                                  darkMode ? 'text-gray-300' : 'text-gray-800'
                                }`}>
                                  {transaction.description}
                                </span>
                                <span className={`text-xs px-2 py-1 rounded-full ${
                                  darkMode 
                                    ? 'bg-gray-700 text-gray-300' 
                                    : 'bg-white text-gray-600 shadow-sm'
                                }`}>
                                  {transaction.category}
                                </span>
                              </div>
                              <div className={`flex items-center gap-3 text-xs ${
                                darkMode ? 'text-gray-400' : 'text-gray-500'
                              }`}>
                                <span>{new Date(transaction.date).toLocaleDateString()}</span>
                                <span>•</span>
                                <span>Deleted {getTimeSinceDeletion(transaction.deletedAt)}</span>
                              </div>
                            </div>

                            <div className="flex items-center gap-2">
                              <span className={`text-sm font-bold ${
                                transaction.type === 'income' ? 'text-green-500' : 'text-red-500'
                              }`}>
                                {transaction.type === 'income' ? '+' : '-'}₱{transaction.amount.toFixed(2)}
                              </span>
                              
                              <div className="flex gap-1">
                                <button
                                  onClick={() => handleRestoreClick(transaction)}
                                  className={`p-2 text-green-600 hover:bg-green-600/20 rounded-lg transition-all duration-200 hover:scale-110`}
                                  title="Restore Transaction"
                                >
                                  <span className="text-lg">↩️</span>
                                </button>
                                
                                <button
                                  onClick={() => handlePermanentDeleteClick(transaction)}
                                  className={`p-2 text-red-600 hover:bg-red-600/20 rounded-lg transition-all duration-200 hover:scale-110`}
                                  title="Permanently Delete"
                                >
                                  <span className="text-lg">🗑️</span>
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Info Footer */}
              {deletedTransactions.length > 0 && (
                <div className={`mt-4 pt-4 border-t ${
                  darkMode ? 'border-gray-700' : 'border-gray-200'
                }`}>
                  <div className={`text-xs space-y-2 ${
                    darkMode ? 'text-gray-400' : 'text-gray-500'
                  }`}>
                    <p className="flex items-center gap-2">
                      <span>📝</span>
                      <span>Deleted transactions are automatically removed after 30 days</span>
                    </p>
                    <p className="flex items-center gap-2">
                      <span>🔄</span>
                      <span>You can restore transactions within this period</span>
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </>
    </>
  );
};

export default ArchiveModal;