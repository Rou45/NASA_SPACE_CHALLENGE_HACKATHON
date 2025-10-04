import React, { useState, useEffect } from 'react';

interface PerformanceStatsProps {
  isVisible: boolean;
}

interface Stats {
  fps: number;
  ms: number;
  memory?: number;
}

const PerformanceStats: React.FC<PerformanceStatsProps> = ({ isVisible }) => {
  const [stats, setStats] = useState<Stats>({ fps: 0, ms: 0 });

  useEffect(() => {
    if (!isVisible) return;

    let frameCount = 0;
    let lastTime = performance.now();
    let lastFpsUpdate = performance.now();
    let animationId: number;

    const updateStats = () => {
      const now = performance.now();
      const deltaTime = now - lastTime;
      frameCount++;

      // Update FPS every second
      if (now - lastFpsUpdate >= 1000) {
        const fps = Math.round((frameCount * 1000) / (now - lastFpsUpdate));
        const ms = Math.round(deltaTime * 100) / 100;
        
        // Get memory usage if available
        const memory = (performance as any).memory?.usedJSHeapSize 
          ? Math.round((performance as any).memory.usedJSHeapSize / 1048576)
          : undefined;

        setStats({ fps, ms, memory });
        frameCount = 0;
        lastFpsUpdate = now;
      }

      lastTime = now;
      animationId = requestAnimationFrame(updateStats);
    };

    animationId = requestAnimationFrame(updateStats);

    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
    };
  }, [isVisible]);

  if (!isVisible) return null;

  return (
    <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2 bg-black/80 text-white px-3 py-2 rounded-lg text-xs font-mono z-40 backdrop-blur-sm border border-white/20">
      <div className="space-y-1">
        <div className="flex justify-between gap-4">
          <span className="text-green-400">FPS:</span>
          <span>{stats.fps}</span>
        </div>
        <div className="flex justify-between gap-4">
          <span className="text-blue-400">MS:</span>
          <span>{stats.ms}</span>
        </div>
        {stats.memory && (
          <div className="flex justify-between gap-4">
            <span className="text-yellow-400">MB:</span>
            <span>{stats.memory}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default PerformanceStats;