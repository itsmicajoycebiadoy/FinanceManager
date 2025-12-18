import React, { useState, useEffect, useRef } from 'react';

const ArchiveModal = ({ 
  isOpen, 
  onClose, 
  deletedTransactions = [], 
  restoreTransaction, 
  permanentDelete, 
  darkMode, 
  emptyAllTransactions, 
  showNotification 
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showDeleteAllConfirm, setShowDeleteAllConfirm] = useState(false);
  const modalRef = useRef(null);

  // Auto-close 
  useEffect(() => {
    if (!isOpen) return;
    const handleScroll = () => {
      const footer = document.querySelector('footer');
      if (footer && footer.getBoundingClientRect().top < window.innerHeight) onClose();
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isOpen, onClose]);

  if (!isOpen) return null; 
  const handleRestore = (id) => {
    restoreTransaction(id);
  };

  const handlePermanentDelete = (id) => {
    permanentDelete(id);
  };

  const handleEmptyArchive = () => {
    emptyAllTransactions();
    setShowDeleteAllConfirm(false);
  };

  // Filter Logic
  const categories = ['all', ...new Set(deletedTransactions.map(t => t.category))];
  const filteredTransactions = deletedTransactions.filter(t => {
    const matchesSearch = t.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || t.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <>
      {/* DELETE ALL CONFIRMATION OVERLAY */}
      {showDeleteAllConfirm && (
        <div className="fixed inset-0 z-[10001] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className={`rounded-3xl shadow-2xl max-w-xs w-full p-6 ${darkMode ? 'bg-[#0f172a] border border-white/10' : 'bg-white'}`}>
            <div className="text-center">
              <h3 className={`text-base font-black mb-4 uppercase ${darkMode ? 'text-white' : 'text-gray-900'}`}>Empty Archive?</h3>
              <p className={`text-[10px] mb-6 font-bold uppercase opacity-60 ${darkMode ? 'text-white' : 'text-gray-900'}`}>This cannot be undone.</p>
              <div className="flex gap-3">
                <button 
                  onClick={() => setShowDeleteAllConfirm(false)} 
                  className={`flex-1 py-3 rounded-2xl font-black text-[10px] uppercase ${darkMode ? 'bg-white/5 text-white' : 'bg-gray-100 text-gray-500'}`}
                >
                  Cancel
                </button>
                <button 
                  onClick={handleEmptyArchive} 
                  className="flex-1 py-3 bg-red-600 text-white rounded-2xl font-black text-[10px] uppercase shadow-lg shadow-red-600/20"
                >
                  Confirm
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MAIN SIDEBAR MODAL */}
      <div className="fixed inset-0 z-[9990] flex justify-end overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-black/20 backdrop-blur-[2px] pointer-events-auto" onClick={onClose} />
        
        <div 
          ref={modalRef} 
          className={`relative pointer-events-auto w-[320px] sm:w-[380px] h-full flex flex-col transform transition-transform duration-300 ease-out 
          ${isOpen ? 'translate-x-0' : 'translate-x-full'} 
          ${darkMode ? 'bg-[#0f172a] text-white border-l border-white/5' : 'bg-white text-gray-900 shadow-2xl'}`}
        >
          {/* Header Section */}
          <div className="p-5 border-b border-white/5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-xl ${darkMode ? 'bg-indigo-500/10 text-indigo-400' : 'bg-indigo-50 text-indigo-600'}`}>
                   <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                     <path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-4v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                   </svg>
                </div>
                <div>
                  <h2 className="text-sm font-black uppercase tracking-widest">Archive</h2>
                  <p className="text-[10px] opacity-50 font-bold">{deletedTransactions.length} ITEMS</p>
                </div>
              </div>
              <button onClick={onClose} className="hover:bg-white/10 p-2 rounded-full transition-colors opacity-50">✕</button>
            </div>

            {/* Filters */}
            <div className="space-y-2">
              <input 
                type="text" 
                placeholder="Search..." 
                value={searchTerm} 
                onChange={(e) => setSearchTerm(e.target.value)} 
                className={`w-full px-4 py-2.5 rounded-xl text-xs font-bold outline-none ${darkMode ? 'bg-white/5 border border-white/5' : 'bg-gray-100 border-none'}`} 
              />
              <div className="flex gap-2">
                <select 
                  value={selectedCategory} 
                  onChange={(e) => setSelectedCategory(e.target.value)} 
                  className={`flex-1 px-3 py-2 rounded-xl text-[10px] font-black uppercase outline-none ${darkMode ? 'bg-white/5' : 'bg-gray-100'}`}
                >
                  {categories.map(cat => <option key={cat} value={cat} className={darkMode ? 'bg-gray-900' : 'bg-white'}>{cat}</option>)}
                </select>
                <button 
                  onClick={() => setShowDeleteAllConfirm(true)} 
                  className="px-4 py-2 bg-red-500/10 text-red-500 rounded-xl text-[10px] font-black uppercase hover:bg-red-500 hover:text-white transition-all"
                >
                  Empty
                </button>
              </div>
            </div>
          </div>

          {/* List Section */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {filteredTransactions.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center opacity-20">
                <span className="text-5xl mb-4">📬</span>
                <p className="text-[10px] font-black uppercase">Empty</p>
              </div>
            ) : (
              filteredTransactions.map(transaction => (
                <div key={transaction.id} className={`p-4 rounded-2xl border ${darkMode ? 'bg-white/5 border-white/5' : 'bg-gray-50 border-gray-100'}`}>
                  <div className="flex justify-between items-start gap-2">
                    <div className="min-w-0 flex-1">
                      <h4 className="font-bold text-[11px] truncate uppercase mb-1">{transaction.description}</h4>
                      <div className="flex items-center gap-2">
                        <span className={`text-[8px] px-2 py-0.5 rounded-md font-black uppercase ${transaction.type === 'income' ? 'bg-green-500/20 text-green-500' : 'bg-red-500/20 text-red-500'}`}>
                          {transaction.category}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`font-black text-xs mb-2 ${transaction.type === 'income' ? 'text-green-500' : 'text-red-500'}`}>
                        ₱{transaction.amount.toLocaleString()}
                      </p>
                      <div className="flex gap-1.5 justify-end">
                        <button 
                          onClick={() => handleRestore(transaction.id)} 
                          className={`p-2 rounded-lg transition-all ${darkMode ? 'bg-green-500/10 text-green-500 hover:bg-green-500 hover:text-white' : 'bg-green-100 text-green-600 hover:bg-green-600'}`}
                          title="Restore"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/></svg>
                        </button>
                        <button 
                          onClick={() => handlePermanentDelete(transaction.id)} 
                          className={`p-2 rounded-lg transition-all ${darkMode ? 'bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white' : 'bg-red-100 text-red-600 hover:bg-red-600'}`}
                          title="Delete Permanently"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-4v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/></svg>
                        </button>
                      </div>
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

export default ArchiveModal;