import React from 'react';

const Header = ({ mobileMenuOpen, setMobileMenuOpen, deletedTransactions, toggleArchiveModal, darkMode, toggleDarkMode }) => {
  return (
    <>
      {/* Header */}
      <header className="bg-gradient-to-r from-black to-amber-600 shadow-xl sticky top-0 z-50">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16 sm:h-20">
            <div className="flex items-center gap-2 sm:gap-3">
              <svg className="w-8 h-8 sm:w-10 sm:h-10 text-amber-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"></path>
              </svg>
              <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-white">Finance Manager</h1>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden sm:flex items-center gap-4 md:gap-6">
              <a href="#dashboard" className="text-sm md:text-base text-white hover:text-amber-300 transition-colors duration-200 font-medium">Dashboard</a>
              <a href="#transactions" className="text-sm md:text-base text-white hover:text-amber-300 transition-colors duration-200 font-medium">Transactions</a>
              
              {/* Dark/Light Mode Toggle Button */}
              <button 
                onClick={toggleDarkMode}
                className="p-2 text-white hover:text-amber-300 transition-colors duration-200"
                aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
              >
                {/* Show moon icon for dark mode (click to switch to light mode) */}
                {darkMode ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"></path>
                  </svg>
                ) : (
                  /* Show sun icon for light mode (click to switch to dark mode) */
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"></path>
                  </svg>
                )}
              </button>
              
              <button 
                onClick={toggleArchiveModal}
                className="relative text-sm md:text-base text-white hover:text-amber-300 transition-colors duration-200 font-medium flex items-center gap-2"
                aria-label="View deleted transactions"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                </svg>
                <span>Archive</span>
                
                {deletedTransactions.length > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center animate-pulse">
                    <span className="text-xs text-white font-bold">
                      {deletedTransactions.length}
                    </span>
                  </span>
                )}
              </button>
            </div>

            {/* Mobile Controls */}
            <div className="flex items-center gap-4 sm:hidden">
              {/* Dark/Light Mode Toggle Button */}
              <button 
                onClick={toggleDarkMode}
                className="p-2 text-white hover:text-amber-300 transition-colors duration-200"
                aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
              >
                {/* Show moon icon for dark mode (click to switch to light mode) */}
                {darkMode ? (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"></path>
                  </svg>
                ) : (
                  /* Show sun icon for light mode (click to switch to dark mode) */
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"></path>
                  </svg>
                )}
              </button>
              
              <button 
                onClick={toggleArchiveModal}
                className="relative p-2 text-white hover:text-amber-300 transition-colors duration-200"
                aria-label="View deleted transactions"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                </svg>
                
                {deletedTransactions.length > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center border-2 border-amber-600 animate-pulse">
                    <span className="text-xs text-white font-bold">
                      {deletedTransactions.length}
                    </span>
                  </span>
                )}
              </button>

              {/* Hamburger Menu Button */}
              <button 
                className="p-2 text-white hover:text-amber-300 transition-colors duration-200" 
                onClick={() => setMobileMenuOpen(true)} 
                aria-label="Open navigation menu"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path>
                </svg>
              </button>
            </div>
          </div>
        </nav>
      </header>

      {/* Mobile Sidebar Menu - Slides in from left */}
      <div className={`fixed inset-0 z-50 transform ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-300 ease-in-out`}>
        {/* Backdrop Overlay */}
        <div 
          className={`absolute inset-0 bg-black transition-opacity duration-300 ${mobileMenuOpen ? 'opacity-50' : 'opacity-0 pointer-events-none'}`}
          onClick={() => setMobileMenuOpen(false)}
        />
        
        {/* Sidebar Menu */}
        <div className="absolute left-0 top-0 h-full w-64 bg-gradient-to-b from-black to-amber-900 shadow-2xl">
          {/* Close Button */}
          <div className="flex justify-end p-4">
            <button 
              className="p-2 text-white hover:text-amber-300 transition-colors duration-200" 
              onClick={() => setMobileMenuOpen(false)} 
              aria-label="Close navigation menu"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>
          
          {/* Logo in Sidebar */}
          <div className="flex items-center gap-3 px-6 pb-6 border-b border-amber-700">
            <svg className="w-8 h-8 text-amber-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"></path>
            </svg>
            <h2 className="text-xl font-bold text-white">Finance Manager</h2>
          </div>
          
          {/* Menu Items */}
          <nav className="flex flex-col py-6">
            <a 
              href="#dashboard" 
              className="flex items-center gap-3 text-white hover:text-amber-300 hover:bg-black/30 py-4 px-6 transition-all duration-200"
              onClick={() => setMobileMenuOpen(false)}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
              </svg>
              <span className="font-medium">Dashboard</span>
            </a>
            
            <a 
              href="#transactions" 
              className="flex items-center gap-3 text-white hover:text-amber-300 hover:bg-black/30 py-4 px-6 transition-all duration-200"
              onClick={() => setMobileMenuOpen(false)}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"></path>
              </svg>
              <span className="font-medium">Transactions</span>
            </a>
            
            {/* Dark Mode Toggle in Mobile Menu */}
            <button 
              onClick={() => {
                toggleDarkMode();
                setMobileMenuOpen(false);
              }}
              className="flex items-center gap-3 text-white hover:text-amber-300 hover:bg-black/30 py-4 px-6 transition-all duration-200 text-left"
            >
              {/* Show moon icon and "Switch to Light" text for dark mode */}
              {darkMode ? (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"></path>
                  </svg>
                  <span className="font-medium">Switch to Light</span>
                </>
              ) : (
                /* Show sun icon and "Switch to Dark" text for light mode */
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"></path>
                  </svg>
                  <span className="font-medium">Switch to Dark</span>
                </>
              )}
            </button>
            
            <button 
              onClick={() => {
                toggleArchiveModal();
                setMobileMenuOpen(false);
              }}
              className="flex items-center justify-between text-white hover:text-amber-300 hover:bg-black/30 py-4 px-6 transition-all duration-200 text-left"
            >
              <div className="flex items-center gap-3">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                </svg>
                <span className="font-medium">Archive</span>
              </div>
              
              {deletedTransactions.length > 0 && (
                <span className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center animate-pulse">
                  <span className="text-xs text-white font-bold">
                    {deletedTransactions.length}
                  </span>
                </span>
              )}
            </button>
          </nav>
          
          {/* Footer in Sidebar */}
          <div className="absolute bottom-0 left-0 right-0 p-6 border-t border-amber-700 bg-black/30">
            <p className="text-xs text-gray-300">
              © 2025 Finance Manager
            </p>
            <p className="text-xs text-gray-400 mt-1">
              Created by: Mica Joyce Bialoy
            </p>
          </div>
        </div>
      </div>
    </>
  );
}

export default Header;