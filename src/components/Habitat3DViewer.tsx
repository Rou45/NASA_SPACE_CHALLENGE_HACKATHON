import React, { useRef, useState, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Text, Box, Sphere, Cylinder, Torus, Environment, Grid } from '@react-three/drei';
import { useHabitatStore } from '../stores/habitatStore';
import { HabitatShape, ModuleType } from '../types/habitat';
import * as THREE from 'three';
import PerformanceStats from './PerformanceStats';
import { useTheme } from '../contexts/ThemeContext';

interface HabitatMeshProps {
  shape: HabitatShape;
  dimensions: any;
  position?: [number, number, number];
  color?: string;
  onHabitatClick?: (event: any) => void;
}

function HabitatMesh({ shape, dimensions, position = [0, 0, 0], color = '#3b82f6', onHabitatClick }: HabitatMeshProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.1) * 0.05;
    }
  });

  const displayColor = hovered ? '#60a5fa' : color; // Lighter blue on hover

  const getMeshComponent = () => {
    switch (shape) {
      case HabitatShape.CYLINDER:
        return (
          <Cylinder
            ref={meshRef}
            args={[dimensions.radius || 5, dimensions.radius || 5, dimensions.height || 10, 32]}
            position={position}
            onClick={onHabitatClick}
            onPointerOver={() => setHovered(true)}
            onPointerOut={() => setHovered(false)}
          >
            <meshStandardMaterial 
              color={displayColor} 
              transparent 
              opacity={hovered ? 0.95 : 0.9} 
              roughness={0.2}
              metalness={0.3}
            />
          </Cylinder>
        );
      
      case HabitatShape.SPHERE:
        return (
          <Sphere
            ref={meshRef}
            args={[dimensions.sphereRadius || 5, 32, 32]}
            position={position}
            onClick={onHabitatClick}
            onPointerOver={() => setHovered(true)}
            onPointerOut={() => setHovered(false)}
          >
            <meshStandardMaterial 
              color={displayColor} 
              transparent 
              opacity={hovered ? 0.85 : 0.8} 
              roughness={0.3}
              metalness={0.1}
            />
          </Sphere>
        );
      
      case HabitatShape.TORUS:
        return (
          <Torus
            ref={meshRef}
            args={[dimensions.majorRadius || 8, dimensions.minorRadius || 2, 16, 100]}
            position={position}
            onClick={onHabitatClick}
            onPointerOver={() => setHovered(true)}
            onPointerOut={() => setHovered(false)}
          >
            <meshStandardMaterial 
              color={displayColor} 
              transparent 
              opacity={hovered ? 0.85 : 0.8} 
              roughness={0.3}
              metalness={0.1}
            />
          </Torus>
        );
      
      case HabitatShape.DOME:
        return (
          <Sphere
            ref={meshRef}
            args={[dimensions.domeRadius || 5, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2]}
            position={position}
            onClick={onHabitatClick}
            onPointerOver={() => setHovered(true)}
            onPointerOut={() => setHovered(false)}
          >
            <meshStandardMaterial 
              color={displayColor} 
              transparent 
              opacity={hovered ? 0.85 : 0.8} 
              roughness={0.3}
              metalness={0.1}
              side={THREE.DoubleSide}
            />
          </Sphere>
        );
      
      default:
        return (
          <Box
            ref={meshRef}
            args={[dimensions.length || 10, dimensions.height || 6, dimensions.width || 8]}
            position={position}
            onClick={onHabitatClick}
            onPointerOver={() => setHovered(true)}
            onPointerOut={() => setHovered(false)}
          >
            <meshStandardMaterial 
              color={displayColor} 
              transparent 
              opacity={hovered ? 0.85 : 0.8} 
              roughness={0.3}
              metalness={0.1}
            />
          </Box>
        );
    }
  };

  return getMeshComponent();
}

interface ModuleMeshProps {
  module: any;
  index: number;
  onDragStateChange: (isDragging: boolean) => void;
}

function ModuleMesh({ module, index, onDragStateChange }: ModuleMeshProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const { selectModule, selectedModuleId, updateModule, currentDesign } = useHabitatStore();
  const [hovered, setHovered] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number } | null>(null);
  
  const getModuleColor = (type: ModuleType) => {
    switch (type) {
      case ModuleType.COMMAND: return '#ef4444'; // Red
      case ModuleType.HABITATION: return '#10b981'; // Green
      case ModuleType.LABORATORY: return '#3b82f6'; // Blue
      case ModuleType.LOGISTICS: return '#f59e0b'; // Orange
      case ModuleType.EXERCISE: return '#8b5cf6'; // Purple
      case ModuleType.MEDICAL: return '#ec4899'; // Pink
      case ModuleType.AIRLOCK: return '#6b7280'; // Gray
      case ModuleType.GREENHOUSE: return '#22c55e'; // Light Green
      case ModuleType.WORKSHOP: return '#f97316'; // Orange-Red
      case ModuleType.RECREATION: return '#06b6d4'; // Cyan
      default: return '#64748b'; // Slate
    }
  };

  const baseColor = getModuleColor(module.type);
  const isSelected = selectedModuleId === module.id;
  
  // Brighten color when hovered, selected, or dragging
  const displayColor = isSelected 
    ? '#ffffff' 
    : isDragging
      ? '#f97316' // Orange when dragging
      : hovered 
        ? '#fbbf24' // Yellow on hover
        : baseColor;

  const position: [number, number, number] = [
    module.position?.x || (index * 3 - 6),
    module.position?.y || 2,
    module.position?.z || 0
  ];

  // Check if this module is close to other modules
  const isNearOtherModules = () => {
    if (!currentDesign) return false;
    
    const currentPos = {
      x: module.position?.x || (index * 3 - 6),
      z: module.position?.z || 0
    };
    
    return currentDesign.modules.some(otherModule => {
      if (otherModule.id === module.id) return false; // Skip self
      
      const otherPos = {
        x: otherModule.position?.x || (currentDesign.modules.findIndex(m => m.id === otherModule.id) * 3 - 6),
        z: otherModule.position?.z || 0
      };
      
      const distance = Math.sqrt(
        Math.pow(currentPos.x - otherPos.x, 2) + 
        Math.pow(currentPos.z - otherPos.z, 2)
      );
      
      return distance < 4; // Show text only if distance > 4 units
    });
  };

  const shouldShowText = isSelected || (!isNearOtherModules() && !isDragging);

  // Handle module click
  const handleClick = (event: any) => {
    if (isDragging) return; // Don't select if we're dragging
    event.stopPropagation();
    selectModule(module.id);
    console.log(`Selected module: ${module.name} (${module.type})`);
  };

  // Handle drag start
  const handlePointerDown = (event: any) => {
    if (event.altKey || event.ctrlKey) { // Hold Alt/Ctrl to enable dragging
      event.stopPropagation();
      setIsDragging(true);
      setDragStart({ x: event.clientX, y: event.clientY });
      selectModule(module.id); // Select module when starting drag
      onDragStateChange(true); // Notify parent about drag start
      console.log(`Started dragging: ${module.name}`);
    }
  };

  // Handle drag move with optional grid snapping
  const handlePointerMove = (event: any) => {
    if (isDragging && dragStart) {
      const deltaX = (event.clientX - dragStart.x) * 0.02; // Scale factor for movement
      const deltaZ = (event.clientY - dragStart.y) * 0.02;
      
      let newX = (module.position?.x || (index * 3 - 6)) + deltaX;
      let newZ = (module.position?.z || 0) + deltaZ;
      
      // Snap to grid if Shift is held
      if (event.shiftKey) {
        newX = Math.round(newX / 2) * 2; // Snap to 2-unit grid
        newZ = Math.round(newZ / 2) * 2;
      }
      
      // Update module position
      const newPosition = {
        x: newX,
        y: module.position?.y || 2,
        z: newZ
      };
      
      updateModule(module.id, { position: newPosition });
      setDragStart({ x: event.clientX, y: event.clientY }); // Update drag start for next move
    }
  };

  // Handle drag end
  const handlePointerUp = () => {
    if (isDragging) {
      setIsDragging(false);
      setDragStart(null);
      onDragStateChange(false); // Notify parent about drag end
      console.log(`Finished dragging: ${module.name}`);
    }
  };

  // Add global event listeners for drag
  useEffect(() => {
    if (isDragging) {
      document.addEventListener('pointermove', handlePointerMove);
      document.addEventListener('pointerup', handlePointerUp);
      
      return () => {
        document.removeEventListener('pointermove', handlePointerMove);
        document.removeEventListener('pointerup', handlePointerUp);
      };
    }
  }, [isDragging, dragStart, module, index]);

  return (
    <group position={position}>
      <Box
        ref={meshRef}
        args={[2, 2, 2]}
        onClick={handleClick}
        onPointerDown={handlePointerDown}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
        scale={isSelected ? [1.1, 1.1, 1.1] : hovered || isDragging ? [1.05, 1.05, 1.05] : [1, 1, 1]}
      >
        <meshStandardMaterial 
          color={displayColor}
          roughness={isSelected ? 0.2 : 0.4}
          metalness={isSelected ? 0.8 : 0.6}
          emissive={isSelected ? baseColor : hovered || isDragging ? '#333333' : '#000000'}
          emissiveIntensity={isSelected ? 0.3 : hovered || isDragging ? 0.1 : 0}
        />
      </Box>
      {/* Module Name - Only show if selected or not near other modules */}
      {shouldShowText && (
        <Text
          position={[0, 1.5, 0]}
          fontSize={isSelected ? 0.35 : 0.3}
          color={isSelected ? "#fbbf24" : isDragging ? "#f97316" : "white"}
          anchorX="center"
          anchorY="middle"
        >
          {module.name}
        </Text>
      )}
      
      {/* Module Type - Only show if selected or dragging */}
      {(isSelected || isDragging) && (
        <Text
          position={[0, -1.5, 0]}
          fontSize={isSelected ? 0.25 : 0.2}
          color={isSelected ? "#fbbf24" : isDragging ? "#f97316" : "#94a3b8"}
          anchorX="center"
          anchorY="middle"
        >
          {isDragging ? "DRAGGING..." : module.type.replace('_', ' ').toUpperCase()}
        </Text>
      )}
      
      {/* Hover indicator for crowded areas */}
      {!shouldShowText && hovered && (
        <Text
          position={[0, 3.5, 0]}
          fontSize={0.25}
          color="#fbbf24"
          anchorX="center"
          anchorY="middle"
        >
          {module.name}
        </Text>
      )}
      
      {/* Selection indicator */}
      {isSelected && (
        <mesh position={[0, 3, 0]}>
          <sphereGeometry args={[0.2, 8, 8]} />
          <meshStandardMaterial 
            color="#fbbf24" 
            emissive="#fbbf24" 
            emissiveIntensity={0.5}
          />
        </mesh>
      )}
      
      {/* Drag indicator */}
      {isDragging && (
        <mesh position={[0, -3, 0]}>
          <boxGeometry args={[0.5, 0.1, 0.5]} />
          <meshStandardMaterial 
            color="#f97316" 
            emissive="#f97316" 
            emissiveIntensity={0.7}
          />
        </mesh>
      )}
    </group>
  );
}

function SceneControls({ animationSpeed, isDraggingModule }: { animationSpeed: number; isDraggingModule: boolean }) {
  const { camera, gl } = useThree();
  
  return (
    <OrbitControls
      camera={camera}
      domElement={gl.domElement}
      enablePan={!isDraggingModule}
      enableZoom={!isDraggingModule}
      enableRotate={!isDraggingModule}
      minDistance={5}
      maxDistance={50}
      autoRotate={animationSpeed > 0 && !isDraggingModule}
      autoRotateSpeed={animationSpeed}
    />
  );
}

function SceneLighting({ isDayMode }: { isDayMode: boolean }) {
  if (isDayMode) {
    // Day mode - bright, warm lighting
    return (
      <>
        <ambientLight intensity={0.8} color="#ffffff" />
        <directionalLight
          position={[10, 10, 5]}
          intensity={2.0}
          color="#ffffff"
          castShadow
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
        />
        <directionalLight
          position={[-10, 10, -5]}
          intensity={1.0}
          color="#fff8e1"
        />
        <pointLight position={[-10, -10, -10]} intensity={0.5} color="#ffd54f" />
        <pointLight position={[10, -10, 10]} intensity={0.5} color="#ffb74d" />
        <spotLight
          position={[0, 25, 0]}
          intensity={1.5}
          angle={0.4}
          penumbra={0.5}
          color="#ffffff"
          castShadow
        />
      </>
    );
  } else {
    // Night mode - cool, moonlit atmosphere
    return (
      <>
        <ambientLight intensity={0.3} color="#1a237e" />
        <directionalLight
          position={[10, 10, 5]}
          intensity={0.8}
          color="#bbdefb"
          castShadow
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
        />
        <directionalLight
          position={[-10, 10, -5]}
          intensity={0.4}
          color="#3f51b5"
        />
        <pointLight position={[-10, -10, -10]} intensity={0.6} color="#5c6bc0" />
        <pointLight position={[10, -10, 10]} intensity={0.6} color="#7986cb" />
        <spotLight
          position={[0, 25, 0]}
          intensity={0.8}
          angle={0.4}
          penumbra={0.8}
          color="#9fa8da"
          castShadow
        />
      </>
    );
  }
}

interface Habitat3DViewerProps {
  showStats?: boolean;
  showGrid?: boolean;
  autoRotate?: boolean;
}

export function Habitat3DViewer({ showStats = false, showGrid = true, autoRotate = false }: Habitat3DViewerProps) {
  const { currentDesign, selectModule, selectedModuleId, updateModule } = useHabitatStore();
  const { isDayMode } = useTheme();
  const [cameraPosition, setCameraPosition] = useState<[number, number, number]>([20, 15, 20]);
  const [animationSpeed, setAnimationSpeed] = useState(0.5);
  const [localShowGrid, setLocalShowGrid] = useState(showGrid);
  const [localShowStats, setLocalShowStats] = useState(showStats);
  const [isDraggingAnyModule, setIsDraggingAnyModule] = useState(false);

  // Handle background click to deselect modules
  const handleBackgroundClick = () => {
    selectModule(null);
  };

  // Handle habitat structure click to open module wizard
  const handleHabitatClick = (event: any) => {
    event.stopPropagation();
    // Dispatch custom event to open design wizard
    window.dispatchEvent(new CustomEvent('openDesignWizard'));
  };

  useEffect(() => {
    // Adjust camera based on habitat size
    if (currentDesign) {
      const dimensions = currentDesign.dimensions;
      let maxDimension = 15;
      
      switch (dimensions.shape) {
        case HabitatShape.CYLINDER:
          maxDimension = Math.max(dimensions.radius || 5, dimensions.height || 10);
          break;
        case HabitatShape.SPHERE:
          maxDimension = dimensions.sphereRadius || 5;
          break;
        case HabitatShape.TORUS:
          maxDimension = (dimensions.majorRadius || 8) + (dimensions.minorRadius || 2);
          break;
        default:
          maxDimension = Math.max(
            dimensions.length || 10,
            dimensions.height || 6,
            dimensions.width || 8
          );
      }
      
      const distance = maxDimension * 3;
      setCameraPosition([distance, distance * 0.8, distance]);
    }
  }, [currentDesign]);

  if (!currentDesign) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-900 to-blue-900">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center animate-pulse">
            <span className="text-2xl">🏠</span>
          </div>
          <h3 className="text-xl font-bold text-white mb-2">Loading Habitat Design...</h3>
          <p className="text-slate-400">Please wait while we prepare your 3D workspace</p>
        </div>
      </div>
    );
  }

  // Ensure we have proper dimensions
  const dimensions = currentDesign.dimensions || {
    shape: HabitatShape.CYLINDER,
    radius: 6,
    height: 12
  };

  // Ensure we have modules
  const modules = currentDesign.modules || [];

  // Ensure we have mission parameters
  const mission = currentDesign.missionParameters || {
    destination: 'Lunar Surface',
    crewSize: 4,
    duration: 180
  };

  return (
    <div className="w-full h-full relative">
      <Canvas
        camera={{ position: cameraPosition, fov: 60 }}
        shadows
        className={isDayMode 
          ? "bg-gradient-to-br from-blue-900 via-slate-800 to-gray-900" 
          : "bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900"
        }
        style={{ minHeight: '500px', cursor: 'grab' }}
        onClick={handleBackgroundClick}
        onCreated={({ gl }) => {
          // Handle WebGL context loss
          gl.domElement.addEventListener('webglcontextlost', (event) => {
            console.warn('WebGL context lost, preventing default...');
            event.preventDefault();
          });
          
          gl.domElement.addEventListener('webglcontextrestored', () => {
            console.log('WebGL context restored');
            // Force re-render
            gl.setSize(gl.domElement.clientWidth, gl.domElement.clientHeight);
          });
        }}
        gl={{ 
          antialias: true,
          alpha: false,
          powerPreference: "default",
          failIfMajorPerformanceCaveat: false
        }}
      >
        {/* Environment and Lighting */}
        <SceneLighting isDayMode={isDayMode} />
        <Environment preset={isDayMode ? "sunset" : "night"} />
        
        {/* Grid */}
        {localShowGrid && (
          <Grid
            args={[100, 100]}
            position={[0, -8, 0]}
            fadeDistance={50}
            fadeStrength={0.5}
          />
        )}
        
        {/* Main Habitat Structure */}
        <HabitatMesh
          shape={dimensions.shape}
          dimensions={dimensions}
          color="#2563eb"
          position={[0, 0, 0]}
          onHabitatClick={handleHabitatClick}
        />
        
        {/* Modules */}
        {modules.map((module, index) => (
          <ModuleMesh
            key={module.id || `module-${index}`}
            module={module}
            index={index}
            onDragStateChange={(dragging) => setIsDraggingAnyModule(dragging)}
          />
        ))}
        
        {/* Mission Info Display */}
        <Text
          position={[0, 15, 0]}
          fontSize={1.2}
          color="#ffffff"
          anchorX="center"
          anchorY="middle"
        >
          {currentDesign?.name || 'Default Habitat'}
        </Text>
        
        <Text
          position={[0, 12, 0]}
          fontSize={0.6}
          color="#94a3b8"
          anchorX="center"
          anchorY="middle"
        >
          {mission.destination?.toUpperCase() || 'LUNAR SURFACE'} Mission • {mission.crewSize || 4} Crew • {mission.duration || 180} Days
        </Text>
        
        {/* Controls */}
        <SceneControls animationSpeed={animationSpeed} isDraggingModule={isDraggingAnyModule} />
      </Canvas>

      {/* Custom Performance Stats */}
      <PerformanceStats isVisible={localShowStats} />
      
      {/* UI Overlay - Top Left (3D Instructions) */}
      <div className="absolute top-6 left-6 z-10">
        <div className="glass-effect rounded-lg p-3 border border-slate-600/50">
          <div className="text-sm text-white font-medium mb-2">3D Controls</div>
          <div className="text-xs text-slate-400 space-y-1">
            <div>🖱️ Drag to rotate</div>
            <div>🔍 Scroll to zoom</div>
            <div>⌨️ Right-click to pan</div>
            <div className="border-t border-slate-600 pt-1 mt-2">
              <div className="text-yellow-400">📦 Click modules to select</div>
              <div className="text-green-400">🏗️ Click habitat to add modules</div>
              <div className="text-orange-400">🔄 Alt+Drag to move modules</div>
              <div className="text-cyan-400">⌨️ Shift+Drag for grid snap</div>
              <div className="text-purple-400">👀 Hover crowded areas for names</div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Selected Module Info - Top Center */}
      {selectedModuleId && (
        <div className="absolute top-6 left-1/2 transform -translate-x-1/2 z-10">
          <div className="glass-effect rounded-lg p-3 border border-yellow-400/50 bg-yellow-400/10">
            <div className="text-sm text-yellow-400 font-medium text-center">
              📦 Selected: {currentDesign.modules.find(m => m.id === selectedModuleId)?.name || 'Unknown Module'}
            </div>
            <div className="text-xs text-slate-300 text-center mt-1">
              Alt+Drag to move • Shift+Drag for grid snap
            </div>
            <div className="flex justify-center mt-2 space-x-2">
              <button
                onClick={() => {
                  const moduleIndex = currentDesign.modules.findIndex(m => m.id === selectedModuleId);
                  updateModule(selectedModuleId, { 
                    position: { 
                      x: moduleIndex * 3 - 6, 
                      y: 2, 
                      z: 0 
                    } 
                  });
                }}
                className="text-xs btn-outline px-2 py-1"
              >
                🔄 Reset Position
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Module Legend & Stats - Top Right */}
      <div className="absolute top-6 right-6 z-10">
        <div className="glass-effect rounded-lg p-3 border border-slate-600/50 max-w-xs">
          <div className="text-sm text-white font-medium mb-2">Design Overview</div>
          
          {/* Quick Stats */}
          <div className="text-xs text-slate-300 space-y-1 mb-3 p-2 bg-slate-800/30 rounded">
            <div>Shape: <span className="text-blue-400">{currentDesign.dimensions.shape}</span></div>
            <div>Modules: <span className="text-green-400">{currentDesign.modules.length}</span></div>
            <div>Crew: <span className="text-yellow-400">{currentDesign.missionParameters.crewSize}</span></div>
            <div>Duration: <span className="text-purple-400">{currentDesign.missionParameters.duration} days</span></div>
          </div>
          
          {/* Module Types */}
          <div className="text-sm text-white font-medium mb-2">Module Types</div>
          <div className="grid grid-cols-2 gap-1 text-xs">
            {Object.values(ModuleType).map((type) => (
              <div key={type} className="flex items-center space-x-2">
                <div 
                  className="w-3 h-3 rounded"
                  style={{ 
                    backgroundColor: (() => {
                      switch (type) {
                        case ModuleType.COMMAND: return '#ef4444';
                        case ModuleType.HABITATION: return '#10b981';
                        case ModuleType.LABORATORY: return '#3b82f6';
                        case ModuleType.LOGISTICS: return '#f59e0b';
                        case ModuleType.EXERCISE: return '#8b5cf6';
                        case ModuleType.MEDICAL: return '#ec4899';
                        case ModuleType.AIRLOCK: return '#6b7280';
                        case ModuleType.GREENHOUSE: return '#22c55e';
                        case ModuleType.WORKSHOP: return '#f97316';
                        case ModuleType.RECREATION: return '#06b6d4';
                        default: return '#64748b';
                      }
                    })()
                  }}
                />
                <span className="text-slate-300 capitalize">{type.replace('_', ' ')}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {/* Mission Info - Bottom Left */}
      <div className="absolute bottom-6 left-6 z-10">
        <div className="glass-effect rounded-lg p-3 border border-slate-600/50">
          <div className="text-sm text-white font-medium mb-2">Current Mission</div>
          <div className="text-xs text-slate-300 space-y-1">
            <div>🏗️ <span className="text-blue-400">{currentDesign?.name || 'Default Habitat'}</span></div>
            <div>🌙 <span className="text-green-400">{mission.destination?.toUpperCase() || 'LUNAR SURFACE'}</span></div>
            <div>👥 <span className="text-yellow-400">{mission.crewSize || 4}</span> crew • <span className="text-purple-400">{mission.duration || 180}</span> days</div>
          </div>
        </div>
      </div>

      {/* Animation & View Controls - Bottom Right */}
      <div className="absolute bottom-24 right-6 z-10">
        <div className="glass-effect rounded-lg p-3 border border-slate-600/50">
          <div className="text-sm text-white font-medium mb-3">Animation & View</div>
          <div className="space-y-3">
            {/* Animation Speed */}
            <div>
              <div className="text-xs text-slate-400 mb-1">Animation Speed</div>
              <div className="flex items-center space-x-2">
                <button 
                  onClick={() => setAnimationSpeed(animationSpeed === 0 ? 1 : 0)}
                  className={`btn-ghost p-1 ${animationSpeed === 0 ? 'text-slate-500' : 'text-green-400'}`}
                  title={animationSpeed === 0 ? 'Start Animation' : 'Pause Animation'}
                >
                  {animationSpeed === 0 ? (
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  )}
                </button>
                <input
                  type="range"
                  min="0"
                  max="2"
                  step="0.1"
                  value={animationSpeed}
                  onChange={(e) => setAnimationSpeed(parseFloat(e.target.value))}
                  className="flex-1 h-1 bg-slate-600 rounded-lg appearance-none cursor-pointer"
                />
                <span className="text-xs text-slate-400 min-w-[2rem]">
                  {animationSpeed.toFixed(1)}x
                </span>
              </div>
            </div>

            {/* Grid Toggle */}
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400">Grid</span>
              <button
                onClick={() => setLocalShowGrid(!localShowGrid)}
                className={`btn-ghost p-1 ${localShowGrid ? 'text-blue-400' : 'text-slate-500'}`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </button>
            </div>

            {/* Stats Toggle */}
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400">Stats</span>
              <button
                onClick={() => setLocalShowStats(!localShowStats)}
                className={`btn-ghost p-1 ${localShowStats ? 'text-green-400' : 'text-slate-500'}`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}