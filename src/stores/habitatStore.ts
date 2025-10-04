import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import { HabitatDesign, FunctionalModule, HabitatShape, Destination, LaunchVehicle, ValidationResult, AnalysisResults } from '../types/habitat';
import { HabitatGeometry } from '../utils/geometry';
import { HabitatValidator } from '../utils/validation';
import { SAMPLE_DESIGNS } from '../constants/sample-designs';

interface HabitatStore {
  // Current design state
  currentDesign: HabitatDesign | null;
  selectedModuleId: string | null;
  
  // UI state
  isLoading: boolean;
  showValidation: boolean;
  show3D: boolean;
  viewMode: '2d' | '3d' | 'split';
  theme: 'day' | 'night';
  
  // Validation and analysis
  validationResults: ValidationResult[];
  analysisResults: AnalysisResults | null;
  complianceScore: number;
  
  // Actions
  createNewDesign: (name: string, description: string) => void;
  loadDesign: (design: HabitatDesign) => void;
  updateDesignMetadata: (updates: Partial<Pick<HabitatDesign, 'name' | 'description' | 'author'>>) => void;
  
  // Habitat configuration
  updateHabitatDimensions: (dimensions: Partial<HabitatDesign['dimensions']>) => void;
  updateMissionParameters: (params: Partial<HabitatDesign['missionParameters']>) => void;
  
  // Module management
  addModule: (module: Omit<FunctionalModule, 'id'>) => void;
  updateModule: (id: string, updates: Partial<FunctionalModule>) => void;
  removeModule: (id: string) => void;
  selectModule: (id: string | null) => void;
  
  // Connections
  addConnection: (fromId: string, toId: string, type: 'corridor' | 'airlock' | 'hatch' | 'emergency') => void;
  removeConnection: (connectionId: string) => void;
  
  // Analysis and validation
  validateDesign: () => void;
  runAnalysis: () => void;
  
  // UI controls
  setViewMode: (mode: '2d' | '3d' | 'split') => void;
  toggleValidation: () => void;
  setLoading: (loading: boolean) => void;
  
  // Data persistence
  exportDesign: (format: 'json' | 'obj' | 'stl' | 'pdf') => void;
  importDesign: (data: string) => void;
  saveToLocal: () => void;
  loadFromLocal: () => void;
}

// Generate unique ID for modules and connections
const generateId = (): string => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

// Create default habitat design
const createDefaultDesign = (name: string, description: string): HabitatDesign => ({
  id: generateId(),
  name,
  description,
  version: '1.0.0',
  createdAt: new Date(),
  updatedAt: new Date(),
  author: 'Designer',
  
  dimensions: {
    shape: HabitatShape.CYLINDER,
    radius: 4.0,
    height: 12.0,
  },
  
  missionParameters: {
    crewSize: 4,
    duration: 180,
    destination: Destination.LUNAR_SURFACE,
    launchVehicle: LaunchVehicle.SLS_BLOCK_1,
    missionType: 'exploration',
    emergencyEvacuation: true,
  },
  
  modules: [],
  connections: [],
  
  totalVolume: 0,
  pressurizedVolume: 0,
  netHabitableVolume: 0,
  totalMass: 0,
  powerRequirement: 0,
  
  validationResults: [],
  complianceScore: 0,
});

// Calculate design metrics
const calculateDesignMetrics = (design: HabitatDesign): Partial<HabitatDesign> => {
  const totalVolume = HabitatGeometry.calculateVolume(design.dimensions);
  const moduleVolume = design.modules.reduce((sum, module) => sum + module.volume, 0);
  const totalMass = design.modules.reduce((sum, module) => sum + module.mass, 0) + 
                   HabitatGeometry.calculateStructuralMass(design.dimensions);
  const powerRequirement = design.modules.reduce((sum, module) => sum + module.powerRequirement, 0);
  
  return {
    totalVolume,
    pressurizedVolume: totalVolume,
    netHabitableVolume: Math.max(0, totalVolume - moduleVolume * 0.3), // 30% reduction for equipment/storage
    totalMass,
    powerRequirement,
    updatedAt: new Date(),
  };
};

export const useHabitatStore = create<HabitatStore>()(
  subscribeWithSelector((set, get) => ({
    // Initial state - start with Luna Base Alpha sample  
    currentDesign: SAMPLE_DESIGNS[0],
    selectedModuleId: null,
    isLoading: false,
    showValidation: true,
    show3D: true,
    viewMode: '3d' as const,
    theme: 'day' as const,
    validationResults: [],
    analysisResults: null,
    complianceScore: SAMPLE_DESIGNS[0].complianceScore || 0,

    // Utilities
    geometry: new HabitatGeometry(),
    validator: new HabitatValidator(),

    // Design management
    createNewDesign: (name: string, description: string) => {
      const design = createDefaultDesign(name, description);
      const metrics = calculateDesignMetrics(design);
      const updatedDesign = { ...design, ...metrics };
      
      set({
        currentDesign: updatedDesign,
        selectedModuleId: null,
        validationResults: [],
        analysisResults: null,
        complianceScore: 0,
      });
      
      // Auto-validate new design
      get().validateDesign();
    },

    loadDesign: (design: HabitatDesign) => {
      set({
        currentDesign: design,
        selectedModuleId: null,
        validationResults: design.validationResults || [],
        complianceScore: design.complianceScore || 0,
      });
      
      get().validateDesign();
    },

    updateDesignMetadata: (updates) => {
      const { currentDesign } = get();
      if (!currentDesign) return;
      
      const updatedDesign = {
        ...currentDesign,
        ...updates,
        updatedAt: new Date(),
      };
      
      set({ currentDesign: updatedDesign });
    },

    // Habitat configuration
    updateHabitatDimensions: (dimensions) => {
      const { currentDesign } = get();
      if (!currentDesign) return;
      
      // Ensure we have valid dimensions based on shape
      const newDimensions = { ...currentDesign.dimensions, ...dimensions };
      
      // Add default values if switching shapes
      if (dimensions.shape && dimensions.shape !== currentDesign.dimensions.shape) {
        switch (dimensions.shape) {
          case HabitatShape.CYLINDER:
            if (!newDimensions.radius) newDimensions.radius = 4.0;
            if (!newDimensions.height) newDimensions.height = 12.0;
            break;
          case HabitatShape.SPHERE:
            if (!newDimensions.sphereRadius) newDimensions.sphereRadius = 5.0;
            break;
          case HabitatShape.TORUS:
            if (!newDimensions.majorRadius) newDimensions.majorRadius = 8.0;
            if (!newDimensions.minorRadius) newDimensions.minorRadius = 3.0;
            break;
          case HabitatShape.DOME:
            if (!newDimensions.domeRadius) newDimensions.domeRadius = 6.0;
            if (!newDimensions.domeHeight) newDimensions.domeHeight = 4.0;
            break;
          case HabitatShape.INFLATABLE:
            if (!newDimensions.inflatedRadius) newDimensions.inflatedRadius = 4.0;
            if (!newDimensions.inflatedHeight) newDimensions.inflatedHeight = 10.0;
            break;
          case HabitatShape.MODULAR:
            if (!newDimensions.length) newDimensions.length = 10.0;
            if (!newDimensions.width) newDimensions.width = 8.0;
            if (!newDimensions.height) newDimensions.height = 6.0;
            break;
        }
      }
      
      const metrics = calculateDesignMetrics({ ...currentDesign, dimensions: newDimensions });
      
      const updatedDesign = {
        ...currentDesign,
        dimensions: newDimensions,
        ...metrics,
      };
      
      set({ currentDesign: updatedDesign });
      get().validateDesign();
    },

    updateMissionParameters: (params) => {
      const { currentDesign } = get();
      if (!currentDesign) return;
      
      const newParams = { ...currentDesign.missionParameters, ...params };
      const updatedDesign = {
        ...currentDesign,
        missionParameters: newParams,
        updatedAt: new Date(),
      };
      
      set({ currentDesign: updatedDesign });
      get().validateDesign();
    },

    // Module management
    addModule: (moduleData) => {
      const { currentDesign } = get();
      if (!currentDesign) return;
      
      const newModule: FunctionalModule = {
        ...moduleData,
        id: generateId(),
      };
      
      const updatedModules = [...currentDesign.modules, newModule];
      const metrics = calculateDesignMetrics({ ...currentDesign, modules: updatedModules });
      
      const updatedDesign = {
        ...currentDesign,
        modules: updatedModules,
        ...metrics,
      };
      
      set({ currentDesign: updatedDesign });
      get().validateDesign();
    },

    updateModule: (id: string, updates) => {
      const { currentDesign } = get();
      if (!currentDesign) return;
      
      const updatedModules = currentDesign.modules.map(module =>
        module.id === id ? { ...module, ...updates } : module
      );
      
      const metrics = calculateDesignMetrics({ ...currentDesign, modules: updatedModules });
      
      const updatedDesign = {
        ...currentDesign,
        modules: updatedModules,
        ...metrics,
      };
      
      set({ currentDesign: updatedDesign });
      get().validateDesign();
    },

    removeModule: (id: string) => {
      const { currentDesign, selectedModuleId } = get();
      if (!currentDesign) return;
      
      const updatedModules = currentDesign.modules.filter(module => module.id !== id);
      const updatedConnections = currentDesign.connections.filter(
        conn => conn.fromModuleId !== id && conn.toModuleId !== id
      );
      
      const metrics = calculateDesignMetrics({ 
        ...currentDesign, 
        modules: updatedModules,
        connections: updatedConnections 
      });
      
      const updatedDesign = {
        ...currentDesign,
        modules: updatedModules,
        connections: updatedConnections,
        ...metrics,
      };
      
      set({ 
        currentDesign: updatedDesign,
        selectedModuleId: selectedModuleId === id ? null : selectedModuleId,
      });
      get().validateDesign();
    },

    selectModule: (id: string | null) => {
      set({ selectedModuleId: id });
    },

    // Connections
    addConnection: (fromId: string, toId: string, type) => {
      const { currentDesign } = get();
      if (!currentDesign) return;
      
      const newConnection = {
        id: generateId(),
        fromModuleId: fromId,
        toModuleId: toId,
        type,
        diameter: type === 'airlock' ? 1.2 : 0.8,
        length: 2.0,
        pressurized: true,
        bidirectional: true,
      };
      
      const updatedDesign = {
        ...currentDesign,
        connections: [...currentDesign.connections, newConnection],
        updatedAt: new Date(),
      };
      
      set({ currentDesign: updatedDesign });
      get().validateDesign();
    },

    removeConnection: (connectionId: string) => {
      const { currentDesign } = get();
      if (!currentDesign) return;
      
      const updatedConnections = currentDesign.connections.filter(
        conn => conn.id !== connectionId
      );
      
      const updatedDesign = {
        ...currentDesign,
        connections: updatedConnections,
        updatedAt: new Date(),
      };
      
      set({ currentDesign: updatedDesign });
      get().validateDesign();
    },

    // Analysis and validation
    validateDesign: () => {
      const { currentDesign } = get();
      if (!currentDesign) return;
      
      const validationResults = HabitatValidator.validateDesign(currentDesign);
      const complianceScore = HabitatValidator.calculateComplianceScore(validationResults);
      
      const updatedDesign = {
        ...currentDesign,
        validationResults,
        complianceScore,
      };
      
      set({ 
        currentDesign: updatedDesign,
        validationResults,
        complianceScore,
      });
    },

    runAnalysis: () => {
      const { currentDesign } = get();
      if (!currentDesign) return;
      
      // TODO: Implement detailed analysis
      const analysisResults: AnalysisResults = {
        volumeAnalysis: {
          totalVolume: currentDesign.totalVolume,
          pressurizedVolume: currentDesign.pressurizedVolume,
          netHabitableVolume: currentDesign.netHabitableVolume,
          volumePerCrew: currentDesign.netHabitableVolume / currentDesign.missionParameters.crewSize,
          volumeUtilization: 85,
          volumeByFunction: {} as any,
        },
        massAnalysis: {
          totalMass: currentDesign.totalMass,
          dryMass: currentDesign.totalMass * 0.7,
          consumablesMass: currentDesign.totalMass * 0.3,
          massPerCrew: currentDesign.totalMass / currentDesign.missionParameters.crewSize,
          massDistribution: {} as any,
          centerOfMass: { x: 0, y: 0, z: 0 },
        },
        accessibilityAnalysis: {
          averagePathLength: 8.5,
          maxPathLength: 15.2,
          emergencyEgressTime: 45,
          bottlenecks: [],
          deadEnds: [],
        },
        adjacencyAnalysis: {
          satisfiedRequirements: 8,
          violatedRequirements: 2,
          optimalPlacements: 6,
          suboptimalPlacements: 4,
          recommendations: [],
        },
        safetyAnalysis: {
          redundancyScore: 85,
          emergencyAccessScore: 92,
          structuralSafetyScore: 88,
          criticalSinglePoints: [],
        },
      };
      
      set({ analysisResults });
    },

    // UI controls
    setViewMode: (mode) => set({ viewMode: mode }),
    toggleValidation: () => set((state) => ({ showValidation: !state.showValidation })),
    setLoading: (loading) => set({ isLoading: loading }),

    // Data persistence
    exportDesign: (format) => {
      const { currentDesign } = get();
      if (!currentDesign) return;
      
      let exportData: string;
      let filename: string;
      
      switch (format) {
        case 'json':
          exportData = JSON.stringify(currentDesign, null, 2);
          filename = `${currentDesign.name.replace(/\s+/g, '_')}.json`;
          break;
        default:
          console.warn(`Export format ${format} not implemented yet`);
          return;
      }
      
      // Create download link
      const blob = new Blob([exportData], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    },

    importDesign: (data: string) => {
      try {
        const design = JSON.parse(data) as HabitatDesign;
        get().loadDesign(design);
      } catch (error) {
        console.error('Failed to import design:', error);
      }
    },

    saveToLocal: () => {
      const { currentDesign } = get();
      if (!currentDesign) return;
      
      localStorage.setItem('habitat-design', JSON.stringify(currentDesign));
      localStorage.setItem('habitat-design-timestamp', new Date().toISOString());
    },

    loadFromLocal: () => {
      try {
        const data = localStorage.getItem('habitat-design');
        if (data) {
          const design = JSON.parse(data) as HabitatDesign;
          get().loadDesign(design);
        }
      } catch (error) {
        console.error('Failed to load from local storage:', error);
      }
    },
  }))
);

// Auto-save to local storage on design changes
useHabitatStore.subscribe(
  (state) => state.currentDesign,
  (currentDesign) => {
    if (currentDesign) {
      useHabitatStore.getState().saveToLocal();
    }
  }
);