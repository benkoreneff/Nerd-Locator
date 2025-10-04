import React, { useState } from 'react';
import { Level0to5, LEVEL_DESCRIPTIONS } from '../types';

interface SkillLevelDisplayProps {
  skillLevels: Record<string, Level0to5>;
}

export default function SkillLevelDisplay({ skillLevels }: SkillLevelDisplayProps) {
  const [showOnlyAdvanced, setShowOnlyAdvanced] = useState(true);

  // Skill names (matching the civilian form)
  const skillNames: Record<string, string> = {
    drone_piloting: 'Drone Piloting',
    rf_radio: 'RF/Radio',
    '3d_printing': '3D Printing',
    welding_metalwork: 'Welding/Metalwork',
    electrical_work: 'Electrical Work'
  };

  const levels: Level0to5[] = [0, 1, 2, 3, 4, 5];

  const filteredSkills = Object.entries(skillLevels).filter(([_, level]) => 
    !showOnlyAdvanced || level >= 3
  );

  if (filteredSkills.length === 0) {
    return (
      <div className="mt-4">
        <h4 className="text-sm font-medium text-gray-900 mb-3">Operational Skill Levels</h4>
        <p className="text-sm text-gray-500">No skill level data available.</p>
      </div>
    );
  }

  return (
    <div className="mt-4">
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-sm font-medium text-gray-900">Operational Skill Levels</h4>
        <label className="flex items-center text-xs text-gray-600">
          <input
            type="checkbox"
            checked={showOnlyAdvanced}
            onChange={(e) => setShowOnlyAdvanced(e.target.checked)}
            className="mr-1 rounded"
          />
          Show only Level ≥ 3
        </label>
      </div>

      <div className="space-y-3">
        {filteredSkills.map(([skillId, level]) => (
          <div key={skillId} className="flex items-center space-x-4">
            {/* Skill name */}
            <div className="w-40 flex-shrink-0">
              <span className="text-sm font-medium text-gray-700">
                {skillNames[skillId] || skillId.replace('_', ' ')}
              </span>
            </div>

            {/* Level scale */}
            <div className="flex items-center space-x-1">
              {levels.map((l) => (
                <div
                  key={l}
                  className={`w-8 h-8 rounded-full border-2 flex items-center justify-center text-xs font-medium ${
                    l === level
                      ? 'bg-blue-500 text-white border-blue-500'
                      : 'bg-white text-gray-400 border-gray-300'
                  }`}
                >
                  {l}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
