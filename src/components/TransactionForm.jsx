import React, { useState, useEffect, useRef } from 'react';

const TransactionForm = ({ form, setForm, categories, addTransaction, darkMode, showNotification, transactions }) => {
    const [touchedFields, setTouchedFields] = useState({});
    const [errors, setErrors] = useState({});
    const [monthlyBudget, setMonthlyBudget] = useState('');
    const [currentBudgetDate, setCurrentBudgetDate] = useState(new Date());
    const [selectedBudgetCategory, setSelectedBudgetCategory] = useState('');
    const [spentAmount, setSpentAmount] = useState(0);
    const [savedBudgetForCategory, setSavedBudgetForCategory] = useState(0);
    const [budgetHistory, setBudgetHistory] = useState([]);
    const lastValidSpentRef = useRef(0);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [pendingSpentUpdate, setPendingSpentUpdate] = useState(0);
    const [prevSelectedCategory, setPrevSelectedCategory] = useState('');

    // Sync selectedBudgetCategory when form category changes
    useEffect(() => {
        if (form.type === 'expense' && form.category) {
            if (form.category !== selectedBudgetCategory) {
                setSelectedBudgetCategory(form.category);
            }
        }
    }, [form.category, form.type]);

    // Sync form category when selectedBudgetCategory changes
    useEffect(() => {
        if (selectedBudgetCategory && form.type === 'expense') {
            if (form.category !== selectedBudgetCategory) {
                setForm(prev => ({ ...prev, category: selectedBudgetCategory }));
            }
        }
    }, [selectedBudgetCategory]);

    // --- RESET VALUES WHEN CATEGORY CHANGES ---
    useEffect(() => {

        if (prevSelectedCategory !== selectedBudgetCategory) {
            setMonthlyBudget('');
            setSavedBudgetForCategory(0);
            setSpentAmount(0);
            setPendingSpentUpdate(0);
            lastValidSpentRef.current = 0;
            
            setPrevSelectedCategory(selectedBudgetCategory);
        }
    }, [selectedBudgetCategory, prevSelectedCategory]);

    // --- LOAD BUDGET & CALCULATE SPENT ---
    useEffect(() => {
        const monthKey = `${currentBudgetDate.getFullYear()}-${String(currentBudgetDate.getMonth() + 1).padStart(2, '0')}`;
        
        const storageKey = `budget_history_${monthKey}`;
        const history = JSON.parse(localStorage.getItem(storageKey)) || [];
        setBudgetHistory(history);

        if (selectedBudgetCategory) {
            const categoryHistory = history.filter(h => h.category === selectedBudgetCategory);
            
            // latest budget 
            let latestBudget = 0;
            if (categoryHistory.length > 0) {
                // Sort by timestamp or date 
                const sortedHistory = [...categoryHistory].sort((a, b) => {
                    const dateA = new Date(`${a.date} ${a.timestamp}`);
                    const dateB = new Date(`${b.date} ${b.timestamp}`);
                    return dateB - dateA; // Descending order
                });
                latestBudget = sortedHistory[0].amount;
            }
            
            setSavedBudgetForCategory(parseFloat(latestBudget) || 0);
            setMonthlyBudget(latestBudget || ''); 

            const actualSpentFromHistory = (transactions || [])
                .filter(t => {
                    const tDate = new Date(t.date);
                    const tMonthKey = `${tDate.getFullYear()}-${String(tDate.getMonth() + 1).padStart(2, '0')}`;
                    
                    return t.category === selectedBudgetCategory && 
                           t.type === 'expense' && 
                           tMonthKey === monthKey;
                })
                .reduce((sum, t) => sum + parseFloat(t.amount || 0), 0);
            
            const totalWithPending = actualSpentFromHistory + pendingSpentUpdate;
            const formAmountValue = parseFloat(form.amount);
            const isFormRelevant = form.type === 'expense' && 
                                  form.category === selectedBudgetCategory && 
                                  !isNaN(formAmountValue) && 
                                  formAmountValue > 0;
            
            const liveFormAmount = (!isSubmitting && isFormRelevant) 
                 ? formAmountValue 
                 : 0;

            const totalCalculated = totalWithPending + liveFormAmount;

            setSpentAmount(totalCalculated);
            lastValidSpentRef.current = totalCalculated;

        } else {
            setMonthlyBudget('');
            setSavedBudgetForCategory(0);
            setSpentAmount(0);
            lastValidSpentRef.current = 0;
            setPendingSpentUpdate(0);
        }
    }, [currentBudgetDate, selectedBudgetCategory, transactions, form.amount, form.category, form.type, pendingSpentUpdate, isSubmitting]); 

    const handleSaveBudget = () => {
        if (!selectedBudgetCategory) {
            showNotification('Please select a category first', 'error');
            return;
        }

        const monthKey = `${currentBudgetDate.getFullYear()}-${String(currentBudgetDate.getMonth() + 1).padStart(2, '0')}`;
        const amount = parseFloat(monthlyBudget);

        if (!monthlyBudget || amount <= 0) {
            showNotification('Please enter a valid budget amount', 'error');
            return;
        }
        
        const storageKey = `budget_history_${monthKey}`;
        const existingHistory = JSON.parse(localStorage.getItem(storageKey)) || [];
        
        const newEntry = {
            id: Date.now(),
            category: selectedBudgetCategory,
            amount: amount,
            date: new Date().toLocaleDateString(),
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };

        const updatedHistory = [...existingHistory, newEntry];

        localStorage.setItem(storageKey, JSON.stringify(updatedHistory));
        setSavedBudgetForCategory(amount);
        setBudgetHistory(updatedHistory);

        showNotification(`Budget for ${selectedBudgetCategory} has been updated!`, 'success');
    };

    const handleRemoveBudgetEntry = (entryId) => {
        const monthKey = `${currentBudgetDate.getFullYear()}-${String(currentBudgetDate.getMonth() + 1).padStart(2, '0')}`;
        const storageKey = `budget_history_${monthKey}`;
        const existingHistory = JSON.parse(localStorage.getItem(storageKey)) || [];
        const entryToRemove = existingHistory.find(h => h.id === entryId);
        
        const updatedHistory = existingHistory.filter(h => h.id !== entryId);
        localStorage.setItem(storageKey, JSON.stringify(updatedHistory));
        setBudgetHistory(updatedHistory);

        const categoryHistory = updatedHistory.filter(h => h.category === selectedBudgetCategory);
        
        if (categoryHistory.length > 0) {
            const sortedHistory = [...categoryHistory].sort((a, b) => {
                const dateA = new Date(`${a.date} ${a.timestamp}`);
                const dateB = new Date(`${b.date} ${b.timestamp}`);
                return dateB - dateA;
            });
            const latestAmount = sortedHistory[0].amount;
            setSavedBudgetForCategory(parseFloat(latestAmount));
            setMonthlyBudget(latestAmount.toString());
        } else {
            setSavedBudgetForCategory(0);
            setMonthlyBudget('');
        }
        
        showNotification(`Budget history entry removed`, 'info');
    };

    const handleRemoveBudget = () => {
        if (!selectedBudgetCategory) return;
        
        const monthKey = `${currentBudgetDate.getFullYear()}-${String(currentBudgetDate.getMonth() + 1).padStart(2, '0')}`;
        const storageKey = `budget_history_${monthKey}`;
        const existingHistory = JSON.parse(localStorage.getItem(storageKey)) || [];
        
        const updatedHistory = existingHistory.filter(h => h.category !== selectedBudgetCategory);
        localStorage.setItem(storageKey, JSON.stringify(updatedHistory));
        
        setBudgetHistory(updatedHistory);
        setMonthlyBudget('');
        setSavedBudgetForCategory(0);
        showNotification(`Budget history for ${selectedBudgetCategory} cleared`, 'info');
    };

    const changeMonth = (offset) => {
        const nextDate = new Date(currentBudgetDate);
        nextDate.setMonth(nextDate.getMonth() + offset);
        setCurrentBudgetDate(nextDate);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm(prevForm => {
            if (name === 'type' && prevForm.type !== value) {
                return { 
                    ...prevForm, 
                    type: value, 
                    category: '' 
                };
            }
            return { ...prevForm, [name]: value };
        });

        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const handleBlur = (e) => {
        const { name } = e.target;
        setTouchedFields(prev => ({ ...prev, [name]: true }));
        validateField(name, form[name]);
    };

    const validateField = (name, value) => {
        let error = '';
        switch(name) {
            case 'type': if (!value.trim()) error = 'Required'; break;
            case 'category': if (!value.trim()) error = 'Required'; break;
            case 'amount': if (!value || parseFloat(value) <= 0) error = 'Invalid'; break;
            case 'date': if (!value) error = 'Required'; break;
            case 'description': if (!value.trim()) error = 'Required'; break;
            default: break;
        }
        setErrors(prev => ({ ...prev, [name]: error }));
    };

    const handleSubmit = () => {
        const fieldNames = ['type', 'category', 'amount', 'date', 'description'];
        let isValid = true;
        const newErrors = {};

        fieldNames.forEach(field => {
            const value = form[field];
            if (field === 'amount' ? (!value || parseFloat(value) <= 0) : !value?.trim()) {
                newErrors[field] = 'Required';
                isValid = false;
            }
        });

        setErrors(newErrors);
        if (!isValid) {
            showNotification(`Please fill in all required fields`, 'error');
        } else {
            // save ang amount from the form
            const formAmountValue = parseFloat(form.amount) || 0;
            const isExpenseForSelectedCategory = form.type === 'expense' && 
                                                form.category === selectedBudgetCategory;
            
            setIsSubmitting(true);
            
            if (isExpenseForSelectedCategory) {
                setPendingSpentUpdate(prev => prev + formAmountValue);
            }
            
            // call addTransaction function from parent component
            addTransaction(); 
            
            //reset ang form at errors
            setErrors({});
            setTouchedFields({});
            
            // isSubmitting state
            setTimeout(() => {
                setIsSubmitting(false);
            }, 300);
        }
    };

    const getInputClasses = (name) => {
        const hasError = errors[name];
        const baseClasses = 'w-full px-4 py-3 min-h-[48px] rounded-xl border focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-sm appearance-none';
        
        if (hasError) {
            return `${baseClasses} border-red-500 ${darkMode ? 'bg-red-500/10 text-white' : 'bg-red-50'}`;
        }
        return `${baseClasses} ${darkMode ? 'bg-gray-900/50 border-gray-700 text-white' : 'bg-gray-50 border-gray-200 text-gray-800'}`;
    };

    const selectArrowStyle = {
        backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='${darkMode ? '%239ca3af' : '%234b5563'}' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'right 0.75rem center',
        backgroundSize: '1.25em 1.25em'
    };

    const dateInputStyle = {
        colorScheme: darkMode ? 'dark' : 'light',
        paddingRight: '10px' 
    };

    const remainingAmount = savedBudgetForCategory - spentAmount;
    const usagePercent = savedBudgetForCategory > 0 ? Math.round((spentAmount / savedBudgetForCategory) * 100) : 0;

    return (
        <div className="w-full h-full flex flex-col space-y-4 md:space-y-6">
            <div className={`p-4 md:p-6 rounded-2xl shadow-sm border ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}>
                <div className="flex items-center justify-between mb-6">
                    <button onClick={() => changeMonth(-1)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors">
                        <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>
                    </button>
                    <div className="text-center">
                        <h2 className={`text-[10px] md:text-xs font-semibold uppercase tracking-widest ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Category Budget Tracker</h2>
                        <p className={`text-lg md:text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                            {currentBudgetDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
                        </p>
                    </div>
                    <button onClick={() => changeMonth(1)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors">
                        <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
                    </button>
                </div>

                <div className="space-y-3">
                    <select 
                        value={selectedBudgetCategory}
                        onChange={(e) => {
                            const newCategory = e.target.value;
                            setSelectedBudgetCategory(newCategory);
                        }}
                        className={`w-full px-4 py-3 rounded-xl border focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-sm appearance-none ${darkMode ? 'bg-gray-900 border-gray-700 text-white' : 'bg-gray-50 border-gray-200 text-gray-800'}`}
                        style={selectArrowStyle}
                    >
                        <option value="">Select Category to View Budget</option>
                        {categories.expense.map(cat => (
                            <option key={cat} value={cat}>{cat}</option>
                        ))}
                    </select>

                    {!selectedBudgetCategory ? (
                        <div className="mt-4 py-12 flex flex-col items-center justify-center space-y-2 border-2 border-dashed border-gray-100 dark:border-gray-700/50 rounded-2xl">
                             <p className={`text-center text-[10px] italic ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                                Choose a category above to set or track its budget.
                            </p>
                        </div>
                    ) : (
                        <>
                            <div className="flex flex-col sm:flex-row gap-2 mt-4">
                                <div className="relative flex-1">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-medium">₱</span>
                                    <input 
                                        type="number" 
                                        value={monthlyBudget} 
                                        onChange={(e) => setMonthlyBudget(e.target.value)}
                                        placeholder="Set amount" 
                                        className={`w-full pl-8 pr-4 py-3 rounded-xl border focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-sm ${darkMode ? 'bg-gray-900 border-gray-700 text-white' : 'bg-gray-50 border-gray-200 text-gray-800'}`}
                                    />
                                </div>
                                <div className="flex gap-2 w-full sm:w-auto">
                                    <button 
                                        onClick={handleSaveBudget}
                                        className="flex-1 sm:flex-none px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold transition-all active:scale-95 shadow-lg shadow-indigo-500/20 text-sm"
                                    >
                                        Save
                                    </button>
                                    <button 
                                        onClick={handleRemoveBudget}
                                        className={`px-4 py-3 rounded-xl border transition-all active:scale-95 ${darkMode ? 'border-red-500/50 text-red-400 hover:bg-red-500/10' : 'border-red-200 text-red-500 hover:bg-red-50'}`}
                                    >
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                    </button>
                                </div>
                            </div>

                            <div className={`mt-4 p-4 rounded-xl border ${darkMode ? 'bg-gray-900/50 border-gray-700' : 'bg-gray-50 border-gray-100'}`}>
                                <div className="flex justify-between items-center mb-4">
                                    <span className="text-[10px] font-bold text-gray-500 uppercase">{selectedBudgetCategory} Status</span>
                                    <span className={`text-[9px] font-black px-2 py-1 rounded-md uppercase ${remainingAmount < 0 ? 'bg-red-500 text-white' : 'bg-green-500 text-white'}`}>
                                        {remainingAmount < 0 ? 'Over Budget' : 'Within Budget'}
                                    </span>
                                </div>
                                
                                <div className="grid grid-cols-3 gap-1 md:gap-2 mb-3 text-center sm:text-left">
                                    <div className="flex flex-col">
                                        <span className="text-[8px] md:text-[9px] uppercase font-bold text-gray-400">Spent</span>
                                        <span className={`text-xs md:text-sm font-bold truncate ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                                            ₱{spentAmount.toLocaleString()}
                                        </span>
                                    </div>
                                    <div className="flex flex-col border-l pl-2 border-gray-200 dark:border-gray-700">
                                        <span className="text-[8px] md:text-[9px] uppercase font-bold text-gray-400">Budget</span>
                                        <span className={`text-xs md:text-sm font-bold truncate ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                                            ₱{savedBudgetForCategory.toLocaleString()}
                                        </span>
                                    </div>
                                    <div className="flex flex-col border-l pl-2 border-gray-200 dark:border-gray-700">
                                        <span className="text-[8px] md:text-[9px] uppercase font-bold text-gray-400">Left</span>
                                        <span className={`text-xs md:text-sm font-bold truncate ${remainingAmount < 0 ? 'text-red-500' : (darkMode ? 'text-green-400' : 'text-green-600')}`}>
                                            ₱{remainingAmount.toLocaleString()}
                                        </span>
                                    </div>
                                </div>

                                <div className="space-y-1">
                                    <div className="flex justify-between text-[9px] font-bold text-gray-500">
                                        <span>Usage</span>
                                        <span>{usagePercent}%</span>
                                    </div>
                                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5 overflow-hidden">
                                        <div 
                                            className={`h-full transition-all duration-500 ${remainingAmount < 0 ? 'bg-red-500' : 'bg-indigo-500'}`}
                                            style={{ width: `${Math.min(usagePercent, 100)}%` }}
                                        ></div>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="mt-4">
                                <span className="text-[10px] font-bold text-gray-500 uppercase ml-1">Budget History Log</span>
                                <div className={`mt-2 max-h-32 overflow-y-auto rounded-xl border ${darkMode ? 'bg-gray-900/30 border-gray-700' : 'bg-gray-50/50 border-gray-100'}`}>
                                    {budgetHistory.filter(h => h.category === selectedBudgetCategory).length > 0 ? (
                                        <table className="w-full text-left border-collapse">
                                            <thead>
                                                <tr className={`border-b ${darkMode ? 'border-gray-700' : 'border-gray-100'}`}>
                                                    <th className="px-3 py-2 text-[8px] font-bold text-gray-400 uppercase">Category</th>
                                                    <th className="px-3 py-2 text-[8px] font-bold text-gray-400 uppercase">Amount</th>
                                                    <th className="px-3 py-2 text-[8px] font-bold text-gray-400 uppercase text-right">Action</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {budgetHistory
                                                    .filter(h => h.category === selectedBudgetCategory)
                                                    .slice().reverse() 
                                                    .map((log) => (
                                                        <tr key={log.id} className={`border-b last:border-0 ${darkMode ? 'border-gray-700/50' : 'border-gray-100'}`}>
                                                            <td className="px-3 py-2">
                                                                <div className={`text-[10px] font-medium ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>{log.category}</div>
                                                            </td>
                                                            <td className="px-3 py-2">
                                                                <div className={`text-[10px] font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>₱{log.amount.toLocaleString()}</div>
                                                                <div className="text-[8px] text-gray-500">{log.timestamp}</div>
                                                            </td>
                                                            <td className="px-3 py-2 text-right">
                                                                <button 
                                                                    onClick={() => handleRemoveBudgetEntry(log.id)}
                                                                    className="text-red-400 hover:text-red-500 transition-colors"
                                                                >
                                                                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                                                                </button>
                                                            </td>
                                                        </tr>
                                                    ))}
                                            </tbody>
                                        </table>
                                    ) : (
                                        <div className="p-4 text-center text-[9px] text-gray-500 italic">No history found for this category.</div>
                                    )}
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>

            <div className={`p-4 md:p-6 rounded-2xl shadow-sm border flex-1 flex flex-col ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}>
                <h3 className={`text-lg md:text-2xl font-bold mb-6 flex items-center gap-2 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                    <span className="w-1.5 h-6 bg-indigo-600 rounded-full"></span>
                    Transaction Details
                </h3>

                <div className="space-y-4 flex-1 flex flex-col">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-gray-500 uppercase ml-1">Type</label>
                            <select 
                                name="type" 
                                value={form.type} 
                                onChange={handleChange} 
                                onBlur={handleBlur} 
                                className={getInputClasses('type')}
                                style={selectArrowStyle}
                            >
                                <option value="">Select</option>
                                <option value="income">Income</option>
                                <option value="expense">Expense</option>
                            </select>
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-gray-500 uppercase ml-1">Category</label>
                            <select 
                                name="category" 
                                value={form.category} 
                                onChange={handleChange} 
                                onBlur={handleBlur} 
                                disabled={!form.type}
                                className={getInputClasses('category')}
                                style={selectArrowStyle}
                            >
                                {!form.type ? (
                                    <option value="">Select type first</option>
                                ) : (
                                    <>
                                        <option value="">Select Category</option>
                                        {categories[form.type].map(cat => (
                                            <option key={cat} value={cat}>{cat}</option>
                                        ))}
                                    </>
                                )}
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-gray-500 uppercase ml-1">Amount</label>
                            <input name="amount" type="number" value={form.amount} onChange={handleChange} onBlur={handleBlur} placeholder="0.00" className={getInputClasses('amount')} />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-gray-500 uppercase ml-1">Date</label>
                            <input 
                                name="date" 
                                type="date" 
                                value={form.date} 
                                onChange={handleChange} 
                                onBlur={handleBlur} 
                                className={`${getInputClasses('date')} block w-full`}
                                style={dateInputStyle}
                            />
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-gray-500 uppercase ml-1">Description</label>
                        <input name="description" type="text" value={form.description} onChange={handleChange} onBlur={handleBlur} placeholder="Add a description." className={getInputClasses('description')} />
                    </div>

                    <div className="pt-4 mt-auto">
                        <button 
                            onClick={handleSubmit} 
                            disabled={isSubmitting}
                            className={`w-full bg-indigo-600 hover:bg-indigo-700 text-white py-4 rounded-xl font-bold text-xs md:text-sm uppercase tracking-widest transition-all active:scale-[0.98] shadow-xl shadow-indigo-600/20 ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                            {isSubmitting ? 'Processing...' : 'Add Transaction'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TransactionForm;