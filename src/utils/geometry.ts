import { HabitatShape, HabitatDimensions } from '../types/habitat';

/**
 * Mathematical calculations for habitat geometry and volume
 * Based on standard geometric formulas with engineering precision
 */

export class HabitatGeometry {
  /**
   * Calculate total volume for different habitat shapes
   */
  static calculateVolume(dimensions: HabitatDimensions): number {
    switch (dimensions.shape) {
      case HabitatShape.CYLINDER:
        const radius = dimensions.radius || 4.0; // Default radius
        const height = dimensions.height || 12.0; // Default height
        if (radius <= 0 || height <= 0) {
          throw new Error('Cylinder requires positive radius and height values');
        }
        return Math.PI * Math.pow(radius, 2) * height;

      case HabitatShape.SPHERE:
        const sphereRadius = dimensions.sphereRadius || 5.0;
        if (sphereRadius <= 0) {
          throw new Error('Sphere requires positive sphereRadius');
        }
        return (4 / 3) * Math.PI * Math.pow(sphereRadius, 3);

      case HabitatShape.TORUS:
        const majorRadius = dimensions.majorRadius || 8.0;
        const minorRadius = dimensions.minorRadius || 3.0;
        if (majorRadius <= 0 || minorRadius <= 0) {
          throw new Error('Torus requires positive majorRadius and minorRadius');
        }
        return 2 * Math.pow(Math.PI, 2) * majorRadius * Math.pow(minorRadius, 2);

      case HabitatShape.DOME:
        const domeRadius = dimensions.domeRadius || 6.0;
        const domeHeight = dimensions.domeHeight || 4.0;
        if (domeRadius <= 0 || domeHeight <= 0) {
          throw new Error('Dome requires positive domeRadius and domeHeight');
        }
        // Spherical cap formula: V = π * h² * (3r - h) / 3
        const h = domeHeight;
        const r = domeRadius;
        return (Math.PI * h * h * (3 * r - h)) / 3;

      case HabitatShape.INFLATABLE:
        const inflatedRadius = dimensions.inflatedRadius || 4.0;
        const inflatedHeight = dimensions.inflatedHeight || 10.0;
        if (inflatedRadius <= 0 || inflatedHeight <= 0) {
          throw new Error('Inflatable requires positive inflatedRadius and inflatedHeight');
        }
        // Assuming cylindrical when inflated
        return Math.PI * Math.pow(inflatedRadius, 2) * inflatedHeight;

      case HabitatShape.MODULAR:
        const length = dimensions.length || 10.0;
        const width = dimensions.width || 8.0;
        const modularHeight = dimensions.height || 6.0;
        if (length <= 0 || width <= 0 || modularHeight <= 0) {
          throw new Error('Modular requires positive length, width, and height');
        }
        return length * width * modularHeight;

      default:
        throw new Error(`Unsupported habitat shape: ${dimensions.shape}`);
    }
  }

  /**
   * Calculate surface area for structural material requirements
   */
  static calculateSurfaceArea(dimensions: HabitatDimensions): number {
    switch (dimensions.shape) {
      case HabitatShape.CYLINDER:
        if (!dimensions.radius || !dimensions.height) {
          throw new Error('Cylinder requires radius and height');
        }
        // 2πr² + 2πrh (including end caps)
        const cylR = dimensions.radius;
        const cylH = dimensions.height;
        return 2 * Math.PI * cylR * (cylR + cylH);

      case HabitatShape.SPHERE:
        if (!dimensions.sphereRadius) {
          throw new Error('Sphere requires sphereRadius');
        }
        return 4 * Math.PI * Math.pow(dimensions.sphereRadius, 2);

      case HabitatShape.TORUS:
        if (!dimensions.majorRadius || !dimensions.minorRadius) {
          throw new Error('Torus requires majorRadius and minorRadius');
        }
        return 4 * Math.pow(Math.PI, 2) * dimensions.majorRadius * dimensions.minorRadius;

      case HabitatShape.DOME:
        if (!dimensions.domeRadius || !dimensions.domeHeight) {
          throw new Error('Dome requires domeRadius and domeHeight');
        }
        // Spherical cap surface area: 2πrh + πr²base
        const domeH = dimensions.domeHeight;
        const domeR = dimensions.domeRadius;
        const baseRadius = Math.sqrt(2 * domeR * domeH - domeH * domeH);
        return 2 * Math.PI * domeR * domeH + Math.PI * baseRadius * baseRadius;

      case HabitatShape.INFLATABLE:
        if (!dimensions.inflatedRadius || !dimensions.inflatedHeight) {
          throw new Error('Inflatable requires inflatedRadius and inflatedHeight');
        }
        const ir = dimensions.inflatedRadius;
        const ih = dimensions.inflatedHeight;
        return 2 * Math.PI * ir * (ir + ih);

      case HabitatShape.MODULAR:
        if (!dimensions.length || !dimensions.width || !dimensions.height) {
          throw new Error('Modular requires length, width, and height');
        }
        const l = dimensions.length;
        const w = dimensions.width;
        const hm = dimensions.height;
        return 2 * (l * w + l * hm + w * hm);

      default:
        throw new Error(`Unsupported habitat shape: ${dimensions.shape}`);
    }
  }

  /**
   * Calculate maximum diameter that fits in launch vehicle fairing
   */
  static getMaxDiameter(dimensions: HabitatDimensions, fairingDiameter: number): number {
    switch (dimensions.shape) {
      case HabitatShape.CYLINDER:
      case HabitatShape.INFLATABLE:
        return Math.min(dimensions.radius ? dimensions.radius * 2 : fairingDiameter, fairingDiameter);

      case HabitatShape.SPHERE:
        return Math.min(dimensions.sphereRadius ? dimensions.sphereRadius * 2 : fairingDiameter, fairingDiameter);

      case HabitatShape.TORUS:
        return Math.min(dimensions.majorRadius ? dimensions.majorRadius * 2 : fairingDiameter, fairingDiameter);

      case HabitatShape.DOME:
        return Math.min(dimensions.domeRadius ? dimensions.domeRadius * 2 : fairingDiameter, fairingDiameter);

      case HabitatShape.MODULAR:
        const maxDim = Math.max(dimensions.length || 0, dimensions.width || 0);
        return Math.min(maxDim, fairingDiameter);

      default:
        return fairingDiameter;
    }
  }

  /**
   * Calculate structural mass based on surface area and material properties
   */
  static calculateStructuralMass(
    dimensions: HabitatDimensions,
    wallThickness: number = 0.1, // meters
    materialDensity: number = 2700 // kg/m³ (aluminum)
  ): number {
    const surfaceArea = this.calculateSurfaceArea(dimensions);
    return surfaceArea * wallThickness * materialDensity;
  }

  /**
   * Calculate moment of inertia for structural analysis
   */
  static calculateMomentOfInertia(dimensions: HabitatDimensions): {
    Ixx: number;
    Iyy: number;
    Izz: number;
  } {
    const volume = this.calculateVolume(dimensions);
    const mass = volume * 1000; // assume 1000 kg/m³ average density

    switch (dimensions.shape) {
      case HabitatShape.CYLINDER:
        if (!dimensions.radius || !dimensions.height) {
          throw new Error('Cylinder requires radius and height');
        }
        const r = dimensions.radius;
        const h = dimensions.height;
        return {
          Ixx: (mass / 12) * (3 * r * r + h * h),
          Iyy: (mass / 12) * (3 * r * r + h * h),
          Izz: (mass / 2) * r * r,
        };

      case HabitatShape.SPHERE:
        if (!dimensions.sphereRadius) {
          throw new Error('Sphere requires sphereRadius');
        }
        const sphereI = (2 / 5) * mass * Math.pow(dimensions.sphereRadius, 2);
        return { Ixx: sphereI, Iyy: sphereI, Izz: sphereI };

      case HabitatShape.MODULAR:
        if (!dimensions.length || !dimensions.width || !dimensions.height) {
          throw new Error('Modular requires length, width, and height');
        }
        const l = dimensions.length;
        const w = dimensions.width;
        const hm = dimensions.height;
        return {
          Ixx: (mass / 12) * (w * w + hm * hm),
          Iyy: (mass / 12) * (l * l + hm * hm),
          Izz: (mass / 12) * (l * l + w * w),
        };

      default:
        // Approximate as sphere for other shapes
        const approxRadius = Math.pow((3 * volume) / (4 * Math.PI), 1 / 3);
        const approxI = (2 / 5) * mass * Math.pow(approxRadius, 2);
        return { Ixx: approxI, Iyy: approxI, Izz: approxI };
    }
  }

  /**
   * Check if habitat fits within launch vehicle constraints
   */
  static checkLaunchConstraints(
    dimensions: HabitatDimensions,
    fairingDiameter: number,
    fairingHeight: number,
    maxMass: number
  ): {
    fits: boolean;
    violations: string[];
    utilizationFactors: {
      diameter: number;
      height: number;
      mass: number;
    };
  } {
    const violations: string[] = [];
    const structuralMass = this.calculateStructuralMass(dimensions);
    const maxDiameter = this.getMaxDiameter(dimensions, fairingDiameter);

    // Check diameter constraint
    const diameterUtilization = maxDiameter / fairingDiameter;
    if (diameterUtilization > 1.0) {
      violations.push(`Habitat diameter (${maxDiameter.toFixed(2)}m) exceeds fairing diameter (${fairingDiameter}m)`);
    }

    // Check height constraint
    const habitatHeight = this.getEffectiveHeight(dimensions);
    const heightUtilization = habitatHeight / fairingHeight;
    if (heightUtilization > 1.0) {
      violations.push(`Habitat height (${habitatHeight.toFixed(2)}m) exceeds fairing height (${fairingHeight}m)`);
    }

    // Check mass constraint
    const massUtilization = structuralMass / maxMass;
    if (massUtilization > 1.0) {
      violations.push(`Structural mass (${(structuralMass / 1000).toFixed(1)}t) exceeds launch capacity (${(maxMass / 1000).toFixed(1)}t)`);
    }

    return {
      fits: violations.length === 0,
      violations,
      utilizationFactors: {
        diameter: Math.min(diameterUtilization, 1.0),
        height: Math.min(heightUtilization, 1.0),
        mass: Math.min(massUtilization, 1.0),
      },
    };
  }

  /**
   * Get effective height for launch constraint checking
   */
  private static getEffectiveHeight(dimensions: HabitatDimensions): number {
    switch (dimensions.shape) {
      case HabitatShape.CYLINDER:
      case HabitatShape.INFLATABLE:
        return dimensions.height || dimensions.inflatedHeight || 0;

      case HabitatShape.SPHERE:
        return dimensions.sphereRadius ? dimensions.sphereRadius * 2 : 0;

      case HabitatShape.TORUS:
        return dimensions.minorRadius ? dimensions.minorRadius * 2 : 0;

      case HabitatShape.DOME:
        return dimensions.domeHeight || 0;

      case HabitatShape.MODULAR:
        return dimensions.height || 0;

      default:
        return 0;
    }
  }

  /**
   * Generate recommended dimensions based on mission parameters
   */
  static generateRecommendedDimensions(
    shape: HabitatShape,
    targetVolume: number,
    aspectRatio: number = 2.0 // height/diameter for cylinders
  ): HabitatDimensions {
    switch (shape) {
      case HabitatShape.CYLINDER:
        // V = πr²h, with h = aspectRatio * 2r
        const cylinderRadius = Math.pow(targetVolume / (2 * Math.PI * aspectRatio), 1 / 3);
        return {
          shape,
          radius: cylinderRadius,
          height: aspectRatio * 2 * cylinderRadius,
        };

      case HabitatShape.SPHERE:
        // V = (4/3)πr³
        const sphereRadius = Math.pow((3 * targetVolume) / (4 * Math.PI), 1 / 3);
        return {
          shape,
          sphereRadius,
        };

      case HabitatShape.MODULAR:
        // Assume cubic proportions by default
        const sideLength = Math.pow(targetVolume, 1 / 3);
        return {
          shape,
          length: sideLength,
          width: sideLength,
          height: sideLength,
        };

      default:
        throw new Error(`Recommended dimensions not implemented for ${shape}`);
    }
  }
}