import React, { useRef, useEffect, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Grid, Environment, Text, Box, Cylinder, Sphere } from '@react-three/drei';
import { useHabitatStore } from '../../stores/habitatStore';
import { HabitatShape } from '../../types/habitat';
import * as THREE from 'three';

// Habitat shell component
function HabitatShell() {
  const currentDesign = useHabitatStore(state => state.currentDesign);
  
  if (!currentDesign) return null;
  
  const { dimensions } = currentDesign;
  
  switch (dimensions.shape) {
    case HabitatShape.CYLINDER:
      return (
        <Cylinder
          args={[dimensions.radius || 4, dimensions.radius || 4, dimensions.height || 12, 32]}
          position={[0, 0, 0]}
        >
          <meshStandardMaterial
            color="#2563eb"
            transparent
            opacity={0.3}
            side={THREE.DoubleSide}
          />
        </Cylinder>
      );
      
    case HabitatShape.SPHERE:
      return (
        <Sphere
          args={[dimensions.sphereRadius || 5, 32, 32]}
          position={[0, 0, 0]}
        >
          <meshStandardMaterial
            color="#2563eb"
            transparent
            opacity={0.3}
            side={THREE.DoubleSide}
          />
        </Sphere>
      );
      
    case HabitatShape.MODULAR:
      return (
        <Box
          args={[dimensions.length || 8, dimensions.height || 4, dimensions.width || 8]}
          position={[0, 0, 0]}
        >
          <meshStandardMaterial
            color="#2563eb"
            transparent
            opacity={0.3}
            side={THREE.DoubleSide}
          />
        </Box>
      );
      
    default:
      return null;
  }
}

// Module component
function Module({ module }: { module: any }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);
  const [selected, setSelected] = useState(false);
  const selectedModuleId = useHabitatStore(state => state.selectedModuleId);
  const selectModule = useHabitatStore(state => state.selectModule);
  
  useEffect(() => {
    setSelected(selectedModuleId === module.id);
  }, [selectedModuleId, module.id]);
  
  // Color based on module type
  const getModuleColor = (type: string) => {
    const colors = {
      command: '#ef4444',
      habitation: '#10b981',
      laboratory: '#f59e0b',
      logistics: '#8b5cf6',
      exercise: '#06b6d4',
      medical: '#ec4899',
      airlock: '#6b7280',
      greenhouse: '#84cc16',
    };
    return colors[type as keyof typeof colors] || '#64748b';
  };
  
  return (
    <group
      position={[module.position.x, module.position.y, module.position.z]}
      onClick={() => selectModule(selected ? null : module.id)}
      onPointerEnter={() => setHovered(true)}
      onPointerLeave={() => setHovered(false)}
    >
      <Box
        ref={meshRef}
        args={[module.dimensions.length, module.dimensions.height, module.dimensions.width]}
      >
        <meshStandardMaterial
          color={getModuleColor(module.type)}
          transparent
          opacity={selected ? 0.8 : hovered ? 0.6 : 0.5}
          wireframe={selected}
        />
      </Box>
      
      {/* Module label */}
      <Text
        position={[0, module.dimensions.height / 2 + 0.5, 0]}
        fontSize={0.5}
        color="white"
        anchorX="center"
        anchorY="middle"
      >
        {module.name}
      </Text>
      
      {/* Selection outline */}
      {selected && (
        <Box
          args={[
            module.dimensions.length + 0.1,
            module.dimensions.height + 0.1,
            module.dimensions.width + 0.1
          ]}
        >
          <meshBasicMaterial
            color="#00ff00"
            transparent
            opacity={0.3}
            wireframe
          />
        </Box>
      )}
    </group>
  );
}

// Camera controller
function CameraController() {
  const { camera } = useThree();
  const viewMode = useHabitatStore(state => state.viewMode);
  
  useEffect(() => {
    if (viewMode === '2d') {
      camera.position.set(0, 20, 0);
      camera.lookAt(0, 0, 0);
    } else {
      camera.position.set(15, 10, 15);
      camera.lookAt(0, 0, 0);
    }
  }, [viewMode, camera]);
  
  return null;
}

// Grid and environment
function SceneEnvironment() {
  return (
    <>
      <Environment preset="studio" />
      <ambientLight intensity={0.4} />
      <directionalLight position={[10, 10, 5]} intensity={1} castShadow />
      <Grid
        args={[50, 50]}
        position={[0, -6, 0]}
        cellColor="#334155"
        sectionColor="#475569"
      />
    </>
  );
}

// Main 3D scene component
function Scene() {
  const currentDesign = useHabitatStore(state => state.currentDesign);
  
  return (
    <>
      <CameraController />
      <SceneEnvironment />
      
      {/* Habitat shell */}
      <HabitatShell />
      
      {/* Modules */}
      {currentDesign?.modules.map(module => (
        <Module key={module.id} module={module} />
      ))}
      
      {/* Connections */}
      {currentDesign?.connections.map(connection => {
        const fromModule = currentDesign.modules.find(m => m.id === connection.fromModuleId);
        const toModule = currentDesign.modules.find(m => m.id === connection.toModuleId);
        
        if (!fromModule || !toModule) return null;
        
        const start = new THREE.Vector3(
          fromModule.position.x,
          fromModule.position.y,
          fromModule.position.z
        );
        const end = new THREE.Vector3(
          toModule.position.x,
          toModule.position.y,
          toModule.position.z
        );
        const middle = start.clone().lerp(end, 0.5);
        const distance = start.distanceTo(end);
        
        return (
          <group key={connection.id}>
            <Cylinder
              args={[connection.diameter / 2, connection.diameter / 2, distance, 8]}
              position={[middle.x, middle.y, middle.z]}
              rotation={[
                Math.PI / 2,
                0,
                Math.atan2(end.z - start.z, end.x - start.x)
              ]}
            >
              <meshStandardMaterial
                color={connection.type === 'airlock' ? '#fbbf24' : '#6b7280'}
                transparent
                opacity={0.7}
              />
            </Cylinder>
          </group>
        );
      })}
      
      <OrbitControls
        enablePan={true}
        enableZoom={true}
        enableRotate={true}
        minDistance={5}
        maxDistance={50}
      />
    </>
  );
}

// Main 3D viewer component
export function HabitatViewer3D() {
  return (
    <div className="w-full h-full">
      <Canvas
        camera={{ position: [15, 10, 15], fov: 60 }}
        shadows
        className="w-full h-full"
      >
        <Scene />
      </Canvas>
      
      {/* View controls overlay */}
      <div className="absolute top-4 left-4 bg-slate-900/80 backdrop-blur-sm rounded-lg p-2">
        <div className="flex space-x-1">
          <ViewControlButton icon="🔄" tooltip="Reset View" />
          <ViewControlButton icon="🏠" tooltip="Home View" />
          <ViewControlButton icon="⊞" tooltip="Fit All" />
          <ViewControlButton icon="📐" tooltip="Measurements" />
        </div>
      </div>
      
      {/* Module info overlay */}
      <ModuleInfoOverlay />
    </div>
  );
}

// View control button
function ViewControlButton({ icon, tooltip }: { icon: string; tooltip: string }) {
  return (
    <button
      className="w-8 h-8 bg-slate-700 hover:bg-slate-600 rounded flex items-center justify-center transition-colors"
      title={tooltip}
    >
      <span className="text-sm">{icon}</span>
    </button>
  );
}

// Module information overlay
function ModuleInfoOverlay() {
  const selectedModuleId = useHabitatStore(state => state.selectedModuleId);
  const currentDesign = useHabitatStore(state => state.currentDesign);
  
  const selectedModule = currentDesign?.modules.find(m => m.id === selectedModuleId);
  
  if (!selectedModule) return null;
  
  return (
    <div className="absolute bottom-4 left-4 bg-slate-900/90 backdrop-blur-sm rounded-lg p-4 max-w-sm">
      <h3 className="font-semibold text-lg mb-2">{selectedModule.name}</h3>
      <p className="text-slate-300 text-sm mb-3">{selectedModule.description}</p>
      
      <div className="grid grid-cols-2 gap-2 text-sm">
        <div>
          <span className="text-slate-400">Type:</span>
          <span className="ml-1 text-white capitalize">{selectedModule.type}</span>
        </div>
        <div>
          <span className="text-slate-400">Volume:</span>
          <span className="ml-1 text-white">{selectedModule.volume.toFixed(1)}m³</span>
        </div>
        <div>
          <span className="text-slate-400">Mass:</span>
          <span className="ml-1 text-white">{(selectedModule.mass / 1000).toFixed(1)}t</span>
        </div>
        <div>
          <span className="text-slate-400">Power:</span>
          <span className="ml-1 text-white">{selectedModule.powerRequirement.toFixed(1)}kW</span>
        </div>
      </div>
      
      <div className="flex justify-between mt-3 pt-3 border-t border-slate-700">
        <button className="btn-secondary text-xs">Edit</button>
        <button className="btn-outline text-xs">Duplicate</button>
        <button className="btn-outline text-xs text-red-400">Remove</button>
      </div>
    </div>
  );
}