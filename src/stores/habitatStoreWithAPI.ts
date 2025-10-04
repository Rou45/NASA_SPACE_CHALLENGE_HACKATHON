/**
 * Updated Zustand Store with API Integration
 * This shows how to modify your existing store to use live data
 */

import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import { HabitatDesign, FunctionalModule, ValidationResult, AnalysisResults } from '../types/habitat';
import { HabitatGeometry } from '../utils/geometry';
import { HabitatValidator } from '../utils/validation';
import APIService, { NASAStandardsResponse, LaunchVehicleResponse } from '../services/apiService';

interface HabitatStore {
  // Existing state...
  currentDesign: HabitatDesign | null;
  selectedModuleId: string | null;
  isLoading: boolean;
  showValidation: boolean;
  validationResults: ValidationResult[];
  complianceScore: number;
  
  // NEW: API data state
  nasaStandards: NASAStandardsResponse | null;
  launchVehicles: LaunchVehicleResponse[];
  communityDesigns: any[];
  apiLoading: boolean;
  apiError: string | null;
  
  // Existing actions...
  createNewDesign: (name: string, description: string) => void;
  loadDesign: (design: HabitatDesign) => void;
  validateDesign: () => void;
  
  // NEW: API actions
  initializeAPIData: () => Promise<void>;
  refreshNASAStandards: () => Promise<void>;
  refreshLaunchVehicles: () => Promise<void>;
  loadCommunityDesigns: () => Promise<void>;
  submitDesignToCommunity: (design: HabitatDesign) => Promise<void>;
}

export const useHabitatStore = create<HabitatStore>()(
  subscribeWithSelector((set, get) => ({
    // Existing state
    currentDesign: null,
    selectedModuleId: null,
    isLoading: false,
    showValidation: true,
    validationResults: [],
    complianceScore: 100,
    
    // NEW: API data state
    nasaStandards: null,
    launchVehicles: [],
    communityDesigns: [],
    apiLoading: false,
    apiError: null,

    // Existing actions (keep your current implementations)
    createNewDesign: (name: string, description: string) => {
      // Your existing implementation
    },

    loadDesign: (design: HabitatDesign) => {
      // Your existing implementation
    },

    validateDesign: () => {
      const { currentDesign, nasaStandards } = get();
      if (!currentDesign) return;

      // Use NASA standards validation with current design
      const validationResults = HabitatValidator.validateDesign(currentDesign);
      
      const compliance = HabitatValidator.calculateComplianceScore(validationResults);
      
      set({
        validationResults,
        complianceScore: compliance,
      });
    },

    // NEW: API initialization - Call this when app starts
    initializeAPIData: async () => {
      set({ apiLoading: true, apiError: null });
      
      try {
        // Load all API data in parallel
        const [nasaStandards, launchVehicles, communityDesigns] = await Promise.all([
          APIService.getNASAStandards(),
          APIService.getLaunchVehicles(),
          APIService.getCommunityDesigns(20, 0),
        ]);

        set({
          nasaStandards,
          launchVehicles,
          communityDesigns,
          apiLoading: false,
        });

        console.log('✅ Live API data loaded successfully');
      } catch (error) {
        console.error('❌ Failed to load API data:', error);
        set({ 
          apiError: 'Failed to load live data. Using offline mode.',
          apiLoading: false 
        });
      }
    },

    // NEW: Refresh NASA standards
    refreshNASAStandards: async () => {
      try {
        const nasaStandards = await APIService.getNASAStandards();
        set({ nasaStandards });
        
        // Re-validate current design with new standards
        get().validateDesign();
      } catch (error) {
        console.error('Failed to refresh NASA standards:', error);
      }
    },

    // NEW: Refresh launch vehicles
    refreshLaunchVehicles: async () => {
      try {
        const launchVehicles = await APIService.getLaunchVehicles();
        set({ launchVehicles });
      } catch (error) {
        console.error('Failed to refresh launch vehicles:', error);
      }
    },

    // NEW: Load community designs
    loadCommunityDesigns: async () => {
      try {
        const communityDesigns = await APIService.getCommunityDesigns(50, 0);
        set({ communityDesigns });
      } catch (error) {
        console.error('Failed to load community designs:', error);
      }
    },

    // NEW: Submit design to community
    submitDesignToCommunity: async (design: HabitatDesign) => {
      try {
        set({ apiLoading: true });
        const result = await APIService.submitDesign(design);
        
        // Refresh community designs to show the new submission
        await get().loadCommunityDesigns();
        
        set({ apiLoading: false });
        console.log('✅ Design submitted successfully:', result);
      } catch (error) {
        set({ apiLoading: false });
        console.error('❌ Failed to submit design:', error);
        throw error;
      }
    },

    // Add your other existing actions here...
  }))
);

// Initialize API data when store is created
useHabitatStore.getState().initializeAPIData();