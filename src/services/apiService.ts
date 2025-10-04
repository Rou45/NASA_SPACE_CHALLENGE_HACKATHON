/**
 * API Service Layer for Real-time Data Integration
 * Replace static constants with live API data
 */

// Configuration
const API_BASE_URL = (import.meta as any).env?.VITE_API_BASE_URL || 'https://api.nasa.gov';
const NASA_API_KEY = (import.meta as any).env?.VITE_NASA_API_KEY || '6yArgyys3noK0gyNAxU2eagKpupQ0E0KA7LYrFIN';
const NASA_IMAGES_API = (import.meta as any).env?.VITE_NASA_IMAGERY_API || 'https://images-api.nasa.gov';
const ISS_API = (import.meta as any).env?.VITE_ISS_API || 'http://api.open-notify.org';

// API Response Types
export interface NASAStandardsResponse {
  volumeRequirements: {
    nhvPerCrewMinimum: number;
    nhvPerCrewOptimal: number;
    sleepVolumePerCrew: number;
    workVolumePerCrew: number;
    exerciseVolumeMinimum: number;
  };
  lifeSupportStandards: {
    oxygenPartialPressure: { min: number; max: number };
    co2MaxLevel: number;
    temperatureRange: { min: number; max: number };
    humidityRange: { min: number; max: number };
  };
  safetyFactors: {
    pressureVessel: number;
    structuralLoad: number;
    redundancyRequirement: number;
  };
}

export interface LaunchVehicleResponse {
  id: string;
  name: string;
  specifications: {
    diameter: number;
    height: number;
    volume: number;
    massLimit: number;
    destination: string[];
  };
  availability: {
    nextLaunch: string;
    costPerKg: number;
  };
}

export interface MaterialResponse {
  id: string;
  name: string;
  properties: {
    density: number; // kg/m³
    strength: number; // MPa
    thermalConductivity: number;
    radiation_resistance: number;
  };
  cost: number;
  availability: boolean;
}

export interface EnvironmentResponse {
  destination: string;
  current_conditions: {
    gravity: number;
    temperature: number;
    radiation_level: number;
    pressure: number;
  };
  forecast: Array<{
    date: string;
    temperature_range: [number, number];
    radiation_level: number;
  }>;
}

export interface CommunityDesignResponse {
  id: string;
  name: string;
  description: string;
  author: string;
  rating: number;
  downloads: number;
  design_data: any; // Full HabitatDesign object
  created_at: string;
  updated_at: string;
}

/**
 * API Service Class
 */
export class APIService {
  private static async fetchWithAuth(url: string, options: RequestInit = {}) {
    const headers = {
      'Content-Type': 'application/json',
      'X-API-Key': NASA_API_KEY,
      ...options.headers,
    };

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  // 1. NASA Standards API
  static async getNASAStandards(): Promise<NASAStandardsResponse> {
    try {
      const response = await this.fetchWithAuth(`${API_BASE_URL}/nasa-standards`);
      return response;
    } catch (error) {
      console.error('Failed to fetch NASA standards:', error);
      // Fallback to static data
      return this.getFallbackNASAStandards();
    }
  }

  // 2. Launch Vehicles API
  static async getLaunchVehicles(): Promise<LaunchVehicleResponse[]> {
    try {
      const response = await this.fetchWithAuth(`${API_BASE_URL}/launch-vehicles`);
      return response;
    } catch (error) {
      console.error('Failed to fetch launch vehicles:', error);
      return this.getFallbackLaunchVehicles();
    }
  }

  static async getLaunchVehicleById(id: string): Promise<LaunchVehicleResponse> {
    try {
      const response = await this.fetchWithAuth(`${API_BASE_URL}/launch-vehicles/${id}`);
      return response;
    } catch (error) {
      console.error(`Failed to fetch launch vehicle ${id}:`, error);
      throw error;
    }
  }

  // 3. Materials API
  static async getMaterials(): Promise<MaterialResponse[]> {
    try {
      const response = await this.fetchWithAuth(`${API_BASE_URL}/materials`);
      return response;
    } catch (error) {
      console.error('Failed to fetch materials:', error);
      return this.getFallbackMaterials();
    }
  }

  // 4. Environment API - Real-time orbital/surface conditions
  static async getEnvironmentData(destination: string): Promise<EnvironmentResponse> {
    try {
      const response = await this.fetchWithAuth(
        `${API_BASE_URL}/environment/${destination.toLowerCase()}`
      );
      return response;
    } catch (error) {
      console.error(`Failed to fetch environment data for ${destination}:`, error);
      return this.getFallbackEnvironmentData(destination);
    }
  }

  // 5. Community Designs API
  static async getCommunityDesigns(limit = 10, offset = 0): Promise<CommunityDesignResponse[]> {
    try {
      const response = await this.fetchWithAuth(
        `${API_BASE_URL}/community-designs?limit=${limit}&offset=${offset}`
      );
      return response;
    } catch (error) {
      console.error('Failed to fetch community designs:', error);
      return [];
    }
  }

  static async submitDesign(design: any): Promise<{ id: string; status: string }> {
    try {
      const response = await this.fetchWithAuth(`${API_BASE_URL}/community-designs`, {
        method: 'POST',
        body: JSON.stringify(design),
      });
      return response;
    } catch (error) {
      console.error('Failed to submit design:', error);
      throw error;
    }
  }

  // 6. Real-time ISS Position (NASA API)
  static async getISSPosition(): Promise<{ latitude: number; longitude: number; altitude: number }> {
    try {
      const response = await fetch('http://api.open-notify.org/iss-now.json');
      const data = await response.json();
      return {
        latitude: parseFloat(data.iss_position.latitude),
        longitude: parseFloat(data.iss_position.longitude),
        altitude: 408, // Average ISS altitude in km
      };
    } catch (error) {
      console.error('Failed to fetch ISS position:', error);
      return { latitude: 0, longitude: 0, altitude: 408 };
    }
  }

  // 7. NASA APOD (Astronomy Picture of the Day)
  static async getAPOD(): Promise<any> {
    try {
      console.log('Fetching APOD with API key:', NASA_API_KEY.substring(0, 8) + '...');
      const url = `https://api.nasa.gov/planetary/apod?api_key=${NASA_API_KEY}`;
      console.log('APOD URL:', url);
      
      const response = await fetch(url);
      console.log('APOD response status:', response.status, response.statusText);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('APOD data received:', data);
      return data;
    } catch (error) {
      console.error('Failed to fetch APOD:', error);
      return null;
    }
  }

  // 8. NASA Near Earth Object Web Service (NEO)
  static async getNearEarthObjects(): Promise<any> {
    try {
      const today = new Date().toISOString().split('T')[0];
      const response = await fetch(
        `https://api.nasa.gov/neo/rest/v1/feed?start_date=${today}&end_date=${today}&api_key=${NASA_API_KEY}`
      );
      return response.json();
    } catch (error) {
      console.error('Failed to fetch NEO data:', error);
      return null;
    }
  }

  // 9. NASA Mars Weather Service
  static async getMarsWeather(): Promise<any> {
    try {
      const response = await fetch(`https://api.nasa.gov/insight_weather/?api_key=${NASA_API_KEY}&feedtype=json&ver=1.0`);
      return response.json();
    } catch (error) {
      console.error('Failed to fetch Mars weather:', error);
      return null;
    }
  }

  // 10. NASA Earth Imagery
  static async getEarthImagery(lat: number, lon: number, date?: string): Promise<any> {
    try {
      const dateParam = date || new Date().toISOString().split('T')[0];
      console.log('Fetching Earth imagery for:', { lat, lon, date: dateParam });
      
      const url = `https://api.nasa.gov/planetary/earth/imagery?lon=${lon}&lat=${lat}&date=${dateParam}&api_key=${NASA_API_KEY}`;
      console.log('Earth imagery URL:', url);
      
      const response = await fetch(url);
      console.log('Earth imagery response status:', response.status, response.statusText);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return response.blob();
    } catch (error) {
      console.error('Failed to fetch Earth imagery:', error);
      return null;
    }
  }

  // 11. NASA Exoplanet Archive
  static async getExoplanets(): Promise<any> {
    try {
      const response = await fetch(
        `https://exoplanetarchive.ipac.caltech.edu/TAP/sync?query=select+pl_name,pl_orbper,pl_bmasse,st_dist+from+ps+where+default_flag=1&format=json`
      );
      return response.json();
    } catch (error) {
      console.error('Failed to fetch exoplanet data:', error);
      return null;
    }
  }

  // 12. NASA Solar System Dynamics (SSD) API
  static async getPlanetaryData(): Promise<any> {
    try {
      // Get current planetary positions
      const response = await fetch(
        'https://ssd-api.jpl.nasa.gov/horizons.api?format=json&COMMAND=\'499\'&OBJ_DATA=\'YES\'&MAKE_EPHEM=\'YES\'&EPHEM_TYPE=\'OBSERVER\'&CENTER=\'500@399\'&START_TIME=\'2025-10-04\'&STOP_TIME=\'2025-10-05\'&STEP_SIZE=\'1d\''
      );
      return response.json();
    } catch (error) {
      console.error('Failed to fetch planetary data:', error);
      return null;
    }
  }

  // Fallback methods (use your existing static data)
  private static getFallbackNASAStandards(): NASAStandardsResponse {
    return {
      volumeRequirements: {
        nhvPerCrewMinimum: 25,
        nhvPerCrewOptimal: 75,
        sleepVolumePerCrew: 2.5,
        workVolumePerCrew: 8,
        exerciseVolumeMinimum: 15,
      },
      lifeSupportStandards: {
        oxygenPartialPressure: { min: 16.0, max: 23.0 },
        co2MaxLevel: 0.7,
        temperatureRange: { min: 18.3, max: 26.7 },
        humidityRange: { min: 25, max: 75 },
      },
      safetyFactors: {
        pressureVessel: 4.0,
        structuralLoad: 2.0,
        redundancyRequirement: 2,
      },
    };
  }

  private static getFallbackLaunchVehicles(): LaunchVehicleResponse[] {
    return [
      {
        id: 'falcon_heavy',
        name: 'SpaceX Falcon Heavy',
        specifications: {
          diameter: 5.2,
          height: 13.1,
          volume: 145,
          massLimit: 26700,
          destination: ['LEO', 'GTO', 'Mars'],
        },
        availability: {
          nextLaunch: '2025-12-01',
          costPerKg: 1400,
        },
      },
      // Add more vehicles...
    ];
  }

  private static getFallbackMaterials(): MaterialResponse[] {
    return [
      {
        id: 'aluminum_6061',
        name: 'Aluminum 6061-T6',
        properties: {
          density: 2700,
          strength: 310,
          thermalConductivity: 167,
          radiation_resistance: 0.8,
        },
        cost: 2.5,
        availability: true,
      },
      // Add more materials...
    ];
  }

  private static getFallbackEnvironmentData(destination: string): EnvironmentResponse {
    const environments: { [key: string]: EnvironmentResponse } = {
      'lunar_surface': {
        destination: 'lunar_surface',
        current_conditions: {
          gravity: 1.62,
          temperature: -20,
          radiation_level: 0.7,
          pressure: 0,
        },
        forecast: [],
      },
      // Add more destinations...
    };
    
    return environments[destination] || environments['lunar_surface'];
  }
}

export default APIService;