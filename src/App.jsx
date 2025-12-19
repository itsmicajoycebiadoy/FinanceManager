import React, { useState, useEffect } from 'react';
import { Instagram, Github, Facebook, X, ArrowRight, AlertTriangle, Download } from 'lucide-react';
import Header from './components/Header';
import SummaryCards from './components/SummaryCards';
import TransactionForm from './components/TransactionForm';
import TransactionList from './components/TransactionList';
import ExpenseBreakdown from './components/ExpenseBreakdown';
import ArchiveModal from './components/ArchiveModal';

function App() {
  const [userName, setUserName] = useState(() => localStorage.getItem('userName') || '');
  const [nameInput, setNameInput] = useState('');
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [transactions, setTransactions] = useState([]);
  const [deletedTransactions, setDeletedTransactions] = useState([]);
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem('theme') === 'dark');
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

  // --- PERSISTENCE LOGIC: LOADING ---
  useEffect(() => {
    if (userName) {
      const savedTransactions = localStorage.getItem(`transactions_${userName}`);
      const savedDeleted = localStorage.getItem(`deletedTransactions_${userName}`);
      setTransactions(savedTransactions ? JSON.parse(savedTransactions) : []);
      setDeletedTransactions(savedDeleted ? JSON.parse(savedDeleted) : []);
    }
  }, [userName]); // Re-load data kapag nag-login/change user

  // --- PERSISTENCE LOGIC: SAVING ---
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
    document.documentElement.classList.toggle('dark', darkMode);
    localStorage.setItem('theme', darkMode ? 'dark' : 'light');
  }, [darkMode]);

  // --- HANDLERS ---
  const showNotification = (message, type = 'info') => {
    const id = Date.now();
    setNotifications(prev => [...prev, { id, message, type }]);
    setTimeout(() => setNotifications(prev => prev.filter(n => n.id !== id)), 3000);
  };

  const getNotificationStyles = (type) => {
    switch (type) {
      case 'success': return 'bg-green-600 border-green-800';
      case 'error': return 'bg-red-600 border-red-800';
      case 'warning': return 'bg-yellow-600 border-yellow-800';
      default: return 'bg-blue-600 border-blue-800';
    }
  };

  const exportToCSV = () => {
    if (transactions.length === 0) {
      showNotification('No transactions to export', 'warning');
      return;
    }
    try {
      const headers = ['Date', 'Type', 'Category', 'Description', 'Amount'];
      const rows = transactions.map(t => [t.date, t.type.toUpperCase(), t.category.toUpperCase(), `"${t.description.replace(/"/g, '""')}"`, t.amount]);
      const csvContent = "\ufeff" + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `Finance_Report_${userName}.csv`);
      document.body.appendChild(link);
      link.click();
      setTimeout(() => { document.body.removeChild(link); URL.revokeObjectURL(url); }, 200);
      showNotification('Report exported successfully!', 'success');
      setMobileMenuOpen(false); 
    } catch (error) {
      showNotification('Failed to export', 'error');
    }
  };

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
    setTransactions(prev => [transaction, ...prev]);
    setForm({ ...form, amount: '', description: '', date: new Date().toISOString().split('T')[0] });
    showNotification('Transaction added successfully!', 'success');
  };

  const deleteTransaction = (id) => {
    const transactionToDelete = transactions.find(t => t.id === id);
    if (transactionToDelete) {
      setDeletedTransactions(prev => [{ ...transactionToDelete, deletedAt: new Date().toISOString() }, ...prev]);
      setTransactions(prev => prev.filter(t => t.id !== id));
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
      const offsetPosition = element.getBoundingClientRect().top + window.pageYOffset - 80;
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

  if (!userName) {
    return (
      <div className="fixed inset-0 w-full h-full bg-gradient-to-br from-black via-amber-900 to-black flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white/10 backdrop-blur-xl rounded-3xl p-8 border border-white/20 shadow-2xl text-center">
          <div className="mb-6 flex justify-center">
            <div className="bg-amber-500 p-4 rounded-full">
              <svg className="w-12 h-12 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"/></svg>
            </div>
          </div>
          <h1 className="text-3xl font-black text-white mb-2">Finance Manager</h1>
          <p className="text-amber-200/70 mb-8">Track your wealth, secure your future.</p>
          <form onSubmit={handleStart} className="space-y-4">
            <input type="text" required value={nameInput} onChange={(e) => setNameInput(e.target.value)} placeholder="Enter your name to start..." className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white focus:ring-2 focus:ring-amber-500 outline-none" />
            <button type="submit" className="w-full bg-amber-500 hover:bg-amber-400 text-black font-bold py-4 rounded-2xl flex items-center justify-center gap-2 group">
              Get Started <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${darkMode ? 'dark bg-gray-900' : 'bg-gradient-to-br from-blue-50 to-indigo-100'} transition-colors duration-300`}>
      {/* Notifications */}
      <div className="fixed top-4 right-4 left-4 sm:left-auto z-[9999] flex flex-col gap-3 sm:w-80">
        {notifications.map(n => (
          <div key={n.id} className={`${getNotificationStyles(n.type)} text-white px-4 py-3 rounded-xl shadow-2xl border-l-4 flex justify-between items-center animate-slide-in-right`}>
            <span className="text-sm font-medium">{n.message}</span>
            <button onClick={() => setNotifications(prev => prev.filter(notif => notif.id !== n.id))}><X size={18} /></button>
          </div>
        ))}
      </div>

      {isLogoutModalOpen && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 max-w-sm w-full shadow-2xl border border-white/20">
            <div className="flex flex-col items-center text-center">
              <AlertTriangle className="text-red-600 mb-4" size={48} />
              <h3 className="text-xl font-bold dark:text-white mb-2">Logout Session?</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">Your data is saved under your name. You can return anytime.</p>
              <div className="flex gap-3 w-full">
                <button onClick={() => setIsLogoutModalOpen(false)} className="flex-1 py-3 bg-gray-100 dark:bg-gray-700 rounded-xl font-bold">Cancel</button>
                <button onClick={confirmLogout} className="flex-1 py-3 bg-red-600 text-white rounded-xl font-bold">Logout</button>
              </div>
            </div>
          </div>
        </div>
      )}

      <Header userName={userName} mobileMenuOpen={mobileMenuOpen} setMobileMenuOpen={setMobileMenuOpen} deletedTransactions={deletedTransactions} toggleArchiveModal={toggleArchiveModal} darkMode={darkMode} toggleDarkMode={toggleDarkMode} scrollToSection={scrollToSection} handleLogout={() => setIsLogoutModalOpen(true)} exportToCSV={exportToCSV} />
      <ArchiveModal isOpen={archiveModalOpen} onClose={() => setArchiveModalOpen(false)} deletedTransactions={deletedTransactions} restoreTransaction={restoreTransaction} permanentDelete={permanentDelete} darkMode={darkMode} emptyAllTransactions={emptyAllTransactions} showNotification={showNotification} />

      <main className="max-w-7xl mx-auto px-4 py-12">
        <section id="dashboard" className="scroll-mt-20">
          <div className="text-center mb-12">
            <h2 className={`text-4xl md:text-5xl font-extrabold ${darkMode ? 'text-white' : 'text-gray-800'} mb-3`}>Take Control of Your Money</h2>
            <p className={`text-lg ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Track your income and manage your expenses with ease.</p>
          </div>
          <SummaryCards totals={totals} balance={totals.income - totals.expense} darkMode={darkMode} />
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mt-10">
            <div className="lg:col-span-7 xl:col-span-8 flex flex-col gap-8">
              <TransactionForm form={form} setForm={setForm} categories={categories} addTransaction={addTransaction} darkMode={darkMode} showNotification={showNotification} />
              <div id="transactions" className="scroll-mt-24">
                <TransactionList 
                  filteredTransactions={transactions.filter(t => currentFilter === 'all' || t.type === currentFilter)} 
                  currentFilter={currentFilter} 
                  setCurrentFilter={setCurrentFilter} 
                  deleteTransaction={deleteTransaction} 
                  darkMode={darkMode} 
                />
              </div>
            </div>
            <div className="lg:col-span-5 xl:col-span-4">
              <ExpenseBreakdown categoryTotals={categoryTotals} totalExpense={totals.expense} totalIncome={totals.income} darkMode={darkMode} />
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-gradient-to-r from-black to-amber-900 text-white/80 py-16 border-t border-white/10">
        <div className="max-w-7xl mx-auto px-8 grid grid-cols-1 md:grid-cols-3 gap-12 text-center md:text-left">
          <div>
            <h4 className="text-2xl font-black text-white mb-4">Finance Manager</h4>
            <p className="text-sm opacity-70">Manage your money smarter.</p>
          </div>
          <div>
            <h4 className="text-xl font-bold text-white mb-4">Quick Links</h4>
            <div className="flex flex-col gap-2">
              <button onClick={() => scrollToSection('dashboard')} className="hover:text-amber-400 text-left">Dashboard</button>
              <button onClick={() => scrollToSection('transactions')} className="hover:text-amber-400 text-left">Transactions</button>
            </div>
          </div>
          <div>
             <h4 className="text-xl font-bold text-white mb-4">Connect With Me</h4>
             <div className="flex justify-center md:justify-start gap-4">
                <a href="https://github.com/itsmicajoycebiadoy" target="_blank" rel="noopener noreferrer" className="p-3 bg-white/5 rounded-full hover:bg-gray-800 transition-all"><Github size={20}/></a>
                <a href="https://www.instagram.com/miiekkaa" target="_blank" rel="noopener noreferrer" className="p-3 bg-white/5 rounded-full hover:bg-pink-600 transition-all"><Instagram size={20}/></a>
             </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;