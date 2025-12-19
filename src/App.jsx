import React, { useState, useEffect } from 'react';
import { Instagram, Github, Facebook, X, ArrowRight, AlertTriangle, Download } from 'lucide-react';
import Header from './components/Header';
import SummaryCards from './components/SummaryCards';
import TransactionForm from './components/TransactionForm';
import TransactionList from './components/TransactionList';
import ExpenseBreakdown from './components/ExpenseBreakdown';
import ArchiveModal from './components/ArchiveModal';

function App() {
  // --- STATE INITIALIZATION ---
  const [userName, setUserName] = useState(() => {
    return localStorage.getItem('userName') || '';
  });

  const [nameInput, setNameInput] = useState('');
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [transactions, setTransactions] = useState([]);
  const [deletedTransactions, setDeletedTransactions] = useState([]);

  const [darkMode, setDarkMode] = useState(() => {
    const savedTheme = localStorage.getItem('theme');
    return savedTheme === 'dark';
  });

  const [currentFilter, setCurrentFilter] = useState('all');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [archiveModalOpen, setArchiveModalOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);

  const [form, setForm] = useState({
    type: 'expense',
    category: 'food',
    amount: '',
    description: '',
    date: new Date().toISOString().split('T')[0]
  });

  const categories = {
    income: ['salary', 'freelance', 'investment', 'other'],
    expense: ['food', 'transportation', 'shopping', 'other']
  };

  // --- USER DATA LOADING LOGIC ---
  useEffect(() => {
    if (userName) {
      const savedTransactions = localStorage.getItem(`transactions_${userName}`);
      const savedDeleted = localStorage.getItem(`deletedTransactions_${userName}`);
      
      setTransactions(savedTransactions ? JSON.parse(savedTransactions) : []);
      setDeletedTransactions(savedDeleted ? JSON.parse(savedDeleted) : []);
    } else {
      setTransactions([]);
      setDeletedTransactions([]);
    }
  }, [userName]);

  // --- NOTIFICATION SYSTEM ---
  const showNotification = (message, type = 'info') => {
    const id = Date.now();
    setNotifications(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 3000);
  };

  const getNotificationStyles = (type) => {
    switch (type) {
      case 'success': return 'bg-green-600 border-green-800';
      case 'error': return 'bg-red-600 border-red-800';
      case 'warning': return 'bg-yellow-600 border-yellow-800';
      default: return 'bg-blue-600 border-blue-800';
    }
  };

  // --- FIXED EXPORT LOGIC FOR ALL DEVICES ---
  const exportToCSV = () => {
    if (transactions.length === 0) {
      showNotification('No transactions to export', 'warning');
      return;
    }

    try {
      const headers = ['Date', 'Type', 'Category', 'Description', 'Amount'];
      const rows = transactions.map(t => [
        t.date,
        t.type.toUpperCase(),
        t.category.toUpperCase(),
        `"${t.description.replace(/"/g, '""')}"`,
        t.amount
      ]);

      const csvContent = [
        headers.join(','),
        ...rows.map(e => e.join(','))
      ].join('\n');

      // Paggamit ng Universal approach para sa mobile at desktop
      const blob = new Blob(["\ufeff" + csvContent], { type: 'text/csv;charset=utf-8;' });
      const fileName = `Finance_Report_${userName}_${new Date().toLocaleDateString().replace(/\//g, '-')}.csv`;

      if (window.navigator && window.navigator.msSaveOrOpenBlob) {
        // Para sa Internet Explorer/Legacy browsers
        window.navigator.msSaveOrOpenBlob(blob, fileName);
      } else {
        // Standard modern approach (Android/iOS/Desktop)
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', fileName);
        
        // Importante ito para sa mobile browsers
        link.style.display = 'none';
        document.body.appendChild(link);
        link.click();
        
        // Cleanup
        setTimeout(() => {
          document.body.removeChild(link);
          URL.revokeObjectURL(url);
        }, 100);
      }

      showNotification('Report exported successfully!', 'success');
      setMobileMenuOpen(false); // Siguradong magsasara ang menu pagkatapos
    } catch (error) {
      showNotification('Export failed. Please try again.', 'error');
      console.error('Export error:', error);
    }
  };

  // --- PERSISTENCE LOGIC (User-Specific) ---
  useEffect(() => {
    if (userName) {
      localStorage.setItem(`transactions_${userName}`, JSON.stringify(transactions));
    }
  }, [transactions, userName]);

  useEffect(() => {
    if (userName) {
      localStorage.setItem(`deletedTransactions_${userName}`, JSON.stringify(deletedTransactions));
    }
  }, [deletedTransactions, userName]);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);

  // --- HANDLERS ---
  const handleStart = (e) => {
    e.preventDefault();
    if (nameInput.trim()) {
      const newUser = nameInput.trim();
      setUserName(newUser);
      localStorage.setItem('userName', newUser);
      showNotification(`Welcome, ${newUser}!`, 'success');
      setNameInput(''); 
    }
  };

  const confirmLogout = () => {
    setUserName('');
    localStorage.removeItem('userName');
    setMobileMenuOpen(false);
    setIsLogoutModalOpen(false);
    showNotification('Logged out successfully', 'info');
  };

  const addTransaction = () => {
    if (!form.amount || !form.description) {
      showNotification('Please fill in all fields', 'warning');
      return;
    }
    const transaction = {
      id: Date.now(),
      type: form.type,
      category: form.category,
      amount: parseFloat(form.amount),
      date: form.date,
      description: form.description
    };
    setTransactions([transaction, ...transactions]);
    setForm({
      ...form,
      amount: '',
      description: '',
      date: new Date().toISOString().split('T')[0]
    });
    showNotification('Transaction added successfully!', 'success');
  };

  const deleteTransaction = (id) => {
    const transactionToDelete = transactions.find(t => t.id === id);
    if (transactionToDelete) {
      setDeletedTransactions(prev => [{
        ...transactionToDelete,
        deletedAt: new Date().toISOString()
      }, ...prev]);
      setTransactions(transactions.filter(t => t.id !== id));
      showNotification('Moved to archive bin', 'info');
    }
  };

  const restoreTransaction = (id) => {
    const transactionToRestore = deletedTransactions.find(t => t.id === id);
    if (transactionToRestore) {
      const { deletedAt, ...transaction } = transactionToRestore;
      setTransactions(prev => [transaction, ...prev]);
      setDeletedTransactions(prev => prev.filter(t => t.id !== id));
      showNotification('Transaction restored!', 'success');
    }
  };

  const permanentDelete = (id) => {
    setDeletedTransactions(prev => prev.filter(t => t.id !== id));
    showNotification('Permanently deleted', 'error');
  };

  const emptyAllTransactions = () => {
    if (deletedTransactions.length === 0) return;
    setDeletedTransactions([]);
    showNotification('Archive cleared', 'info');
  };

  const toggleDarkMode = () => setDarkMode(!darkMode);
  const toggleArchiveModal = () => setArchiveModalOpen(!archiveModalOpen);

  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      const headerOffset = 80;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
      window.scrollTo({ top: offsetPosition, behavior: "smooth" });
    }
    setMobileMenuOpen(false);
  };

  const totals = transactions.reduce((acc, t) => {
    t.type === 'income' ? acc.income += t.amount : acc.expense += t.amount;
    return acc;
  }, { income: 0, expense: 0 });

  const categoryTotals = transactions.reduce((acc, t) => {
    if (t.type === 'expense') acc[t.category] = (acc[t.category] || 0) + t.amount;
    return acc;
  }, {});

  // --- WELCOME SCREEN RENDER ---
  if (!userName) {
    return (
      <div className="fixed inset-0 w-full h-full bg-gradient-to-br from-black via-amber-900 to-black flex items-center justify-center p-4 overflow-hidden touch-none">
        <div className="fixed top-4 right-4 left-4 sm:left-auto z-[9999] flex flex-col gap-3 sm:w-80 md:w-96">
          {notifications.map(n => (
            <div key={n.id} className={`${getNotificationStyles(n.type)} text-white px-4 py-3 rounded-xl shadow-2xl border-l-4 flex justify-between items-center`}>
              <span className="text-sm md:text-base font-medium">{n.message}</span>
              <button onClick={() => setNotifications(prev => prev.filter(notif => notif.id !== n.id))} className="text-white/70 hover:text-white p-1">
                <X size={18} />
              </button>
            </div>
          ))}
        </div>

        <div className="w-full max-w-md bg-white/10 backdrop-blur-xl rounded-3xl p-6 sm:p-8 border border-white/20 shadow-2xl text-center">
          <div className="mb-6 flex justify-center">
            <div className="bg-amber-500 p-4 rounded-full shadow-lg">
              <svg className="w-10 h-10 sm:w-12 sm:h-12 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"></path>
              </svg>
            </div>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white mb-2">Finance Manager</h1>
          <p className="text-amber-200/70 mb-8 text-sm sm:text-base">Track your wealth, secure your future.</p>
          
          <form onSubmit={handleStart} className="space-y-4">
            <div className="text-left">
              <label className="text-[10px] sm:text-xs font-bold text-amber-500 uppercase tracking-widest ml-1">Your Name</label>
              <input 
                type="text" 
                required
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                placeholder="Enter your name to start..."
                className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white text-base placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all"
              />
            </div>
            <button 
              type="submit"
              className="w-full bg-amber-500 hover:bg-amber-400 text-black font-bold py-4 rounded-2xl transition-all flex items-center justify-center gap-2 group text-base"
            >
              Get Started <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </form>
        </div>
      </div>
    );
  }

  // --- MAIN APP RENDER ---
  return (
    <div className={`min-h-screen ${darkMode ? 'dark bg-gray-900' : 'bg-gradient-to-br from-blue-50 to-indigo-100'} transition-colors duration-300`}>
      
      {/* NOTIFICATIONS */}
      <div className="fixed top-4 right-4 left-4 sm:left-auto z-[9999] flex flex-col gap-3 sm:w-80 md:w-96">
        {notifications.map(n => (
          <div key={n.id} className={`${getNotificationStyles(n.type)} text-white px-4 py-3 rounded-xl shadow-2xl border-l-4 flex justify-between items-center animate-slide-in-right`}>
            <span className="text-sm md:text-base font-medium">{n.message}</span>
            <button onClick={() => setNotifications(prev => prev.filter(notif => notif.id !== n.id))} className="text-white/70 hover:text-white p-1">
              <X size={18} />
            </button>
          </div>
        ))}
      </div>

      {/* MODAL LOGOUT CONFIRMATION */}
      {isLogoutModalOpen && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-800 rounded-3xl p-5 sm:p-6 max-w-[90%] sm:max-w-sm w-full shadow-2xl border border-white/20">
            <div className="flex flex-col items-center text-center">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mb-3 sm:mb-4">
                <AlertTriangle className="text-red-600 dark:text-red-400" size={28} />
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-1 sm:mb-2">Logout Session?</h3>
              <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mb-5 sm:mb-6">Are you sure you want to end your session? You can always log back in later.</p>
              <div className="flex flex-row gap-3 w-full">
                <button 
                  onClick={() => setIsLogoutModalOpen(false)}
                  className="flex-1 px-3 py-2.5 sm:px-4 sm:py-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 text-sm sm:text-base font-bold rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={confirmLogout}
                  className="flex-1 px-3 py-2.5 sm:px-4 sm:py-3 bg-red-600 text-white text-sm sm:text-base font-bold rounded-xl hover:bg-red-700 transition-colors shadow-lg shadow-red-600/20"
                >
                  Yes, Logout
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <Header 
        userName={userName}
        mobileMenuOpen={mobileMenuOpen} 
        setMobileMenuOpen={setMobileMenuOpen}
        deletedTransactions={deletedTransactions}
        toggleArchiveModal={toggleArchiveModal}
        darkMode={darkMode}
        toggleDarkMode={toggleDarkMode}
        scrollToSection={scrollToSection}
        handleLogout={() => setIsLogoutModalOpen(true)}
        exportToCSV={exportToCSV} 
      />

      <ArchiveModal
        isOpen={archiveModalOpen}
        onClose={() => setArchiveModalOpen(false)}
        deletedTransactions={deletedTransactions}
        restoreTransaction={restoreTransaction}
        permanentDelete={permanentDelete}
        darkMode={darkMode}
        emptyAllTransactions={emptyAllTransactions}
        showNotification={showNotification}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 py-8 md:py-12 text-gray-800 dark:text-gray-100">
        <section id="dashboard" className="mb-12 scroll-mt-20">
          <div className="text-center mb-8 md:mb-12 px-2">
            <h2 className={`text-2xl sm:text-3xl md:text-4xl xl:text-5xl font-extrabold ${darkMode ? 'text-white' : 'text-gray-800'} mb-3 tracking-tight`}>
              Take Control of Your Money
            </h2>
            <p className={`text-sm sm:text-base md:text-lg ${darkMode ? 'text-gray-300' : 'text-gray-600'} max-w-2xl mx-auto`}>
              Track your income and manage your expenses with ease.
            </p>
          </div>

          <div className="mb-10">
            <SummaryCards totals={totals} balance={totals.income - totals.expense} darkMode={darkMode} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8 xl:gap-10 items-stretch">
            <div className="lg:col-span-7 xl:col-span-8 flex flex-col gap-8 h-full">
              <div className="shrink-0">
                <TransactionForm 
                  form={form} setForm={setForm} categories={categories}
                  addTransaction={addTransaction} darkMode={darkMode}
                  showNotification={showNotification}
                />
              </div>

              <div id="transactions" className="scroll-mt-24 flex-grow">
                <TransactionList 
                  filteredTransactions={transactions.filter(t => currentFilter === 'all' || t.type === currentFilter)}
                  currentFilter={currentFilter}
                  setCurrentFilter={setCurrentFilter}
                  deleteTransaction={deleteTransaction}
                  darkMode={darkMode}
                />
              </div>
            </div>

            <div className="lg:col-span-5 xl:col-span-4 h-full">
              <div className="lg:sticky lg:top-24 h-full">
                <ExpenseBreakdown 
                  categoryTotals={categoryTotals} 
                  totalExpense={totals.expense} 
                  totalIncome={totals.income} 
                  darkMode={darkMode} 
                />
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-gradient-to-r from-black to-amber-900 text-white/80 mt-16 py-12 md:py-16 border-t border-white/10">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 xl:px-12">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12 text-center lg:text-left mb-12 items-start">
            <div className="sm:col-span-2 flex flex-col items-center lg:items-start space-y-4">
              <h4 className="text-xl md:text-2xl font-black text-white tracking-tight">Finance Manager</h4>
              <p className="text-sm leading-relaxed max-w-sm opacity-70">
                Your personal finance tracking solution. Simple, secure, and designed to help you manage your money smarter.
              </p>
            </div>
            <div className="flex flex-col items-center lg:items-start space-y-4">
              <h4 className="text-xl md:text-2xl font-black text-white tracking-tight">Quick Links</h4>
              <ul className="space-y-3">
                <li><button onClick={() => scrollToSection('dashboard')} className="text-sm hover:text-amber-400 transition-colors">Dashboard</button></li>
                <li><button onClick={() => scrollToSection('transactions')} className="text-sm hover:text-amber-400 transition-colors">Transactions</button></li>
              </ul>
            </div>
            <div className="flex flex-col items-center lg:items-start space-y-4">
              <h4 className="text-xl md:text-2xl font-black text-white tracking-tight">Connect With Me</h4>
              <div className="flex gap-4 justify-center lg:justify-start">
                <a href="https://github.com/itsmicajoycebiadoy" target="_blank" rel="noopener noreferrer" className="group p-3 bg-white/5 rounded-full border border-white/10 hover:bg-gray-800 transition-all shadow-lg">
                  <Github size={20} />
                </a>
                <a href="https://www.instagram.com/miiekkaa" target="_blank" rel="noopener noreferrer" className="group p-3 bg-white/5 rounded-full border border-white/10 hover:bg-pink-600 transition-all shadow-lg">
                  <Instagram size={20} />
                </a>
                <a href="https://www.facebook.com/share/17iqtjmstS/" target="_blank" rel="noopener noreferrer" className="group p-3 bg-white/5 rounded-full border border-white/10 hover:bg-blue-600 transition-all shadow-lg">
                  <Facebook size={20} />
                </a>
              </div>
            </div>
          </div>
          <div className="pt-8 border-t border-white/5 flex flex-col items-center justify-center text-center space-y-1">
            <p className="text-[13px] md:text-sm font-medium text-white/90">© 2025 Finance Manager</p>
            <p className="text-[13px] md:text-sm text-white/50 font-normal">Created by: Mica Joyce Biadoy</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;