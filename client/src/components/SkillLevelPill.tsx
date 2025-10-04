import React, { useState } from 'react';
import { Level0to5, LEVEL_DESCRIPTIONS } from '../types';

interface SkillLevelPillProps {
  skillName: string;
  level: Level0to5;
  showLevel?: boolean;
}

export default function SkillLevelPill({ skillName, level, showLevel = true }: SkillLevelPillProps) {
  const [showTooltip, setShowTooltip] = useState(false);

  // Color intensity based on level
  const getColorClass = (level: Level0to5) => {
    switch (level) {
      case 3:
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 4:
        return 'bg-blue-200 text-blue-900 border-blue-300';
      case 5:
        return 'bg-blue-300 text-blue-900 border-blue-400';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="relative inline-block">
      <span
        className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getColorClass(level)} cursor-help`}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
      >
        {skillName}
        {showLevel && (
          <>
            <span className="mx-1">•</span>
            <span className="font-bold">{level}</span>
          </>
        )}
      </span>

      {showTooltip && (
        <div className="absolute z-50 bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg shadow-lg max-w-xs">
          <div className="font-medium mb-1">Level {level}</div>
          <div>{LEVEL_DESCRIPTIONS[level]}</div>
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
        </div>
      )}
    </div>
  );
}
