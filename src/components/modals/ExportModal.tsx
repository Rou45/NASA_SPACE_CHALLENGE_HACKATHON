import React, { useState } from 'react';
import { useHabitatStore } from '../../stores/habitatStore';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ExportModal({ isOpen, onClose }: ExportModalProps) {
  const { currentDesign } = useHabitatStore();
  const [exportFormat, setExportFormat] = useState<'json' | 'csv' | 'pdf'>('json');
  const [includeMetrics, setIncludeMetrics] = useState(true);
  const [includeValidation, setIncludeValidation] = useState(true);

  if (!isOpen || !currentDesign) return null;

  const handleExport = () => {
    try {
      switch (exportFormat) {
        case 'json':
          exportAsJSON();
          break;
        case 'csv':
          exportAsCSV();
          break;
        case 'pdf':
          exportAsPDF();
          break;
      }
      onClose();
    } catch (error) {
      console.error('Export failed:', error);
      alert('Export failed. Please try again.');
    }
  };

  const exportAsJSON = () => {
    const exportData = {
      ...currentDesign,
      exportedAt: new Date().toISOString(),
      exportSettings: {
        includeMetrics,
        includeValidation,
        format: 'json'
      }
    };

    const dataStr = JSON.stringify(exportData, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
    const exportFileDefaultName = `${currentDesign.name.replace(/\s+/g, '_')}_habitat_design.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const exportAsCSV = () => {
    let csvContent = "Module Name,Type,Length (m),Width (m),Height (m),Volume (m³),Mass (kg),Position X,Position Y,Position Z\n";
    
    currentDesign.modules.forEach(module => {
      csvContent += `"${module.name}","${module.type}",${module.dimensions.length},${module.dimensions.width},${module.dimensions.height},${module.volume},${module.mass},${module.position?.x || 0},${module.position?.y || 0},${module.position?.z || 0}\n`;
    });

    if (includeMetrics) {
      csvContent += "\n\nDesign Metrics\n";
      csvContent += `Total Volume,${currentDesign.totalVolume}\n`;
      csvContent += `Pressurized Volume,${currentDesign.pressurizedVolume}\n`;
      csvContent += `Net Habitable Volume,${currentDesign.netHabitableVolume}\n`;
      csvContent += `Total Mass,${currentDesign.totalMass}\n`;
      csvContent += `Power Requirement,${currentDesign.powerRequirement}\n`;
    }

    const dataUri = 'data:text/csv;charset=utf-8,' + encodeURIComponent(csvContent);
    const exportFileDefaultName = `${currentDesign.name.replace(/\s+/g, '_')}_habitat_modules.csv`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const exportAsPDF = () => {
    // Create a simple HTML report for PDF generation
    const reportContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>${currentDesign.name} - Habitat Design Report</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          .header { text-align: center; border-bottom: 2px solid #333; padding-bottom: 10px; }
          .section { margin: 20px 0; }
          .metric { display: inline-block; margin: 10px; padding: 10px; border: 1px solid #ccc; }
          table { width: 100%; border-collapse: collapse; margin: 10px 0; }
          th, td { border: 1px solid #ccc; padding: 8px; text-align: left; }
          th { background-color: #f2f2f2; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>${currentDesign.name}</h1>
          <p>NASA Space Habitat Design Report</p>
          <p>Generated on: ${new Date().toLocaleDateString()}</p>
        </div>
        
        <div class="section">
          <h2>Design Overview</h2>
          <p><strong>Description:</strong> ${currentDesign.description}</p>
          <p><strong>Shape:</strong> ${currentDesign.dimensions.shape}</p>
          <p><strong>Crew Size:</strong> ${currentDesign.missionParameters.crewSize}</p>
          <p><strong>Mission Duration:</strong> ${currentDesign.missionParameters.duration} days</p>
          <p><strong>Destination:</strong> ${currentDesign.missionParameters.destination}</p>
        </div>
        
        ${includeMetrics ? `
        <div class="section">
          <h2>Design Metrics</h2>
          <div class="metric">
            <strong>Total Volume:</strong><br>
            ${currentDesign.totalVolume.toFixed(1)} m³
          </div>
          <div class="metric">
            <strong>Pressurized Volume:</strong><br>
            ${currentDesign.pressurizedVolume.toFixed(1)} m³
          </div>
          <div class="metric">
            <strong>Net Habitable Volume:</strong><br>
            ${currentDesign.netHabitableVolume.toFixed(1)} m³
          </div>
          <div class="metric">
            <strong>Total Mass:</strong><br>
            ${currentDesign.totalMass.toLocaleString()} kg
          </div>
          <div class="metric">
            <strong>Power Requirement:</strong><br>
            ${currentDesign.powerRequirement} kW
          </div>
        </div>
        ` : ''}
        
        <div class="section">
          <h2>Module Configuration</h2>
          <table>
            <thead>
              <tr>
                <th>Module Name</th>
                <th>Type</th>
                <th>Dimensions (L×W×H)</th>
                <th>Volume (m³)</th>
                <th>Mass (kg)</th>
              </tr>
            </thead>
            <tbody>
              ${currentDesign.modules.map(module => `
                <tr>
                  <td>${module.name}</td>
                  <td>${module.type}</td>
                  <td>${module.dimensions.length}×${module.dimensions.width}×${module.dimensions.height}m</td>
                  <td>${module.volume.toFixed(1)}</td>
                  <td>${module.mass.toLocaleString()}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </body>
      </html>
    `;

    const blob = new Blob([reportContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const exportFileDefaultName = `${currentDesign.name.replace(/\s+/g, '_')}_habitat_report.html`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', url);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
    
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="w-full max-w-md glass-effect border border-slate-600/50 rounded-2xl shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-700/50">
          <div>
            <h2 className="text-xl font-bold text-gradient">Export Design</h2>
            <p className="text-sm text-slate-400">Choose export format and options</p>
          </div>
          <button 
            onClick={onClose}
            className="btn-ghost p-2 hover:bg-slate-700/50 rounded-lg"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Format Selection */}
          <div>
            <label className="label mb-3">Export Format</label>
            <div className="space-y-2">
              <label className="flex items-center space-x-3">
                <input
                  type="radio"
                  name="format"
                  value="json"
                  checked={exportFormat === 'json'}
                  onChange={(e) => setExportFormat(e.target.value as any)}
                  className="text-blue-500"
                />
                <div>
                  <div className="text-white">📄 JSON</div>
                  <div className="text-xs text-slate-400">Complete design data for import/backup</div>
                </div>
              </label>
              
              <label className="flex items-center space-x-3">
                <input
                  type="radio"
                  name="format"
                  value="csv"
                  checked={exportFormat === 'csv'}
                  onChange={(e) => setExportFormat(e.target.value as any)}
                  className="text-blue-500"
                />
                <div>
                  <div className="text-white">📊 CSV</div>
                  <div className="text-xs text-slate-400">Module data for spreadsheet analysis</div>
                </div>
              </label>
              
              <label className="flex items-center space-x-3">
                <input
                  type="radio"
                  name="format"
                  value="pdf"
                  checked={exportFormat === 'pdf'}
                  onChange={(e) => setExportFormat(e.target.value as any)}
                  className="text-blue-500"
                />
                <div>
                  <div className="text-white">📋 HTML Report</div>
                  <div className="text-xs text-slate-400">Professional design report</div>
                </div>
              </label>
            </div>
          </div>

          {/* Export Options */}
          <div>
            <label className="label mb-3">Include Options</label>
            <div className="space-y-2">
              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={includeMetrics}
                  onChange={(e) => setIncludeMetrics(e.target.checked)}
                  className="text-blue-500"
                />
                <span className="text-white">Design Metrics</span>
              </label>
              
              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={includeValidation}
                  onChange={(e) => setIncludeValidation(e.target.checked)}
                  className="text-blue-500"
                />
                <span className="text-white">Validation Results</span>
              </label>
            </div>
          </div>

          {/* Design Info */}
          <div className="p-3 bg-slate-800/30 rounded-lg border border-slate-700/50">
            <div className="text-sm text-white font-medium">{currentDesign.name}</div>
            <div className="text-xs text-slate-400 mt-1">
              {currentDesign.modules.length} modules • {currentDesign.totalVolume.toFixed(1)}m³ total volume
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end space-x-3 p-6 border-t border-slate-700/50">
          <button 
            onClick={onClose}
            className="btn-outline px-4 py-2"
          >
            Cancel
          </button>
          <button 
            onClick={handleExport}
            className="btn-primary px-6 py-2"
          >
            📤 Export {exportFormat.toUpperCase()}
          </button>
        </div>
      </div>
    </div>
  );
}