import React, { useState, useEffect, useRef, useCallback } from 'react';
import { skillsApi } from '../lib/api';

export interface SkillOption {
  id: number;
  name: string;
  canonical: boolean;
}

interface SkillsTypeaheadProps {
  selectedSkills: SkillOption[];
  onSkillsChange: (skills: SkillOption[]) => void;
  placeholder?: string;
}

export default function SkillsTypeahead({ 
  selectedSkills, 
  onSkillsChange, 
  placeholder = "Add a skill (inside or outside your industry)..." 
}: SkillsTypeaheadProps) {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<SkillOption[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<NodeJS.Timeout>();

  // Debounced search function
  const searchSkills = useCallback(async (searchQuery: string) => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      setError(null);
      
      try {
        const data = await skillsApi.suggestSkills(searchQuery, 10);
        setSuggestions(data.results || []);
      } catch (err) {
        console.error('Skills search error:', err);
        setError(`Failed to load suggestions: ${err instanceof Error ? err.message : 'Unknown error'}`);
        setSuggestions([]);
      } finally {
        setLoading(false);
      }
    }, 300);
  }, []);

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    setSelectedIndex(-1);
    
    if (value.trim()) {
      setIsOpen(true);
      searchSkills(value);
    } else {
      setIsOpen(false);
      setSuggestions([]);
    }
  };

  // Handle key navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) {
      if (e.key === 'ArrowDown') {
        setIsOpen(true);
        return;
      }
      return;
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < suggestions.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => prev > 0 ? prev - 1 : prev);
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && selectedIndex < suggestions.length) {
          selectSkill(suggestions[selectedIndex]);
        } else if (query.trim() && !hasExactMatch(query.trim())) {
          // Add new skill
          addNewSkill(query.trim());
        }
        break;
      case 'Escape':
        setIsOpen(false);
        setSelectedIndex(-1);
        break;
    }
  };

  // Check if query has exact match in suggestions or selected skills
  const hasExactMatch = (searchQuery: string): boolean => {
    const normalizedQuery = searchQuery.toLowerCase();
    
    // Check suggestions
    const hasInSuggestions = suggestions.some(skill => 
      skill.name.toLowerCase() === normalizedQuery
    );
    
    // Check selected skills
    const hasInSelected = selectedSkills.some(skill => 
      skill.name.toLowerCase() === normalizedQuery
    );
    
    return hasInSuggestions || hasInSelected;
  };

  // Select an existing skill
  const selectSkill = (skill: SkillOption) => {
    // Check if skill is already selected (case-insensitive)
    const isAlreadySelected = selectedSkills.some(selected => 
      selected.name.toLowerCase() === skill.name.toLowerCase()
    );
    
    if (!isAlreadySelected) {
      onSkillsChange([...selectedSkills, skill]);
    }
    
    setQuery('');
    setIsOpen(false);
    setSelectedIndex(-1);
    inputRef.current?.focus();
  };

  // Add a new skill
  const addNewSkill = async (skillName: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const newSkill = await skillsApi.createSkill(skillName);
      selectSkill(newSkill);
    } catch (err) {
      console.error('Create skill error:', err);
      setError(`Failed to create new skill: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  // Remove a skill
  const removeSkill = (skillId: number) => {
    onSkillsChange(selectedSkills.filter(skill => skill.id !== skillId));
  };

  // Handle outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current && 
        !dropdownRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
        setSelectedIndex(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Show "Add new" option if no exact match
  const showAddNew = query.trim() && !hasExactMatch(query.trim()) && !loading;
  const displaySuggestions = showAddNew 
    ? [{ id: -1, name: `➕ Add '${query.trim()}' as new skill`, canonical: false }, ...suggestions]
    : suggestions;

  return (
    <div className="space-y-3">
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            if (query.trim()) {
              setIsOpen(true);
            }
          }}
          placeholder={placeholder}
          className="form-input w-full"
          aria-expanded={isOpen}
          aria-autocomplete="list"
          aria-activedescendant={selectedIndex >= 0 ? `suggestion-${selectedIndex}` : undefined}
        />
        
        {isOpen && (
          <div
            ref={dropdownRef}
            className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto"
            role="listbox"
          >
            {loading && (
              <div className="px-3 py-2 text-sm text-gray-500">
                Loading suggestions...
              </div>
            )}
            
            {error && (
              <div className="px-3 py-2 text-sm text-red-500">
                {error}
              </div>
            )}
            
            {!loading && !error && displaySuggestions.length === 0 && query.trim() && (
              <div className="px-3 py-2 text-sm text-gray-500">
                No suggestions found
              </div>
            )}
            
            {displaySuggestions.map((skill, index) => (
              <div
                key={skill.id}
                id={`suggestion-${index}`}
                className={`px-3 py-2 text-sm cursor-pointer flex items-center justify-between ${
                  index === selectedIndex ? 'bg-blue-100' : 'hover:bg-gray-100'
                }`}
                role="option"
                aria-selected={index === selectedIndex}
                onClick={() => {
                  if (skill.id === -1) {
                    addNewSkill(query.trim());
                  } else {
                    selectSkill(skill);
                  }
                }}
              >
                <span className={skill.id === -1 ? 'text-blue-600 font-medium' : ''}>
                  {skill.name}
                </span>
                {skill.canonical && skill.id !== -1 && (
                  <span className="text-xs text-gray-500 bg-gray-100 px-1 rounded">
                    Canonical
                  </span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
      
      {/* Selected skills chips */}
      {selectedSkills.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selectedSkills.map(skill => (
            <span
              key={skill.id}
              className="badge badge-primary flex items-center"
            >
              {skill.name}
              {skill.canonical && (
                <span className="ml-1 text-xs opacity-75">•</span>
              )}
              <button
                onClick={() => removeSkill(skill.id)}
                className="ml-1 text-primary-600 hover:text-primary-800"
                aria-label={`Remove ${skill.name}`}
              >
                ×
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
