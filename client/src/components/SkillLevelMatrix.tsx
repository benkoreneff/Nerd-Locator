import React, { useState, useRef, useEffect } from 'react';

export type Level0to5 = 0 | 1 | 2 | 3 | 4 | 5;
export type QuestionId = string;

export interface SkillLevelMatrixProps {
  skillLevels: Record<QuestionId, Level0to5 | null>;
  onSkillLevelsChange: (skillLevels: Record<QuestionId, Level0to5 | null>) => void;
}

// Level descriptions for tooltips
const LEVEL_DESCRIPTIONS: Record<Level0to5, string> = {
  0: "No experience",
  1: "Basic awareness; need guidance",
  2: "Can perform simple tasks with supervision",
  3: "Independent for routine tasks",
  4: "Advanced; can guide others in most situations",
  5: "Professional/main hobby; multiple years; can lead & teach"
};

// Skill level assessment questions
const SKILL_QUESTIONS = [
  { id: 'drone_piloting', label: 'Drone Piloting' },
  { id: 'rf_radio', label: 'RF/Radio' },
  { id: '3d_printing', label: '3D Printing' },
  { id: 'welding_metalwork', label: 'Welding/Metalwork' },
  { id: 'electrical_work', label: 'Electrical Work' }
];

const LEVELS: Level0to5[] = [0, 1, 2, 3, 4, 5];

export default function SkillLevelMatrix({ skillLevels, onSkillLevelsChange }: SkillLevelMatrixProps) {
  const [focusedCell, setFocusedCell] = useState<{ questionId: QuestionId; level: Level0to5 } | null>(null);
  const [tooltipVisible, setTooltipVisible] = useState<Level0to5 | null>(null);
  const tableRef = useRef<HTMLTableElement>(null);

  // Handle cell selection
  const handleCellClick = (questionId: QuestionId, level: Level0to5) => {
    const newSkillLevels = {
      ...skillLevels,
      [questionId]: level
    };
    onSkillLevelsChange(newSkillLevels);
  };

  // Handle clear selection for a row
  const handleClearRow = (questionId: QuestionId) => {
    const newSkillLevels = {
      ...skillLevels,
      [questionId]: null
    };
    onSkillLevelsChange(newSkillLevels);
  };

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent, questionId: QuestionId, level: Level0to5) => {
    const currentLevel = skillLevels[questionId];
    
    switch (e.key) {
      case ' ':
      case 'Enter':
        e.preventDefault();
        handleCellClick(questionId, level);
        break;
      case 'ArrowLeft':
        e.preventDefault();
        if (level > 0) {
          const prevCell = tableRef.current?.querySelector(
            `[data-question-id="${questionId}"][data-level="${level - 1}"]`
          ) as HTMLButtonElement;
          prevCell?.focus();
        }
        break;
      case 'ArrowRight':
        e.preventDefault();
        if (level < 5) {
          const nextCell = tableRef.current?.querySelector(
            `[data-question-id="${questionId}"][data-level="${level + 1}"]`
          ) as HTMLButtonElement;
          nextCell?.focus();
        }
        break;
      case 'Tab':
        // Let default tab behavior handle row navigation
        break;
      case 'Escape':
        setTooltipVisible(null);
        break;
    }
  };

  // Handle tooltip visibility
  const handleTooltipShow = (level: Level0to5) => {
    setTooltipVisible(level);
  };

  const handleTooltipHide = () => {
    setTooltipVisible(null);
  };

  return (
    <div className="space-y-4 overflow-visible">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">Skill Level Assessment</h3>
        <p className="text-sm text-gray-600 mb-4">
          Rate your experience level for each skill area. Select one level per row.
        </p>
      </div>

      <div className="overflow-x-auto overflow-y-visible">
        <table ref={tableRef} className="w-full border-collapse border border-gray-300">
          <thead>
            <tr className="bg-gray-50">
              <th className="border border-gray-300 px-3 py-2 text-left text-sm font-medium text-gray-700">
                Skill Area
              </th>
              {LEVELS.map(level => (
                <th key={level} className="border border-gray-300 px-2 py-2 text-center text-sm font-medium text-gray-700">
                  <div className="flex items-center justify-center space-x-1">
                    <span>Level {level}</span>
                    <div className="relative">
                      <button
                        type="button"
                        className="text-gray-500 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 rounded-full p-1"
                        onMouseEnter={() => handleTooltipShow(level)}
                        onMouseLeave={() => handleTooltipHide()}
                        onFocus={() => handleTooltipShow(level)}
                        onBlur={() => handleTooltipHide()}
                        aria-describedby={`tooltip-${level}`}
                      >
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                        </svg>
                      </button>
                      
                      {tooltipVisible === level && (
                        <div
                          id={`tooltip-${level}`}
                          className="absolute z-50 top-full left-1/2 transform -translate-x-1/2 mt-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg shadow-lg max-w-xs"
                          role="tooltip"
                          onMouseEnter={() => handleTooltipShow(level)}
                          onMouseLeave={() => handleTooltipHide()}
                        >
                          <div className="font-medium mb-1">Level {level}</div>
                          <div>{LEVEL_DESCRIPTIONS[level]}</div>
                          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-b-4 border-transparent border-b-gray-900"></div>
                        </div>
                      )}
                    </div>
                  </div>
                </th>
              ))}
              <th className="border border-gray-300 px-3 py-2 text-center text-sm font-medium text-gray-700">
                <button
                  type="button"
                  className="text-xs text-gray-600 hover:text-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 rounded px-2 py-1"
                  onClick={() => {
                    const clearedLevels: Record<QuestionId, Level0to5 | null> = {};
                    SKILL_QUESTIONS.forEach(q => {
                      clearedLevels[q.id] = null;
                    });
                    onSkillLevelsChange(clearedLevels);
                  }}
                  title="Clear all selections"
                >
                  Clear All
                </button>
              </th>
            </tr>
          </thead>
          <tbody>
            {SKILL_QUESTIONS.map(question => (
              <tr key={question.id} className="hover:bg-gray-50">
                <th className="border border-gray-300 px-3 py-2 text-left text-sm font-medium text-gray-700">
                  {question.label}
                </th>
                {LEVELS.map(level => {
                  const isSelected = skillLevels[question.id] === level;
                  const isFocused = focusedCell?.questionId === question.id && focusedCell?.level === level;
                  
                  return (
                    <td key={level} className="border border-gray-300 px-2 py-2 text-center">
                      <button
                        type="button"
                        data-question-id={question.id}
                        data-level={level}
                        className={`w-full h-10 rounded border-2 transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 ${
                          isSelected
                            ? 'bg-blue-100 border-blue-500 text-blue-900 font-semibold'
                            : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-100'
                        } ${
                          isFocused ? 'ring-2 ring-blue-500' : ''
                        }`}
                        onClick={() => handleCellClick(question.id, level)}
                        onKeyDown={(e) => handleKeyDown(e, question.id, level)}
                        onFocus={() => setFocusedCell({ questionId: question.id, level })}
                        onBlur={() => setFocusedCell(null)}
                        aria-checked={isSelected}
                        role="radio"
                        aria-labelledby={`${question.id}-label`}
                        tabIndex={skillLevels[question.id] === level ? 0 : -1}
                      >
                        {level}
                      </button>
                    </td>
                  );
                })}
                <td className="border border-gray-300 px-2 py-2 text-center">
                  <button
                    type="button"
                    className="text-xs text-gray-500 hover:text-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 rounded px-2 py-1"
                    onClick={() => handleClearRow(question.id)}
                    title={`Clear selection for ${question.label}`}
                  >
                    Clear
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
