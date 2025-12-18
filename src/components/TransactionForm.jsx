import React, { useState, useEffect } from 'react';

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

        // Clear error when user starts typing
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const handleBlur = (e) => {
        const { name } = e.target;
        setTouchedFields(prev => ({ ...prev, [name]: true }));
        
        // Validate the field on blur
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
        // Validate all fields before submitting
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
            // Show success notification for adding transaction
            showNotification('Transaction added successfully!', 'success');
        }
    };

    const getInputClasses = (name) => {
        const hasError = errors[name];
        const baseClasses = 'w-full px-3 sm:px-4 md:px-5 py-2.5 sm:py-3 rounded-lg focus:ring-2 focus:border-transparent transition-all duration-200 text-sm sm:text-base md:text-lg';
        
        if (hasError) {
            return `${baseClasses} border border-red-500 focus:ring-red-500 ${
                darkMode ? 'bg-gray-800 text-white' : 'bg-white'
            }`;
        }
        
        return `${baseClasses} focus:ring-indigo-500 border ${
            darkMode ? 'bg-gray-800 border-gray-700 text-white hover:border-gray-600' : 'border-gray-300 bg-white hover:border-gray-400'
        }`;
    };

    const getCategoryClasses = () => {
        const hasError = errors['category'];
        
        if (!form.type) {
            return darkMode 
                ? 'bg-gray-900 border border-gray-800 text-gray-500 cursor-not-allowed' 
                : 'bg-gray-100 border border-gray-300 text-gray-400 cursor-not-allowed';
        }
        
        if (hasError) {
            return `${darkMode ? 'bg-gray-800 text-white' : 'bg-white'} border border-red-500 focus:ring-red-500`;
        }
        
        return `${darkMode ? 'bg-gray-800 border-gray-700 text-white hover:border-gray-600' : 'border border-gray-300 bg-white text-gray-800 hover:border-gray-400'}`;
    };

    const getNotificationConfig = (type) => {
        switch(type) {
            case 'error':
                return {
                    bgColor: 'bg-red-500',
                    borderColor: 'border-red-700',
                    icon: (
                        <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                        </svg>
                    ),
                    title: 'Error'
                };
            case 'success':
                return {
                    bgColor: 'bg-green-500',
                    borderColor: 'border-green-700',
                    icon: (
                        <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                        </svg>
                    ),
                    title: 'Success'
                };
            case 'warning':
                return {
                    bgColor: 'bg-yellow-500',
                    borderColor: 'border-yellow-700',
                    icon: (
                        <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L4.732 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
                        </svg>
                    ),
                    title: 'Warning'
                };
            default: // info
                return {
                    bgColor: 'bg-blue-500',
                    borderColor: 'border-blue-700',
                    icon: (
                        <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                        </svg>
                    ),
                    title: 'Info'
                };
        }
    };

    return (
        <>
            {/* Notification Container - Improved responsiveness */}
            <div className="fixed top-4 right-4 z-50 space-y-3 w-full max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg xl:max-w-xl px-4 sm:px-0">
                {notifications.map((notification) => {
                    const config = getNotificationConfig(notification.type);
                    return (
                        <div 
                            key={notification.id}
                            className={`animate-slide-in-right ${config.bgColor} text-white px-4 sm:px-5 md:px-6 py-3 sm:py-4 rounded-lg shadow-xl border-l-4 ${config.borderColor} transform transition-all duration-300 hover:scale-[1.02]`}
                        >
                            <div className="flex items-start justify-between">
                                <div className="flex items-start flex-1">
                                    <div className="mr-3 mt-0.5 flex-shrink-0">
                                        {config.icon}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-semibold text-sm sm:text-base md:text-lg">{config.title}</p>
                                        <p className="text-xs sm:text-sm md:text-base mt-1 text-white/90 leading-relaxed break-words">
                                            {notification.message}
                                        </p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => removeNotification(notification.id)}
                                    className="ml-3 text-white/80 hover:text-white transition-colors flex-shrink-0 mt-0.5"
                                    aria-label="Close notification"
                                >
                                    <svg className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                                    </svg>
                                </button>
                            </div>
                            {/* Progress bar */}
                            <div className="mt-3 h-1 bg-white/30 rounded-full overflow-hidden">
                                <div 
                                    className={`h-full ${config.bgColor.replace('500', '300')} animate-progress`}
                                    style={{
                                        animation: 'progress 5s linear forwards',
                                        animationDelay: '0s'
                                    }}
                                />
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Main Form Container - Improved responsiveness */}
            <div className={`rounded-xl shadow-lg p-5 sm:p-6 md:p-8 lg:p-10 xl:p-12 mb-6 sm:mb-8 md:mb-10 lg:mb-12 ${darkMode ? 'bg-gray-900' : 'bg-white'}`}>
                <h3 className={`text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold mb-4 sm:mb-6 md:mb-8 flex items-center gap-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    <svg className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 lg:w-8 lg:h-8 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                    </svg>
                    Add New Transaction
                </h3>
                
                {/* Form Grid - Improved responsiveness */}
                <div className="space-y-4 sm:space-y-5 md:space-y-6 lg:space-y-8">
                    {/* First Row: Type and Category */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5 md:gap-6 lg:gap-8">
                        {/* Type with blank option */}
                        <div>
                            <label htmlFor="type" className={`block text-xs sm:text-sm md:text-base lg:text-lg font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                Type <span className="text-red-500">*</span>
                            </label>
                            <select
                                id="type"
                                name="type"
                                value={form.type}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                className={`w-full px-3 sm:px-4 md:px-5 py-2.5 sm:py-3 rounded-lg focus:ring-2 focus:border-transparent text-sm sm:text-base md:text-lg ${getInputClasses('type')}`}>
                                <option value="" className={darkMode ? 'text-gray-400 bg-gray-900' : 'text-gray-400'}></option>
                                <option value="income" className={darkMode ? 'text-white bg-gray-900' : 'text-gray-900'}>Income</option>
                                <option value="expense" className={darkMode ? 'text-white bg-gray-900' : 'text-gray-900'}>Expense</option>
                            </select>
                            {errors.type && (
                                <p className="text-red-500 text-xs sm:text-sm md:text-base mt-1">{errors.type}</p>
                            )}
                        </div>

                        {/* Category with blank option */}
                        <div>
                            <label htmlFor="category" className={`block text-xs sm:text-sm md:text-base lg:text-lg font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                Category <span className="text-red-500">*</span>
                            </label>
                            <select
                                id="category"
                                name="category"
                                value={form.category}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                disabled={!form.type}
                                className={`w-full px-3 sm:px-4 md:px-5 py-2.5 sm:py-3 rounded-lg focus:ring-2 focus:border-transparent text-sm sm:text-base md:text-lg ${getCategoryClasses()}`}>
                                <option value="" className={darkMode ? 'text-gray-400 bg-gray-900' : 'text-gray-400'}></option>
                                {form.type && categories[form.type].map(cat => (
                                    <option key={cat} value={cat} className={darkMode ? 'text-white bg-gray-900' : 'text-gray-900'}>
                                        {cat.charAt(0).toUpperCase() + cat.slice(1)}
                                    </option>
                                ))}
                            </select>
                            {errors.category && (
                                <p className="text-red-500 text-xs sm:text-sm md:text-base mt-1">{errors.category}</p>
                            )}
                        </div>
                    </div>
                    
                    {/* Second Row: Amount and Date */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5 md:gap-6 lg:gap-8">
                        {/* Amount */}
                        <div>
                            <label htmlFor="amount" className={`block text-xs sm:text-sm md:text-base lg:text-lg font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                Amount (₱) <span className="text-red-500">*</span>
                            </label>
                            <input
                                id="amount"
                                name="amount"
                                type="number"
                                value={form.amount}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                placeholder="0"
                                className={`w-full px-3 sm:px-4 md:px-5 py-2.5 sm:py-3 rounded-lg focus:ring-2 focus:border-transparent text-sm sm:text-base md:text-lg ${getInputClasses('amount')} [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none`}/>
                            {errors.amount && (
                                <p className="text-red-500 text-xs sm:text-sm md:text-base mt-1">{errors.amount}</p>
                            )}
                        </div>
                        
                        {/* Date */}
                        <div>
                            <label htmlFor="date" className={`block text-xs sm:text-sm md:text-base lg:text-lg font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                Date <span className="text-red-500">*</span>
                            </label>
                            <input
                                id="date"
                                name="date"
                                type="date"
                                value={form.date}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                className={`w-full px-3 sm:px-4 md:px-5 py-2.5 sm:py-3 rounded-lg focus:ring-2 focus:border-transparent text-sm sm:text-base md:text-lg ${getInputClasses('date')}`}/>
                            {errors.date && (
                                <p className="text-red-500 text-xs sm:text-sm md:text-base mt-1">{errors.date}</p>
                            )}
                        </div>
                    </div>

                    {/* Description - Full width */}
                    <div>
                        <label htmlFor="description" className={`block text-xs sm:text-sm md:text-base lg:text-lg font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                            Description <span className="text-red-500">*</span>
                        </label>
                        <input
                            id="description"
                            name="description"
                            type="text"
                            value={form.description}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            placeholder="Enter description"
                            className={`w-full px-3 sm:px-4 md:px-5 py-2.5 sm:py-3 rounded-lg focus:ring-2 focus:border-transparent text-sm sm:text-base md:text-lg ${getInputClasses('description')}`}/>
                        {errors.description && (
                            <p className="text-red-500 text-xs sm:text-sm md:text-base mt-1">{errors.description}</p>
                        )}
                    </div>

                    {/* Add Transaction Button */}
                    <button
                        onClick={handleSubmit}
                        className="w-full bg-indigo-600 text-white py-2.5 sm:py-3 md:py-4 lg:py-5 rounded-lg hover:bg-indigo-700 transition-colors font-medium text-sm sm:text-base md:text-lg lg:text-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 mt-2 sm:mt-4 md:mt-6">
                        Add Transaction
                    </button>
                </div>
            </div>
        </>
    );
};

export default TransactionForm;