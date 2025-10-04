import React, { useState } from 'react';
import { HomePage } from './pages/HomePage';
import { NASAPage } from './pages/NASAPage';
import { useHabitatStore } from './stores/habitatStore';
import { HabitatShape, Destination, LaunchVehicle } from './types/habitat';
import { ThemeProvider } from './contexts/ThemeContext';

export function App() {
  const [currentPage, setCurrentPage] = useState<'home' | 'nasa'>('home');

  // Load design from local storage on first run
  React.useEffect(() => {
    const { loadFromLocal, currentDesign } = useHabitatStore.getState();
    
    try {
      loadFromLocal();
      // Check if we actually have a current design
      const state = useHabitatStore.getState();
      if (!state.currentDesign || state.currentDesign.modules.length === 0) {
        console.log('No saved design found or design is empty, using sample design...');
        // The store is already initialized with SAMPLE_DESIGNS[0], so we don't need to do anything
        // Just validate to make sure we have proper state
        const sampleState = useHabitatStore.getState();
        if (!sampleState.currentDesign) {
          throw new Error('No sample design available');
        }
      }
    } catch (error) {
      console.log('Error loading design:', error);
      // If there's still an issue, the store should have the sample design as fallback
    }
  }, []);

  const handleNavigate = (page: string) => {
    setCurrentPage(page as 'home' | 'nasa');
  };

  return (
    <ThemeProvider>
      {currentPage === 'home' && <HomePage onNavigate={handleNavigate} />}
      {currentPage === 'nasa' && <NASAPage onNavigate={handleNavigate} />}
    </ThemeProvider>
  );
}