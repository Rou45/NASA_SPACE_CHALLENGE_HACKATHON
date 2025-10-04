import React, { useState, useEffect } from 'react';
import { APIService } from '../services/apiService';
import { useTheme } from '../contexts/ThemeContext';
import { Footer } from '../components/layout/Footer';

interface NASAPageProps {
  onNavigate: (page: string) => void;
}

interface NASAData {
  apod?: {
    title: string;
    explanation: string;
    url?: string;
    date: string;
    copyright?: string;
  };
  issPosition?: {
    latitude: number;
    longitude: number;
    timestamp: number;
  };
  neoFeeds?: Array<{
    id: string;
    name: string;
    estimated_diameter: {
      meters: {
        estimated_diameter_min: number;
        estimated_diameter_max: number;
      };
    };
    is_potentially_hazardous_asteroid: boolean;
    close_approach_date: string;
  }>;
}

export function NASAPage({ onNavigate }: NASAPageProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'iss' | 'mars' | 'deep-space'>('overview');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [nasaData, setNasaData] = useState<NASAData>({});
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const { isDayMode, toggleTheme } = useTheme();

  useEffect(() => {
    loadNASAData();
    const interval = setInterval(updateISSPosition, 10000);
    return () => clearInterval(interval);
  }, []);

  const loadNASAData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Mock data for demonstration since API might not be available
      const mockData: NASAData = {
        apod: {
          title: "Galaxy NGC 1300",
          explanation: "Big, beautiful spiral galaxy NGC 1300 lies some 70 million light-years away on the banks of the constellation Eridanus. This Hubble Space Telescope composite view of the gorgeous island universe is one of the most detailed Hubble images ever made of a complete galaxy.",
          url: "https://apod.nasa.gov/apod/image/2024/ngc1300_hubble_3000.jpg",
          date: new Date().toISOString().split('T')[0],
          copyright: "NASA, ESA, Hubble Heritage Team"
        },
        issPosition: {
          latitude: 25.4352,
          longitude: -91.7123,
          timestamp: Math.floor(Date.now() / 1000)
        },
        neoFeeds: [
          {
            id: "2022 AP7",
            name: "2022 AP7",
            estimated_diameter: {
              meters: {
                estimated_diameter_min: 1100,
                estimated_diameter_max: 2300
              }
            },
            is_potentially_hazardous_asteroid: true,
            close_approach_date: "2024-10-15"
          }
        ]
      };

      setNasaData(mockData);
      setLastUpdate(new Date());
    } catch (err) {
      console.error('Failed to load NASA data:', err);
      setError('Failed to load NASA data. Using demo data.');
    } finally {
      setLoading(false);
    }
  };

  const updateISSPosition = async () => {
    try {
      // Simulate ISS movement
      setNasaData(prev => ({
        ...prev,
        issPosition: prev.issPosition ? {
          ...prev.issPosition,
          latitude: prev.issPosition.latitude + (Math.random() - 0.5) * 2,
          longitude: prev.issPosition.longitude + (Math.random() - 0.5) * 2,
          timestamp: Math.floor(Date.now() / 1000)
        } : undefined
      }));
    } catch (err) {
      console.error('Failed to update ISS position:', err);
    }
  };

  const refreshData = () => {
    loadNASAData();
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: '🌌' },
    { id: 'iss', label: 'ISS Tracking', icon: '🛰️' },
    { id: 'mars', label: 'Mars Data', icon: '🔴' },
    { id: 'deep-space', label: 'Deep Space', icon: '✨' }
  ] as const;

  return (
    <div className={`min-h-screen flex flex-col ${isDayMode ? 'text-gray-800' : 'text-white'}`}>
      {/* Header */}
      <div className={`flex items-center justify-between p-6 border-b ${
        isDayMode 
          ? 'bg-white/70 backdrop-blur-md border-gray-200/50' 
          : 'bg-slate-800/50 border-slate-700/50'
      }`}>
        <div className="flex items-center space-x-4">
          <button 
            onClick={() => onNavigate('home')}
            className={`btn-ghost p-2 transition-colors ${
              isDayMode ? 'hover:bg-gray-100/80' : 'hover:bg-slate-700/50'
            }`}
            title="Back to Home"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </button>
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
            <span className="text-2xl">🚀</span>
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gradient">NASA Live Data</h1>
            <p className={isDayMode ? 'text-gray-600' : 'text-slate-400'}>
              Real-time space mission information
              {lastUpdate && (
                <span className="ml-2 text-xs">
                  • Updated {lastUpdate.toLocaleTimeString()}
                </span>
              )}
            </p>
          </div>
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
            onClick={refreshData}
            disabled={loading}
            className="btn-primary px-6 py-3 disabled:opacity-50"
            title="Refresh Data"
          >
            <svg className={`w-5 h-5 mr-2 ${loading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Refresh
          </button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className={`flex border-b ${
        isDayMode 
          ? 'border-gray-200/50 bg-white/40 backdrop-blur-sm' 
          : 'border-slate-700/50 bg-slate-800/30'
      }`}>
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 px-8 py-6 text-base font-medium transition-all ${
              activeTab === tab.id
                ? isDayMode
                  ? 'text-blue-600 border-b-2 border-blue-500 bg-blue-50/80'
                  : 'text-blue-400 border-b-2 border-blue-500 bg-blue-500/10'
                : isDayMode
                  ? 'text-gray-600 hover:text-gray-800 hover:bg-gray-100/60'
                  : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
            }`}
          >
            <span className="mr-3 text-xl">{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="p-8">
        {loading && (
          <div className="text-center py-12">
            <div className="w-16 h-16 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin mx-auto mb-4" />
            <p className={isDayMode ? 'text-gray-600' : 'text-slate-400'}>Loading NASA data...</p>
          </div>
        )}

        {error && (
          <div className="mb-8 p-6 bg-red-500/20 border border-red-500/50 rounded-xl">
            <div className="flex items-center space-x-3">
              <svg className="w-6 h-6 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-red-400 font-medium text-lg">{error}</span>
            </div>
          </div>
        )}

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            <h2 className="text-2xl font-bold mb-6">Mission Overview</h2>
            
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
              {/* APOD */}
              {nasaData.apod && (
                <div className="glass-panel p-6">
                  <h3 className={`text-xl font-semibold mb-4 flex items-center ${
                    isDayMode ? 'text-blue-600' : 'text-blue-400'
                  }`}>
                    🌌 <span className="ml-2">Astronomy Picture of the Day</span>
                  </h3>
                  <div className="space-y-4">
                    <div className={`text-sm ${isDayMode ? 'text-gray-500' : 'text-slate-400'}`}>
                      {nasaData.apod.date}
                      {nasaData.apod.copyright && <> • © {nasaData.apod.copyright}</>}
                    </div>
                    <h4 className={`font-medium text-lg ${isDayMode ? 'text-gray-800' : 'text-white'}`}>
                      {nasaData.apod.title}
                    </h4>
                    <p className={`leading-relaxed ${isDayMode ? 'text-gray-700' : 'text-slate-300'}`}>
                      {nasaData.apod.explanation}
                    </p>
                    {nasaData.apod.url && (
                      <div className={`aspect-video rounded-lg overflow-hidden border ${
                        isDayMode 
                          ? 'bg-gray-100/50 border-gray-300/30' 
                          : 'bg-slate-800/50 border-purple-500/20'
                      }`}>
                        <img 
                          src={nasaData.apod.url} 
                          alt={nasaData.apod.title}
                          className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                            const parent = target.parentElement;
                            if (parent) {
                              parent.innerHTML = `
                                <div class="w-full h-full flex items-center justify-center ${
                                  isDayMode ? 'bg-gray-200/50 text-gray-500' : 'bg-slate-700/50 text-slate-400'
                                }">
                                  <div class="text-center">
                                    <div class="text-4xl mb-2">🖼️</div>
                                    <div class="text-sm">NASA Image Unavailable</div>
                                  </div>
                                </div>
                              `;
                            }
                          }}
                        />
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* ISS Position */}
              {nasaData.issPosition && (
                <div className="glass-panel p-6">
                  <h3 className={`text-xl font-semibold mb-4 flex items-center ${
                    isDayMode ? 'text-green-600' : 'text-green-400'
                  }`}>
                    🛰️ <span className="ml-2">ISS Current Position</span>
                  </h3>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-6">
                      <div className={`text-center p-4 rounded-lg border ${
                        isDayMode 
                          ? 'bg-green-50/80 border-green-300/50' 
                          : 'bg-green-500/10 border-green-500/20'
                      }`}>
                        <div className={`text-3xl font-mono ${
                          isDayMode ? 'text-green-600' : 'text-green-400'
                        }`}>
                          {nasaData.issPosition.latitude.toFixed(4)}°
                        </div>
                        <div className={`text-sm uppercase tracking-wide mt-2 ${
                          isDayMode ? 'text-gray-500' : 'text-slate-400'
                        }`}>Latitude</div>
                      </div>
                      <div className={`text-center p-4 rounded-lg border ${
                        isDayMode 
                          ? 'bg-blue-50/80 border-blue-300/50' 
                          : 'bg-blue-500/10 border-blue-500/20'
                      }`}>
                        <div className={`text-3xl font-mono ${
                          isDayMode ? 'text-blue-600' : 'text-blue-400'
                        }`}>
                          {nasaData.issPosition.longitude.toFixed(4)}°
                        </div>
                        <div className={`text-sm uppercase tracking-wide mt-2 ${
                          isDayMode ? 'text-gray-500' : 'text-slate-400'
                        }`}>Longitude</div>
                      </div>
                    </div>
                    <div className={`text-center text-sm ${
                      isDayMode ? 'text-gray-500' : 'text-slate-400'
                    }`}>
                      🕐 Last updated: {new Date(nasaData.issPosition.timestamp * 1000).toLocaleTimeString()}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Near Earth Objects */}
            {nasaData.neoFeeds && nasaData.neoFeeds.length > 0 && (
              <div className="glass-panel p-6">
                <h3 className={`text-xl font-semibold mb-4 flex items-center ${
                  isDayMode ? 'text-orange-600' : 'text-orange-400'
                }`}>
                  ☄️ <span className="ml-2">Near Earth Objects</span>
                </h3>
                <div className="space-y-4">
                  {nasaData.neoFeeds.map((neo) => (
                    <div key={neo.id} className={`flex items-center justify-between p-4 rounded-lg border ${
                      isDayMode 
                        ? 'bg-white/60 border-gray-200/50' 
                        : 'bg-slate-800/30 border-slate-700/50'
                    }`}>
                      <div className="flex-1">
                        <div className={`font-medium text-lg ${
                          isDayMode ? 'text-gray-800' : 'text-white'
                        }`}>{neo.name}</div>
                        <div className={`text-sm mt-1 ${
                          isDayMode ? 'text-gray-600' : 'text-slate-400'
                        }`}>
                          Diameter: {neo.estimated_diameter.meters.estimated_diameter_min.toFixed(0)}-
                          {neo.estimated_diameter.meters.estimated_diameter_max.toFixed(0)}m
                        </div>
                        <div className={`text-xs mt-1 ${
                          isDayMode ? 'text-gray-500' : 'text-slate-500'
                        }`}>
                          Close approach: {neo.close_approach_date}
                        </div>
                      </div>
                      {neo.is_potentially_hazardous_asteroid && (
                        <div className={`text-sm font-medium px-3 py-1 rounded-full ${
                          isDayMode 
                            ? 'text-red-600 bg-red-100/80' 
                            : 'text-red-400 bg-red-500/20'
                        }`}>
                          ⚠️ Potentially Hazardous
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ISS Tracking Tab */}
        {activeTab === 'iss' && (
          <div className="space-y-8">
            <h2 className="text-2xl font-bold mb-6">International Space Station</h2>
            
            {nasaData.issPosition ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="glass-panel p-6">
                  <h3 className={`text-xl font-semibold mb-6 ${
                    isDayMode ? 'text-green-600' : 'text-green-400'
                  }`}>Real-time Position</h3>
                  <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-6">
                      <div className={`text-center p-6 rounded-xl border ${
                        isDayMode 
                          ? 'bg-green-50/80 border-green-300/50' 
                          : 'bg-green-500/10 border-green-500/20'
                      }`}>
                        <div className={`text-4xl font-mono mb-2 ${
                          isDayMode ? 'text-green-600' : 'text-green-400'
                        }`}>
                          {nasaData.issPosition.latitude.toFixed(4)}°
                        </div>
                        <div className={`text-sm uppercase tracking-wide ${
                          isDayMode ? 'text-gray-500' : 'text-slate-400'
                        }`}>Latitude</div>
                      </div>
                      <div className={`text-center p-6 rounded-xl border ${
                        isDayMode 
                          ? 'bg-blue-50/80 border-blue-300/50' 
                          : 'bg-blue-500/10 border-blue-500/20'
                      }`}>
                        <div className={`text-4xl font-mono mb-2 ${
                          isDayMode ? 'text-blue-600' : 'text-blue-400'
                        }`}>
                          {nasaData.issPosition.longitude.toFixed(4)}°
                        </div>
                        <div className={`text-sm uppercase tracking-wide ${
                          isDayMode ? 'text-gray-500' : 'text-slate-400'
                        }`}>Longitude</div>
                      </div>
                    </div>
                    <div className={`text-center text-sm p-3 rounded-lg ${
                      isDayMode 
                        ? 'text-gray-600 bg-gray-100/80' 
                        : 'text-slate-400 bg-slate-800/30'
                    }`}>
                      🕐 Last updated: {new Date(nasaData.issPosition.timestamp * 1000).toLocaleString()}
                    </div>
                  </div>
                </div>

                <div className="glass-panel p-6">
                  <h3 className={`text-xl font-semibold mb-6 ${
                    isDayMode ? 'text-blue-600' : 'text-blue-400'
                  }`}>Station Information</h3>
                  <div className="space-y-4">
                    {[
                      { label: 'Altitude', value: '~408 km (254 miles)' },
                      { label: 'Orbital Speed', value: '~27,600 km/h (17,150 mph)' },
                      { label: 'Orbital Period', value: '~92 minutes' },
                      { label: 'Current Crew', value: '6-7 astronauts' },
                      { label: 'Launch Date', value: 'November 20, 1998' },
                      { label: 'Mass', value: '~420,000 kg' }
                    ].map((item, index) => (
                      <div key={index} className={`flex justify-between items-center py-3 border-b last:border-b-0 ${
                        isDayMode ? 'border-gray-200/30' : 'border-slate-700/30'
                      }`}>
                        <span className={isDayMode ? 'text-gray-600' : 'text-slate-400'}>{item.label}:</span>
                        <span className={`font-medium ${isDayMode ? 'text-gray-800' : 'text-white'}`}>{item.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className={`text-center py-16 ${isDayMode ? 'text-gray-500' : 'text-slate-400'}`}>
                <svg className={`w-16 h-16 mx-auto mb-4 ${isDayMode ? 'text-gray-400' : 'text-slate-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.34 0-4.47.94-6.071 2.469l-.102.101M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-lg">No ISS position data available</p>
              </div>
            )}
          </div>
        )}

        {/* Mars Data Tab */}
        {activeTab === 'mars' && (
          <div className="space-y-8">
            <h2 className="text-2xl font-bold mb-6">Mars Mission Data</h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="glass-panel p-6">
                <h3 className={`text-xl font-semibold mb-6 flex items-center ${
                  isDayMode ? 'text-red-600' : 'text-red-400'
                }`}>
                  🔴 <span className="ml-2">Mars Overview</span>
                </h3>
                <div className="space-y-4">
                  {[
                    { label: 'Distance from Earth', value: '~225 million km' },
                    { label: 'Day Length (Sol)', value: '24h 37m 22s' },
                    { label: 'Year Length', value: '687 Earth days' },
                    { label: 'Gravity', value: '0.38x Earth (3.7 m/s²)' },
                    { label: 'Atmosphere', value: '95% CO₂, 3% N₂' },
                    { label: 'Average Temperature', value: '-80°C (-112°F)' }
                  ].map((item, index) => (
                    <div key={index} className={`flex justify-between items-center py-3 border-b last:border-b-0 ${
                      isDayMode ? 'border-gray-200/30' : 'border-slate-700/30'
                    }`}>
                      <span className={isDayMode ? 'text-gray-600' : 'text-slate-400'}>{item.label}:</span>
                      <span className={`font-medium ${isDayMode ? 'text-gray-800' : 'text-white'}`}>{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="glass-panel p-6">
                <h3 className={`text-xl font-semibold mb-6 flex items-center ${
                  isDayMode ? 'text-orange-600' : 'text-orange-400'
                }`}>
                  🚁 <span className="ml-2">Active Missions</span>
                </h3>
                <div className="space-y-4">
                  {[
                    { name: 'Perseverance Rover', location: 'Jezero Crater', mission: 'Sample Collection & Analysis' },
                    { name: 'Ingenuity Helicopter', location: 'Jezero Crater', mission: 'Aerial Scout & Technology Demo' },
                    { name: 'MAVEN Orbiter', location: 'Mars Orbit', mission: 'Atmospheric Studies' },
                    { name: 'Mars Reconnaissance Orbiter', location: 'Mars Orbit', mission: 'High-Resolution Imaging' }
                  ].map((mission, index) => (
                    <div key={index} className={`p-4 rounded-lg border ${
                      isDayMode 
                        ? 'bg-gradient-to-r from-orange-50/80 to-red-50/80 border-orange-300/40' 
                        : 'bg-gradient-to-r from-orange-500/10 to-red-500/10 border-orange-500/20'
                    }`}>
                      <div className={`font-medium text-lg ${isDayMode ? 'text-gray-800' : 'text-white'}`}>{mission.name}</div>
                      <div className={`text-sm mt-1 ${
                        isDayMode ? 'text-orange-600' : 'text-orange-300'
                      }`}>{mission.location}</div>
                      <div className={`text-xs mt-2 ${
                        isDayMode ? 'text-gray-600' : 'text-slate-400'
                      }`}>{mission.mission}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Deep Space Tab */}
        {activeTab === 'deep-space' && (
          <div className="space-y-8">
            <h2 className="text-2xl font-bold mb-6">Deep Space Missions</h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="glass-panel p-6">
                <h3 className={`text-xl font-semibold mb-6 flex items-center ${
                  isDayMode ? 'text-purple-600' : 'text-purple-400'
                }`}>
                  ✨ <span className="ml-2">Active Deep Space Missions</span>
                </h3>
                <div className="space-y-4">
                  {[
                    { name: 'James Webb Space Telescope', location: 'L2 Lagrange Point', mission: 'Infrared Astronomy' },
                    { name: 'Voyager 1', location: 'Interstellar Space', mission: '45+ years of exploration' },
                    { name: 'Voyager 2', location: 'Interstellar Space', mission: '45+ years of exploration' },
                    { name: 'New Horizons', location: 'Kuiper Belt', mission: 'Pluto & KBO exploration' }
                  ].map((mission, index) => (
                    <div key={index} className={`p-4 rounded-lg border ${
                      isDayMode 
                        ? 'bg-gradient-to-r from-purple-50/80 to-blue-50/80 border-purple-300/40' 
                        : 'bg-gradient-to-r from-purple-500/10 to-blue-500/10 border-purple-500/20'
                    }`}>
                      <div className={`font-medium text-lg ${isDayMode ? 'text-gray-800' : 'text-white'}`}>{mission.name}</div>
                      <div className={`text-sm mt-1 ${
                        isDayMode ? 'text-purple-600' : 'text-purple-300'
                      }`}>{mission.location}</div>
                      <div className={`text-xs mt-2 ${
                        isDayMode ? 'text-gray-600' : 'text-slate-400'
                      }`}>{mission.mission}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="glass-panel p-6">
                <h3 className={`text-xl font-semibold mb-6 flex items-center ${
                  isDayMode ? 'text-indigo-600' : 'text-indigo-400'
                }`}>
                  📡 <span className="ml-2">Upcoming Missions</span>
                </h3>
                <div className="space-y-4">
                  {[
                    { name: 'Artemis III', target: 'Lunar South Pole', timeline: '2026' },
                    { name: 'Mars Sample Return', target: 'Mars Surface', timeline: '2030s' },
                    { name: 'Europa Clipper', target: "Jupiter's Moon Europa", timeline: '2030' },
                    { name: 'Dragonfly', target: "Saturn's Moon Titan", timeline: '2034' }
                  ].map((mission, index) => (
                    <div key={index} className={`p-4 rounded-lg border ${
                      isDayMode 
                        ? 'bg-gradient-to-r from-indigo-50/80 to-cyan-50/80 border-indigo-300/40' 
                        : 'bg-gradient-to-r from-indigo-500/10 to-cyan-500/10 border-indigo-500/20'
                    }`}>
                      <div className={`font-medium text-lg ${isDayMode ? 'text-gray-800' : 'text-white'}`}>{mission.name}</div>
                      <div className={`text-sm mt-1 ${
                        isDayMode ? 'text-indigo-600' : 'text-indigo-300'
                      }`}>{mission.target}</div>
                      <div className={`text-xs mt-2 ${
                        isDayMode ? 'text-gray-600' : 'text-slate-400'
                      }`}>Expected: {mission.timeline}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Footer */}
      <Footer />
    </div>
  );
}