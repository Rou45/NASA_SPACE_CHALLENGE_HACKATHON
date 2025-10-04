/**
 * NASA Space Habitat Design Standards and Requirements
 * Based on NASA-STD-3001 and Artemis/Mars mission requirements
 */

// NASA Standard Volume Requirements (m³ per astronaut)
export const NASA_VOLUME_STANDARDS = {
  // Net Habitable Volume per crew member
  NHV_PER_CREW_MINIMUM: 25, // m³ - absolute minimum
  NHV_PER_CREW_OPTIMAL: 75, // m³ - optimal for long-duration missions
  NHV_PER_CREW_LUXURY: 150, // m³ - highly comfortable

  // Specific functional area requirements
  SLEEP_VOLUME_PER_CREW: 2.5, // m³ - private sleep quarters
  HYGIENE_VOLUME_PER_CREW: 1.5, // m³ - personal hygiene
  WORK_VOLUME_PER_CREW: 8, // m³ - workspace per person
  EXERCISE_VOLUME_MINIMUM: 15, // m³ - shared exercise area
  FOOD_PREP_VOLUME: 12, // m³ - galley/food preparation
  MEDICAL_VOLUME_MINIMUM: 8, // m³ - medical bay
  COMMON_AREA_PER_CREW: 10, // m³ - recreational/common space
} as const;

// Mission Duration Categories (days)
export const MISSION_DURATIONS = {
  SHORT_TERM: { min: 1, max: 30, label: 'Short-term (≤30 days)' },
  MEDIUM_TERM: { min: 31, max: 180, label: 'Medium-term (31-180 days)' },
  LONG_TERM: { min: 181, max: 500, label: 'Long-term (181-500 days)' },
  EXTENDED: { min: 501, max: 1000, label: 'Extended (501+ days)' },
  PERMANENT: { min: 1001, max: Infinity, label: 'Permanent Settlement' },
} as const;

// Launch Vehicle Payload Fairing Constraints (meters)
export const PAYLOAD_FAIRINGS = {
  FALCON_HEAVY: {
    diameter: 5.2,
    height: 13.1,
    volume: 145, // m³
    mass_limit: 26700, // kg to LEO
    label: 'SpaceX Falcon Heavy',
  },
  SLS_BLOCK_1: {
    diameter: 5.0,
    height: 19.1,
    volume: 374, // m³
    mass_limit: 27000, // kg to TLI
    label: 'NASA SLS Block 1',
  },
  SLS_BLOCK_2: {
    diameter: 8.4,
    height: 19.1,
    volume: 1058, // m³
    mass_limit: 45000, // kg to TLI
    label: 'NASA SLS Block 2 (Future)',
  },
  STARSHIP: {
    diameter: 9.0,
    height: 18.0,
    volume: 1100, // m³
    mass_limit: 150000, // kg to LEO
    label: 'SpaceX Starship',
  },
} as const;

// Destination Environment Constraints
export const DESTINATION_ENVIRONMENTS = {
  LEO: {
    gravity: 0, // microgravity
    radiation_protection_required: true,
    temperature_range: [-157, 121], // °C
    pressure_differential: 101.325, // kPa (full atmosphere vs vacuum)
    label: 'Low Earth Orbit',
  },
  LUNAR_ORBIT: {
    gravity: 0, // microgravity
    radiation_protection_required: true,
    temperature_range: [-230, 123], // °C
    pressure_differential: 101.325,
    label: 'Lunar Orbit',
  },
  LUNAR_SURFACE: {
    gravity: 1.62, // m/s²
    radiation_protection_required: true,
    temperature_range: [-230, 123], // °C
    pressure_differential: 101.325,
    label: 'Lunar Surface',
  },
  MARS_ORBIT: {
    gravity: 0, // microgravity
    radiation_protection_required: true,
    temperature_range: [-125, 20], // °C
    pressure_differential: 100.725, // kPa (Earth pressure - Mars pressure)
    label: 'Mars Orbit',
  },
  MARS_SURFACE: {
    gravity: 3.71, // m/s²
    radiation_protection_required: true,
    temperature_range: [-125, 20], // °C
    pressure_differential: 100.725,
    label: 'Mars Surface',
  },
  DEEP_SPACE: {
    gravity: 0, // microgravity
    radiation_protection_required: true,
    temperature_range: [-270, 127], // °C
    pressure_differential: 101.325,
    label: 'Deep Space',
  },
} as const;

// Crew Size Constraints
export const CREW_CONSTRAINTS = {
  MIN_CREW: 2, // minimum viable crew
  OPTIMAL_CREW: 4, // optimal crew size for most missions
  MAX_CREW_SMALL: 6, // maximum for small habitats
  MAX_CREW_LARGE: 12, // maximum for large habitats
  ISOLATION_FACTOR: 1.5, // volume multiplier for psychological well-being
} as const;

// Air Quality and Life Support Standards
export const LIFE_SUPPORT_STANDARDS = {
  OXYGEN_PARTIAL_PRESSURE: { min: 16.0, max: 23.0 }, // kPa
  CO2_MAX_LEVEL: 0.7, // kPa
  TEMPERATURE_RANGE: { min: 18.3, max: 26.7 }, // °C
  HUMIDITY_RANGE: { min: 25, max: 75 }, // %RH
  AIR_VELOCITY_MAX: 0.76, // m/s
  NOISE_LEVEL_MAX: 60, // dB(A) during sleep periods
} as const;

// Structural Safety Factors
export const SAFETY_FACTORS = {
  PRESSURE_VESSEL: 4.0, // safety factor for pressure containment
  STRUCTURAL_LOAD: 2.0, // safety factor for structural loads
  MICROMETEORITE_PROTECTION: true, // requires MMOD shielding
  REDUNDANCY_REQUIREMENT: 2, // critical systems must have backup
} as const;

// Functional Module Types and Requirements
export const MODULE_TYPES = {
  COMMAND: {
    essential: true,
    min_volume: 15,
    max_occupancy: 8,
    description: 'Command and control center',
  },
  HABITATION: {
    essential: true,
    min_volume: 20,
    max_occupancy: 4,
    description: 'Living quarters and personal space',
  },
  LABORATORY: {
    essential: false,
    min_volume: 25,
    max_occupancy: 6,
    description: 'Science and research laboratory',
  },
  LOGISTICS: {
    essential: true,
    min_volume: 10,
    max_occupancy: 2,
    description: 'Storage and supply management',
  },
  EXERCISE: {
    essential: true,
    min_volume: 15,
    max_occupancy: 2,
    description: 'Exercise and fitness equipment',
  },
  MEDICAL: {
    essential: true,
    min_volume: 8,
    max_occupancy: 3,
    description: 'Medical bay and health monitoring',
  },
  AIRLOCK: {
    essential: true,
    min_volume: 6,
    max_occupancy: 2,
    description: 'EVA preparation and equipment',
  },
  GREENHOUSE: {
    essential: false,
    min_volume: 20,
    max_occupancy: 4,
    description: 'Food production and life support',
  },
} as const;

// Mass Budget Guidelines (kg/m³)
export const MASS_BUDGETS = {
  STRUCTURE_DENSITY: 150, // kg/m³ - habitat structure
  EQUIPMENT_DENSITY: 300, // kg/m³ - equipment and systems
  CONSUMABLES_PER_CREW_PER_DAY: 3.5, // kg - food, water, oxygen
  WASTE_PER_CREW_PER_DAY: 2.8, // kg - waste generation
} as const;