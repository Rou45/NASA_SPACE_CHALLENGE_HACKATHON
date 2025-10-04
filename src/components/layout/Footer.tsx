import React from 'react';
import { useTheme } from '../../contexts/ThemeContext';

export function Footer() {
  const { isDayMode } = useTheme();
  
  return (
    <footer className={`w-full py-4 px-6 border-t transition-all duration-300 backdrop-blur-md ${
      isDayMode 
        ? 'bg-white/20 border-blue-300/30 text-blue-900 shadow-lg' 
        : 'bg-slate-900/20 border-slate-700/30 text-slate-100 shadow-xl'
    } glass-effect`}>
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between space-y-2 sm:space-y-0">
        {/* Left side - Copyright */}
        <div className="flex items-center space-x-2 text-sm">
          <span className={isDayMode ? 'text-blue-600' : 'text-blue-400'}>🚀</span>
          <span>
            © 2025 Space Habitat Layout Creator by{' '}
            <span className={`font-bold ${isDayMode ? 'text-blue-800' : 'text-blue-300'}`}>
              Roushan Kumar
            </span>
          </span>
        </div>
        
        {/* Right side - NASA Hackathon */}
        <div className="flex items-center space-x-2 text-sm">
          <span className={isDayMode ? 'text-orange-600' : 'text-orange-400'}>🏆</span>
          <span>
            Built for{' '}
            <span className={`font-bold ${isDayMode ? 'text-orange-800' : 'text-orange-300'}`}>
              NASA Space Hackathon 2025
            </span>
          </span>
        </div>
      </div>
      
      {/* Bottom line - Additional info */}
      <div className={`max-w-7xl mx-auto mt-3 pt-3 border-t transition-all duration-300 ${
        isDayMode ? 'border-blue-200/40' : 'border-slate-600/30'
      }`}>
        <div className="flex flex-col sm:flex-row items-center justify-between space-y-1 sm:space-y-0 text-xs">
          <div className={isDayMode ? 'text-blue-700' : 'text-slate-300'}>
            Advancing human space exploration through innovative habitat design
          </div>
          <div className={`flex items-center space-x-4 ${isDayMode ? 'text-blue-600' : 'text-slate-400'}`}>
            <span>NASA-Grade Standards</span>
            <span>•</span>
            <span>Real-time Validation</span>
            <span>•</span>
            <span>3D Visualization</span>
          </div>
        </div>
      </div>
    </footer>
  );
}