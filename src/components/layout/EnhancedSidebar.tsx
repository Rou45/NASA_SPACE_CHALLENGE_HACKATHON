import React, { useState } from 'react';
import { useHabitatStore } from '../../stores/habitatStore';
import { HabitatShape, ModuleType, Destination, LaunchVehicle } from '../../types/habitat';

interface SidebarProps {
  onClose?: () => void;
}

// Safe number parsing functions
const safeParseFloat = (value: string, fallback: number = 0): number => {
  const parsed = parseFloat(value);
  return isNaN(parsed) || parsed <= 0 ? fallback : parsed;
};

const safeParseInt = (value: string, fallback: number = 1): number => {
  const parsed = parseInt(value);
  return isNaN(parsed) || parsed <= 0 ? fallback : parsed;
};

export function EnhancedSidebar({ onClose }: SidebarProps = {}) {
  const {
    currentDesign,
    updateHabitatDimensions,
    updateMissionParameters,
    addModule,
    selectedModuleId,
    updateModule,
    removeModule,
  } = useHabitatStore();
  
  const [showModuleForm, setShowModuleForm] = useState(false);
  const [activeTab, setActiveTab] = useState<'habitat' | 'mission' | 'modules'>('habitat');
  
  if (!currentDesign) return null;
  
  const selectedModule = currentDesign.modules.find(m => m.id === selectedModuleId);

  const tabs = [
    { id: 'habitat', label: 'Habitat', icon: '🏠' },
    { id: 'mission', label: 'Mission', icon: '🚀' },
    { id: 'modules', label: 'Modules', icon: '🔧' },
  ];

  return (
    <aside className="w-80 lg:w-96 h-full panel flex flex-col animate-slide-up">
      {/* Enhanced Header - Fixed height */}
      <div className="panel-header constellation-bg flex-shrink-0 min-h-[80px]">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
            <span className="text-white font-bold">🏗️</span>
          </div>
          <div>
            <h2 className="text-xl font-bold text-gradient">Design Studio</h2>
            <p className="text-xs text-slate-400">NASA-Grade Habitat Design</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <button 
            className="btn-outline text-xs px-3 py-2 animate-pulse-glow"
            onClick={() => useHabitatStore.getState().validateDesign()}
          >
            <span className="mr-1">✅</span>
            Validate
          </button>
          
          {onClose && (
            <button
              onClick={onClose}
              className="btn-ghost p-2 lg:hidden"
              aria-label="Close sidebar"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Enhanced Tab Navigation - Fixed height */}
      <div className="px-6 py-4 border-b border-slate-700/50 flex-shrink-0">
        <div className="flex space-x-1 bg-slate-800/50 rounded-xl p-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex-1 flex items-center justify-center space-x-1 px-2 py-3 rounded-lg text-xs font-medium transition-all duration-200 min-w-0 ${
                activeTab === tab.id
                  ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                  : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              <span className="flex-shrink-0">{tab.icon}</span>
              <span className="truncate">{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Enhanced Content Area - Proper scrolling */}
      <div className="flex-1 overflow-y-auto scrollbar-thin px-6 py-6 space-y-6 min-h-0">
        {/* Habitat Configuration Tab */}
        {activeTab === 'habitat' && (
          <div className="space-y-6 animate-fade-in pb-6">
            <div className="section">
              <div className="section-title mb-4">
                🏗️ Habitat Configuration
              </div>
              
              {/* Shape Selection */}
              <div className="form-group">
                <label className="label">Habitat Shape</label>
                <select 
                  className="input"
                  value={currentDesign.dimensions.shape}
                  onChange={(e) => updateHabitatDimensions({ 
                    shape: e.target.value as HabitatShape 
                  })}
                >
                  <option value={HabitatShape.CYLINDER}>🔘 Cylinder</option>
                  <option value={HabitatShape.SPHERE}>⚪ Sphere</option>
                  <option value={HabitatShape.TORUS}>🍩 Torus</option>
                  <option value={HabitatShape.MODULAR}>🧩 Modular</option>
                </select>
              </div>

              {/* Dynamic Dimension Inputs */}
              {currentDesign.dimensions.shape === HabitatShape.CYLINDER && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="form-group">
                    <label className="label">Radius (m)</label>
                    <input 
                      type="number" 
                      className="input w-full" 
                      value={currentDesign.dimensions.radius}
                      onChange={(e) => updateHabitatDimensions({ 
                        radius: safeParseFloat(e.target.value, 5.0)
                      })}
                      step="0.1"
                      min="1"
                      max="20"
                    />
                  </div>
                  <div className="form-group">
                    <label className="label">Height (m)</label>
                    <input 
                      type="number" 
                      className="input w-full" 
                      value={currentDesign.dimensions.height}
                      onChange={(e) => updateHabitatDimensions({ 
                        height: safeParseFloat(e.target.value, 10.0)
                      })}
                      step="0.1"
                      min="2"
                      max="50"
                    />
                  </div>
                </div>
              )}

              {currentDesign.dimensions.shape === HabitatShape.SPHERE && (
                <div className="form-group">
                  <label className="label">Sphere Radius (m)</label>
                  <input 
                    type="number" 
                    className="input" 
                    value={currentDesign.dimensions.sphereRadius}
                    onChange={(e) => updateHabitatDimensions({ 
                      sphereRadius: safeParseFloat(e.target.value, 5.0)
                    })}
                    step="0.1"
                    min="2"
                    max="25"
                  />
                </div>
              )}

              {currentDesign.dimensions.shape === HabitatShape.TORUS && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="form-group">
                    <label className="label">Major Radius (m)</label>
                    <input 
                      type="number" 
                      className="input w-full" 
                      value={currentDesign.dimensions.majorRadius}
                      onChange={(e) => updateHabitatDimensions({ 
                        majorRadius: safeParseFloat(e.target.value, 15.0)
                      })}
                      step="0.1"
                      min="5"
                      max="50"
                    />
                  </div>
                  <div className="form-group">
                    <label className="label">Minor Radius (m)</label>
                    <input 
                      type="number" 
                      className="input w-full" 
                      value={currentDesign.dimensions.minorRadius}
                      onChange={(e) => updateHabitatDimensions({ 
                        minorRadius: safeParseFloat(e.target.value, 3.0)
                      })}
                      step="0.1"
                      min="1"
                      max="10"
                    />
                  </div>
                </div>
              )}

              {currentDesign.dimensions.shape === HabitatShape.MODULAR && (
                <div className="grid grid-cols-1 gap-4">
                  <div className="form-group">
                    <label className="label">Length (m)</label>
                    <input 
                      type="number" 
                      className="input w-full" 
                      value={currentDesign.dimensions.length}
                      onChange={(e) => updateHabitatDimensions({ 
                        length: safeParseFloat(e.target.value, 20.0)
                      })}
                      step="0.1"
                      min="5"
                      max="100"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="form-group">
                      <label className="label">Width (m)</label>
                      <input 
                        type="number" 
                        className="input w-full" 
                        value={currentDesign.dimensions.width}
                        onChange={(e) => updateHabitatDimensions({ 
                          width: safeParseFloat(e.target.value, 15.0)
                        })}
                        step="0.1"
                        min="5"
                        max="50"
                      />
                    </div>
                    <div className="form-group">
                      <label className="label">Height (m)</label>
                      <input 
                        type="number" 
                        className="input w-full" 
                        value={currentDesign.dimensions.height}
                        onChange={(e) => updateHabitatDimensions({ 
                          height: safeParseFloat(e.target.value, 8.0)
                        })}
                        step="0.1"
                        min="3"
                        max="20"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Mission Parameters Tab */}
        {activeTab === 'mission' && (
          <div className="space-y-6 animate-fade-in pb-6">
            <div className="section">
              <div className="section-title mb-4">
                🚀 Mission Parameters
              </div>
              
              <div className="form-grid">
                <div className="form-group">
                  <label className="label">Crew Size</label>
                  <input 
                    type="number" 
                    className="input" 
                    value={currentDesign.missionParameters.crewSize}
                    onChange={(e) => updateMissionParameters({ 
                      crewSize: safeParseInt(e.target.value, 4)
                    })}
                    min="1"
                    max="20"
                  />
                </div>
                
                <div className="form-group">
                  <label className="label">Duration (days)</label>
                  <input 
                    type="number" 
                    className="input" 
                    value={currentDesign.missionParameters.duration}
                    onChange={(e) => updateMissionParameters({ 
                      duration: safeParseInt(e.target.value, 180)
                    })}
                    min="1"
                    max="1000"
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="label">Destination</label>
                <select 
                  className="input"
                  value={currentDesign.missionParameters.destination}
                  onChange={(e) => updateMissionParameters({ 
                    destination: e.target.value as Destination 
                  })}
                >
                  <option value={Destination.LEO}>🌍 Low Earth Orbit</option>
                  <option value={Destination.LUNAR_ORBIT}>🌙 Lunar Orbit</option>
                  <option value={Destination.LUNAR_SURFACE}>🏔️ Lunar Surface</option>
                  <option value={Destination.MARS_ORBIT}>🔴 Mars Orbit</option>
                  <option value={Destination.MARS_SURFACE}>🏜️ Mars Surface</option>
                  <option value={Destination.DEEP_SPACE}>🌌 Deep Space</option>
                </select>
              </div>

              <div className="form-group">
                <label className="label">Launch Vehicle</label>
                <select 
                  className="input"
                  value={currentDesign.missionParameters.launchVehicle}
                  onChange={(e) => updateMissionParameters({ 
                    launchVehicle: e.target.value as LaunchVehicle 
                  })}
                >
                  <option value={LaunchVehicle.FALCON_HEAVY}>🚀 SpaceX Falcon Heavy</option>
                  <option value={LaunchVehicle.SLS_BLOCK_1}>🚀 NASA SLS Block 1</option>
                  <option value={LaunchVehicle.SLS_BLOCK_2}>🚀 NASA SLS Block 2</option>
                  <option value={LaunchVehicle.STARSHIP}>🚀 SpaceX Starship</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Modules Tab */}
        {activeTab === 'modules' && (
          <div className="space-y-6 animate-fade-in pb-6">
            <div className="section">
              <div className="section-title mb-4">
                🔧 Habitat Modules
              </div>
              
              {/* Module List - Scrollable container */}
              <div className="space-y-3 mb-6 max-h-[400px] overflow-y-auto scrollbar-thin pr-2">
                {currentDesign.modules.map(module => (
                  <div 
                    key={module.id}
                    className={`metric-card cursor-pointer transition-all duration-200 ${
                      selectedModuleId === module.id 
                        ? 'glow-border' 
                        : ''
                    }`}
                    onClick={() => useHabitatStore.getState().selectModule(module.id)}
                  >
                    <div className="flex justify-between items-start gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-white flex items-center space-x-2">
                          <span className="flex-shrink-0">{getModuleIcon(module.type)}</span>
                          <span className="truncate">{module.name}</span>
                        </div>
                        <div className="text-sm text-slate-400 capitalize mt-1">
                          {module.type.replace('_', ' ')}
                        </div>
                        <div className="text-xs text-slate-500 mt-2">
                          {module.dimensions.length}×{module.dimensions.width}×{module.dimensions.height}m
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0 min-w-[60px]">
                        <div className="metric-value text-lg whitespace-nowrap">
                          {module.volume.toFixed(1)}m³
                        </div>
                        <div className="text-xs text-slate-400 whitespace-nowrap">
                          {module.mass.toLocaleString()}kg
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Add Module Button - Fixed at bottom */}
              <div className="sticky bottom-0 bg-slate-900/95 backdrop-blur-sm pt-4 pb-2">
                <button 
                  className="btn-primary w-full"
                  onClick={() => setShowModuleForm(true)}
                >
                  <span className="mr-2">➕</span>
                  Add New Module
                </button>
              </div>
            </div>

            {/* Selected Module Details */}
            {selectedModule && (
              <div className="section">
                <div className="section-title">
                  📝 Module Editor
                </div>
                
                <div className="space-y-4">
                  <div className="form-group">
                    <label className="label">Module Name</label>
                    <input 
                      type="text" 
                      className="input" 
                      value={selectedModule.name}
                      onChange={(e) => updateModule(selectedModule.id, { 
                        name: e.target.value 
                      })}
                    />
                  </div>

                  <div className="form-grid">
                    <div className="form-group">
                      <label className="label">Length (m)</label>
                      <input 
                        type="number" 
                        className="input" 
                        value={selectedModule.dimensions.length}
                        onChange={(e) => {
                          const length = safeParseFloat(e.target.value, 5.0);
                          updateModule(selectedModule.id, { 
                            dimensions: { ...selectedModule.dimensions, length },
                            volume: length * selectedModule.dimensions.width * selectedModule.dimensions.height
                          });
                        }}
                        step="0.1"
                        min="0.5"
                      />
                    </div>
                    <div className="form-group">
                      <label className="label">Width (m)</label>
                      <input 
                        type="number" 
                        className="input" 
                        value={selectedModule.dimensions.width}
                        onChange={(e) => {
                          const width = safeParseFloat(e.target.value, 5.0);
                          updateModule(selectedModule.id, { 
                            dimensions: { ...selectedModule.dimensions, width },
                            volume: selectedModule.dimensions.length * width * selectedModule.dimensions.height
                          });
                        }}
                        step="0.1"
                        min="0.5"
                      />
                    </div>
                    <div className="form-group">
                      <label className="label">Height (m)</label>
                      <input 
                        type="number" 
                        className="input" 
                        value={selectedModule.dimensions.height}
                        onChange={(e) => {
                          const height = safeParseFloat(e.target.value, 3.0);
                          updateModule(selectedModule.id, { 
                            dimensions: { ...selectedModule.dimensions, height },
                            volume: selectedModule.dimensions.length * selectedModule.dimensions.width * height
                          });
                        }}
                        step="0.1"
                        min="0.5"
                      />
                    </div>
                  </div>

                  <button 
                    className="btn-danger w-full mt-4"
                    onClick={() => removeModule(selectedModule.id)}
                  >
                    <span className="mr-2">🗑️</span>
                    Remove Module
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Module Form Modal */}
      {showModuleForm && (
        <AddModuleForm 
          onClose={() => setShowModuleForm(false)}
          onAdd={(moduleData) => {
            addModule(moduleData);
            setShowModuleForm(false);
          }}
        />
      )}
    </aside>
  );
}

// Helper function to get module icons
function getModuleIcon(type: ModuleType): string {
  const icons = {
    [ModuleType.COMMAND]: '🎛️',
    [ModuleType.HABITATION]: '🏠',
    [ModuleType.LABORATORY]: '🔬',
    [ModuleType.LOGISTICS]: '📦',
    [ModuleType.EXERCISE]: '💪',
    [ModuleType.MEDICAL]: '🏥',
    [ModuleType.AIRLOCK]: '🚪',
    [ModuleType.GREENHOUSE]: '🌱',
    [ModuleType.WORKSHOP]: '🔧',
    [ModuleType.RECREATION]: '🎮',
  };
  return icons[type as keyof typeof icons] || '📦';
}

// Enhanced Add Module Form Component
function AddModuleForm({ 
  onClose, 
  onAdd 
}: { 
  onClose: () => void; 
  onAdd: (moduleData: any) => void;
}) {
  const [formData, setFormData] = useState({
    type: ModuleType.HABITATION,
    name: '',
    description: '',
    length: 5.0,
    width: 5.0,
    height: 3.0,
    essential: false,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const moduleData = {
      type: formData.type,
      name: formData.name || `New ${formData.type}`,
      description: formData.description,
      position: { x: 0, y: 0, z: 0 },
      rotation: { x: 0, y: 0, z: 0, w: 1 },
      dimensions: {
        length: formData.length,
        width: formData.width,
        height: formData.height,
      },
      volume: formData.length * formData.width * formData.height,
      mass: Math.round(formData.length * formData.width * formData.height * 1000), // kg
      powerRequirement: Math.round(formData.length * formData.width * 2), // kW
      crewCapacity: Math.floor(formData.length * formData.width / 10),
      essential: formData.essential,
      adjacencyRequirements: [],
      adjacencyRestrictions: [],
      accessRequirements: {
        directAccess: true,
        emergencyAccess: true,
        equipmentAccess: true,
      },
    };

    onAdd(moduleData);
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content animate-bounce-in">
        <div className="panel-header">
          <h3 className="text-xl font-bold text-gradient">Add New Module</h3>
          <button
            onClick={onClose}
            className="btn-ghost p-2"
            aria-label="Close"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="form-grid">
            <div className="form-group">
              <label className="label">Module Type</label>
              <select 
                className="input"
                value={formData.type}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  type: e.target.value as ModuleType 
                }))}
              >
                {Object.values(ModuleType).map(type => (
                  <option key={type} value={type}>
                    {getModuleIcon(type)} {type.replace('_', ' ').toUpperCase()}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="form-group">
              <label className="label">Module Name</label>
              <input 
                type="text" 
                className="input" 
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  name: e.target.value 
                }))}
                placeholder="Enter module name"
              />
            </div>
          </div>

          <div className="form-group">
            <label className="label">Description</label>
            <textarea 
              className="input min-h-[80px] resize-none"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ 
                ...prev, 
                description: e.target.value 
              }))}
              placeholder="Describe the module's purpose and features"
            />
          </div>

          <div className="form-grid">
            <div className="form-group">
              <label className="label">Length (m)</label>
              <input 
                type="number" 
                className="input" 
                value={formData.length}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  length: safeParseFloat(e.target.value, 5.0) 
                }))}
                step="0.1"
                min="0.5"
                max="20"
              />
            </div>
            <div className="form-group">
              <label className="label">Width (m)</label>
              <input 
                type="number" 
                className="input" 
                value={formData.width}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  width: safeParseFloat(e.target.value, 5.0) 
                }))}
                step="0.1"
                min="0.5"
                max="20"
              />
            </div>
            <div className="form-group">
              <label className="label">Height (m)</label>
              <input 
                type="number" 
                className="input" 
                value={formData.height}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  height: safeParseFloat(e.target.value, 3.0) 
                }))}
                step="0.1"
                min="0.5"
                max="10"
              />
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <input 
              type="checkbox" 
              id="essential"
              className="w-4 h-4 text-blue-600"
              checked={formData.essential}
              onChange={(e) => setFormData(prev => ({ 
                ...prev, 
                essential: e.target.checked 
              }))}
            />
            <label htmlFor="essential" className="label">
              Essential for mission safety
            </label>
          </div>

          <div className="flex space-x-4 pt-4">
            <button type="button" onClick={onClose} className="btn-outline flex-1">
              Cancel
            </button>
            <button type="submit" className="btn-primary flex-1">
              <span className="mr-2">➕</span>
              Add Module
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}