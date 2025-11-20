
import React from 'react';

interface StatCardProps {
  title: string;
  value: string | number;
  subValue?: string | number;
  unit?: string;
  icon?: React.ReactNode;
  description: string;
  isEstimate?: boolean;
}

export const StatCard: React.FC<StatCardProps> = ({ title, value, subValue, unit, icon, description, isEstimate }) => {
  return (
    <div className="group relative bg-white p-6 rounded-lg shadow-sm border border-gray-200 flex flex-col justify-between hover:border-blue-300 transition-colors z-0">
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center">
            {title}
            {isEstimate && (
              <span 
                className="text-orange-500 ml-1 cursor-help font-bold text-sm" 
                title="This value is an estimation"
              >
                *
              </span>
            )}
          </h3>
          {/* Tooltip Icon */}
          <div className="cursor-help text-gray-300 hover:text-blue-500 transition-colors relative z-10" tabIndex={0} aria-label="More info">
             <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
          </div>
        </div>
        {icon && <div className="text-blue-100 group-hover:text-blue-500 transition-colors">{icon}</div>}
      </div>
      
      <div className="flex flex-col">
        <div className="flex items-baseline">
          <span className="text-2xl font-bold text-slate-800">{value}</span>
          {unit && <span className="ml-1 text-sm text-gray-500 font-medium">{unit}</span>}
        </div>
        {subValue && (
          <div className="text-xs text-gray-400 mt-1 font-medium">
            {subValue}
          </div>
        )}
      </div>

      {/* Tooltip Popover */}
      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-3 px-4 py-3 bg-slate-800 text-white text-xs rounded-md shadow-xl opacity-0 group-hover:opacity-100 pointer-events-none transition-all w-56 text-center z-50 border border-slate-700">
        {isEstimate && <span className="block text-orange-300 mb-1.5 font-bold uppercase text-[10px] tracking-wide border-b border-slate-600 pb-1">⚠️ Estimation Only</span>}
        <span className="leading-relaxed">{description}</span>
        <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1 border-4 border-transparent border-t-slate-800"></div>
      </div>
    </div>
  );
};
