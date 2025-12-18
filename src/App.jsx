import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import SummaryCards from './components/SummaryCards';
import TransactionForm from './components/TransactionForm';
import TransactionList from './components/TransactionList';
import ExpenseBreakdown from './components/ExpenseBreakdown';
import ArchiveModal from './components/ArchiveModal';

function App() {
  const [transactions, setTransactions] = useState([]);
  const [deletedTransactions, setDeletedTransactions] = useState(() => {
    const saved = localStorage.getItem('deletedTransactions');
    return saved ? JSON.parse(saved) : [];
  });
  const [currentFilter, setCurrentFilter] = useState('all');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [archiveModalOpen, setArchiveModalOpen] = useState(false);
  
  // Dark mode state
  const [darkMode, setDarkMode] = useState(() => {
    const savedTheme = localStorage.getItem('theme');
    return savedTheme === 'dark';
  });
  
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

  // Load transactions from localStorage
  useEffect(() => {
    const stored = localStorage.getItem('transactions');
    if (stored) {
      setTransactions(JSON.parse(stored));
    }
  }, []);

  // Save transactions to localStorage
  useEffect(() => {
    localStorage.setItem('transactions', JSON.stringify(transactions));
  }, [transactions]);

  // Save deleted transactions to localStorage
  useEffect(() => {
    localStorage.setItem('deletedTransactions', JSON.stringify(deletedTransactions));
  }, [deletedTransactions]);

  // Apply dark mode to body
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);

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
      // Move to deleted transactions with timestamp
      setDeletedTransactions(prev => [{
        ...transactionToDelete,
        deletedAt: new Date().toISOString()
      }, ...prev]);
      
      // Remove from active transactions
      setTransactions(transactions.filter(t => t.id !== id));
    }
  };

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  // Restore transaction from archive
  const restoreTransaction = (id) => {
    const transactionToRestore = deletedTransactions.find(t => t.id === id);
    
    if (transactionToRestore) {
      // Remove deletedAt property
      const { deletedAt, ...transaction } = transactionToRestore;
      
      // Add back to transactions
      setTransactions(prev => [transaction, ...prev]);
      
      // Remove from deleted transactions
      setDeletedTransactions(prev => prev.filter(t => t.id !== id));
      
      alert('Transaction restored successfully!');
    }
  };

  const permanentDelete = (id) => {
    setDeletedTransactions(prev => prev.filter(t => t.id !== id));
  };

  const toggleArchiveModal = () => {
    setArchiveModalOpen(!archiveModalOpen);
  };

  const filteredTransactions = transactions.filter(t =>
    currentFilter === 'all' || t.type === currentFilter
  );

  const totals = transactions.reduce((acc, t) => {
    if (t.type === 'income') {
      acc.income += t.amount;
    } else {
      acc.expense += t.amount;
    }
    return acc;
  }, { income: 0, expense: 0 });

  const balance = totals.income - totals.expense;

  const categoryTotals = transactions.reduce((acc, t) => {
    if (t.type === 'expense') {
      acc[t.category] = (acc[t.category] || 0) + t.amount;
    }
    return acc;
  }, {});

  // Function to handle smooth scrolling to sections
  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
      });
    }
  };

  return (
    <div className={`min-h-screen ${darkMode ? 'dark bg-gray-900' : 'bg-gradient-to-br from-blue-50 to-indigo-100'} relative transition-colors duration-300`}>
      <Header 
        mobileMenuOpen={mobileMenuOpen} 
        setMobileMenuOpen={setMobileMenuOpen}
        deletedTransactions={deletedTransactions}
        toggleArchiveModal={toggleArchiveModal}
        darkMode={darkMode}
        toggleDarkMode={toggleDarkMode}
      />

      {/* Archive Modal */}
      <ArchiveModal
        isOpen={archiveModalOpen}
        onClose={() => setArchiveModalOpen(false)}
        deletedTransactions={deletedTransactions}
        restoreTransaction={restoreTransaction}
        permanentDelete={permanentDelete}
        darkMode={darkMode}
      />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 md:py-12">
        {/* Dashboard Section */}
        <section id="dashboard" className="mb-8 sm:mb-12">
          <div className="text-center mb-6 sm:mb-8">
            <h2 className={`text-2xl sm:text-3xl md:text-4xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'} mb-2`}>Take Control of Your Money</h2>
            <p className={`text-sm sm:text-base ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Track your income and manage your expenses with ease</p>
          </div>

          <SummaryCards totals={totals} balance={balance} darkMode={darkMode} />

          {/* Transaction Form and List Section */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
            {/* Form and List */}
            <div className="lg:col-span-2">
              <TransactionForm 
                form={form}
                setForm={setForm}
                categories={categories}
                addTransaction={addTransaction}
                darkMode={darkMode}
              />
              
              {/* Transaction List Section with ID for navigation */}
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

            {/* Expense Breakdown Sidebar */}
            <ExpenseBreakdown 
              categoryTotals={categoryTotals}
              totalExpense={totals.expense}
              darkMode={darkMode}
            />
          </div>
        </section>
      </main>

      {/* FOOTER */}
      <footer className="bg-gradient-to-r from-black to-amber-600 text-white mt-12 sm:mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 md:py-12">
          {/* Main Footer */}
          <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-4 gap-6 sm:gap-8 md:gap-10 lg:gap-12 text-center md:text-left">
                
            {/* Finance Manager Section */}
            <div className="space-y-3 sm:space-y-4 md:col-span-2"> 
              <h4 className="text-base sm:text-lg md:text-xl font-bold mb-3 sm:mb-4">Finance Manager</h4>
              <p className="text-xs sm:text-sm md:text-base text-white leading-relaxed">
                Your personal finance tracking solution. 
                Manage your money smarter and save better.
              </p>
            </div>
            
            {/* Quick Links Section */}
            <div className="space-y-3 sm:space-y-4"> 
              <h4 className="text-base sm:text-lg md:text-xl font-bold mb-3 sm:mb-4 text-white">Quick Links</h4>
              <ul className="space-y-2 sm:space-y-3">
                <li>
                  <button
                    onClick={() => scrollToSection('dashboard')}
                    className="text-xs sm:text-sm md:text-base text-white hover:text-amber-300 transition-colors inline-flex items-center group mx-auto md:mx-0" 
                    aria-label="Dashboard"
                  >
                    <svg className="w-4 h-4 mr-2 text-amber-300 opacity-0 transform -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
                    </svg>
                    Dashboard
                  </button>
                </li>

                <li>
                  <button
                    onClick={() => scrollToSection('transactions')}
                    className="text-xs sm:text-sm md:text-base text-white hover:text-amber-300 transition-colors inline-flex items-center group mx-auto md:mx-0" 
                    aria-label="Transactions"
                  >
                    <svg className="w-4 h-4 mr-2 text-amber-300 opacity-0 transform -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
                    </svg>
                    Transactions
                  </button>
                </li>
              </ul>
            </div>
            
          {/* Social Media Section */}
            <div className="space-y-3 sm:space-y-4"> 
              <h4 className="text-base sm:text-lg md:text-xl font-bold mb-3 sm:mb-4 text-white">Connect</h4>
              <ul className="space-y-2 sm:space-y-3">
                <li>
                  <a 
                    href="https://www.facebook.com/mica.biadoy" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-xs sm:text-sm md:text-base text-white hover:text-amber-300 transition-colors inline-flex items-center group mx-auto md:mx-0" 
                    aria-label="Facebook"
                  >
                    <svg className="w-5 h-5 mr-2 text-white group-hover:text-blue-500 transition-colors duration-200" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-4.48c-4.664 0-5.52 2.766-5.52 5.04v1.96h-3z"/>
                    </svg>
                    Facebook
                  </a>
                </li>

                <li>
                  <a 
                    href="https://github.com/itsmicajoycebiadoy" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-xs sm:text-sm md:text-base text-white hover:text-amber-300 transition-colors inline-flex items-center group mx-auto md:mx-0" 
                    aria-label="GitHub"
                  >
                    <svg className="w-5 h-5 mr-2 text-white group-hover:text-gray-800 transition-colors duration-200" fill="currentColor" viewBox="0 0 24 24">
                      <path fillRule="evenodd" clipRule="evenodd" d="M12 0C5.372 0 0 5.372 0 12c0 5.309 3.438 9.8 8.207 11.387.6.11.82-.26.82-.577 0-.28-.01-1.018-.016-2c-3.344.726-4.043-1.612-4.043-1.612-.547-1.387-1.332-1.758-1.332-1.758-1.089-.745.083-.73.083-.73 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.49.997.108-.775.42-1.303.762-1.602-2.665-.3-5.464-1.333-5.464-5.932 0-1.31.468-2.382 1.236-3.22-.124-.303-.536-1.52.117-3.176 0 0 1.008-.322 3.301 1.23A11.51 11.51 0 0112 5.864c1.986.002 4.008.38 5.815 1.144 2.292-1.552 3.3-1.23 3.3-1.23.653 1.656.241 2.873.118 3.176.77.838 1.233 1.91 1.233 3.22 0 4.61-2.8 5.625-5.474 5.924.43.37.817 1.09.817 2.198 0 1.602-.014 2.894-.014 3.287 0 .318.21.69.827.576C20.566 21.8 24 17.31 24 12c0-6.628-5.372-12-12-12z"/>
                    </svg>
                    GitHub
                  </a>
                </li>

                <li>
                  <a 
                    href="https://www.instagram.com/miiekkaa?igsh=ZDBrdTVnNmt0eDFm" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-xs sm:text-sm md:text-base text-white hover:text-amber-300 transition-colors inline-flex items-center group mx-auto md:mx-0" 
                    aria-label="Instagram"
                  >
                    <svg className="w-5 h-5 mr-2 text-white group-hover:text-pink-500 transition-colors duration-200" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                    </svg>
                    Instagram
                  </a>
                </li>
              </ul>
            </div>
          </div>
        
          {/* Bottom Footer */}
          <div className="border-t border-gray-700 mt-8 sm:mt-10 md:mt-12 pt-6 sm:pt-8 text-center">
            <p className="text-xs sm:text-sm md:text-base text-white">
              &copy; 2025 Finance Manager || Created by: Mica Joyce Biadoy
            </p>
          </div>
          </div>
        </footer>
    </div>
  );
}

export default App;