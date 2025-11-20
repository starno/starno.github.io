
import React, { useState } from 'react';
import { ProtocolAnalysis, CustomAction } from '../types';
import { StatCard } from './StatCard';

interface DashboardProps {
  data: ProtocolAnalysis;
}

const TableHeader: React.FC<{ label: string; tooltip: string; align?: 'left' | 'right' | 'center' }> = ({ label, tooltip, align = 'left' }) => {
  const alignClass = align === 'right' ? 'text-right' : align === 'center' ? 'text-center' : 'text-left';
  return (
    <th 
      className={`px-6 py-3 font-medium group relative cursor-help ${alignClass}`}
      tabIndex={0}
    >
      <span className="border-b border-dotted border-gray-400 inline-block leading-tight">{label}</span>
      <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 w-48 bg-slate-800 text-white text-xs p-3 rounded shadow-xl opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity font-normal z-50 normal-case whitespace-normal leading-relaxed">
        {tooltip}
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 border-4 border-transparent border-b-slate-800"></div>
      </div>
    </th>
  );
};

// Helper for Expandable Rows
const ExpandableRow: React.FC<{
  children: React.ReactNode; // The summary row content (tr)
  expandedContent: React.ReactNode; // The detailed content
  colSpan: number;
  isExpanded: boolean;
  onToggle: () => void;
}> = ({ children, expandedContent, colSpan, isExpanded, onToggle }) => {
  return (
    <>
      <tr 
        onClick={onToggle} 
        className={`group cursor-pointer transition-all border-b border-gray-50 ${isExpanded ? 'bg-blue-50/50' : 'hover:bg-blue-50 hover:border-blue-200'}`}
      >
        {children}
      </tr>
      {isExpanded && (
        <tr>
          <td colSpan={colSpan} className="p-0 border-b border-gray-100">
             <div className="bg-slate-50 inner-shadow p-4 text-sm animate-in slide-in-from-top-1">
                {expandedContent}
             </div>
          </td>
        </tr>
      )}
    </>
  );
};

export const Dashboard: React.FC<DashboardProps> = ({ data }) => {
  const [isStepsExpanded, setIsStepsExpanded] = useState(false);
  
  // State for tracking expanded rows by index/id
  const [expandedPipettes, setExpandedPipettes] = useState<Set<number>>(new Set());
  const [expandedAux, setExpandedAux] = useState<Set<number>>(new Set());
  const [expandedTips, setExpandedTips] = useState<Set<number>>(new Set());
  const [expandedAxes, setExpandedAxes] = useState<Set<number>>(new Set());
  const [expandedModules, setExpandedModules] = useState<Set<number>>(new Set());

  const toggleSet = (set: Set<number>, id: number, update: (s: Set<number>) => void) => {
    const newSet = new Set(set);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    update(newSet);
  };

  const sortedCommands = [...data.api_commands].sort((a, b) => b.count - a.count);

  // Deduplicate custom actions
  const uniqueCustomActions = data.custom_actions.reduce((acc: CustomAction[], current) => {
    const x = acc.find(item => item.description === current.description && item.line_number === current.line_number);
    if (!x) {
      return acc.concat([current]);
    } else {
      return acc;
    }
  }, []);

  return (
    <div className="h-full overflow-y-auto custom-scrollbar p-4 md:p-8 bg-gray-100">
      <div className="max-w-6xl mx-auto space-y-8 pb-12">
        
        {/* 1. Protocol Procedure (Step-by-Step) */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden w-full">
           <div 
             className="px-6 py-4 border-b border-gray-200 bg-blue-50 flex justify-between items-center cursor-pointer hover:bg-blue-100 transition-colors"
             onClick={() => setIsStepsExpanded(!isStepsExpanded)}
           >
              <div className="flex items-center gap-3">
                <div className="bg-blue-200 p-1.5 rounded text-blue-700">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
                </div>
                <div>
                  <h2 className="text-base font-bold text-blue-900">Protocol Procedure (Step-by-Step)</h2>
                  <p className="text-xs text-blue-600 font-medium">Click to {isStepsExpanded ? 'collapse' : 'expand'} details</p>
                </div>
              </div>
              <div className={`transform transition-transform duration-200 text-blue-400 ${isStepsExpanded ? 'rotate-180' : ''}`}>
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
              </div>
           </div>
           
           {isStepsExpanded && (
             <div className="p-6 bg-slate-50 border-b border-gray-200 animate-in slide-in-from-top-2">
               <ul className="space-y-3">
                 {data.procedure_steps && data.procedure_steps.length > 0 ? (
                   data.procedure_steps.map((step, idx) => (
                     <li key={idx} className="flex gap-3 text-sm text-slate-700 leading-relaxed">
                       <span className="font-mono text-slate-400 select-none shrink-0 w-6 text-right">{(idx + 1).toString().padStart(2, '0')}.</span>
                       <span>{step}</span>
                     </li>
                   ))
                 ) : (
                   <li className="text-slate-500 italic">No step-by-step summary available.</li>
                 )}
               </ul>
             </div>
           )}
           {!isStepsExpanded && (
              <div className="px-6 py-3 text-sm text-slate-600 bg-white">
                {data.summary}
              </div>
           )}
        </div>

        {/* 2. Custom Actions (Overrides) */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden flex flex-col border-l-4 border-l-orange-400 w-full">
          <div className="px-6 py-4 border-b border-gray-200 bg-orange-50/30 flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-orange-500"><polygon points="7.86 2 16.14 2 22 7.86 22 16.14 16.14 22 7.86 22 2 16.14 2 7.86 7.86 2"></polygon><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
              Custom Actions & Overrides
            </h3>
          </div>
          <div className="p-4">
            {uniqueCustomActions.length > 0 ? (
              <ul className="space-y-2">
                {uniqueCustomActions.map((action, i) => (
                  <li key={i} className="flex flex-col md:flex-row md:items-center gap-2 text-sm text-slate-700 bg-orange-50 p-3 rounded border border-orange-100 hover:bg-orange-100 transition-colors">
                     <span className="text-orange-600 font-bold whitespace-nowrap border-r border-orange-200 pr-3 mr-1">
                       {action.line_number ? `Line ${action.line_number}` : 'Unknown Line'}
                     </span>
                     <span className="font-medium">{action.description}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="text-center text-gray-400 py-4 italic text-sm flex items-center justify-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                No custom overrides detected. Protocol uses standard default parameters.
              </div>
            )}
          </div>
        </div>

        {/* 3. Pipette & Liquid (Expandable) */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden w-full">
           <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
            <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wider">Pipette & Liquid Transfer Breakdown</h3>
          </div>
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-sm text-left min-w-[1000px]">
              <thead className="text-xs text-gray-500 uppercase bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="w-8"></th>
                  <TableHeader label="Pipette" tooltip="Instrument loaded name" />
                  <TableHeader label="Channels" tooltip="Number of channels (Multiplies Volume)" align="center" />
                  <TableHeader label="Mount" tooltip="Physical mount location" />
                  <TableHeader label="Tip Type" tooltip="Size of tip used for these actions" />
                  <TableHeader label="Total Asp (µL)" tooltip="Total volume drawn (Vol x Channels)" align="right" />
                  <TableHeader label="Total Disp (µL)" tooltip="Total volume ejected (Vol x Channels)" align="right" />
                  <TableHeader label="Asp Count" tooltip="# of aspirate calls" align="right" />
                  <TableHeader label="Disp Count" tooltip="# of dispense calls" align="right" />
                  <TableHeader label="Mix Count" tooltip="# of mix calls" align="right" />
                  <TableHeader label="Blowout Count" tooltip="# of blow_out calls" align="right" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {data.pipette_stats.map((stat, idx) => (
                  <ExpandableRow
                    key={idx}
                    colSpan={11}
                    isExpanded={expandedPipettes.has(idx)}
                    onToggle={() => toggleSet(expandedPipettes, idx, setExpandedPipettes)}
                    expandedContent={
                      <div className="space-y-2">
                        <h4 className="text-xs font-bold text-slate-500 uppercase mb-2">Action Sequence for {stat.pipette_name}</h4>
                        {stat.logs && stat.logs.length > 0 ? (
                          <div className="max-h-60 overflow-y-auto custom-scrollbar border border-gray-200 rounded bg-white">
                            <table className="w-full text-xs">
                              <thead className="bg-gray-50 text-gray-500 sticky top-0">
                                <tr>
                                  <th className="px-4 py-2 text-left">#</th>
                                  <th className="px-4 py-2 text-left">Action</th>
                                  <th className="px-4 py-2 text-right">Vol (Per Tip)</th>
                                  <th className="px-4 py-2 text-right">Total Vol ({stat.channels}ch)</th>
                                  <th className="px-4 py-2 text-right">Location</th>
                                </tr>
                              </thead>
                              <tbody>
                                {stat.logs.map((log, logIdx) => (
                                  <tr key={logIdx} className="border-b border-gray-100 hover:bg-blue-50/30">
                                    <td className="px-4 py-2 font-mono text-gray-400 w-10">{logIdx + 1}</td>
                                    <td className="px-4 py-2 font-medium text-slate-700">{log.description}</td>
                                    <td className="px-4 py-2 text-right font-mono">{log.volume_ul ? `${log.volume_ul} µL` : '-'}</td>
                                    <td className="px-4 py-2 text-right font-mono font-bold text-blue-600">
                                      {log.volume_ul ? `${(log.volume_ul * (stat.channels || 1)).toLocaleString()} µL` : '-'}
                                    </td>
                                    <td className="px-4 py-2 text-right font-mono text-slate-600">{log.location || '-'}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        ) : (
                          <p className="text-slate-400 italic">No detailed logs available for this pipette.</p>
                        )}
                      </div>
                    }
                  >
                    <td className="px-6 py-4 text-gray-400 group-hover:text-blue-600 transition-colors">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`transform transition-transform ${expandedPipettes.has(idx) ? 'rotate-90' : ''}`}><polyline points="9 18 15 12 9 6"></polyline></svg>
                    </td>
                    <td className="px-6 py-4 font-medium text-slate-800">{stat.pipette_name}</td>
                    <td className="px-6 py-4 text-center">
                       <span className="inline-flex items-center justify-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                         {stat.channels || 1}
                       </span>
                    </td>
                    <td className="px-6 py-4 text-slate-600 uppercase text-xs font-bold">{stat.mount}</td>
                    <td className="px-6 py-4 text-slate-600 font-mono text-xs">{stat.tip_type}</td>
                    <td className="px-6 py-4 text-right font-mono text-blue-600 font-bold">{stat.aspirated_volume_ul.toLocaleString()}</td>
                    <td className="px-6 py-4 text-right font-mono text-green-600 font-bold">{stat.dispensed_volume_ul.toLocaleString()}</td>
                    <td className="px-6 py-4 text-right font-mono">{stat.aspirate_count}</td>
                    <td className="px-6 py-4 text-right font-mono">{stat.dispense_count}</td>
                    <td className="px-6 py-4 text-right font-mono">{stat.mix_count}</td>
                    <td className="px-6 py-4 text-right font-mono">{stat.blowout_count}</td>
                  </ExpandableRow>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* 4. Tip Consumption (Expandable) */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden w-full">
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
              <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wider">Tip Consumption & Totals</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 border-b border-gray-100 bg-slate-50/30">
               <StatCard 
                title="Total Liquid Moved" 
                value={data.total_aspirated_ul.toLocaleString()} 
                unit="µL"
                subValue={`Dispensed: ${data.total_dispensed_ul.toLocaleString()} µL`}
                description="Total volume theoretically aspirated across all pipettes (multiplying by channel count)."
                icon={<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2.69l5.74 5.88a6 6 0 0 1-8.48 8.48A6 6 0 0 1 5.5 7l6.5-4.31z"></path></svg>}
              />
              <StatCard 
                title="Total Tip Pickups" 
                value={data.total_tip_pickups} 
                unit="Tips"
                description="Total individual tips used across all racks (multiplying by channel count)."
                icon={<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 21H7"></path><path d="m5 11 9 9"></path></svg>}
              />
            </div>

            <div className="p-0 overflow-x-auto custom-scrollbar">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-gray-500 uppercase bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="w-8"></th>
                    <th className="px-6 py-3 font-medium">Tip Rack Type</th>
                    <th className="px-6 py-3 font-medium text-right">Total Tips Used</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {data.tip_usage_breakdown && data.tip_usage_breakdown.length > 0 ? (
                    data.tip_usage_breakdown.map((usage, i) => (
                      <ExpandableRow
                        key={i}
                        colSpan={3}
                        isExpanded={expandedTips.has(i)}
                        onToggle={() => toggleSet(expandedTips, i, setExpandedTips)}
                        expandedContent={
                           <div className="space-y-2">
                             <h4 className="text-xs font-bold text-slate-500 uppercase mb-2">Pickup Log for {usage.tip_rack}</h4>
                             {usage.logs && usage.logs.length > 0 ? (
                                <div className="max-h-40 overflow-y-auto custom-scrollbar border border-gray-200 rounded bg-white">
                                  <table className="w-full text-xs">
                                    <tbody>
                                    {usage.logs.map((log, li) => (
                                      <tr key={li} className="border-b border-gray-100 hover:bg-gray-50">
                                        <td className="px-4 py-2 w-8 text-gray-400 text-right">{li+1}.</td>
                                        <td className="px-4 py-2 text-slate-700">{log.description}</td>
                                        <td className="px-4 py-2 text-right font-mono text-slate-500">{log.location}</td>
                                      </tr>
                                    ))}
                                    </tbody>
                                  </table>
                                </div>
                             ) : <p className="text-slate-400 italic text-xs">No detailed logs.</p>}
                          </div>
                        }
                      >
                        <td className="px-6 py-3 text-gray-400 group-hover:text-blue-600 transition-colors">
                           <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`transform transition-transform ${expandedTips.has(i) ? 'rotate-90' : ''}`}><polyline points="9 18 15 12 9 6"></polyline></svg>
                        </td>
                        <td className="px-6 py-3 text-slate-700 font-medium">{usage.tip_rack}</td>
                        <td className="px-6 py-3 text-right font-mono font-bold text-slate-800">{usage.count}</td>
                      </ExpandableRow>
                    ))
                  ) : (
                    <tr><td colSpan={3} className="px-6 py-4 text-center text-gray-400 italic">No tip usage data available</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

        {/* 5. Aux Motions (Expandable) */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden w-full">
           <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
            <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wider">Auxiliary Motion Events</h3>
          </div>
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-sm text-left min-w-[800px]">
              <thead className="text-xs text-gray-500 uppercase bg-gray-50/50 border-b border-gray-100">
                <tr>
                  <th className="w-8"></th>
                  <TableHeader label="Action" tooltip="Command type" />
                  <TableHeader label="Tip Status" tooltip="Was a tip attached?" />
                  <TableHeader label="Tip Type" tooltip="Size of tip" />
                  <TableHeader label="Volume Defined" tooltip="Volume parameter passed to command" align="right" />
                  <TableHeader label="Count" tooltip="Frequency" align="right" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {data.auxiliary_motions.map((aux, idx) => (
                  <ExpandableRow
                    key={`aux-${idx}`}
                    colSpan={6}
                    isExpanded={expandedAux.has(idx)}
                    onToggle={() => toggleSet(expandedAux, idx, setExpandedAux)}
                    expandedContent={
                      <div className="space-y-2">
                         <h4 className="text-xs font-bold text-slate-500 uppercase mb-2">Detailed {aux.action} Log</h4>
                         {aux.logs && aux.logs.length > 0 ? (
                            <div className="max-h-60 overflow-y-auto custom-scrollbar border border-gray-200 rounded bg-white">
                              <ul className="divide-y divide-gray-100">
                                {aux.logs.map((log, i) => (
                                  <li key={i} className="px-4 py-2 text-xs flex justify-between hover:bg-gray-50">
                                    <span className="font-medium text-slate-700">{i+1}. {log.description}</span>
                                    <span className="font-mono text-slate-500">{log.location}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                         ) : <p className="text-slate-400 italic text-xs">No detailed logs.</p>}
                      </div>
                    }
                  >
                    <td className="px-6 py-3 text-gray-400 group-hover:text-blue-600 transition-colors">
                       <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`transform transition-transform ${expandedAux.has(idx) ? 'rotate-90' : ''}`}><polyline points="9 18 15 12 9 6"></polyline></svg>
                    </td>
                    <td className="px-6 py-3 font-mono text-slate-700 font-bold">{aux.action}</td>
                    <td className="px-6 py-3">
                      <span className={`text-xs px-2 py-1 rounded font-medium ${aux.tip_status.toLowerCase().includes('no') ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                        {aux.tip_status}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-slate-600 font-mono text-xs">{aux.tip_type}</td>
                    <td className="px-6 py-3 text-right font-mono text-slate-600">{aux.volume_ul > 0 ? `${aux.volume_ul} µL` : '-'}</td>
                    <td className="px-6 py-3 text-right font-mono font-bold text-blue-600">{aux.count}</td>
                  </ExpandableRow>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        
        {/* 6. Module Stats (Expandable) */}
        {data.module_stats && data.module_stats.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden w-full">
             <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
              <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wider">Module Hardware Statistics</h3>
            </div>
            <div className="overflow-x-auto custom-scrollbar">
              <table className="w-full text-sm text-left min-w-[800px]">
                <thead className="text-xs text-gray-500 uppercase bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="w-8"></th>
                    <TableHeader label="Module" tooltip="Hardware module name" />
                    <TableHeader label="Slot" tooltip="Deck Location" />
                    <TableHeader label="Lid (Open/Close)" tooltip="Number of lid movements" align="center" />
                    <TableHeader label="Latch (Open/Close)" tooltip="Number of latch movements" align="center" />
                    <TableHeader label="Temp Changes" tooltip="Number of set_temperature calls" align="center" />
                    <TableHeader label="Engagements" tooltip="Gripper or Magdeck engage counts" align="center" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {data.module_stats.map((mod, idx) => (
                    <ExpandableRow
                      key={idx}
                      colSpan={7}
                      isExpanded={expandedModules.has(idx)}
                      onToggle={() => toggleSet(expandedModules, idx, setExpandedModules)}
                      expandedContent={
                        <div className="space-y-2">
                          <h4 className="text-xs font-bold text-slate-500 uppercase mb-2">Operation Log for {mod.module_name}</h4>
                          {mod.logs && mod.logs.length > 0 ? (
                             <div className="max-h-60 overflow-y-auto custom-scrollbar border border-gray-200 rounded bg-white">
                               <table className="w-full text-xs">
                                 <thead className="bg-gray-50 text-gray-500 sticky top-0">
                                    <tr>
                                      <th className="px-4 py-2 text-left w-10">#</th>
                                      <th className="px-4 py-2 text-left">Action</th>
                                      <th className="px-4 py-2 text-right">Parameters / Details</th>
                                      <th className="px-4 py-2 text-right">Location</th>
                                    </tr>
                                 </thead>
                                 <tbody>
                                 {mod.logs.map((log, i) => (
                                   <tr key={i} className="border-b border-gray-100 hover:bg-gray-50">
                                     <td className="px-4 py-2 text-gray-400 font-mono text-right">{i+1}</td>
                                     <td className="px-4 py-2 text-slate-700 font-medium">{log.description}</td>
                                     <td className="px-4 py-2 text-right font-mono text-blue-600">{log.details || '-'}</td>
                                     <td className="px-4 py-2 text-right text-slate-500">{log.location || mod.slot}</td>
                                   </tr>
                                 ))}
                                 </tbody>
                               </table>
                             </div>
                          ) : <p className="text-slate-400 italic text-xs">No detailed logs available.</p>}
                        </div>
                      }
                    >
                      <td className="px-6 py-4 text-gray-400 group-hover:text-blue-600 transition-colors align-middle">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`transform transition-transform ${expandedModules.has(idx) ? 'rotate-90' : ''}`}><polyline points="9 18 15 12 9 6"></polyline></svg>
                      </td>
                      <td className="px-6 py-4 font-bold text-slate-700 align-middle">{mod.module_name}</td>
                      <td className="px-6 py-4 font-mono text-slate-500 text-xs align-middle">{mod.slot}</td>
                      <td className="px-6 py-4 text-center align-middle">
                        {(mod.lid_open_count > 0 || mod.lid_close_count > 0) ? (
                          <span className="font-mono text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                            {mod.lid_open_count} / {mod.lid_close_count}
                          </span>
                        ) : <span className="text-gray-300">-</span>}
                      </td>
                      <td className="px-6 py-4 text-center align-middle">
                         {(mod.latch_open_count > 0 || mod.latch_close_count > 0) ? (
                          <span className="font-mono text-xs bg-orange-100 text-orange-800 px-2 py-1 rounded">
                            {mod.latch_open_count} / {mod.latch_close_count}
                          </span>
                        ) : <span className="text-gray-300">-</span>}
                      </td>
                      <td className="px-6 py-4 text-center align-middle">
                         {mod.temp_change_count > 0 ? (
                           <span className="font-mono font-bold text-red-600">{mod.temp_change_count}</span>
                         ) : <span className="text-gray-300">-</span>}
                      </td>
                      <td className="px-6 py-4 text-center align-middle">
                         {mod.engagements_count > 0 ? (
                           <span className="font-mono font-bold text-slate-700">{mod.engagements_count}</span>
                         ) : <span className="text-gray-300">-</span>}
                      </td>
                    </ExpandableRow>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 7. Mechanical Breakdown (Expandable Table) */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden w-full">
             <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
              <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wider">Mechanical Event Counts (Axis & Gripper)</h3>
            </div>
            <div className="overflow-x-auto custom-scrollbar">
              <table className="w-full text-sm text-left min-w-[400px]">
                <thead className="text-xs text-gray-500 uppercase bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="w-8"></th>
                    <TableHeader label="Axis / Motor" tooltip="Hardware axis or gripper" />
                    <TableHeader label="Movement Events" tooltip="Number of separate motion commands sent to this axis." align="right" />
                    <TableHeader label="Homing Events" tooltip="Number of home() calls or implicit homing." align="right" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {data.axes.map((axis, idx) => (
                    <ExpandableRow
                      key={idx}
                      colSpan={4}
                      isExpanded={expandedAxes.has(idx)}
                      onToggle={() => toggleSet(expandedAxes, idx, setExpandedAxes)}
                      expandedContent={
                        <div className="space-y-2">
                          <h4 className="text-xs font-bold text-slate-500 uppercase mb-2">Motion Log for {axis.axis}</h4>
                          {axis.actions && axis.actions.length > 0 ? (
                            <div className="max-h-60 overflow-y-auto custom-scrollbar border border-gray-200 rounded bg-white">
                              <table className="w-full text-xs">
                                <tbody>
                                {axis.actions.map((act, i) => (
                                  <tr key={i} className="border-b border-gray-100 hover:bg-gray-50">
                                    <td className="px-4 py-2 w-10 text-gray-400 text-right">{i+1}</td>
                                    <td className="px-4 py-2 text-slate-700">{act.description}</td>
                                    <td className="px-4 py-2 text-right font-mono text-slate-500">{act.details}</td>
                                  </tr>
                                ))}
                                </tbody>
                              </table>
                            </div>
                          ) : <p className="text-slate-400 italic text-xs">No detailed motion logs.</p>}
                        </div>
                      }
                    >
                      <td className="px-6 py-4 text-gray-400 group-hover:text-blue-600 transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`transform transition-transform ${expandedAxes.has(idx) ? 'rotate-90' : ''}`}><polyline points="9 18 15 12 9 6"></polyline></svg>
                      </td>
                      <td className="px-6 py-4 font-bold text-slate-700">{axis.axis}</td>
                      <td className="px-6 py-4 font-mono text-right text-blue-600 font-bold">{axis.movement_count}</td>
                      <td className="px-6 py-4 font-mono text-right text-slate-500">{axis.homing_count}</td>
                    </ExpandableRow>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        {/* 8. Top API Commands */}
           <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden flex flex-col w-full">
             <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
              <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wider">Top API Commands</h3>
            </div>
            <div className="flex-1 overflow-y-auto custom-scrollbar max-h-[400px]">
              <table className="w-full text-sm text-left">
                 <thead className="text-xs text-gray-500 uppercase bg-gray-50 sticky top-0 z-10 shadow-sm">
                  <tr>
                    <th className="px-6 py-3 font-medium bg-gray-50 border-b border-gray-200">Command</th>
                    <th className="px-6 py-3 font-medium text-right bg-gray-50 border-b border-gray-200">Count</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {sortedCommands.map((cmd, idx) => (
                    <tr key={idx} className="hover:bg-gray-50">
                      <td className="px-6 py-2 font-mono text-slate-600">{cmd.command}</td>
                      <td className="px-6 py-2 text-right font-bold text-slate-800">{cmd.count}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

      </div>
    </div>
  );
};
