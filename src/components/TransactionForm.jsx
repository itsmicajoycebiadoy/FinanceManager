import React, { useState } from 'react';

const TransactionForm = ({ form, setForm, categories, addTransaction, darkMode, showNotification }) => {
    const [touchedFields, setTouchedFields] = useState({});
    const [errors, setErrors] = useState({});

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
            case 'type': if (!value.trim()) error = 'Transaction type is required'; break;
            case 'category': if (!value.trim()) error = 'Category is required'; break;
            case 'amount': if (!value || parseFloat(value) <= 0) error = 'Amount must be greater than 0'; break;
            case 'date': if (!value) error = 'Date is required'; break;
            case 'description': if (!value.trim()) error = 'Description is required'; break;
            default: break;
        }
        setErrors(prev => ({ ...prev, [name]: error }));
    };

    const handleSubmit = () => {
        const fieldNames = ['type', 'category', 'amount', 'date', 'description'];
        let isValid = true;
        const newErrors = {};
        let errorFields = [];

        fieldNames.forEach(field => {
            const value = form[field];
            let error = '';
            if (field === 'amount' ? (!value || parseFloat(value) <= 0) : !value.trim()) {
                error = 'Required';
                isValid = false;
                newErrors[field] = error;
                errorFields.push(field);
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
        const isDisabled = name === 'category' && !form.type;
        const baseClasses = 'w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 text-sm sm:text-base outline-none appearance-none';
        
        if (isDisabled) {
            return `${baseClasses} border ${darkMode ? 'bg-gray-900/30 border-gray-800 text-gray-600' : 'bg-gray-100 border-gray-200 text-gray-400'} cursor-not-allowed`;
        }
        if (hasError) {
            return `${baseClasses} border border-red-500 focus:ring-red-500 ${darkMode ? 'bg-gray-900/50 text-white' : 'bg-white'}`;
        }
        return `${baseClasses} border ${darkMode ? 'bg-gray-900/50 border-gray-700 text-white hover:border-gray-600' : 'border-gray-300 bg-gray-50 text-gray-800 hover:border-gray-400'}`;
    };

    return (
        <div className="mb-6 sm:mb-8 w-full max-w-full overflow-hidden">

            <div className={`rounded-xl shadow-lg p-4 sm:p-8 min-h-[480px] flex flex-col ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
                <div className="mb-6">
                    <h3 className={`text-xl sm:text-2xl font-bold flex items-center gap-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                        <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 6v6m0 0v6m0-6h6m-6 0H6" strokeWidth="2" /></svg>
                        Add New Transaction
                    </h3>
                </div>
                
                <div className="space-y-4 sm:space-y-6 flex-1">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                        <div className="relative">
                            <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Type <span className="text-red-500">*</span></label>
                            <div className="relative">
                                <select name="type" value={form.type} onChange={handleChange} onBlur={handleBlur} className={getInputClasses('type')}>
                                    <option value="">Select Type</option>
                                    <option value="income">Income</option>
                                    <option value="expense">Expense</option>
                                </select>
                            </div>
                            {errors.type && <p className="text-red-500 text-xs mt-1">{errors.type}</p>}
                        </div>

                        <div className="relative">
                            <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Category <span className="text-red-500">*</span></label>
                            <div className="relative">
                                <select name="category" value={form.category} onChange={handleChange} onBlur={handleBlur} disabled={!form.type} className={getInputClasses('category')}>
                                    <option value="">Select Category</option>
                                    {form.type && categories[form.type].map(cat => (
                                        <option key={cat} value={cat}>{cat.charAt(0).toUpperCase() + cat.slice(1)}</option>
                                    ))}
                                </select>
                            </div>
                            {errors.category && <p className="text-red-500 text-xs mt-1">{errors.category}</p>}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                        <div>
                            <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Amount (₱) *</label>
                            <input name="amount" type="number" value={form.amount} onChange={handleChange} onBlur={handleBlur} placeholder="0" className={getInputClasses('amount')} />
                            {errors.amount && <p className="text-red-500 text-xs mt-1">{errors.amount}</p>}
                        </div>
                        <div>
                            <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Date *</label>
                            <input 
                                name="date" 
                                type="date" 
                                value={form.date} 
                                onChange={handleChange} 
                                onBlur={handleBlur} 
                                className={`${getInputClasses('date')} ${darkMode ? 'dark-calendar' : ''}`} 
                            />
                            {errors.date && <p className="text-red-500 text-xs mt-1">{errors.date}</p>}
                        </div>
                    </div>

                    <div>
                        <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Description *</label>
                        <input name="description" type="text" value={form.description} onChange={handleChange} onBlur={handleBlur} placeholder="Enter description" className={getInputClasses('description')} />
                        {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description}</p>}
                    </div>

                    <div className="pt-6 mt-auto">
                        <button onClick={handleSubmit} className="w-full bg-indigo-600 text-white py-3 rounded-lg hover:bg-indigo-700 active:scale-95 transition-all font-medium shadow-lg transform">
                            Add Transaction
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TransactionForm;