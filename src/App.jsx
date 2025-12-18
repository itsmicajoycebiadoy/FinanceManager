import React, { useState, useEffect } from 'react';
import { Instagram, Github, Facebook, X } from 'lucide-react';
import Header from './components/Header';
import SummaryCards from './components/SummaryCards';
import TransactionForm from './components/TransactionForm';
import TransactionList from './components/TransactionList';
import ExpenseBreakdown from './components/ExpenseBreakdown';
import ArchiveModal from './components/ArchiveModal';

function App() {
  // --- STATE INITIALIZATION ---
  const [transactions, setTransactions] = useState(() => {
    const saved = localStorage.getItem('transactions');
    return saved ? JSON.parse(saved) : [];
  });

  const [deletedTransactions, setDeletedTransactions] = useState(() => {
    const saved = localStorage.getItem('deletedTransactions');
    return saved ? JSON.parse(saved) : [];
  });

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

  // --- PERSISTENCE LOGIC ---
  useEffect(() => {
    localStorage.setItem('transactions', JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem('deletedTransactions', JSON.stringify(deletedTransactions));
  }, [deletedTransactions]);

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
  };

  const totals = transactions.reduce((acc, t) => {
    t.type === 'income' ? acc.income += t.amount : acc.expense += t.amount;
    return acc;
  }, { income: 0, expense: 0 });

  const categoryTotals = transactions.reduce((acc, t) => {
    if (t.type === 'expense') acc[t.category] = (acc[t.category] || 0) + t.amount;
    return acc;
  }, {});

  return (
    <div className={`min-h-screen ${darkMode ? 'dark bg-gray-900' : 'bg-gradient-to-br from-blue-50 to-indigo-100'} transition-colors duration-300`}>
      
      {/* RESPONSIVE NOTIFICATIONS PORTAL */}
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

      <Header 
        mobileMenuOpen={mobileMenuOpen} 
        setMobileMenuOpen={setMobileMenuOpen}
        deletedTransactions={deletedTransactions}
        toggleArchiveModal={toggleArchiveModal}
        darkMode={darkMode}
        toggleDarkMode={toggleDarkMode}
        scrollToSection={scrollToSection}
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

      {/* --- MAIN CONTENT SECTION --- */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 py-8 md:py-12 text-gray-800 dark:text-gray-100">
        <section id="dashboard" className="mb-12 scroll-mt-20">
          
          {/* Page Header */}
          <div className="text-center mb-8 md:mb-12 px-2">
            <h2 className={`text-2xl sm:text-3xl md:text-4xl xl:text-5xl font-extrabold ${darkMode ? 'text-white' : 'text-gray-800'} mb-3 tracking-tight`}>
              Take Control of Your Money
            </h2>
            <p className={`text-sm sm:text-base md:text-lg ${darkMode ? 'text-gray-300' : 'text-gray-600'} max-w-2xl mx-auto`}>
              Track your income and manage your expenses with ease.
            </p>
          </div>

          {/* FIX: Use Capitalized SummaryCards */}
          <div className="mb-10">
            <SummaryCards totals={totals} balance={totals.income - totals.expense} darkMode={darkMode} />
          </div>

          {/* --- RESPONSIVE GRID LAYOUT --- */}
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