import React, { useMemo, useState } from 'react';
import { useHabitatStore } from '../../stores/habitatStore';
import { ModuleType, Destination, HabitatShape } from '../../types/habitat';

interface ValidationPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ValidationResult {
  category: string;
  tests: Array<{
    name: string;
    status: 'pass' | 'warning' | 'fail';
    message: string;
    requirement?: string;
    actual?: string;
    recommendation?: string;
  }>;
}

export function EnhancedValidationPanel({ isOpen, onClose }: ValidationPanelProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'detailed' | 'guidelines'>('overview');
  const { currentDesign, complianceScore } = useHabitatStore();

  const validationResults = useMemo((): ValidationResult[] => {
    if (!currentDesign) return [];

    const results: ValidationResult[] = [];

    // Structural Requirements
    const structuralTests = [];
    
    // Calculate volume based on shape
    let totalVolume = 0;
    const dimensions = currentDesign.dimensions;
    
    switch (dimensions.shape) {
      case 'cylinder':
        if (dimensions.radius && dimensions.height) {
          totalVolume = Math.PI * dimensions.radius * dimensions.radius * dimensions.height;
        }
        break;
      case 'sphere':
        if (dimensions.sphereRadius) {
          totalVolume = (4/3) * Math.PI * Math.pow(dimensions.sphereRadius, 3);
        }
        break;
      case 'torus':
        if (dimensions.majorRadius && dimensions.minorRadius) {
          totalVolume = 2 * Math.PI * Math.PI * dimensions.majorRadius * dimensions.minorRadius * dimensions.minorRadius;
        }
        break;
      case 'dome':
        if (dimensions.domeRadius && dimensions.domeHeight) {
          totalVolume = (2/3) * Math.PI * dimensions.domeRadius * dimensions.domeRadius * dimensions.domeHeight;
        }
        break;
      default:
        if (dimensions.length && dimensions.width && dimensions.depth) {
          totalVolume = dimensions.length * dimensions.width * dimensions.depth;
        }
        break;
    }
    
    const volumePerPerson = totalVolume / currentDesign.missionParameters.crewSize;
    
    if (volumePerPerson >= 20) {
      structuralTests.push({
        name: 'Personal Volume',
        status: 'pass' as const,
        message: 'Adequate personal volume per crew member',
        requirement: '≥20 m³ per person',
        actual: `${volumePerPerson.toFixed(1)} m³ per person`
      });
    } else if (volumePerPerson >= 15) {
      structuralTests.push({
        name: 'Personal Volume',
        status: 'warning' as const,
        message: 'Minimal personal volume per crew member',
        requirement: '≥20 m³ per person',
        actual: `${volumePerPerson.toFixed(1)} m³ per person`,
        recommendation: 'Consider increasing habitat volume for crew comfort'
      });
    } else {
      structuralTests.push({
        name: 'Personal Volume',
        status: 'fail' as const,
        message: 'Insufficient personal volume per crew member',
        requirement: '≥20 m³ per person',
        actual: `${volumePerPerson.toFixed(1)} m³ per person`,
        recommendation: 'Increase habitat dimensions or reduce crew size'
      });
    }

    // Pressure integrity
    if (dimensions.shape === HabitatShape.CYLINDER || dimensions.shape === HabitatShape.SPHERE) {
      structuralTests.push({
        name: 'Pressure Vessel Design',
        status: 'pass' as const,
        message: 'Optimal shape for pressure containment',
        requirement: 'Cylindrical or spherical design preferred'
      });
    } else {
      structuralTests.push({
        name: 'Pressure Vessel Design',
        status: 'warning' as const,
        message: 'Non-optimal shape for pressure containment',
        requirement: 'Cylindrical or spherical design preferred',
        recommendation: 'Consider structural reinforcement for complex shapes'
      });
    }

    results.push({
      category: 'Structural Requirements',
      tests: structuralTests
    });

    // Life Support Systems
    const lifeSupportTests = [];
    const hasLifeSupport = currentDesign.modules.some(m => m.type === ModuleType.MEDICAL || m.type === ModuleType.HABITATION);
    const hasEmergencyBackup = currentDesign.modules.filter(m => m.type === ModuleType.MEDICAL || m.type === ModuleType.HABITATION).length >= 2;

    if (hasLifeSupport) {
      lifeSupportTests.push({
        name: 'Primary Life Support',
        status: 'pass' as const,
        message: 'Life support module present',
        requirement: 'At least one life support module required'
      });
    } else {
      lifeSupportTests.push({
        name: 'Primary Life Support',
        status: 'fail' as const,
        message: 'No life support module found',
        requirement: 'At least one life support module required',
        recommendation: 'Add a life support module immediately'
      });
    }

    if (hasEmergencyBackup) {
      lifeSupportTests.push({
        name: 'Backup Life Support',
        status: 'pass' as const,
        message: 'Redundant life support systems available',
        requirement: 'Backup systems recommended for long missions'
      });
    } else if (currentDesign.missionParameters.duration > 30) {
      lifeSupportTests.push({
        name: 'Backup Life Support',
        status: 'warning' as const,
        message: 'No backup life support for extended mission',
        requirement: 'Backup systems recommended for long missions',
        recommendation: 'Add redundant life support for mission safety'
      });
    }

    results.push({
      category: 'Life Support Systems',
      tests: lifeSupportTests
    });

    // Crew Facilities
    const crewTests: Array<{
      name: string;
      status: 'pass' | 'warning' | 'fail';
      message: string;
      requirement?: string;
      actual?: string;
      recommendation?: string;
    }> = [];
    const hasLiving = currentDesign.modules.some(m => m.type === ModuleType.HABITATION);
    const hasWorkspace = currentDesign.modules.some(m => m.type === ModuleType.LABORATORY || m.type === ModuleType.WORKSHOP);
    const hasStorage = currentDesign.modules.some(m => m.type === ModuleType.LOGISTICS);
    const hasExercise = currentDesign.modules.some(m => m.type === ModuleType.EXERCISE);

    [
      { check: hasLiving, name: 'Living Quarters', type: ModuleType.HABITATION },
      { check: hasWorkspace, name: 'Work Areas', type: ModuleType.LABORATORY },
      { check: hasStorage, name: 'Storage Space', type: ModuleType.LOGISTICS },
      { check: hasExercise, name: 'Exercise Facility', type: ModuleType.EXERCISE }
    ].forEach(({ check, name, type }) => {
      if (check) {
        crewTests.push({
          name,
          status: 'pass' as const,
          message: `${name} module available`,
          requirement: `${name} required for crew health and productivity`
        });
      } else {
        crewTests.push({
          name,
          status: currentDesign.missionParameters.duration > 30 ? 'fail' as const : 'warning' as const,
          message: `No ${name.toLowerCase()} module found`,
          requirement: `${name} required for crew health and productivity`,
          recommendation: `Add a ${type} module for crew well-being`
        });
      }
    });

    results.push({
      category: 'Crew Facilities',
      tests: crewTests
    });

    // Mission Specific
    const missionTests = [];
    
    if (currentDesign.missionParameters.destination === Destination.MARS_SURFACE) {
      const hasAirlock = currentDesign.modules.some(m => m.type === ModuleType.AIRLOCK);
      if (hasAirlock) {
        missionTests.push({
          name: 'Mars EVA Capability',
          status: 'pass' as const,
          message: 'Airlock available for Mars surface operations',
          requirement: 'Airlock required for Mars surface missions'
        });
      } else {
        missionTests.push({
          name: 'Mars EVA Capability',
          status: 'fail' as const,
          message: 'No airlock for Mars surface operations',
          requirement: 'Airlock required for Mars surface missions',
          recommendation: 'Add airlock module for surface EVA activities'
        });
      }
    }

    if (currentDesign.missionParameters.duration > 180) {
      const hasRecreation = currentDesign.modules.some(m => m.type === ModuleType.RECREATION);
      if (hasRecreation) {
        missionTests.push({
          name: 'Long Duration Support',
          status: 'pass' as const,
          message: 'Recreation facilities for extended mission',
          requirement: 'Recreation facilities needed for missions >6 months'
        });
      } else {
        missionTests.push({
          name: 'Long Duration Support',
          status: 'warning' as const,
          message: 'No recreation facilities for extended mission',
          requirement: 'Recreation facilities needed for missions >6 months',
          recommendation: 'Add recreation module for crew psychological health'
        });
      }
    }

    if (missionTests.length > 0) {
      results.push({
        category: 'Mission Specific',
        tests: missionTests
      });
    }

    return results;
  }, [currentDesign]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pass': return 'text-green-400';
      case 'warning': return 'text-yellow-400';
      case 'fail': return 'text-red-400';
      default: return 'text-slate-400';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pass': return '✅';
      case 'warning': return '⚠️';
      case 'fail': return '❌';
      default: return '❓';
    }
  };

  const getOverallStatus = () => {
    if (complianceScore >= 90) return { status: 'pass', text: 'Excellent', color: 'text-green-400' };
    if (complianceScore >= 80) return { status: 'pass', text: 'Good', color: 'text-green-400' };
    if (complianceScore >= 70) return { status: 'warning', text: 'Acceptable', color: 'text-yellow-400' };
    if (complianceScore >= 60) return { status: 'warning', text: 'Needs Improvement', color: 'text-yellow-400' };
    return { status: 'fail', text: 'Critical Issues', color: 'text-red-400' };
  };

  const overallStatus = getOverallStatus();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Panel */}
      <div className="relative w-full max-w-6xl max-h-[90vh] glass-effect border border-slate-600/50 rounded-2xl shadow-2xl overflow-hidden animate-slide-up">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-700/50">
          <div className="flex items-center space-x-4">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
              overallStatus.status === 'pass' ? 'bg-green-500/20' :
              overallStatus.status === 'warning' ? 'bg-yellow-500/20' :
              'bg-red-500/20'
            }`}>
              <span className="text-2xl">{getStatusIcon(overallStatus.status)}</span>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gradient">NASA Compliance Validation</h2>
              <p className="text-slate-400">
                <span className={`font-semibold ${overallStatus.color}`}>
                  {overallStatus.text}
                </span> 
                {' • '}
                <span className="font-bold">{complianceScore}%</span> compliance score
              </p>
            </div>
          </div>
          
          <button 
            onClick={onClose}
            className="btn-ghost p-3 hover:bg-red-500/20"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-700/50">
          {[
            { id: 'overview', label: '📊 Overview', count: validationResults.reduce((acc, cat) => acc + cat.tests.length, 0) },
            { id: 'detailed', label: '🔍 Detailed Analysis', count: validationResults.length },
            { id: 'guidelines', label: '📖 NASA Guidelines', count: null }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-6 py-4 text-sm font-semibold transition-all ${
                activeTab === tab.id
                  ? 'border-b-2 border-blue-500 text-blue-400 bg-blue-500/10'
                  : 'text-slate-400 hover:text-white hover:bg-slate-700/30'
              }`}
            >
              {tab.label}
              {tab.count !== null && (
                <span className="ml-2 px-2 py-1 bg-slate-600/50 rounded-full text-xs">
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="p-6 max-h-[60vh] overflow-y-auto scrollbar-thin">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Compliance Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                {validationResults.map((category) => {
                  const passed = category.tests.filter(t => t.status === 'pass').length;
                  const warnings = category.tests.filter(t => t.status === 'warning').length;
                  const failed = category.tests.filter(t => t.status === 'fail').length;
                  const total = category.tests.length;
                  const percentage = Math.round((passed / total) * 100);
                  
                  return (
                    <div key={category.category} className="glass-effect rounded-xl p-6 border border-slate-600/30">
                      <h3 className="font-bold text-lg mb-4">{category.category}</h3>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-slate-400">Compliance</span>
                          <span className={`font-bold ${getStatusColor(percentage >= 80 ? 'pass' : percentage >= 60 ? 'warning' : 'fail')}`}>
                            {percentage}%
                          </span>
                        </div>
                        <div className="w-full bg-slate-700/50 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full transition-all duration-500 ${
                              percentage >= 80 ? 'bg-green-500' :
                              percentage >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                            }`}
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-green-400">✅ {passed}</span>
                          <span className="text-yellow-400">⚠️ {warnings}</span>
                          <span className="text-red-400">❌ {failed}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Critical Issues */}
              {validationResults.some(cat => cat.tests.some(t => t.status === 'fail')) && (
                <div className="glass-effect rounded-xl p-6 border border-red-500/30 bg-red-500/5">
                  <h3 className="font-bold text-lg mb-4 text-red-400">🚨 Critical Issues</h3>
                  <div className="space-y-3">
                    {validationResults.map(category => 
                      category.tests
                        .filter(test => test.status === 'fail')
                        .map(test => (
                          <div key={`${category.category}-${test.name}`} className="p-4 bg-red-500/10 rounded-lg border border-red-500/20">
                            <div className="font-semibold text-red-400">{test.name}</div>
                            <div className="text-sm text-slate-300 mt-1">{test.message}</div>
                            {test.recommendation && (
                              <div className="text-sm text-blue-400 mt-2">
                                💡 {test.recommendation}
                              </div>
                            )}
                          </div>
                        ))
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'detailed' && (
            <div className="space-y-8">
              {validationResults.map((category) => (
                <div key={category.category} className="glass-effect rounded-xl p-6 border border-slate-600/30">
                  <h3 className="font-bold text-xl mb-6 text-gradient">{category.category}</h3>
                  <div className="space-y-4">
                    {category.tests.map((test, index) => (
                      <div key={index} className="p-4 bg-slate-800/30 rounded-lg border border-slate-600/20">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center space-x-3">
                            <span className="text-lg">{getStatusIcon(test.status)}</span>
                            <span className="font-semibold">{test.name}</span>
                          </div>
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold uppercase ${
                            test.status === 'pass' ? 'bg-green-500/20 text-green-400' :
                            test.status === 'warning' ? 'bg-yellow-500/20 text-yellow-400' :
                            'bg-red-500/20 text-red-400'
                          }`}>
                            {test.status}
                          </span>
                        </div>
                        
                        <p className="text-slate-300 mb-3">{test.message}</p>
                        
                        {test.requirement && (
                          <div className="text-sm text-slate-400 mb-2">
                            <strong>Requirement:</strong> {test.requirement}
                          </div>
                        )}
                        
                        {test.actual && (
                          <div className="text-sm text-slate-400 mb-2">
                            <strong>Actual:</strong> {test.actual}
                          </div>
                        )}
                        
                        {test.recommendation && (
                          <div className="text-sm text-blue-400 bg-blue-500/10 p-3 rounded-lg border border-blue-500/20">
                            <strong>💡 Recommendation:</strong> {test.recommendation}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'guidelines' && (
            <div className="space-y-6">
              <div className="glass-effect rounded-xl p-6 border border-slate-600/30">
                <h3 className="font-bold text-xl mb-4 text-gradient">🚀 NASA Space Habitat Design Guidelines</h3>
                
                <div className="space-y-6">
                  <div className="space-y-4">
                    <h4 className="font-semibold text-lg text-blue-400">Volume Requirements</h4>
                    <ul className="space-y-2 text-slate-300">
                      <li>• Minimum 15 m³ personal volume per crew member</li>
                      <li>• Recommended 20-25 m³ for long-duration missions</li>
                      <li>• Additional common area space of 10-15 m³ per person</li>
                    </ul>
                  </div>
                  
                  <div className="space-y-4">
                    <h4 className="font-semibold text-lg text-blue-400">Life Support Systems</h4>
                    <ul className="space-y-2 text-slate-300">
                      <li>• Primary and backup life support systems required</li>
                      <li>• Atmosphere: 21% O₂, 79% N₂ at 101.3 kPa</li>
                      <li>• Temperature: 18-24°C operational range</li>
                      <li>• Humidity: 25-75% relative humidity</li>
                    </ul>
                  </div>
                  
                  <div className="space-y-4">
                    <h4 className="font-semibold text-lg text-blue-400">Structural Design</h4>
                    <ul className="space-y-2 text-slate-300">
                      <li>• Pressure vessel design with factor of safety ≥ 4</li>
                      <li>• Cylindrical or spherical shapes preferred for pressure integrity</li>
                      <li>• Micrometeorite protection (MMOD shielding)</li>
                      <li>• Radiation shielding for deep space missions</li>
                    </ul>
                  </div>
                  
                  <div className="space-y-4">
                    <h4 className="font-semibold text-lg text-blue-400">Crew Health & Safety</h4>
                    <ul className="space-y-2 text-slate-300">
                      <li>• Exercise facilities for missions {'>'}30 days</li>
                      <li>• Medical bay for crew {'>'}4 or missions {'>'}90 days</li>
                      <li>• Fire suppression and emergency systems</li>
                      <li>• EVA capability for surface missions</li>
                    </ul>
                  </div>
                  
                  <div className="space-y-4">
                    <h4 className="font-semibold text-lg text-blue-400">Mission Specific</h4>
                    <ul className="space-y-2 text-slate-300">
                      <li>• Mars missions: Dust mitigation and surface operations support</li>
                      <li>• Lunar missions: Regolith protection and resource utilization</li>
                      <li>• Deep space: Enhanced radiation protection and psychological support</li>
                      <li>• Long duration ({'>'}6 months): Recreation and social spaces</li>
                    </ul>
                  </div>
                </div>
                
                <div className="mt-8 p-4 bg-blue-500/10 rounded-lg border border-blue-500/20">
                  <p className="text-sm text-blue-400">
                    <strong>📖 Reference:</strong> These guidelines are based on NASA's Human Integration Design Handbook (NASA/SP-2010-3407), 
                    Spacecraft Habitability Guidelines, and lessons learned from ISS operations.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}