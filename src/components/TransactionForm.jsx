import React, { useState, useEffect } from 'react';

const TransactionForm = ({ form, setForm, categories, addTransaction, darkMode, showNotification, transactions }) => {
    const [touchedFields, setTouchedFields] = useState({});
    const [errors, setErrors] = useState({});
    const [monthlyBudget, setMonthlyBudget] = useState('');
    const [currentBudgetDate, setCurrentBudgetDate] = useState(new Date());
    
    // State para sa napiling category sa budget section
    const [selectedBudgetCategory, setSelectedBudgetCategory] = useState('');

    // --- STATE FOR BUDGET VS SPENT ---
    const [spentAmount, setSpentAmount] = useState(0);

    // --- CONNECTION LOGIC: Sync Budget Category with Form Category ---
    useEffect(() => {
        if (form.type === 'expense' && form.category && form.category !== selectedBudgetCategory) {
            setSelectedBudgetCategory(form.category);
        }
    }, [form.category, form.type]);

    useEffect(() => {
        if (selectedBudgetCategory && form.type === 'expense' && form.category !== selectedBudgetCategory) {
            setForm(prev => ({ ...prev, category: selectedBudgetCategory }));
        }
    }, [selectedBudgetCategory]);

    // LOAD BUDGET AT KALKULAHIN ANG SPENT (CONNECTED SA FORM AMOUNT)
    useEffect(() => {
        const monthKey = `${currentBudgetDate.getFullYear()}-${String(currentBudgetDate.getMonth() + 1).padStart(2, '0')}`;
        
        // 1. Load Budget from LocalStorage
        const allBudgets = JSON.parse(localStorage.getItem(`monthly_budgets_${monthKey}`)) || {};
        
        if (selectedBudgetCategory) {
            setMonthlyBudget(allBudgets[selectedBudgetCategory] || '');

            // 2. Calculate Spent Amount from historical transactions
            const pastSpent = (transactions || [])
                .filter(t => {
                    const tDate = new Date(t.date);
                    const tMonthKey = `${tDate.getFullYear()}-${String(tDate.getMonth() + 1).padStart(2, '0')}`;
                    return t.category === selectedBudgetCategory && 
                           t.type === 'expense' && 
                           tMonthKey === monthKey;
                })
                .reduce((sum, t) => sum + parseFloat(t.amount || 0), 0);
            
            // 3. Live Preview: Isama ang kasalukuyang tina-type sa form kung tugma ang category
            // Gagamit tayo ng Number() para siguradong hindi ito maging string concatenation
            const currentFormAmount = (form.type === 'expense' && form.category === selectedBudgetCategory) 
                ? Number(form.amount || 0) 
                : 0;

            setSpentAmount(pastSpent + currentFormAmount);
        } else {
            setMonthlyBudget('');
            setSpentAmount(0);
        }
    }, [currentBudgetDate, selectedBudgetCategory, transactions, form.type, form.amount, form.category]); 

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
        
        const storageKey = `monthly_budgets_${monthKey}`;
        const existingBudgets = JSON.parse(localStorage.getItem(storageKey)) || {};
        
        const updatedBudgets = {
            ...existingBudgets,
            [selectedBudgetCategory]: amount
        };

        localStorage.setItem(storageKey, JSON.stringify(updatedBudgets));
        showNotification(`Budget for ${selectedBudgetCategory} has been updated!`, 'success');
    };

    const handleRemoveBudget = () => {
        if (!selectedBudgetCategory) return;
        
        const monthKey = `${currentBudgetDate.getFullYear()}-${String(currentBudgetDate.getMonth() + 1).padStart(2, '0')}`;
        const storageKey = `monthly_budgets_${monthKey}`;
        const existingBudgets = JSON.parse(localStorage.getItem(storageKey)) || {};
        
        if (existingBudgets[selectedBudgetCategory]) {
            delete existingBudgets[selectedBudgetCategory];
            localStorage.setItem(storageKey, JSON.stringify(existingBudgets));
            setMonthlyBudget('');
            showNotification(`Budget for ${selectedBudgetCategory} removed`, 'info');
        }
    };

    const changeMonth = (offset) => {
        const newDate = new Date(currentBudgetDate.setMonth(currentBudgetDate.getMonth() + offset));
        setCurrentBudgetDate(new Date(newDate));
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm(prevForm => {
            if (name === 'type' && prevForm.type !== value) {
                if (value === '') {
                    return { ...prevForm, type: '', category: '' };
                }
                return { 
                    ...prevForm, 
                    type: value, 
                    category: categories[value][0] 
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
            addTransaction();
        }
    };

    const getInputClasses = (name) => {
        const hasError = errors[name];
        const baseClasses = 'w-full px-4 py-3 rounded-xl border focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-sm appearance-none';
        
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

    // --- CALCULATIONS FOR UI ---
    const budgetValue = parseFloat(monthlyBudget) || 0;
    const remainingAmount = budgetValue - spentAmount;
    const usagePercent = budgetValue > 0 ? Math.round((spentAmount / budgetValue) * 100) : 0;

    return (
        <div className="w-full h-full flex flex-col space-y-6">
            {/* 1. SET BUDGET SECTION */}
            <div className={`p-6 rounded-2xl shadow-sm border ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}>
                <div className="flex items-center justify-between mb-6">
                    <button onClick={() => changeMonth(-1)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors">
                        <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>
                    </button>
                    <div className="text-center">
                        <h2 className={`text-xs font-semibold uppercase tracking-widest ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Category Budget Tracker</h2>
                        <p className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
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
                        onChange={(e) => setSelectedBudgetCategory(e.target.value)}
                        className={`w-full px-4 py-3 rounded-xl border focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-sm appearance-none ${darkMode ? 'bg-gray-900 border-gray-700 text-white' : 'bg-gray-50 border-gray-200 text-gray-800'}`}
                        style={selectArrowStyle}
                    >
                        <option value="">Select Category to View Budget</option>
                        {categories.expense.map(cat => (
                            <option key={cat} value={cat}>{cat}</option>
                        ))}
                    </select>

                    <div className="flex gap-2">
                        <div className="relative flex-1">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-medium">₱</span>
                            <input 
                                type="number" 
                                value={monthlyBudget} 
                                onChange={(e) => setMonthlyBudget(e.target.value)}
                                placeholder="Set amount" 
                                className={`w-full pl-8 pr-4 py-3 rounded-xl border focus:ring-2 focus:ring-indigo-500 outline-none transition-all ${darkMode ? 'bg-gray-900 border-gray-700 text-white' : 'bg-gray-50 border-gray-200 text-gray-800'}`}
                            />
                        </div>
                        <button 
                            onClick={handleSaveBudget}
                            className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold transition-all active:scale-95 shadow-lg shadow-indigo-500/20"
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

                    {selectedBudgetCategory && (
                        <div className={`mt-4 p-4 rounded-xl border ${darkMode ? 'bg-gray-900/50 border-gray-700' : 'bg-gray-50 border-gray-100'}`}>
                            <div className="flex justify-between items-center mb-4">
                                <span className="text-xs font-bold text-gray-500 uppercase">{selectedBudgetCategory} Status</span>
                                <span className={`text-[10px] font-black px-2 py-1 rounded-md uppercase ${remainingAmount < 0 ? 'bg-red-500 text-white' : 'bg-green-500 text-white'}`}>
                                    {remainingAmount < 0 ? 'Over Budget' : 'Within Budget'}
                                </span>
                            </div>
                            
                            <div className="grid grid-cols-3 gap-2 mb-3">
                                <div className="flex flex-col">
                                    <span className="text-[9px] uppercase font-bold text-gray-400">Spent</span>
                                    <span className={`text-sm font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                                        ₱{spentAmount.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                                    </span>
                                </div>
                                <div className="flex flex-col border-l pl-2 border-gray-200 dark:border-gray-700">
                                    <span className="text-[9px] uppercase font-bold text-gray-400">Budget</span>
                                    <span className={`text-sm font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                                        ₱{budgetValue.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                                    </span>
                                </div>
                                <div className="flex flex-col border-l pl-2 border-gray-200 dark:border-gray-700">
                                    <span className="text-[9px] uppercase font-bold text-gray-400">Remaining</span>
                                    <span className={`text-sm font-bold ${remainingAmount < 0 ? 'text-red-500' : (darkMode ? 'text-green-400' : 'text-green-600')}`}>
                                        ₱{remainingAmount.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                                    </span>
                                </div>
                            </div>

                            <div className="space-y-1">
                                <div className="flex justify-between text-[10px] font-bold text-gray-500">
                                    <span>Usage Percentage</span>
                                    <span>{usagePercent}%</span>
                                </div>
                                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
                                    <div 
                                        className={`h-full transition-all duration-500 ${remainingAmount < 0 ? 'bg-red-500' : 'bg-indigo-500'}`}
                                        style={{ width: `${Math.min(usagePercent, 100)}%` }}
                                    ></div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* 2. TRANSACTION FORM SECTION */}
            <div className={`p-6 rounded-2xl shadow-sm border flex-1 flex flex-col ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}>
                <h3 className={`text-xl sm:text-2xl font-bold mb-6 flex items-center gap-2 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                    <span className="w-1.5 h-6 bg-indigo-600 rounded-full"></span>
                    Transaction Details
                </h3>

                <div className="space-y-5 flex-1 flex flex-col justify-between">
                    <div className="space-y-5">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-500 uppercase ml-1">Type</label>
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
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-500 uppercase ml-1">Category</label>
                                <select 
                                    name="category" 
                                    value={form.category} 
                                    onChange={handleChange} 
                                    onBlur={handleBlur} 
                                    disabled={!form.type}
                                    className={getInputClasses('category')}
                                    style={selectArrowStyle}
                                >
                                    <option value="">Select</option>
                                    {form.type && categories[form.type].map(cat => (
                                        <option key={cat} value={cat}>{cat}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-500 uppercase ml-1">Amount</label>
                                <input name="amount" type="number" value={form.amount} onChange={handleChange} onBlur={handleBlur} placeholder="0.00" className={getInputClasses('amount')} />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-500 uppercase ml-1">Date</label>
                                <input name="date" type="date" value={form.date} onChange={handleChange} onBlur={handleBlur} className={getInputClasses('date')} />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-500 uppercase ml-1">Description</label>
                            <input name="description" type="text" value={form.description} onChange={handleChange} onBlur={handleBlur} placeholder="Add a description." className={getInputClasses('description')} />
                        </div>
                    </div>

                    <div className="pt-6">
                        <button 
                            onClick={handleSubmit} 
                            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-4 rounded-xl font-bold text-sm uppercase tracking-widest transition-all active:scale-[0.98] shadow-xl shadow-indigo-600/20"
                        >
                            Add Transaction
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TransactionForm;