import React from 'react';

interface HeaderProps {
  onMenuClick: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onMenuClick }) => {
  return (
    <header className="bg-slate-900 h-16 border-b border-slate-800 flex items-center px-4 md:px-6 justify-between shrink-0 z-30 relative shadow-md">
      <div className="flex items-center gap-4">
        {/* Mobile Menu Button */}
        <button 
          onClick={onMenuClick}
          className="md:hidden text-slate-400 hover:text-white transition-colors p-1"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
        </button>

        {/* Logo and Title */}
        <div className="flex items-center gap-3">
          <div className="h-8 flex items-center">
             <img 
               src="https://opentrons.com/wp-content/uploads/2024/06/LOGO2024.svg" 
               alt="Opentrons Logo"
               className="h-full w-auto object-contain"
             />
          </div>
          <h1 className="text-lg font-bold text-white tracking-tight hidden sm:block">Protocol Metrics</h1>
          <h1 className="text-lg font-bold text-white tracking-tight sm:hidden">Metrics</h1>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 px-3 py-1 bg-slate-800 text-slate-300 rounded-full text-xs font-bold border border-slate-700 shadow-sm">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          SYSTEM READY
        </div>
      </div>
    </header>
  );
};