import React from 'react';
import { Download, Trash2, Moon, Sun, LogOut, LayoutDashboard, Repeat } from 'lucide-react';

const Header = ({ 
  userName, 
  mobileMenuOpen, 
  setMobileMenuOpen, 
  deletedTransactions, 
  toggleArchiveModal, 
  darkMode, 
  toggleDarkMode,
  handleLogout,
  exportToCSV 
}) => {
  return (
    <>
      <header className="bg-gradient-to-r from-black to-amber-600 shadow-xl sticky top-0 z-50">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16 sm:h-20">
            
            {/* Logo Section */}
            <div className="flex items-center gap-2 sm:gap-4 shrink-0">
              <div className="flex items-center gap-1.5 sm:gap-2">
                <svg className="w-7 h-7 sm:w-10 sm:h-10 text-amber-300 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"></path>
                </svg>
                <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-white whitespace-nowrap">
                  Finance Manager
                </h1>
              </div>
              
              <div className="hidden xl:block h-8 w-[1px] bg-white/20 mx-2"></div>
              <div className="hidden xl:flex flex-col justify-center">
                 <span className="text-[10px] text-amber-300 font-bold uppercase tracking-tighter leading-none">Welcome back</span>
                 <span className="text-white text-sm font-black truncate max-w-[120px]">HI, {userName.toUpperCase()}!</span>
              </div>
            </div>

            {/* Desktop Navigation - Organized Spacing */}
            <div className="hidden sm:flex items-center justify-end flex-1 gap-1 md:gap-3 lg:gap-6 ml-4">
              <div className="flex items-center gap-1 md:gap-4 border-r border-white/10 pr-2 md:pr-4">
                <a href="#dashboard" className="text-xs lg:text-sm text-white hover:text-amber-300 transition-colors duration-200 font-medium px-2 py-1">Dashboard</a>
                <a href="#transactions" className="text-xs lg:text-sm text-white hover:text-amber-300 transition-colors duration-200 font-medium px-2 py-1">Transactions</a>
              </div>
              
              <div className="flex items-center gap-1 md:gap-2 lg:gap-4">
                {/* Export Button */}
                <button 
                  onClick={exportToCSV}
                  className="p-2 text-white hover:text-amber-300 transition-colors duration-200 flex items-center gap-2"
                  title="Export to CSV"
                >
                  <Download size={18} />
                  <span className="hidden lg:inline text-xs lg:text-sm font-medium">Export</span>
                </button>

                {/* Dark Mode Toggle */}
                <button 
                  onClick={toggleDarkMode}
                  className="p-2 text-white hover:text-amber-300 transition-colors duration-200"
                  aria-label="Toggle Theme"
                >
                  {darkMode ? <Sun size={18} /> : <Moon size={18} />}
                </button>
                
                {/* Archive Button */}
                <button 
                  onClick={toggleArchiveModal}
                  className="relative p-2 text-white hover:text-amber-300 transition-colors duration-200 flex items-center gap-2"
                  title="Archive"
                >
                  <Trash2 size={18} />
                  <span className="hidden lg:inline text-xs lg:text-sm font-medium">Archive</span>
                  {deletedTransactions.length > 0 && (
                    <span className="absolute top-1 right-1 lg:right-[-4px] w-4 h-4 bg-red-500 rounded-full flex items-center justify-center animate-pulse">
                      <span className="text-[10px] text-white font-bold">{deletedTransactions.length}</span>
                    </span>
                  )}
                </button>

                {/* Logout */}
                <button 
                  onClick={handleLogout}
                  className="ml-2 px-3 py-1.5 bg-white/10 hover:bg-red-500/40 text-white border border-white/20 rounded-lg text-[10px] lg:text-xs font-bold transition-all duration-200 flex items-center gap-2"
                >
                  <LogOut size={14} />
                  <span className="hidden md:inline">Logout</span>
                </button>
              </div>
            </div>

            {/* Mobile Actions Toolbar */}
            <div className="flex items-center gap-1 sm:hidden">
              <button onClick={toggleDarkMode} className="p-2 text-white"><Moon size={20} /></button>
              <button onClick={toggleArchiveModal} className="relative p-2 text-white">
                <Trash2 size={20} />
                {deletedTransactions.length > 0 && (
                  <span className="absolute top-1 right-1 w-3.5 h-3.5 bg-red-500 rounded-full flex items-center justify-center border border-black animate-pulse text-[8px] font-bold">
                    {deletedTransactions.length}
                  </span>
                )}
              </button>
              <button 
                className="ml-1 p-2 bg-white/10 rounded-lg text-white" 
                onClick={() => setMobileMenuOpen(true)} 
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path>
                </svg>
              </button>
            </div>
          </div>
        </nav>
      </header>

      {/* Mobile Sidebar */}
      <div className={`fixed inset-0 z-[60] transform ${mobileMenuOpen ? 'translate-x-0' : 'translate-x-full'} transition-transform duration-300 ease-in-out`}>
        <div 
          className={`absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300 ${mobileMenuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
          onClick={() => setMobileMenuOpen(false)}
        />
        
        <div className="absolute right-0 top-0 h-full w-72 bg-gradient-to-b from-black to-amber-950 shadow-2xl flex flex-col">
          <div className="flex justify-end p-5">
            <button className="p-2 text-white hover:rotate-90 transition-transform duration-200" onClick={() => setMobileMenuOpen(false)}>
              <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>
          
          <div className="flex flex-col items-center px-6 pb-8 border-b border-white/10">
            <div className="p-3 bg-amber-500/20 rounded-2xl mb-3">
              <svg className="w-10 h-10 text-amber-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"></path>
              </svg>
            </div>
            <h2 className="text-xl font-bold text-white">Finance Manager</h2>
            <div className="mt-2 px-3 py-1 bg-amber-400/10 rounded-full">
              <p className="text-amber-400 font-bold text-xs">HI, {userName.toUpperCase()}!</p>
            </div>
          </div>
          
          <nav className="flex flex-col py-4 flex-grow overflow-y-auto">
            <a href="#dashboard" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-4 text-white hover:bg-white/5 py-4 px-8 transition-all">
              <LayoutDashboard size={20} className="text-amber-400" />
              <span className="font-medium">Dashboard</span>
            </a>
            
            <a href="#transactions" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-4 text-white hover:bg-white/5 py-4 px-8 transition-all">
              <Repeat size={20} className="text-amber-400" />
              <span className="font-medium">Transactions</span>
            </a>

            <button onClick={() => { exportToCSV(); setMobileMenuOpen(false); }} className="flex items-center gap-4 text-white hover:bg-white/5 py-4 px-8 transition-all w-full text-left">
              <Download size={20} className="text-amber-400" />
              <span className="font-medium">Export Records</span>
            </button>
            
            <button onClick={() => { toggleDarkMode(); setMobileMenuOpen(false); }} className="flex items-center gap-4 text-white hover:bg-white/5 py-4 px-8 transition-all w-full text-left">
              {darkMode ? <Sun size={20} className="text-amber-400" /> : <Moon size={20} className="text-amber-400" />}
              <span className="font-medium">{darkMode ? 'Switch to Light' : 'Switch to Dark'}</span>
            </button>
            
            <button onClick={() => { toggleArchiveModal(); setMobileMenuOpen(false); }} className="flex items-center justify-between text-white hover:bg-white/5 py-4 px-8 transition-all w-full text-left">
              <div className="flex items-center gap-4">
                <Trash2 size={20} className="text-amber-400" />
                <span className="font-medium">Archive</span>
              </div>
              {deletedTransactions.length > 0 && (
                <span className="bg-red-500 text-[10px] font-bold px-2 py-0.5 rounded-full animate-bounce">
                  {deletedTransactions.length}
                </span>
              )}
            </button>

            <button onClick={handleLogout} className="flex items-center gap-4 text-red-400 hover:bg-red-500/10 py-4 px-8 mt-auto mb-4 transition-all w-full text-left font-bold border-t border-white/5 pt-6">
              <LogOut size={20} />
              <span>Logout Session</span>
            </button>
          </nav>
          
          <div className="p-6 bg-black/40 text-center">
            <p className="text-[10px] text-gray-400 uppercase tracking-widest">© 2025 Finance Manager</p>
            <p className="text-[10px] text-amber-500/60 mt-1">Created by: Mica Joyce Biadoy</p>
          </div>
        </div>
      </div>
    </>
  );
}

export default Header;