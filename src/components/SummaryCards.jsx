import React from 'react';

const SummaryCards = ({ totals, balance, darkMode }) => {
    const formatNumber = (number) => {
        return new Intl.NumberFormat('en-PH', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(Math.abs(number));
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 mb-8">
            {/* Total Income Card */}
            <div className={`rounded-xl shadow-lg p-5 sm:p-6 transition-all duration-300 hover:scale-[1.02] ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
                {/* Dinagdagan ng gap-4 para may space sa pagitan ng text at icon */}
                <div className="flex items-center justify-between gap-4">
                    <div className="flex-1 min-w-0">
                        <p className={`text-xs sm:text-sm font-medium mb-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Total Income</p>
                        <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-green-500 truncate">
                            ₱{formatNumber(totals.income)}
                        </p>
                        <p className={`text-[10px] sm:text-xs mt-1 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>This period</p>
                    </div>
                    <div className={`flex-shrink-0 p-3 sm:p-4 rounded-full ${darkMode ? 'bg-green-900/30' : 'bg-green-100'}`}>
                        <svg className="w-5 h-5 sm:w-6 sm:h-6 lg:w-8 lg:h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path>
                        </svg>
                    </div>
                </div>
            </div>

            {/* Total Expenses Card */}
            <div className={`rounded-xl shadow-lg p-5 sm:p-6 transition-all duration-300 hover:scale-[1.02] ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
                <div className="flex items-center justify-between gap-4">
                    <div className="flex-1 min-w-0">
                        <p className={`text-xs sm:text-sm font-medium mb-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Total Expenses</p>
                        <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-red-500 truncate">
                            ₱{formatNumber(totals.expense)}
                        </p>
                        <p className={`text-[10px] sm:text-xs mt-1 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>This period</p>
                    </div>
                    <div className={`flex-shrink-0 p-3 sm:p-4 rounded-full ${darkMode ? 'bg-red-900/30' : 'bg-red-100'}`}>
                        <svg className="w-5 h-5 sm:w-6 sm:h-6 lg:w-8 lg:h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6"></path>
                        </svg>
                    </div>
                </div>
            </div>

            {/* Balance Card */}
            <div className={`rounded-xl shadow-lg p-5 sm:p-6 transition-all duration-300 hover:scale-[1.02] ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
                <div className="flex items-center justify-between gap-4">
                    <div className="flex-1 min-w-0">
                        <p className={`text-xs sm:text-sm font-medium mb-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Current Balance</p>
                        <p className={`text-xl sm:text-2xl lg:text-3xl font-bold truncate ${balance >= 0 ? 'text-blue-500' : 'text-red-500'}`}>
                            {balance < 0 ? '-' : ''}₱{formatNumber(balance)}
                        </p>
                        <p className={`text-[10px] sm:text-xs mt-1 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>Available funds</p>
                    </div>
                    <div className={`flex-shrink-0 p-3 sm:p-4 rounded-full ${darkMode ? 'bg-blue-900/30' : 'bg-blue-100'}`}>
                        <svg className="w-5 h-5 sm:w-6 sm:h-6 lg:w-8 lg:h-8 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 19V5h4.5a3.5 3.5 0 110 7H9m-2-3h8M7 12h8" />
                        </svg>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SummaryCards;