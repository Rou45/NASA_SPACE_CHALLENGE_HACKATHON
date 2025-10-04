import { z } from 'zod';

// Base geometric shapes for habitats
export enum HabitatShape {
  CYLINDER = 'cylinder',
  SPHERE = 'sphere',
  TORUS = 'torus',
  DOME = 'dome',
  INFLATABLE = 'inflatable',
  MODULAR = 'modular',
  CUSTOM = 'custom',
}

// Mission destinations
export enum Destination {
  LEO = 'leo',
  LUNAR_ORBIT = 'lunar_orbit',
  LUNAR_SURFACE = 'lunar_surface',
  MARS_ORBIT = 'mars_orbit',
  MARS_SURFACE = 'mars_surface',
  DEEP_SPACE = 'deep_space',
}

// Functional module categories
export enum ModuleType {
  COMMAND = 'command',
  HABITATION = 'habitation',
  LABORATORY = 'laboratory',
  LOGISTICS = 'logistics',
  EXERCISE = 'exercise',
  MEDICAL = 'medical',
  AIRLOCK = 'airlock',
  GREENHOUSE = 'greenhouse',
  WORKSHOP = 'workshop',
  RECREATION = 'recreation',
}

// Launch vehicle options
export enum LaunchVehicle {
  FALCON_HEAVY = 'falcon_heavy',
  SLS_BLOCK_1 = 'sls_block_1',
  SLS_BLOCK_2 = 'sls_block_2',
  STARSHIP = 'starship',
}

// 3D Position and Rotation
export interface Vector3D {
  x: number;
  y: number;
  z: number;
}

export interface Quaternion {
  x: number;
  y: number;
  z: number;
  w: number;
}

// Habitat dimensions based on shape
export interface HabitatDimensions {
  shape: HabitatShape;
  // Cylinder
  radius?: number;
  height?: number;
  // Sphere
  sphereRadius?: number;
  // Torus
  majorRadius?: number;
  minorRadius?: number;
  // Dome
  domeRadius?: number;
  domeHeight?: number;
  // Custom/Modular
  length?: number;
  width?: number;
  depth?: number;
  // Inflatable
  inflatedRadius?: number;
  inflatedHeight?: number;
}

// Mission parameters
export interface MissionParameters {
  crewSize: number;
  duration: number; // days
  destination: Destination;
  launchVehicle: LaunchVehicle;
  missionType: 'exploration' | 'research' | 'construction' | 'settlement';
  emergencyEvacuation: boolean;
}

// Functional module definition
export interface FunctionalModule {
  id: string;
  type: ModuleType;
  name: string;
  description: string;
  position: Vector3D;
  rotation: Quaternion;
  dimensions: {
    length: number;
    width: number;
    height: number;
  };
  volume: number; // m³
  mass: number; // kg
  powerRequirement: number; // kW
  crewCapacity: number;
  essential: boolean;
  adjacencyRequirements: string[]; // IDs of modules that should be adjacent
  adjacencyRestrictions: string[]; // IDs of modules that should not be adjacent
  accessRequirements: {
    directAccess: boolean;
    emergencyAccess: boolean;
    equipmentAccess: boolean;
  };
}

// Complete habitat design
export interface HabitatDesign {
  id: string;
  name: string;
  description: string;
  version: string;
  createdAt: Date;
  updatedAt: Date;
  author: string;
  
  // Basic parameters
  dimensions: HabitatDimensions;
  missionParameters: MissionParameters;
  
  // Modules and layout
  modules: FunctionalModule[];
  connections: Connection[];
  
  // Calculated properties
  totalVolume: number;
  pressurizedVolume: number;
  netHabitableVolume: number;
  totalMass: number;
  powerRequirement: number;
  
  // Validation results
  validationResults: ValidationResult[];
  complianceScore: number; // 0-100
  
  // Export settings
  exportFormat?: 'json' | 'obj' | 'stl' | 'pdf';
  shareSettings?: {
    public: boolean;
    collaborative: boolean;
    permissions: string[];
  };
}

// Module connections (airlocks, corridors, etc.)
export interface Connection {
  id: string;
  fromModuleId: string;
  toModuleId: string;
  type: 'corridor' | 'airlock' | 'hatch' | 'emergency';
  diameter: number; // meters
  length: number; // meters
  pressurized: boolean;
  bidirectional: boolean;
}

// Validation results
export interface ValidationResult {
  category: 'volume' | 'mass' | 'power' | 'safety' | 'accessibility' | 'adjacency';
  severity: 'error' | 'warning' | 'info';
  message: string;
  suggestion?: string;
  affectedModules?: string[];
  complianceStandard: string; // NASA standard reference
}

// Quantitative analysis results
export interface AnalysisResults {
  volumeAnalysis: {
    totalVolume: number;
    pressurizedVolume: number;
    netHabitableVolume: number;
    volumePerCrew: number;
    volumeUtilization: number; // percentage
    volumeByFunction: Record<ModuleType, number>;
  };
  
  massAnalysis: {
    totalMass: number;
    dryMass: number;
    consumablesMass: number;
    massPerCrew: number;
    massDistribution: Record<ModuleType, number>;
    centerOfMass: Vector3D;
  };
  
  accessibilityAnalysis: {
    averagePathLength: number;
    maxPathLength: number;
    emergencyEgressTime: number; // seconds
    bottlenecks: string[]; // module IDs
    deadEnds: string[]; // module IDs
  };
  
  adjacencyAnalysis: {
    satisfiedRequirements: number;
    violatedRequirements: number;
    optimalPlacements: number;
    suboptimalPlacements: number;
    recommendations: Array<{
      moduleId: string;
      suggestion: string;
      impact: 'high' | 'medium' | 'low';
    }>;
  };
  
  safetyAnalysis: {
    redundancyScore: number; // 0-100
    emergencyAccessScore: number; // 0-100
    structuralSafetyScore: number; // 0-100
    criticalSinglePoints: string[]; // module IDs
  };
}

// Zod schemas for validation
export const Vector3DSchema = z.object({
  x: z.number(),
  y: z.number(),
  z: z.number(),
});

export const QuaternionSchema = z.object({
  x: z.number(),
  y: z.number(),
  z: z.number(),
  w: z.number(),
});

export const HabitatDimensionsSchema = z.object({
  shape: z.nativeEnum(HabitatShape),
  radius: z.number().positive().optional(),
  height: z.number().positive().optional(),
  sphereRadius: z.number().positive().optional(),
  majorRadius: z.number().positive().optional(),
  minorRadius: z.number().positive().optional(),
  domeRadius: z.number().positive().optional(),
  domeHeight: z.number().positive().optional(),
  length: z.number().positive().optional(),
  width: z.number().positive().optional(),
  depth: z.number().positive().optional(),
  inflatedRadius: z.number().positive().optional(),
  inflatedHeight: z.number().positive().optional(),
});

export const MissionParametersSchema = z.object({
  crewSize: z.number().int().min(1).max(20),
  duration: z.number().int().min(1).max(10000),
  destination: z.nativeEnum(Destination),
  launchVehicle: z.nativeEnum(LaunchVehicle),
  missionType: z.enum(['exploration', 'research', 'construction', 'settlement']),
  emergencyEvacuation: z.boolean(),
});

export const FunctionalModuleSchema = z.object({
  id: z.string(),
  type: z.nativeEnum(ModuleType),
  name: z.string().min(1).max(100),
  description: z.string().max(500),
  position: Vector3DSchema,
  rotation: QuaternionSchema,
  dimensions: z.object({
    length: z.number().positive(),
    width: z.number().positive(),
    height: z.number().positive(),
  }),
  volume: z.number().positive(),
  mass: z.number().positive(),
  powerRequirement: z.number().nonnegative(),
  crewCapacity: z.number().int().nonnegative(),
  essential: z.boolean(),
  adjacencyRequirements: z.array(z.string()),
  adjacencyRestrictions: z.array(z.string()),
  accessRequirements: z.object({
    directAccess: z.boolean(),
    emergencyAccess: z.boolean(),
    equipmentAccess: z.boolean(),
  }),
});

export const HabitatDesignSchema = z.object({
  id: z.string(),
  name: z.string().min(1).max(100),
  description: z.string().max(1000),
  version: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
  author: z.string().min(1).max(100),
  dimensions: HabitatDimensionsSchema,
  missionParameters: MissionParametersSchema,
  modules: z.array(FunctionalModuleSchema),
  connections: z.array(z.object({
    id: z.string(),
    fromModuleId: z.string(),
    toModuleId: z.string(),
    type: z.enum(['corridor', 'airlock', 'hatch', 'emergency']),
    diameter: z.number().positive(),
    length: z.number().positive(),
    pressurized: z.boolean(),
    bidirectional: z.boolean(),
  })),
  totalVolume: z.number().positive(),
  pressurizedVolume: z.number().positive(),
  netHabitableVolume: z.number().positive(),
  totalMass: z.number().positive(),
  powerRequirement: z.number().nonnegative(),
  validationResults: z.array(z.object({
    category: z.enum(['volume', 'mass', 'power', 'safety', 'accessibility', 'adjacency']),
    severity: z.enum(['error', 'warning', 'info']),
    message: z.string(),
    suggestion: z.string().optional(),
    affectedModules: z.array(z.string()).optional(),
    complianceStandard: z.string(),
  })),
  complianceScore: z.number().min(0).max(100),
});

// Type exports for runtime use - already exported as interfaces above