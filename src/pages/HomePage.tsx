import React from 'react';
import { Habitat3DViewer } from '../components/Habitat3DViewer';
import { EnhancedSidebar } from '../components/layout/EnhancedSidebar';
import { EnhancedValidationPanel } from '../components/panels/EnhancedValidationPanel';
import { QuickDesignWizard } from '../components/modals/QuickDesignWizard';
import { ExportModal } from '../components/modals/ExportModal';
import { Footer } from '../components/layout/Footer';
import { useHabitatStore } from '../stores/habitatStore';
import { ErrorBoundary } from '../components/ErrorBoundary';
import { useTheme } from '../contexts/ThemeContext';

interface HomePageProps {
  onNavigate: (page: string) => void;
}

export function HomePage({ onNavigate }: HomePageProps) {
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);
  const [isValidationOpen, setIsValidationOpen] = React.useState(false);
  const [isWizardOpen, setIsWizardOpen] = React.useState(false);
  const [isExportOpen, setIsExportOpen] = React.useState(false);
  const { currentDesign, showValidation, viewMode, validateDesign } = useHabitatStore();
  const { isDayMode, toggleTheme } = useTheme();

  // Function to handle validation
  const handleValidation = () => {
    console.log('Validation button clicked!', { currentDesign, hasDesign: !!currentDesign });
    if (currentDesign) {
      console.log('Running validateDesign...');
      validateDesign(); // Run validation
      console.log('Opening validation panel...');
      setIsValidationOpen(true); // Open validation panel
    } else {
      console.log('No current design available');
    }
  };

  // Listen for design wizard events from 3D viewer
  React.useEffect(() => {
    const handleOpenDesignWizard = () => {
      setIsWizardOpen(true);
    };

    window.addEventListener('openDesignWizard', handleOpenDesignWizard);
    return () => {
      window.removeEventListener('openDesignWizard', handleOpenDesignWizard);
    };
  }, []);

  return (
    <div className="relative text-white">
      {/* Main content area - Full height without footer affecting it */}
      <div className="h-screen flex flex-col overflow-hidden">
        <div className="flex flex-1 min-h-0">
        {/* Sidebar - Fixed positioning with proper spacing */}
        <div className={`${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 transition-transform duration-300 ease-in-out fixed lg:relative z-30 h-full`}>
          <EnhancedSidebar onClose={() => setIsSidebarOpen(false)} />
        </div>

        {/* Mobile overlay */}
        {isSidebarOpen && (
          <div 
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-20 lg:hidden"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}

        {/* Main content - Proper margins to avoid overlap */}
        <div className="flex-1 flex flex-col min-w-0 lg:ml-0">
          {/* Header - Full width with proper spacing */}
          <div className="flex items-center justify-between p-4 bg-slate-800/50 border-b border-slate-700/50 h-16 flex-shrink-0">
          <div className="flex items-center space-x-4">
            <button 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="lg:hidden btn-ghost p-2"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <h1 className="text-2xl font-bold text-gradient">Space Habitat Designer</h1>
          </div>
          
          <div className="flex items-center space-x-3">
            <button 
              onClick={toggleTheme}
              className={`btn-ghost p-2 transition-all duration-300 ${isDayMode ? 'text-yellow-500 hover:text-yellow-400' : 'text-blue-300 hover:text-blue-200'}`}
              title={isDayMode ? 'Switch to Night Mode' : 'Switch to Day Mode'}
            >
              {isDayMode ? (
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                </svg>
              )}
            </button>
            <button 
              onClick={() => onNavigate('nasa')}
              className="btn-outline px-4 py-2"
            >
              🚀 NASA Data
            </button>
            <button 
              onClick={handleValidation}
              className="btn-outline px-4 py-2"
              disabled={!currentDesign}
            >
              ✅ Validation
            </button>
            <button 
              onClick={() => setIsExportOpen(true)}
              className="btn-primary px-4 py-2"
              disabled={!currentDesign}
            >
              📤 Export
            </button>
          </div>
        </div>

        {/* 3D Viewer - Full remaining height */}
        <div className="flex-1 relative overflow-hidden">
          <ErrorBoundary fallback={
            <div className="w-full h-full flex items-center justify-center bg-slate-800/50">
              <div className="text-center text-slate-300">
                <div className="text-6xl mb-4">🔧</div>
                <div className="text-xl font-medium mb-2">3D Viewer Error</div>
                <div className="text-sm text-slate-400 mb-4">WebGL context lost or 3D rendering issue</div>
                <button 
                  onClick={() => window.location.reload()}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-white transition-colors"
                >
                  Reload Page
                </button>
              </div>
            </div>
          }>
            <Habitat3DViewer />
          </ErrorBoundary>
          
          {/* Welcome overlay only if no design exists */}
          {!currentDesign && (
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-10">
              <div className="text-center max-w-lg p-8 glass-effect rounded-2xl border border-slate-600/50 mx-4">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <span className="text-3xl">🏗️</span>
                </div>
                <h2 className="text-3xl font-bold text-gradient mb-4">Welcome to Space Habitat Designer</h2>
                <p className="text-slate-300 mb-6">Create and visualize space habitats in stunning 3D. Start by designing your first habitat!</p>
                <button 
                  onClick={() => setIsWizardOpen(true)}
                  className="btn-primary px-8 py-3 text-lg"
                >
                  🚀 Create Your First Habitat
                </button>
                <p className="text-xs text-slate-500 mt-4">Or explore the demo habitat that's already loaded</p>
              </div>
            </div>
          )}
        </div>
        </div>
      </div>

      {/* Validation Panel - Modal */}
      <EnhancedValidationPanel 
        isOpen={isValidationOpen}
        onClose={() => setIsValidationOpen(false)} 
      />

      {/* Floating Action Button - New Design - Moves with scroll to avoid footer overlap */}
      <button
        onClick={() => setIsWizardOpen(true)}
        className="absolute bottom-24 right-6 lg:bottom-28 lg:right-8 w-14 h-14 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white rounded-full shadow-2xl z-40 flex items-center justify-center transition-all duration-300 hover:scale-110 group"
        title="Create New Design"
      >
        <svg className="w-6 h-6 transition-transform group-hover:rotate-90" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
        </svg>
      </button>

      {/* Quick Design Wizard */}
      <QuickDesignWizard 
        isOpen={isWizardOpen} 
        onClose={() => setIsWizardOpen(false)} 
      />

      {/* Export Modal */}
      <ExportModal 
        isOpen={isExportOpen} 
        onClose={() => setIsExportOpen(false)} 
      />
      </div>

      {/* Compact Footer Section - Just enough space for footer, not full screen */}
      <div className="min-h-fit">
        <Footer />
      </div>
    </div>
  );
}