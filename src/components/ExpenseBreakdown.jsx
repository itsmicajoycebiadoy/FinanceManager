import React from 'react';

const ExpenseBreakdown = ({ categoryTotals, totalExpense, darkMode }) => {
    // Function to format numbers with commas
    const formatNumber = (number) => {
        return new Intl.NumberFormat('en-PH', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(number);
    };

    // Function to get percentage
    const getPercentage = (amount, total) => {
        if (total === 0) return 0;
        return (amount / total) * 100;
    };

    // Sort categories by amount in descending order
    const sortedCategories = Object.entries(categoryTotals)
        .sort(([, amountA], [, amountB]) => amountB - amountA);

    return (
        <div className={`rounded-xl shadow-lg p-5 sm:p-6 md:p-8 ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
            <h3 className={`text-xl sm:text-2xl font-bold mb-4 sm:mb-6 flex items-center gap-2 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                <svg className="w-5 h-5 sm:w-6 sm:h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z"></path>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z"></path>
                </svg>
                Expense Breakdown
            </h3>

            <div className="space-y-4 sm:space-y-5">
                {sortedCategories.length === 0 ? (
                    <div className={`text-center py-6 sm:py-8 rounded-lg ${darkMode ? 'bg-gray-900/50' : 'bg-gray-50'}`}>
                        <svg className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-3 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                        </svg>
                        <p className={`text-sm sm:text-base ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>No expenses yet</p>
                    </div>
                ) : (
                    sortedCategories.map(([category, amount]) => {
                        const percentage = getPercentage(amount, totalExpense);
                        return (
                            <div key={category} className="group hover:scale-[1.02] transition-transform duration-200">
                                <div className="flex justify-between text-xs sm:text-sm mb-1">
                                    <span className={`font-medium capitalize ${darkMode ? 'text-gray-300 group-hover:text-white' : 'text-gray-800 group-hover:text-gray-900'}`}>
                                        {category}
                                    </span>
                                    <span className={`font-semibold ${darkMode ? 'text-gray-400 group-hover:text-white' : 'text-gray-600 group-hover:text-gray-900'}`}>
                                        ₱{formatNumber(amount)}
                                    </span>
                                </div>
                                <div className={`w-full h-2 rounded-full ${darkMode ? 'bg-gray-700 group-hover:bg-gray-600' : 'bg-gray-200 group-hover:bg-gray-300'}`}>
                                    <div 
                                        className="bg-gradient-to-r from-indigo-500 to-purple-500 h-2 rounded-full transition-all duration-300 group-hover:shadow-lg"
                                        style={{ width: `${percentage}%` }}
                                    />
                                </div>
                                <div className="flex justify-between items-center mt-1">
                                    <p className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                                        {percentage.toFixed(1)}% of expenses
                                    </p>
                                    {totalExpense > 0 && (
                                        <p className={`text-xs font-medium ${darkMode ? 'text-indigo-400' : 'text-indigo-600'}`}>
                                            {(amount / totalExpense).toLocaleString('en-PH', { style: 'percent', minimumFractionDigits: 1 })}
                                        </p>
                                    )}
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
};

export default ExpenseBreakdown;