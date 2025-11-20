import React from 'react';
import { AppView } from '../types';

interface SidebarProps {
  currentView: AppView;
  onChangeView: (view: AppView) => void;
  isAnalyzing: boolean;
  hasResults: boolean;
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentView, onChangeView, isAnalyzing, hasResults, isOpen, onClose }) => {
  const navItemClass = (isActive: boolean, disabled: boolean = false) => `
    w-full flex items-center gap-3 px-4 py-3 text-sm font-medium transition-all rounded-md mb-1
    ${isActive ? 'bg-slate-800 text-white shadow-md' : 'text-slate-400 hover:text-white hover:bg-slate-800'}
    ${disabled ? 'opacity-40 cursor-not-allowed pointer-events-none' : 'cursor-pointer'}
  `;

  return (
    <aside 
      className={`
        fixed md:relative inset-y-0 left-0 z-40
        w-64 bg-slate-900 h-full flex flex-col shrink-0 text-white py-6 px-3 shadow-xl
        transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}
    >
      <div className="mb-8 px-4 flex justify-between items-center">
        <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Menu</p>
        <button onClick={onClose} className="md:hidden text-slate-400 hover:text-white">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
        </button>
      </div>
      
      <nav className="flex-1">
        <button 
          onClick={() => onChangeView(AppView.EDITOR)}
          className={navItemClass(currentView === AppView.EDITOR)}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
          Protocol File
        </button>
        
        <button 
          onClick={() => onChangeView(AppView.ANALYSIS)}
          className={navItemClass(currentView === AppView.ANALYSIS, !hasResults && !isAnalyzing)}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"></line><line x1="12" y1="20" x2="12" y2="4"></line><line x1="6" y1="20" x2="6" y2="14"></line></svg>
          Analysis Results
          {isAnalyzing && <span className="ml-auto w-2 h-2 bg-blue-400 rounded-full animate-ping"></span>}
        </button>
      </nav>

      <div className="px-4 text-xs text-slate-600">
        Opentrons Protocol Metrics<br/>
        v1.1.3
      </div>
    </aside>
  );
};