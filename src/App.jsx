import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import SummaryCards from './components/SummaryCards';
import TransactionForm from './components/TransactionForm';
import TransactionList from './components/TransactionList';
import ExpenseBreakdown from './components/ExpenseBreakdown';
import ArchiveModal from './components/ArchiveModal';

function App() {
  // --- STATE INITIALIZATION (Dito kinukuha ang data pagka-refresh) ---
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

  // Iba pang states
  const [currentFilter, setCurrentFilter] = useState('all');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [archiveModalOpen, setArchiveModalOpen] = useState(false);
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

  // --- PERSISTENCE LOGIC (Sinasave ang data tuwing may nagbabago) ---
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
    if (!form.amount || parseFloat(form.amount) <= 0) {
      alert('Please enter a valid amount');
      return;
    }
    const transaction = {
      id: Date.now(),
      type: form.type,
      category: form.category,
      amount: parseFloat(form.amount),
      date: form.date,
      description: form.description || 'No description'
    };
    setTransactions([transaction, ...transactions]);
    setForm({
      ...form,
      amount: '',
      description: '',
      date: new Date().toISOString().split('T')[0]
    });
  };

  const deleteTransaction = (id) => {
    const transactionToDelete = transactions.find(t => t.id === id);
    if (transactionToDelete) {
      setDeletedTransactions(prev => [{
        ...transactionToDelete,
        deletedAt: new Date().toISOString()
      }, ...prev]);
      setTransactions(transactions.filter(t => t.id !== id));
    }
  };

  const restoreTransaction = (id) => {
    const transactionToRestore = deletedTransactions.find(t => t.id === id);
    if (transactionToRestore) {
      const { deletedAt, ...transaction } = transactionToRestore;
      setTransactions(prev => [transaction, ...prev]);
      setDeletedTransactions(prev => prev.filter(t => t.id !== id));
    }
  };

  const permanentDelete = (id) => {
    setDeletedTransactions(prev => prev.filter(t => t.id !== id));
  };

  const toggleDarkMode = () => setDarkMode(!darkMode);
  const toggleArchiveModal = () => setArchiveModalOpen(!archiveModalOpen);

  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) element.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  // --- CALCULATIONS ---
  const filteredTransactions = transactions.filter(t =>
    currentFilter === 'all' || t.type === currentFilter
  );

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
      <Header 
        mobileMenuOpen={mobileMenuOpen} 
        setMobileMenuOpen={setMobileMenuOpen}
        deletedTransactions={deletedTransactions}
        toggleArchiveModal={toggleArchiveModal}
        darkMode={darkMode}
        toggleDarkMode={toggleDarkMode}
      />

      <ArchiveModal
        isOpen={archiveModalOpen}
        onClose={() => setArchiveModalOpen(false)}
        deletedTransactions={deletedTransactions}
        restoreTransaction={restoreTransaction}
        permanentDelete={permanentDelete}
        darkMode={darkMode}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <section id="dashboard" className="mb-12">
          <div className="text-center mb-8">
            <h2 className={`text-3xl md:text-4xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'} mb-2`}>Take Control of Your Money</h2>
            <p className={`${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Track your income and manage your expenses with ease</p>
          </div>

          <SummaryCards totals={totals} balance={totals.income - totals.expense} darkMode={darkMode} />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <TransactionForm 
                form={form} setForm={setForm} categories={categories}
                addTransaction={addTransaction} darkMode={darkMode}
              />
              <div id="transactions">
                <TransactionList 
                  filteredTransactions={filteredTransactions}
                  currentFilter={currentFilter}
                  setCurrentFilter={setCurrentFilter}
                  deleteTransaction={deleteTransaction}
                  darkMode={darkMode}
                />
              </div>
            </div>
            <ExpenseBreakdown categoryTotals={categoryTotals} totalExpense={totals.expense} darkMode={darkMode} />
          </div>
        </section>
      </main>

      <footer className="bg-gradient-to-r from-black to-amber-600 text-white mt-16 py-12">
        <div className="max-w-7xl mx-auto px-8 text-center md:text-left grid grid-cols-1 md:grid-cols-4 gap-8">
           <div className="md:col-span-2">
             <h4 className="text-xl font-bold mb-4">Finance Manager</h4>
             <p className="text-sm opacity-90">Your personal finance tracking solution. Manage your money smarter.</p>
           </div>
           <div>
             <h4 className="font-bold mb-4">Quick Links</h4>
             <button onClick={() => scrollToSection('dashboard')} className="block text-sm hover:text-amber-300 mb-2">Dashboard</button>
             <button onClick={() => scrollToSection('transactions')} className="block text-sm hover:text-amber-300">Transactions</button>
           </div>
           <div>
             <h4 className="font-bold mb-4">Copyright</h4>
             <p className="text-sm">© 2025 Mica Joyce Biadoy</p>
           </div>
        </div>
      </footer>
    </div>
  );
}

export default App;