import React from 'react';

const ExpenseBreakdown = ({ categoryTotals, totalExpense, totalIncome, darkMode }) => {
    const formatNumber = (number) => {
        return new Intl.NumberFormat('en-PH', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(number);
    };

    const getPercentage = (amount, total) => {
        if (total === 0) return 0;
        return (amount / total) * 100;
    };

    const expenseVsIncomeRatio = totalIncome > 0 ? (totalExpense / totalIncome) * 100 : 0;
    const isOverspending = expenseVsIncomeRatio > 80;

    const sortedCategories = Object.entries(categoryTotals)
        .sort(([, amountA], [, amountB]) => amountB - amountA);

    return (
        <div className={`rounded-2xl shadow-xl p-5 sm:p-6 transition-all duration-300 h-full flex flex-col min-h-[450px] ${darkMode ? 'bg-[#1a2233] text-white' : 'bg-white text-gray-800'}`}>
            
            {isOverspending && (
                <div className={`mb-6 flex items-center gap-3 p-3 rounded-xl border shrink-0 ${darkMode ? 'bg-red-900/20 border-red-800 text-red-400' : 'bg-red-50 border-red-100 text-red-600'}`}>
                    <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    <p className="text-[11px] font-bold uppercase tracking-tight">Alert: {expenseVsIncomeRatio.toFixed(1)}% of income used.</p>
                </div>
            )}

            {/* HEADER SECTION */}
            <div className="mb-6 shrink-0">
                <div className="flex items-center gap-2 mb-4">
                    <div className="text-indigo-500">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
                        </svg>
                    </div>
                    <h3 className="text-xl sm:text-2xl font-bold tracking-tight">Expense Breakdown</h3>
                </div>

                <div className={`flex items-center justify-between w-full px-5 py-4 rounded-2xl ${darkMode ? 'bg-gray-800/60 border border-gray-700/50' : 'bg-gray-100'}`}>
                    <span className="text-[10px] uppercase font-black tracking-[0.2em] opacity-50">Total Expense</span>
                    <span className="text-lg font-black">₱ {formatNumber(totalExpense)}</span>
                </div>
            </div>

            {/* Categories List */}
            <div className="space-y-6 flex-grow overflow-y-auto pr-1 custom-scrollbar">
                {sortedCategories.length === 0 ? (
                    <div className="text-center py-20 opacity-30 text-sm italic tracking-wide">No transactions yet</div>
                ) : (
                    sortedCategories.map(([category, amount]) => {
                        const percentage = getPercentage(amount, totalExpense);
                        
                        const isHigh = totalIncome > 0 && amount > totalIncome;

                        return (
                            <div key={category} className="group animate-fade-in">
                                <div className="flex items-center justify-between mb-2.5">
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm font-bold capitalize tracking-tight">{category}</span>
                                        {isHigh && (
                                            <span className="text-[8px] bg-red-500 text-white px-2 py-0.5 rounded-md font-black animate-pulse">CRITICAL</span>
                                        )}
                                    </div>
                                    <span className="text-sm font-black tabular-nums">₱{formatNumber(amount)}</span>
                                </div>

                                <div className={`relative w-full h-2.5 rounded-full overflow-hidden ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                                    <div 
                                        className={`h-full rounded-full transition-all duration-1000 ease-out ${isHigh ? 'bg-red-600' : 'bg-indigo-500'}`}
                                        style={{ width: `${Math.min(percentage, 100)}%` }}
                                    />
                                </div>

                                <div className="flex justify-between items-center mt-2 px-0.5">
                                    <p className="text-[9px] font-bold uppercase tracking-wider opacity-40">{percentage.toFixed(1)}% of spending</p>
                                    <p className={`text-[10px] font-black ${isHigh ? 'text-red-500' : 'text-indigo-500'}`}>{percentage.toFixed(1)}%</p>
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