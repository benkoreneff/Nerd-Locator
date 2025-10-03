import React from 'react';

interface HeatmapToggleProps {
  showHeatmap: boolean;
  onToggle: (show: boolean) => void;
}

export default function HeatmapToggle({ showHeatmap, onToggle }: HeatmapToggleProps) {
  return (
    <button
      onClick={() => onToggle(!showHeatmap)}
      className={`btn text-sm ${
        showHeatmap ? 'btn-primary' : 'btn-secondary'
      }`}
    >
      <svg 
        className="w-4 h-4 mr-2" 
        fill="none" 
        stroke="currentColor" 
        viewBox="0 0 24 24"
      >
        <path 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          strokeWidth={2} 
          d="M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2m0 0V3a1 1 0 011 1v16a1 1 0 01-1 1H6a1 1 0 01-1-1V4a1 1 0 011-1h8zM7 8h10M7 12h10M7 16h4" 
        />
      </svg>
      {showHeatmap ? 'Hide Heatmap' : 'Show Heatmap'}
    </button>
  );
}
