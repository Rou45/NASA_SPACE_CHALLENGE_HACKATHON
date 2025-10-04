import { HabitatDesign, ValidationResult, MissionParameters, FunctionalModule } from '../types/habitat';
import { 
  NASA_VOLUME_STANDARDS, 
  MISSION_DURATIONS, 
  PAYLOAD_FAIRINGS, 
  CREW_CONSTRAINTS,
  LIFE_SUPPORT_STANDARDS,
  MODULE_TYPES 
} from '../constants/nasa-standards';
import { HabitatGeometry } from './geometry';

/**
 * Comprehensive validation engine for NASA habitat design standards
 * Implements real NASA requirements and engineering constraints
 */
export class HabitatValidator {
  /**
   * Validate complete habitat design against all NASA standards
   */
  static validateDesign(design: HabitatDesign): ValidationResult[] {
    const results: ValidationResult[] = [];

    // Volume and space requirements
    results.push(...this.validateVolumeRequirements(design));
    
    // Launch vehicle constraints
    results.push(...this.validateLaunchConstraints(design));
    
    // Crew and mission requirements
    results.push(...this.validateCrewRequirements(design));
    
    // Safety and accessibility
    results.push(...this.validateSafetyRequirements(design));
    
    // Module placement and adjacency
    results.push(...this.validateModuleRequirements(design));
    
    // Life support requirements
    results.push(...this.validateLifeSupportRequirements(design));

    return results;
  }

  /**
   * Validate volume requirements per NASA standards
   */
  private static validateVolumeRequirements(design: HabitatDesign): ValidationResult[] {
    const results: ValidationResult[] = [];
    const crewSize = design.missionParameters.crewSize;
    const duration = design.missionParameters.duration;
    
    // Calculate required volumes
    const requiredNHV = this.calculateRequiredNHV(crewSize, duration);
    const actualNHV = design.netHabitableVolume;
    
    // Check minimum volume requirements
    if (actualNHV < requiredNHV.minimum) {
      results.push({
        category: 'volume',
        severity: 'error',
        message: `Net Habitable Volume (${actualNHV.toFixed(1)}m³) is below NASA minimum requirement (${requiredNHV.minimum.toFixed(1)}m³)`,
        suggestion: `Increase habitat volume by ${(requiredNHV.minimum - actualNHV).toFixed(1)}m³ or reduce crew size`,
        complianceStandard: 'NASA-STD-3001-V1',
      });
    } else if (actualNHV < requiredNHV.optimal) {
      results.push({
        category: 'volume',
        severity: 'warning',
        message: `Net Habitable Volume is below optimal requirement (${requiredNHV.optimal.toFixed(1)}m³)`,
        suggestion: 'Consider increasing volume for crew comfort and mission success',
        complianceStandard: 'NASA-STD-3001-V1',
      });
    }

    // Check volume per crew member
    const volumePerCrew = actualNHV / crewSize;
    if (volumePerCrew < NASA_VOLUME_STANDARDS.NHV_PER_CREW_MINIMUM) {
      results.push({
        category: 'volume',
        severity: 'error',
        message: `Volume per crew member (${volumePerCrew.toFixed(1)}m³) is below minimum (${NASA_VOLUME_STANDARDS.NHV_PER_CREW_MINIMUM}m³)`,
        suggestion: 'Increase habitat volume or reduce crew size',
        complianceStandard: 'NASA-STD-3001-V1',
      });
    }

    // Validate functional area volumes
    results.push(...this.validateFunctionalAreaVolumes(design));

    return results;
  }

  /**
   * Validate launch vehicle payload constraints
   */
  private static validateLaunchConstraints(design: HabitatDesign): ValidationResult[] {
    const results: ValidationResult[] = [];
    const launchVehicle = design.missionParameters.launchVehicle;
    const fairing = PAYLOAD_FAIRINGS[launchVehicle.toUpperCase() as keyof typeof PAYLOAD_FAIRINGS];
    
    if (!fairing) {
      results.push({
        category: 'mass',
        severity: 'error',
        message: `Unknown launch vehicle: ${launchVehicle}`,
        suggestion: 'Select a valid launch vehicle',
        complianceStandard: 'Launch Vehicle Specifications',
      });
      return results;
    }

    // Check dimensional constraints
    const constraints = HabitatGeometry.checkLaunchConstraints(
      design.dimensions,
      fairing.diameter,
      fairing.height,
      fairing.mass_limit
    );

    if (!constraints.fits) {
      constraints.violations.forEach(violation => {
        results.push({
          category: 'mass',
          severity: 'error',
          message: violation,
          suggestion: 'Reduce habitat size or select larger launch vehicle',
          complianceStandard: `${fairing.label} Specifications`,
        });
      });
    }

    // Check utilization efficiency
    const avgUtilization = (constraints.utilizationFactors.diameter + 
                           constraints.utilizationFactors.height + 
                           constraints.utilizationFactors.mass) / 3;
    
    if (avgUtilization < 0.6) {
      results.push({
        category: 'volume',
        severity: 'info',
        message: `Low fairing utilization (${(avgUtilization * 100).toFixed(1)}%). Consider optimizing dimensions.`,
        suggestion: 'Increase habitat size to better utilize launch capacity',
        complianceStandard: 'Launch Efficiency Guidelines',
      });
    }

    return results;
  }

  /**
   * Validate crew and mission-specific requirements
   */
  private static validateCrewRequirements(design: HabitatDesign): ValidationResult[] {
    const results: ValidationResult[] = [];
    const mission = design.missionParameters;
    
    // Check crew size limits
    if (mission.crewSize < CREW_CONSTRAINTS.MIN_CREW) {
      results.push({
        category: 'safety',
        severity: 'error',
        message: `Crew size (${mission.crewSize}) is below minimum safe crew (${CREW_CONSTRAINTS.MIN_CREW})`,
        suggestion: 'Increase crew size for mission safety and redundancy',
        complianceStandard: 'NASA-STD-3001-V2',
      });
    }

    if (mission.crewSize > CREW_CONSTRAINTS.MAX_CREW_LARGE) {
      results.push({
        category: 'volume',
        severity: 'warning',
        message: `Large crew size (${mission.crewSize}) may require multiple habitat modules`,
        suggestion: 'Consider modular habitat design or crew rotation',
        complianceStandard: 'Crew Operations Guidelines',
      });
    }

    // Mission duration analysis
    const durationCategory = this.getMissionDurationCategory(mission.duration);
    if (durationCategory === 'EXTENDED' || durationCategory === 'PERMANENT') {
      const hasGreenhouse = design.modules.some(m => m.type === 'greenhouse');
      if (!hasGreenhouse) {
        results.push({
          category: 'volume',
          severity: 'warning',
          message: 'Long-duration missions should include food production capability',
          suggestion: 'Add greenhouse/hydroponic module for food sustainability',
          complianceStandard: 'Long-Duration Mission Requirements',
        });
      }
    }

    return results;
  }

  /**
   * Validate safety and emergency requirements
   */
  private static validateSafetyRequirements(design: HabitatDesign): ValidationResult[] {
    const results: ValidationResult[] = [];
    
    // Check for essential modules
    const essentialModules = Object.entries(MODULE_TYPES)
      .filter(([_, config]) => config.essential)
      .map(([type, _]) => type.toLowerCase());

    const presentModules = design.modules.map(m => m.type);
    const missingEssential = essentialModules.filter(type => 
      !presentModules.includes(type as any)
    );

    missingEssential.forEach(moduleType => {
      results.push({
        category: 'safety',
        severity: 'error',
        message: `Missing essential module: ${moduleType}`,
        suggestion: `Add ${moduleType} module for mission safety`,
        complianceStandard: 'NASA-STD-3001-V2',
      });
    });

    // Check for multiple airlocks (redundancy)
    const airlocks = design.modules.filter(m => m.type === 'airlock');
    if (airlocks.length < 2 && design.missionParameters.duration > 30) {
      results.push({
        category: 'safety',
        severity: 'warning',
        message: 'Long-duration missions should have redundant airlocks',
        suggestion: 'Add secondary airlock for emergency egress',
        complianceStandard: 'Emergency Egress Requirements',
      });
    }

    // Check emergency evacuation capability
    if (design.missionParameters.emergencyEvacuation) {
      const totalEvacCapacity = airlocks.reduce((sum, airlock) => sum + airlock.crewCapacity, 0);
      if (totalEvacCapacity < design.missionParameters.crewSize) {
        results.push({
          category: 'safety',
          severity: 'error',
          message: 'Insufficient emergency evacuation capacity',
          suggestion: 'Increase airlock capacity or add emergency escape pods',
          complianceStandard: 'Emergency Evacuation Procedures',
        });
      }
    }

    return results;
  }

  /**
   * Validate module placement and adjacency requirements
   */
  private static validateModuleRequirements(design: HabitatDesign): ValidationResult[] {
    const results: ValidationResult[] = [];

    design.modules.forEach(module => {
      // Check adjacency requirements
      module.adjacencyRequirements.forEach(requiredId => {
        const hasConnection = design.connections.some(conn => 
          (conn.fromModuleId === module.id && conn.toModuleId === requiredId) ||
          (conn.toModuleId === module.id && conn.fromModuleId === requiredId)
        );

        if (!hasConnection) {
          const requiredModule = design.modules.find(m => m.id === requiredId);
          results.push({
            category: 'adjacency',
            severity: 'warning',
            message: `${module.name} should be adjacent to ${requiredModule?.name || requiredId}`,
            suggestion: 'Add connection or relocate modules for optimal workflow',
            affectedModules: [module.id, requiredId],
            complianceStandard: 'Habitat Layout Guidelines',
          });
        }
      });

      // Check adjacency restrictions
      module.adjacencyRestrictions.forEach(restrictedId => {
        const hasConnection = design.connections.some(conn => 
          (conn.fromModuleId === module.id && conn.toModuleId === restrictedId) ||
          (conn.toModuleId === module.id && conn.fromModuleId === restrictedId)
        );

        if (hasConnection) {
          const restrictedModule = design.modules.find(m => m.id === restrictedId);
          results.push({
            category: 'adjacency',
            severity: 'error',
            message: `${module.name} should not be adjacent to ${restrictedModule?.name || restrictedId}`,
            suggestion: 'Relocate modules to maintain safe separation',
            affectedModules: [module.id, restrictedId],
            complianceStandard: 'Safety Separation Requirements',
          });
        }
      });

      // Check module volume against type requirements
      const moduleConfig = MODULE_TYPES[module.type.toUpperCase() as keyof typeof MODULE_TYPES];
      if (moduleConfig && module.volume < moduleConfig.min_volume) {
        results.push({
          category: 'volume',
          severity: 'warning',
          message: `${module.name} volume (${module.volume.toFixed(1)}m³) is below recommended minimum (${moduleConfig.min_volume}m³)`,
          suggestion: 'Increase module size for optimal functionality',
          affectedModules: [module.id],
          complianceStandard: 'Module Design Standards',
        });
      }
    });

    return results;
  }

  /**
   * Validate life support and environmental requirements
   */
  private static validateLifeSupportRequirements(design: HabitatDesign): ValidationResult[] {
    const results: ValidationResult[] = [];
    
    // Check power requirements
    const totalPowerReq = design.modules.reduce((sum, module) => sum + module.powerRequirement, 0);
    const estimatedPowerCapacity = design.totalVolume * 2; // Rough estimate: 2kW per m³
    
    if (totalPowerReq > estimatedPowerCapacity) {
      results.push({
        category: 'power',
        severity: 'warning',
        message: `Power requirement (${totalPowerReq.toFixed(1)}kW) may exceed capacity`,
        suggestion: 'Review power systems or reduce equipment power consumption',
        complianceStandard: 'Power System Requirements',
      });
    }

    // Check air handling capacity
    const crewSize = design.missionParameters.crewSize;
    const requiredAirflow = crewSize * 0.5; // m³/min per person
    const habitatVolume = design.totalVolume;
    const airChangeRate = (requiredAirflow * 60) / habitatVolume; // air changes per hour
    
    if (airChangeRate < 0.5) {
      results.push({
        category: 'safety',
        severity: 'warning',
        message: 'Low air circulation rate for crew size',
        suggestion: 'Increase air handling capacity or reduce habitat volume',
        complianceStandard: 'Air Quality Standards',
      });
    }

    return results;
  }

  /**
   * Calculate required Net Habitable Volume based on crew and mission
   */
  private static calculateRequiredNHV(crewSize: number, duration: number) {
    const basePerCrew = NASA_VOLUME_STANDARDS.NHV_PER_CREW_MINIMUM;
    const optimalPerCrew = NASA_VOLUME_STANDARDS.NHV_PER_CREW_OPTIMAL;
    
    // Add volume based on mission duration
    let durationMultiplier = 1.0;
    if (duration > 180) durationMultiplier = 1.2; // Long-term missions need more space
    if (duration > 500) durationMultiplier = 1.5; // Extended missions
    if (duration > 1000) durationMultiplier = 2.0; // Permanent settlements

    return {
      minimum: crewSize * basePerCrew * durationMultiplier,
      optimal: crewSize * optimalPerCrew * durationMultiplier,
    };
  }

  /**
   * Validate functional area volume requirements
   */
  private static validateFunctionalAreaVolumes(design: HabitatDesign): ValidationResult[] {
    const results: ValidationResult[] = [];
    const crewSize = design.missionParameters.crewSize;

    // Calculate required volumes for functional areas
    const requiredSleepVolume = crewSize * NASA_VOLUME_STANDARDS.SLEEP_VOLUME_PER_CREW;
    const requiredWorkVolume = crewSize * NASA_VOLUME_STANDARDS.WORK_VOLUME_PER_CREW;
    const requiredCommonVolume = crewSize * NASA_VOLUME_STANDARDS.COMMON_AREA_PER_CREW;

    // Calculate actual volumes by module type
    const actualSleepVolume = this.getVolumeByType(design.modules, 'habitation');
    const actualWorkVolume = this.getVolumeByType(design.modules, 'laboratory') + 
                             this.getVolumeByType(design.modules, 'command');
    const actualCommonVolume = this.getVolumeByType(design.modules, 'recreation');

    // Validate sleep areas
    if (actualSleepVolume < requiredSleepVolume) {
      results.push({
        category: 'volume',
        severity: 'warning',
        message: `Insufficient sleep area (${actualSleepVolume.toFixed(1)}m³ vs ${requiredSleepVolume.toFixed(1)}m³ required)`,
        suggestion: 'Increase habitation module size or add sleep quarters',
        complianceStandard: 'Crew Quarters Requirements',
      });
    }

    // Validate work areas
    if (actualWorkVolume < requiredWorkVolume) {
      results.push({
        category: 'volume',
        severity: 'warning',
        message: `Insufficient work space (${actualWorkVolume.toFixed(1)}m³ vs ${requiredWorkVolume.toFixed(1)}m³ required)`,
        suggestion: 'Increase laboratory or command module size',
        complianceStandard: 'Workspace Requirements',
      });
    }

    return results;
  }

  /**
   * Get total volume for specific module type
   */
  private static getVolumeByType(modules: FunctionalModule[], type: string): number {
    return modules
      .filter(module => module.type === type)
      .reduce((sum, module) => sum + module.volume, 0);
  }

  /**
   * Determine mission duration category
   */
  private static getMissionDurationCategory(duration: number): string {
    for (const [category, range] of Object.entries(MISSION_DURATIONS)) {
      if (duration >= range.min && duration <= range.max) {
        return category;
      }
    }
    return 'EXTENDED';
  }

  /**
   * Calculate overall compliance score (0-100)
   */
  static calculateComplianceScore(validationResults: ValidationResult[]): number {
    const totalDeductions = validationResults.reduce((sum, result) => {
      switch (result.severity) {
        case 'error': return sum + 15;
        case 'warning': return sum + 5;
        case 'info': return sum + 1;
        default: return sum;
      }
    }, 0);

    return Math.max(0, 100 - totalDeductions);
  }
}