import React, { useState } from 'react';

const TransactionForm = ({ form, setForm, categories, addTransaction, darkMode }) => {
    const [touchedFields, setTouchedFields] = useState({});
    const [errors, setErrors] = useState({});
    const [notifications, setNotifications] = useState([]);

    // Show notification function
    const showNotification = (message, type = 'info') => {
        const id = Date.now();
        const newNotification = {
            id,
            message,
            type,
            timestamp: new Date().getTime()
        };
        
        setNotifications(prev => [...prev, newNotification]);
        
        setTimeout(() => {
            removeNotification(id);
        }, 3000);
    };

    const removeNotification = (id) => {
        setNotifications(prev => prev.filter(notification => notification.id !== id));
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm(prevForm => {
            if (name === 'type' && prevForm.type !== value) {
                if (value === '') {
                    return { 
                        ...prevForm, 
                        type: '', 
                        category: '' 
                    };
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
            case 'type':
                if (!value.trim()) error = 'Transaction type is required';
                break;
            case 'category':
                if (!value.trim()) error = 'Category is required';
                break;
            case 'amount':
                if (!value || parseFloat(value) <= 0) error = 'Amount must be greater than 0';
                break;
            case 'date':
                if (!value) error = 'Date is required';
                break;
            case 'description':
                if (!value.trim()) error = 'Description is required';
                break;
            default:
                break;
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
            
            switch(field) {
                case 'type':
                    if (!value.trim()) error = 'Transaction type is required';
                    break;
                case 'category':
                    if (!value.trim()) error = 'Category is required';
                    break;
                case 'amount':
                    if (!value || parseFloat(value) <= 0) error = 'Amount must be greater than 0';
                    break;
                case 'date':
                    if (!value) error = 'Date is required';
                    break;
                case 'description':
                    if (!value.trim()) error = 'Description is required';
                    break;
                default:
                    break;
            }
            
            if (error) {
                isValid = false;
                newErrors[field] = error;
                errorFields.push(field);
            }
        });

        setErrors(newErrors);
        
        if (!isValid) {
            const fieldNamesMap = {
                'type': 'Transaction Type',
                'category': 'Category',
                'amount': 'Amount',
                'date': 'Date',
                'description': 'Description'
            };
            const missingFields = errorFields.map(field => fieldNamesMap[field]).join(', ');
            showNotification(`Please fill in the following required fields: ${missingFields}`, 'error');
        } else {
            addTransaction();
            showNotification('Transaction added successfully!', 'success');
        }
    };

    // Shared styling for all inputs and dropdowns
    const getInputClasses = (name) => {
        const hasError = errors[name];
        const isDisabled = name === 'category' && !form.type;

        const baseClasses = 'w-full px-3 sm:px-4 md:px-5 py-2.5 sm:py-3 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 text-sm sm:text-base md:text-lg outline-none';
        
        if (isDisabled) {
            return `${baseClasses} border ${
                darkMode 
                ? 'bg-gray-900/30 border-gray-800 text-gray-600' 
                : 'bg-gray-100 border-gray-200 text-gray-400'
            } cursor-not-allowed`;
        }

        if (hasError) {
            return `${baseClasses} border border-red-500 focus:ring-red-500 ${
                darkMode ? 'bg-gray-900/50 text-white' : 'bg-white'
            }`;
        }
        
        return `${baseClasses} border ${
            darkMode 
            ? 'bg-gray-900/50 border-gray-700 text-white hover:border-gray-600' 
            : 'border-gray-300 bg-gray-50 text-gray-800 hover:border-gray-400'
        }`;
    };

    const getNotificationConfig = (type) => {
        const icons = {
            error: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />,
            success: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />,
            warning: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L4.732 16.5c-.77.833.192 2.5 1.732 2.5z" />,
            info: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        };

        const configs = {
            error: { bgColor: 'bg-red-500', borderColor: 'border-red-700', title: 'Error' },
            success: { bgColor: 'bg-green-500', borderColor: 'border-green-700', title: 'Success' },
            warning: { bgColor: 'bg-yellow-500', borderColor: 'border-yellow-700', title: 'Warning' },
            info: { bgColor: 'bg-blue-500', borderColor: 'border-blue-700', title: 'Info' }
        };

        const config = configs[type] || configs.info;
        return {
            ...config,
            icon: (
                <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    {icons[type] || icons.info}
                </svg>
            )
        };
    };

    return (
        <>
            {/* Notification Container */}
            <div className="fixed top-4 right-4 z-50 space-y-3 w-full max-w-xs sm:max-w-sm px-4 sm:px-0">
                {notifications.map((n) => {
                    const config = getNotificationConfig(n.type);
                    return (
                        <div key={n.id} className={`animate-slide-in-right ${config.bgColor} text-white px-4 py-3 rounded-lg shadow-xl border-l-4 ${config.borderColor} transition-all`}>
                            <div className="flex items-start">
                                <div className="mr-3 mt-0.5">{config.icon}</div>
                                <div className="flex-1">
                                    <p className="font-semibold text-sm">{config.title}</p>
                                    <p className="text-xs mt-1 text-white/90">{n.message}</p>
                                </div>
                                <button onClick={() => removeNotification(n.id)} className="ml-3 text-white/80 hover:text-white">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12" strokeWidth="2" /></svg>
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Main Form */}
            <div className="mb-6 sm:mb-8">
                <div className={`rounded-xl shadow-lg p-5 sm:p-8 min-h-[480px] flex flex-col ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
                    <div className="mb-6">
                        <h3 className={`text-xl sm:text-2xl font-bold flex items-center gap-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                            <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 6v6m0 0v6m0-6h6m-6 0H6" strokeWidth="2" /></svg>
                            Add New Transaction
                        </h3>
                    </div>
                    
                    <div className="space-y-4 sm:space-y-6 flex-1">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                            {/* Type */}
                            <div>
                                <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Type <span className="text-red-500">*</span></label>
                                <select name="type" value={form.type} onChange={handleChange} onBlur={handleBlur} className={getInputClasses('type')}>
                                    <option value="">Select Type</option>
                                    <option value="income">Income</option>
                                    <option value="expense">Expense</option>
                                </select>
                                {errors.type && <p className="text-red-500 text-xs mt-1">{errors.type}</p>}
                            </div>

                            {/* Category - Now using shared getInputClasses */}
                            <div>
                                <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Category <span className="text-red-500">*</span></label>
                                <select 
                                    name="category" 
                                    value={form.category} 
                                    onChange={handleChange} 
                                    onBlur={handleBlur} 
                                    disabled={!form.type}
                                    className={getInputClasses('category')}
                                >
                                    <option value="">Select Category</option>
                                    {form.type && categories[form.type].map(cat => (
                                        <option key={cat} value={cat}>{cat.charAt(0).toUpperCase() + cat.slice(1)}</option>
                                    ))}
                                </select>
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
                                <input name="date" type="date" value={form.date} onChange={handleChange} onBlur={handleBlur} className={getInputClasses('date')} />
                                {errors.date && <p className="text-red-500 text-xs mt-1">{errors.date}</p>}
                            </div>
                        </div>

                        <div>
                            <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Description *</label>
                            <input name="description" type="text" value={form.description} onChange={handleChange} onBlur={handleBlur} placeholder="Enter description" className={getInputClasses('description')} />
                            {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description}</p>}
                        </div>

                        <div className="pt-6 mt-auto">
                            <button onClick={handleSubmit} className="w-full bg-indigo-600 text-white py-3 rounded-lg hover:bg-indigo-700 transition-all font-medium shadow-lg transform hover:-translate-y-0.5">
                                Add Transaction
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default TransactionForm;