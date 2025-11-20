import React, { useState, useCallback } from 'react';
import { createRoot } from 'react-dom/client';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './components/Dashboard';
import { AppView, ProtocolAnalysis } from './types';
import { analyzeProtocolCode } from './services/geminiService';

const DEFAULT_PROTOCOL = `
from opentrons import protocol_api

metadata = {
    'apiLevel': '2.13',
    'protocolName': 'Simple Transfer',
    'description': 'A basic transfer example for analysis'
}

def run(protocol: protocol_api.ProtocolContext):
    tiprack = protocol.load_labware('opentrons_96_tiprack_300ul', '1')
    plate = protocol.load_labware('corning_96_wellplate_360ul_flat', '2')
    p300 = protocol.load_instrument('p300_single', 'right', tip_racks=[tiprack])

    # Simple loop to demonstrate motion
    for i in range(8):
        p300.pick_up_tip()
        p300.aspirate(100, plate.columns()[0][i])
        p300.dispense(100, plate.columns()[1][i])
        p300.mix(3, 50, plate.columns()[1][i])
        p300.blow_out()
        p300.drop_tip()
`;

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<AppView>(AppView.EDITOR);
  const [protocolCode, setProtocolCode] = useState<string>(DEFAULT_PROTOCOL);
  const [fileName, setFileName] = useState<string>("example_protocol.py");
  const [analysisResult, setAnalysisResult] = useState<ProtocolAnalysis | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const handleAnalyze = useCallback(async () => {
    if (!protocolCode.trim()) return;
    
    setIsAnalyzing(true);
    setError(null);
    
    try {
      const result = await analyzeProtocolCode(protocolCode);
      setAnalysisResult(result);
      setCurrentView(AppView.ANALYSIS);
      setIsSidebarOpen(false); // Close sidebar on mobile when analyzing
    } catch (err) {
      setError("Failed to analyze protocol. Please check the code and try again.");
      console.error(err);
    } finally {
      setIsAnalyzing(false);
    }
  }, [protocolCode]);

  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const onDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      const file = files[0];
      if (file.name.endsWith('.py')) {
        setFileName(file.name);
        const reader = new FileReader();
        reader.onload = (event) => {
          if (event.target?.result) {
             setProtocolCode(event.target.result as string);
          }
        };
        reader.readAsText(file);
      } else {
        setError("Please upload a valid .py Python protocol file.");
      }
    }
  }, []);

  return (
    <div className="flex h-full flex-col">
      <Header onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)} />
      <div className="flex flex-1 overflow-hidden relative">
        <Sidebar 
          currentView={currentView} 
          onChangeView={(view) => {
            setCurrentView(view);
            setIsSidebarOpen(false);
          }}
          isAnalyzing={isAnalyzing}
          hasResults={!!analysisResult}
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
        />
        
        {/* Overlay for mobile sidebar */}
        {isSidebarOpen && (
          <div 
            className="fixed inset-0 bg-black/50 z-30 md:hidden" 
            onClick={() => setIsSidebarOpen(false)}
          />
        )}
        
        <main className="flex-1 bg-gray-100 relative w-full">
          {currentView === AppView.EDITOR && (
            <div className="h-full flex flex-col p-4 md:p-6">
              <div 
                className={`
                  flex-1 bg-white rounded-lg border-2 shadow-sm flex flex-col h-full overflow-hidden transition-all
                  ${isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}
                `}
                onDragOver={onDragOver}
                onDragLeave={onDragLeave}
                onDrop={onDrop}
              >
                <div className="bg-gray-50 border-b border-gray-200 px-6 py-4 flex flex-col sm:flex-row justify-between items-start sm:items-center shrink-0 gap-4">
                  <div className="flex flex-col">
                    <span className="text-sm font-bold text-gray-700">{fileName}</span>
                    <span className="text-xs text-gray-500">Drag & Drop your protocol file here</span>
                  </div>
                  <button 
                    onClick={handleAnalyze}
                    disabled={isAnalyzing}
                    className={`
                      w-full sm:w-auto px-6 py-2 rounded-full text-sm font-bold text-white transition-all shadow-md
                      ${isAnalyzing ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 hover:shadow-lg transform hover:-translate-y-0.5'}
                    `}
                  >
                    {isAnalyzing ? 'Analyzing Protocol...' : 'Run Analysis'}
                  </button>
                </div>
                
                <div className="flex-1 relative group">
                  {/* Drag Overlay */}
                  {isDragging && (
                    <div className="absolute inset-0 z-20 bg-blue-500/10 flex items-center justify-center backdrop-blur-sm">
                      <div className="bg-white p-8 rounded-xl shadow-2xl text-center">
                        <svg className="w-16 h-16 text-blue-500 mx-auto mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></svg>
                        <p className="text-xl font-bold text-blue-600">Drop Protocol File Here</p>
                      </div>
                    </div>
                  )}

                  <textarea 
                    className="absolute inset-0 w-full h-full p-6 font-mono text-sm resize-none outline-none text-slate-700 custom-scrollbar bg-transparent"
                    value={protocolCode}
                    onChange={(e) => setProtocolCode(e.target.value)}
                    spellCheck={false}
                    placeholder="Drag and drop a .py file here..."
                  />
                </div>
              </div>
              {error && (
                <div className="mt-4 p-4 bg-red-50 text-red-700 rounded-md border border-red-200 text-sm flex items-center gap-2 shadow-sm">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
                  {error}
                </div>
              )}
            </div>
          )}

          {currentView === AppView.ANALYSIS && analysisResult && (
            <Dashboard data={analysisResult} />
          )}

          {currentView === AppView.ANALYSIS && !analysisResult && !isAnalyzing && (
            <div className="h-full flex items-center justify-center flex-col text-gray-400 p-4 text-center">
              <svg className="w-16 h-16 mb-4 opacity-50" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <p className="text-lg font-medium">No analysis available</p>
              <button onClick={() => setCurrentView(AppView.EDITOR)} className="text-blue-500 hover:underline mt-2">Return to Editor</button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);