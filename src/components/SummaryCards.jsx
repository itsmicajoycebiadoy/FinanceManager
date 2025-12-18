import React from 'react';

const SummaryCards = ({ totals, balance, darkMode }) => {
    // Function to format numbers with commas
    const formatNumber = (number) => {
        return new Intl.NumberFormat('en-PH', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(number);
    };

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-8">
            {/* Total Income Card */}
            <div className={`rounded-xl shadow-lg p-5 sm:p-6 md:p-8 hover:transform hover:-translate-y-1 transition-transform duration-300 ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
                <div className="flex items-center justify-between">
                    <div>
                        <p className={`text-xs sm:text-sm mb-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Total Income</p>
                        <p className="text-2xl sm:text-3xl md:text-4xl font-bold text-green-500">
                            ₱ {formatNumber(totals.income)}
                        </p>
                        <p className={`text-xs mt-1 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>This period</p>
                    </div>
                    <div className={`p-3 sm:p-4 rounded-full ${darkMode ? 'bg-green-900/30' : 'bg-green-100'}`}>
                        <svg className="w-6 h-6 sm:w-8 sm:h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path>
                        </svg>
                    </div>
                </div>
            </div>

            {/* Total Expenses Card */}
            <div className={`rounded-xl shadow-lg p-5 sm:p-6 md:p-8 hover:transform hover:-translate-y-1 transition-transform duration-300 ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
                <div className="flex items-center justify-between">
                    <div>
                        <p className={`text-xs sm:text-sm mb-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Total Expenses</p>
                        <p className="text-2xl sm:text-3xl md:text-4xl font-bold text-red-500">
                            ₱ {formatNumber(totals.expense)}
                        </p>
                        <p className={`text-xs mt-1 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>This period</p>
                    </div>
                    <div className={`p-3 sm:p-4 rounded-full ${darkMode ? 'bg-red-900/30' : 'bg-red-100'}`}>
                        <svg className="w-6 h-6 sm:w-8 sm:h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6"></path>
                        </svg>
                    </div>
                </div>
            </div>

            {/* Balance Card */}
            <div className={`rounded-xl shadow-lg p-5 sm:p-6 md:p-8 sm:col-span-2 lg:col-span-1 hover:transform hover:-translate-y-1 transition-transform duration-300 ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
                <div className="flex items-center justify-between">
                    <div>
                        <p className={`text-xs sm:text-sm mb-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Current Balance</p>
                        <p className={`text-2xl sm:text-3xl md:text-4xl font-bold ${balance >= 0 ? 'text-blue-500' : 'text-red-500'}`}>
                            ₱ {formatNumber(balance)}
                        </p>
                        <p className={`text-xs mt-1 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>Available funds</p>
                    </div>
                    <div className={`p-3 sm:p-4 rounded-full ${darkMode ? 'bg-blue-900/30' : 'bg-blue-100'}`}>
                        <svg className="w-6 h-6 sm:w-8 sm:h-8 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                        </svg>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SummaryCards;