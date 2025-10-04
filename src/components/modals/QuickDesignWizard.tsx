import React, { useState } from 'react';
import { useHabitatStore } from '../../stores/habitatStore';
import { HabitatShape, Destination, LaunchVehicle, ModuleType } from '../../types/habitat';

interface QuickDesignWizardProps {
  isOpen: boolean;
  onClose: () => void;
}

export function QuickDesignWizard({ isOpen, onClose }: QuickDesignWizardProps) {
  const [step, setStep] = useState(1);
  const [designData, setDesignData] = useState({
    name: '',
    description: '',
    shape: HabitatShape.CYLINDER,
    destination: Destination.LUNAR_SURFACE,
    crewSize: 4,
    duration: 180,
    launchVehicle: LaunchVehicle.SLS_BLOCK_1,
    dimensions: {
      radius: 5,
      height: 10,
      length: 10,
      width: 8,
      sphereRadius: 6
    },
    modules: [] as string[]
  });

  const { createNewDesign, updateHabitatDimensions, updateMissionParameters, addModule } = useHabitatStore();

  const handleNext = () => {
    if (step < 4) setStep(step + 1);
  };

  const handlePrev = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleCreate = () => {
    try {
      // Create the design
      createNewDesign(designData.name, designData.description);
      
      // Update dimensions based on shape
      const dimensions: any = { shape: designData.shape };
      switch (designData.shape) {
        case HabitatShape.CYLINDER:
          dimensions.radius = designData.dimensions.radius;
          dimensions.height = designData.dimensions.height;
          break;
        case HabitatShape.SPHERE:
          dimensions.sphereRadius = designData.dimensions.sphereRadius;
          break;
        case HabitatShape.MODULAR:
          dimensions.length = designData.dimensions.length;
          dimensions.width = designData.dimensions.width;
          dimensions.height = designData.dimensions.height;
          break;
        default:
          dimensions.radius = designData.dimensions.radius;
          dimensions.height = designData.dimensions.height;
      }
      updateHabitatDimensions(dimensions);
      
      // Update mission parameters
      updateMissionParameters({
        crewSize: designData.crewSize,
        duration: designData.duration,
        destination: designData.destination,
        launchVehicle: designData.launchVehicle,
        missionType: 'exploration',
        emergencyEvacuation: true
      });
      
      // Add basic modules
      const basicModules = [
        { type: ModuleType.COMMAND, name: 'Command Center' },
        { type: ModuleType.HABITATION, name: 'Crew Quarters' },
        { type: ModuleType.LOGISTICS, name: 'Storage Bay' },
        { type: ModuleType.EXERCISE, name: 'Fitness Module' }
      ];
      
      // Add essential modules first
      basicModules.forEach((moduleData, index) => {
        addModule({
          type: moduleData.type,
          name: moduleData.name,
          description: `Essential ${moduleData.name.toLowerCase()} for mission operations`,
          position: { x: index * 2, y: 0, z: 0 },
          rotation: { x: 0, y: 0, z: 0, w: 1 },
          dimensions: { length: 4, width: 4, height: 3 },
          volume: 20,
          mass: 1000,
          powerRequirement: 5,
          crewCapacity: moduleData.type === ModuleType.HABITATION ? designData.crewSize : 0,
          essential: true,
          adjacencyRequirements: [],
          adjacencyRestrictions: [],
          accessRequirements: {
            directAccess: true,
            emergencyAccess: true,
            equipmentAccess: true
          }
        });
      });
      
      // Add selected optional modules
      designData.modules.forEach((moduleType, index) => {
        const moduleData = [
          { type: ModuleType.LABORATORY, name: 'Research Lab' },
          { type: ModuleType.MEDICAL, name: 'Medical Bay' },
          { type: ModuleType.AIRLOCK, name: 'Airlock' },
          { type: ModuleType.GREENHOUSE, name: 'Greenhouse' }
        ].find(m => m.type === moduleType);
        
        if (moduleData) {
          addModule({
            type: moduleData.type,
            name: moduleData.name,
            description: `Optional ${moduleData.name.toLowerCase()} for enhanced mission capabilities`,
            position: { x: (index + 4) * 2, y: 0, z: 2 },
            rotation: { x: 0, y: 0, z: 0, w: 1 },
            dimensions: { length: 3, width: 3, height: 3 },
            volume: 15,
            mass: 800,
            powerRequirement: 3,
            crewCapacity: 0,
            essential: false,
            adjacencyRequirements: [],
            adjacencyRestrictions: [],
            accessRequirements: {
              directAccess: true,
              emergencyAccess: false,
              equipmentAccess: true
            }
          });
        }
      });
      
      // Show success message briefly
      setStep(5); // Success step
      setTimeout(() => {
        onClose();
        setStep(1);
      }, 2000);
      
    } catch (error) {
      console.error('Failed to create habitat:', error);
      alert('Failed to create habitat. Please try again.');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-md" onClick={onClose} />
      
      <div className="relative w-full max-w-4xl max-h-[90vh] glass-effect border border-slate-600/50 rounded-2xl shadow-2xl overflow-hidden animate-slide-up">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-700/50 bg-gradient-to-r from-blue-500/20 to-purple-600/20">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
              <span className="text-2xl">🏗️</span>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gradient">Quick Design Wizard</h2>
              <p className="text-slate-400">Step {step} of 4 • Create your space habitat in minutes</p>
            </div>
          </div>
          
          <button 
            onClick={onClose} 
            className="btn-ghost p-3 hover:bg-red-500/20 transition-colors"
            title="Close Wizard"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Progress Bar */}
        <div className="px-6 py-4 bg-slate-800/30">
          <div className="flex items-center justify-between mb-2">
            {[1, 2, 3, 4].map((stepNum) => (
              <div key={stepNum} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                  stepNum <= step 
                    ? 'bg-blue-500 text-white' 
                    : 'bg-slate-600 text-slate-400'
                }`}>
                  {stepNum}
                </div>
                {stepNum < 4 && (
                  <div className={`w-16 h-1 mx-2 ${
                    stepNum < step ? 'bg-blue-500' : 'bg-slate-600'
                  }`} />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-between text-xs text-slate-400">
            <span>Basic Info</span>
            <span>Mission</span>
            <span>Structure</span>
            <span>Modules</span>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 max-h-[50vh] overflow-y-auto">
          {/* Step 1: Basic Information */}
          {step === 1 && (
            <form onSubmit={(e) => {
              e.preventDefault();
              if (designData.name && designData.description) {
                handleNext();
              }
            }}>
              <div className="space-y-6">
                <h3 className="text-xl font-bold mb-4">Basic Information</h3>
                
                <div className="grid grid-cols-1 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Design Name</label>
                    <input
                      type="text"
                      value={designData.name}
                      onChange={(e) => setDesignData({...designData, name: e.target.value})}
                      placeholder="e.g., Luna Base Alpha, Mars Station Omega"
                      className="input w-full"
                      required
                      autoFocus
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Description</label>
                    <textarea
                      value={designData.description}
                      onChange={(e) => setDesignData({...designData, description: e.target.value})}
                      placeholder="Describe the purpose and features of your habitat..."
                      rows={3}
                      className="input w-full resize-none"
                      required
                    />
                  </div>
                </div>
              </div>
            </form>
          )}

          {/* Step 2: Mission Parameters */}
          {step === 2 && (
            <div className="space-y-6">
              <h3 className="text-xl font-bold mb-4">Mission Parameters</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Destination</label>
                  <select
                    value={designData.destination}
                    onChange={(e) => setDesignData({...designData, destination: e.target.value as Destination})}
                    className="select w-full"
                  >
                    <option value={Destination.LUNAR_SURFACE}>Lunar Surface</option>
                    <option value={Destination.LUNAR_ORBIT}>Lunar Orbit</option>
                    <option value={Destination.MARS_SURFACE}>Mars Surface</option>
                    <option value={Destination.MARS_ORBIT}>Mars Orbit</option>
                    <option value={Destination.LEO}>Low Earth Orbit</option>
                    <option value={Destination.DEEP_SPACE}>Deep Space</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Launch Vehicle</label>
                  <select
                    value={designData.launchVehicle}
                    onChange={(e) => setDesignData({...designData, launchVehicle: e.target.value as LaunchVehicle})}
                    className="select w-full"
                  >
                    <option value={LaunchVehicle.SLS_BLOCK_1}>SLS Block 1</option>
                    <option value={LaunchVehicle.SLS_BLOCK_2}>SLS Block 2</option>
                    <option value={LaunchVehicle.STARSHIP}>Starship</option>
                    <option value={LaunchVehicle.FALCON_HEAVY}>Falcon Heavy</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Crew Size</label>
                  <input
                    type="number"
                    min="1"
                    max="12"
                    value={designData.crewSize}
                    onChange={(e) => setDesignData({...designData, crewSize: parseInt(e.target.value)})}
                    className="input w-full"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Mission Duration (days)</label>
                  <input
                    type="number"
                    min="7"
                    max="1000"
                    value={designData.duration}
                    onChange={(e) => setDesignData({...designData, duration: parseInt(e.target.value)})}
                    className="input w-full"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Habitat Structure */}
          {step === 3 && (
            <div className="space-y-6">
              <h3 className="text-xl font-bold mb-4">Habitat Structure</h3>
              
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Shape</label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {Object.values(HabitatShape).map((shape) => (
                    <button
                      key={shape}
                      onClick={() => setDesignData({...designData, shape})}
                      className={`p-4 rounded-lg border-2 transition-all ${
                        designData.shape === shape
                          ? 'border-blue-500 bg-blue-500/20'
                          : 'border-slate-600 hover:border-slate-500'
                      }`}
                    >
                      <div className="text-2xl mb-2">
                        {shape === HabitatShape.CYLINDER && '🥫'}
                        {shape === HabitatShape.SPHERE && '⚽'}
                        {shape === HabitatShape.TORUS && '🍩'}
                        {shape === HabitatShape.DOME && '🏛️'}
                        {shape === HabitatShape.INFLATABLE && '🎈'}
                        {shape === HabitatShape.MODULAR && '📦'}
                        {shape === HabitatShape.CUSTOM && '🔧'}
                      </div>
                      <div className="text-sm font-medium capitalize">{shape}</div>
                    </button>
                  ))}
                </div>
              </div>
              
              {/* Dimensions based on shape */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {designData.shape === HabitatShape.CYLINDER && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">Radius (m)</label>
                      <input
                        type="number"
                        min="1"
                        max="20"
                        step="0.5"
                        value={designData.dimensions.radius}
                        onChange={(e) => setDesignData({
                          ...designData, 
                          dimensions: {...designData.dimensions, radius: parseFloat(e.target.value)}
                        })}
                        className="input w-full"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">Height (m)</label>
                      <input
                        type="number"
                        min="2"
                        max="50"
                        step="0.5"
                        value={designData.dimensions.height}
                        onChange={(e) => setDesignData({
                          ...designData, 
                          dimensions: {...designData.dimensions, height: parseFloat(e.target.value)}
                        })}
                        className="input w-full"
                      />
                    </div>
                  </>
                )}
                
                {designData.shape === HabitatShape.SPHERE && (
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Radius (m)</label>
                    <input
                      type="number"
                      min="2"
                      max="20"
                      step="0.5"
                      value={designData.dimensions.sphereRadius}
                      onChange={(e) => setDesignData({
                        ...designData, 
                        dimensions: {...designData.dimensions, sphereRadius: parseFloat(e.target.value)}
                      })}
                      className="input w-full"
                    />
                  </div>
                )}
                
                {designData.shape === HabitatShape.MODULAR && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">Length (m)</label>
                      <input
                        type="number"
                        min="3"
                        max="30"
                        step="0.5"
                        value={designData.dimensions.length}
                        onChange={(e) => setDesignData({
                          ...designData, 
                          dimensions: {...designData.dimensions, length: parseFloat(e.target.value)}
                        })}
                        className="input w-full"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">Width (m)</label>
                      <input
                        type="number"
                        min="3"
                        max="20"
                        step="0.5"
                        value={designData.dimensions.width}
                        onChange={(e) => setDesignData({
                          ...designData, 
                          dimensions: {...designData.dimensions, width: parseFloat(e.target.value)}
                        })}
                        className="input w-full"
                      />
                    </div>
                  </>
                )}
              </div>
            </div>
          )}

          {/* Step 4: Essential Modules */}
          {step === 4 && (
            <div className="space-y-6">
              <h3 className="text-xl font-bold mb-4">Essential Modules</h3>
              <p className="text-slate-400 mb-6">Select the modules you want to include in your habitat:</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { type: ModuleType.COMMAND, name: 'Command Center', desc: 'Mission control and communications', essential: true },
                  { type: ModuleType.HABITATION, name: 'Crew Quarters', desc: 'Living space and personal areas', essential: true },
                  { type: ModuleType.LOGISTICS, name: 'Storage Bay', desc: 'Equipment and supply storage', essential: true },
                  { type: ModuleType.EXERCISE, name: 'Fitness Module', desc: 'Exercise equipment for crew health', essential: true },
                  { type: ModuleType.LABORATORY, name: 'Research Lab', desc: 'Scientific experiments and analysis', essential: false },
                  { type: ModuleType.MEDICAL, name: 'Medical Bay', desc: 'Healthcare and emergency treatment', essential: false },
                  { type: ModuleType.AIRLOCK, name: 'Airlock', desc: 'EVA access and contamination control', essential: false },
                  { type: ModuleType.GREENHOUSE, name: 'Greenhouse', desc: 'Food production and life support', essential: false }
                ].map((module) => (
                  <div
                    key={module.type}
                    className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                      designData.modules.includes(module.type) || module.essential
                        ? 'border-green-500 bg-green-500/20'
                        : 'border-slate-600 hover:border-slate-500'
                    } ${module.essential ? 'opacity-75' : ''}`}
                    onClick={() => {
                      if (!module.essential) {
                        if (designData.modules.includes(module.type)) {
                          setDesignData({
                            ...designData,
                            modules: designData.modules.filter(m => m !== module.type)
                          });
                        } else {
                          setDesignData({
                            ...designData,
                            modules: [...designData.modules, module.type]
                          });
                        }
                      }
                    }}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="font-medium text-white">{module.name}</div>
                        <div className="text-sm text-slate-400 mt-1">{module.desc}</div>
                        {module.essential && (
                          <div className="text-xs text-green-400 mt-2">✓ Essential Module</div>
                        )}
                      </div>
                      <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                        designData.modules.includes(module.type) || module.essential
                          ? 'border-green-500 bg-green-500'
                          : 'border-slate-500'
                      }`}>
                        {(designData.modules.includes(module.type) || module.essential) && (
                          <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Step 5: Success */}
          {step === 5 && (
            <div className="text-center py-12">
              <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-green-400 mb-4">Habitat Created Successfully!</h3>
              <p className="text-slate-300 mb-2">Your space habitat "{designData.name}" has been created.</p>
              <p className="text-slate-400 text-sm">You'll be redirected to the 3D viewer shortly...</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-slate-700/50 bg-slate-800/30">
          <button
            onClick={handlePrev}
            disabled={step === 1}
            className="btn-outline px-6 py-3 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          
          <div className="text-sm text-slate-400">
            Step {step} of 4
          </div>
          
          {step < 4 ? (
            <button
              onClick={handleNext}
              disabled={step === 1 && (!designData.name || !designData.description)}
              className="btn-primary px-6 py-3 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          ) : (
            <button
              onClick={handleCreate}
              className="btn-primary px-6 py-3"
            >
              Create Habitat
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
