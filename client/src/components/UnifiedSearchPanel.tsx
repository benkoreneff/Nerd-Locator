import React, { useState, useEffect, useRef, useCallback } from 'react';
import { geocodeApi, skillsApi } from '../lib/api';
import api from '../lib/api';
import { GeocodeResult, SkillOption } from '../types';

interface UnifiedSearchPanelProps {
  onLocationChange: (center: { lat: number; lon: number } | null, radius: number) => void;
  onSearch: (searchParams: any) => void;
  onSearchMethodChange: (method: string | null, details?: string) => void;
}

const UnifiedSearchPanel: React.FC<UnifiedSearchPanelProps> = ({ 
  onLocationChange, 
  onSearch, 
  onSearchMethodChange 
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [advancedExpanded, setAdvancedExpanded] = useState(false);
  
  // Location state
  const [locationMode, setLocationMode] = useState<'current' | 'search' | 'map' | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<GeocodeResult[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedPlace, setSelectedPlace] = useState<GeocodeResult | null>(null);
  const [currentLocation, setCurrentLocation] = useState<{ lat: number; lon: number } | null>(null);
  const [radius, setRadius] = useState(50);
  
  // Basic filters
  const [statusFilter, setStatusFilter] = useState<string[]>(['available']);
  const [selectedSkills, setSelectedSkills] = useState<SkillOption[]>([]);
  const [skillSearchQuery, setSkillSearchQuery] = useState('');
  const [skillSuggestions, setSkillSuggestions] = useState<SkillOption[]>([]);
  const [showSkillSuggestions, setShowSkillSuggestions] = useState(false);
  
  // Advanced filters
  const [skillLevels, setSkillLevels] = useState<Record<string, number>>({});
  const [includeTags, setIncludeTags] = useState<string[]>([]);
  const [tagSearchQuery, setTagSearchQuery] = useState('');
  const [tagSuggestions, setTagSuggestions] = useState<string[]>([]);
  const [showTagSuggestions, setShowTagSuggestions] = useState(false);
  const [sortBy, setSortBy] = useState<'distance' | 'capability' | 'combined'>('combined');
  
  const searchTimeoutRef = useRef<NodeJS.Timeout>();
  const skillTimeoutRef = useRef<NodeJS.Timeout>();
  const tagTimeoutRef = useRef<NodeJS.Timeout>();
  const searchInputRef = useRef<HTMLInputElement>(null);
  const skillInputRef = useRef<HTMLInputElement>(null);
  const tagInputRef = useRef<HTMLInputElement>(null);

  // Skill definitions for advanced section
  const skillDefinitions = [
    { id: 'drone_piloting', name: 'Drone Piloting', description: 'UAV operation and piloting' },
    { id: 'rf_radio', name: 'RF/Radio', description: 'Radio frequency and communications' },
    { id: '3d_printing', name: '3D Printing', description: 'Additive manufacturing' },
    { id: 'welding_metalwork', name: 'Welding/Metalwork', description: 'Metal fabrication and welding' },
    { id: 'electrical_work', name: 'Electrical Work', description: 'Electrical systems and repair' }
  ];

  // Debounced place search
  const searchPlaces = useCallback(async (query: string) => {
    if (query.length < 2) {
      setSearchResults([]);
      return;
    }

    setLoading(true);
    try {
      const results = await geocodeApi.searchPlaces(query);
      setSearchResults(results);
      setShowSuggestions(true);
    } catch (err) {
      setError('Network error while searching');
      console.error('Geocoding error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Debounced skill search
  const searchSkills = useCallback(async (query: string) => {
    console.log('searchSkills called with query:', query);
    if (query.length < 1) {
      console.log('Query too short, clearing suggestions');
      setSkillSuggestions([]);
      setShowSkillSuggestions(false);
      return;
    }

    try {
      console.log('Making API call to skillsApi.suggestSkills with query:', query);
      const response = await skillsApi.suggestSkills(query);
      console.log('Skill search API response:', response);
      console.log('Setting skill suggestions:', response.results);
      setSkillSuggestions(response.results);
      console.log('Setting showSkillSuggestions to true');
      setShowSkillSuggestions(true);
    } catch (err) {
      console.error('Skill search error:', err);
      setSkillSuggestions([]);
      setShowSkillSuggestions(false);
    }
  }, []);

  // Debounced tag search
  const searchTags = useCallback(async (query: string) => {
    console.log('searchTags called with query:', query);
    if (query.length < 1) {
      console.log('Query too short, clearing tag suggestions');
      setTagSuggestions([]);
      setShowTagSuggestions(false);
      return;
    }

    try {
      console.log('Making API call to /search/tags/suggest with query:', query);
      const response = await api.get('/search/tags/suggest', {
        params: { q: query }
      });
      console.log('Tag search API response:', response.data);
      setTagSuggestions(response.data);
      setShowTagSuggestions(true);
      console.log('Tag suggestions set, showing dropdown');
    } catch (err) {
      console.error('Tag search error:', err);
    }
  }, []);

  // Handle place search input
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    
    searchTimeoutRef.current = setTimeout(() => {
      searchPlaces(query);
    }, 300);
  };

  // Handle skill search input
  const handleSkillSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    console.log('Skill search input changed:', query);
    setSkillSearchQuery(query);
    
    if (skillTimeoutRef.current) {
      clearTimeout(skillTimeoutRef.current);
    }
    
    skillTimeoutRef.current = setTimeout(() => {
      console.log('Triggering skill search for:', query);
      searchSkills(query);
    }, 300);
  };

  // Handle tag search input
  const handleTagSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    console.log('Tag search input changed:', query);
    setTagSearchQuery(query);
    
    if (tagTimeoutRef.current) {
      clearTimeout(tagTimeoutRef.current);
    }
    
    tagTimeoutRef.current = setTimeout(() => {
      console.log('Triggering tag search for:', query);
      searchTags(query);
    }, 300);
  };

  // Handle place selection
  const handlePlaceSelect = (place: GeocodeResult) => {
    setSelectedPlace(place);
    setSearchQuery('');
    setShowSuggestions(false);
    setLocationMode('search');
    setCurrentLocation(null);
    onLocationChange({ lat: place.lat, lon: place.lon }, radius);
    onSearchMethodChange('search', place.display_name);
  };

  // Handle skill selection
  const handleSkillSelect = (skill: SkillOption) => {
    console.log('Selecting skill:', skill);
    console.log('Current selected skills:', selectedSkills);
    if (!selectedSkills.find(s => s.id === skill.id)) {
      setSelectedSkills(prev => {
        const newSkills = [...prev, skill];
        console.log('Updated selected skills:', newSkills);
        return newSkills;
      });
    }
    setSkillSearchQuery('');
    setShowSkillSuggestions(false);
  };

  // Handle skill removal
  const handleSkillRemove = (skillId: number) => {
    setSelectedSkills(prev => prev.filter(s => s.id !== skillId));
  };

  // Handle tag selection
  const handleTagSelect = (tag: string) => {
    console.log('Selecting tag:', tag);
    console.log('Current includeTags:', includeTags);
    if (!includeTags.includes(tag)) {
      console.log('Adding tag to includeTags:', tag);
      setIncludeTags(prev => {
        const newTags = [...prev, tag];
        console.log('New includeTags:', newTags);
        return newTags;
      });
    } else {
      console.log('Tag already exists in includeTags');
    }
    setTagSearchQuery('');
    setShowTagSuggestions(false);
  };

  // Handle tag removal
  const handleTagRemove = (tag: string) => {
    setIncludeTags(prev => prev.filter(t => t !== tag));
  };

  // Handle current location
  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by this browser');
      return;
    }

    setLoading(true);
    setError(null);
    
    const timeoutId = setTimeout(() => {
      setLoading(false);
      setError('Location request timed out. Please try again.');
    }, 15000);
    
    navigator.geolocation.getCurrentPosition(
      (position) => {
        clearTimeout(timeoutId);
        const location = {
          lat: position.coords.latitude,
          lon: position.coords.longitude
        };
        setCurrentLocation(location);
        setLocationMode('current');
        setSelectedPlace(null);
        setSearchQuery('');
        onLocationChange(location, radius);
        onSearchMethodChange('current', 'My current location');
        setLoading(false);
      },
      (error) => {
        clearTimeout(timeoutId);
        setLoading(false);
        switch (error.code) {
          case error.PERMISSION_DENIED:
            setError('Location access denied. Please use place search or map center instead.');
            break;
          case error.POSITION_UNAVAILABLE:
            setError('Location information unavailable. Please try place search.');
            break;
          case error.TIMEOUT:
            setError('Location request timed out. Please try again.');
            break;
          default:
            setError('An unknown error occurred while retrieving location.');
            break;
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000
      }
    );
  };

  // Handle map center option
  const handleUseMapCenter = () => {
    setLocationMode('map');
    setSelectedPlace(null);
    setSearchQuery('');
    setCurrentLocation(null);
    onSearchMethodChange('map', 'Current map center');
  };

  // Handle skill level change
  const handleSkillLevelChange = (skillId: string, level: number) => {
    setSkillLevels(prev => ({
      ...prev,
      [skillId]: level
    }));
  };

  // Handle search button click
  const handleSearch = async () => {
    if (!locationMode && !searchQuery.trim()) {
      setError('Please select a location method or enter an address first');
      return;
    }

    if (statusFilter.length === 0) {
      setError('Please select at least one status option');
      return;
    }

    const searchParams = {
      radius_km: radius,
      status: statusFilter,
      page: 1,
      limit: 50,
      sort: sortBy
    };

    // Add skills filter (keyword-based)
    if (selectedSkills.length > 0) {
      searchParams.skills = selectedSkills.map(s => s.name);
    }

    // Add minimum skill levels
    const activeSkillLevels = Object.entries(skillLevels).filter(([_, level]) => level > 0);
    if (activeSkillLevels.length > 0) {
      searchParams.min_levels = Object.fromEntries(activeSkillLevels);
    }

    // Add tag filters
    if (includeTags.length > 0) {
      searchParams.include_tags = includeTags;
    }

    if (locationMode === 'current' && currentLocation) {
      searchParams.center_lat = currentLocation.lat;
      searchParams.center_lon = currentLocation.lon;
    } else if (locationMode === 'search' && selectedPlace) {
      searchParams.center_lat = selectedPlace.lat;
      searchParams.center_lon = selectedPlace.lon;
    } else if (locationMode === 'map') {
      searchParams.use_map_center = true;
    } else if (searchQuery.trim()) {
      // Auto-geocode the typed address
      setLoading(true);
      try {
        const results = await geocodeApi.searchPlaces(searchQuery.trim());
        if (results.length > 0) {
          const place = results[0];
          searchParams.center_lat = place.lat;
          searchParams.center_lon = place.lon;
          onSearchMethodChange('search', place.display_name);
          onLocationChange({ lat: place.lat, lon: place.lon }, radius);
        } else {
          setError('Address not found. Please try a different address or select from suggestions.');
          setLoading(false);
          return;
        }
      } catch (err) {
        setError('Failed to find address. Please try a different address or select from suggestions.');
        setLoading(false);
        return;
      } finally {
        setLoading(false);
      }
    }

    onSearch(searchParams);
  };

  // Generate query summary
  const getQuerySummary = () => {
    const parts = [];
    
    if (locationMode === 'current') parts.push('My location');
    else if (locationMode === 'search' && selectedPlace) parts.push(`${selectedPlace.display_name}`);
    else if (locationMode === 'map') parts.push('Map center');
    
    parts.push(`${radius}km radius`);
    parts.push(`${statusFilter.join(', ')} status`);
    
    if (selectedSkills.length > 0) {
      console.log('Adding skills to query summary:', selectedSkills.map(s => s.name));
      parts.push(`Skills: ${selectedSkills.map(s => s.name).join(', ')}`);
    } else {
      console.log('No selected skills to add to query summary');
    }
    
    if (advancedExpanded) {
      const activeLevels = Object.entries(skillLevels).filter(([_, level]) => level > 0);
      if (activeLevels.length > 0) {
        parts.push(`Min levels: ${activeLevels.map(([skill, level]) => `${skillDefinitions.find(s => s.id === skill)?.name}≥${level}`).join(', ')}`);
      }
      
      if (includeTags.length > 0) parts.push(`Tags: ${includeTags.join(', ')}`);
      
      parts.push(`Sort: ${sortBy}`);
    }
    
    return parts.join(' • ');
  };

  // Debug selectedSkills changes (only when not empty)
  useEffect(() => {
    if (selectedSkills.length > 0) {
      console.log('selectedSkills state changed:', selectedSkills);
    }
  }, [selectedSkills]);

  // Debug skillSuggestions changes (only when not empty)
  useEffect(() => {
    if (skillSuggestions.length > 0) {
      console.log('skillSuggestions state changed:', skillSuggestions);
    }
  }, [skillSuggestions]);

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      
      // Only close suggestions if clicking outside the entire input container
      if (searchInputRef.current && !searchInputRef.current.contains(target)) {
        setShowSuggestions(false);
      }
      
      // For skills, check if clicking outside the input AND not on a suggestion button
      if (skillInputRef.current && !skillInputRef.current.contains(target)) {
        // Check if the click is on a suggestion button (don't close if it is)
        const isSuggestionClick = target instanceof HTMLElement && 
          target.closest('.skill-suggestion-dropdown');
        
        if (!isSuggestionClick) {
          console.log('Clicking outside skills input, closing suggestions');
          setShowSkillSuggestions(false);
        }
      }
      
      // For tags, check if clicking outside the input AND not on a suggestion button
      if (tagInputRef.current && !tagInputRef.current.contains(target)) {
        // Check if the click is on a tag suggestion button (don't close if it is)
        const isTagSuggestionClick = target instanceof HTMLElement && 
          target.closest('.tag-suggestion-dropdown');
        
        if (!isTagSuggestionClick) {
          console.log('Clicking outside tag input, closing suggestions');
          setShowTagSuggestions(false);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Search Civilians</h3>
        
        {/* 1. Location */}
        <div className="mb-4">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Location</h4>
          
          {/* Current Location Button */}
          <button
            type="button"
            onClick={handleUseCurrentLocation}
            disabled={loading}
            className={`w-full mb-3 px-4 py-2 rounded-lg border-2 transition-colors ${
              locationMode === 'current'
                ? 'border-blue-500 bg-blue-50 text-blue-700'
                : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
            } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Getting location...
              </span>
            ) : (
              <span className="flex items-center justify-center">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Use my location
              </span>
            )}
          </button>

          {/* Place Search */}
          <div className="relative">
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={handleSearchChange}
              onFocus={() => setShowSuggestions(searchResults.length > 0)}
              placeholder="Search city, town, or address..."
              className={`w-full px-4 py-2 border-2 rounded-lg transition-colors ${
                locationMode === 'search'
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-300 bg-white focus:border-blue-500'
              }`}
            />
            
            {showSuggestions && searchResults.length > 0 && (
              <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-auto">
                {searchResults.map((result, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => handlePlaceSelect(result)}
                    className="w-full px-4 py-2 text-left hover:bg-gray-100 border-b border-gray-100 last:border-b-0"
                  >
                    <div className="font-medium text-gray-900">{result.display_name}</div>
                    <div className="text-sm text-gray-500">
                      {result.type} • Confidence: {Math.round(result.confidence * 100)}%
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Map Center Option */}
          <button
            type="button"
            onClick={handleUseMapCenter}
            className={`w-full mt-3 px-4 py-2 rounded-lg border-2 transition-colors ${
              locationMode === 'map'
                ? 'border-blue-500 bg-blue-50 text-blue-700'
                : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            <span className="flex items-center justify-center">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-1.447-.894L15 4m0 13V4m0 0L9 7" />
              </svg>
              Use current map center
            </span>
          </button>
        </div>

        {/* 2. Search Radius */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Search Radius: {radius} km
          </label>
          <input
            type="range"
            min="5"
            max="300"
            value={radius}
            onChange={(e) => setRadius(parseInt(e.target.value))}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
          />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>5 km</span>
            <span>150 km</span>
            <span>300 km</span>
          </div>
        </div>

        {/* 3. Status */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
          <div className="space-y-2">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={statusFilter.includes('available')}
                onChange={(e) => {
                  if (e.target.checked) {
                    setStatusFilter(prev => [...prev, 'available']);
                  } else {
                    setStatusFilter(prev => prev.filter(s => s !== 'available'));
                  }
                }}
                className="form-checkbox"
              />
              <span className="ml-2 text-sm text-gray-700">Available</span>
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={statusFilter.includes('allocated')}
                onChange={(e) => {
                  if (e.target.checked) {
                    setStatusFilter(prev => [...prev, 'allocated']);
                  } else {
                    setStatusFilter(prev => prev.filter(s => s !== 'allocated'));
                  }
                }}
                className="form-checkbox"
              />
              <span className="ml-2 text-sm text-gray-700">Allocated</span>
            </label>
          </div>
        </div>

        {/* 4. Skills (typeahead) */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">Skills</label>
          <div className="relative">
            <input
              ref={skillInputRef}
              type="text"
              value={skillSearchQuery}
              onChange={handleSkillSearchChange}
              placeholder="Add a skill (inside or outside your industry)..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-blue-500"
            />
            
            {(() => {
              console.log('Dropdown condition check:', { showSkillSuggestions, skillSuggestionsLength: skillSuggestions.length });
              return showSkillSuggestions && skillSuggestions.length > 0;
            })() && (
              <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-auto skill-suggestion-dropdown">
                {skillSuggestions.map((skill) => (
                  <button
                    key={skill.id}
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      console.log('Button clicked for skill:', skill);
                      handleSkillSelect(skill);
                    }}
                    className="w-full px-4 py-2 text-left hover:bg-gray-100 border-b border-gray-100 last:border-b-0"
                  >
                    <div className="font-medium text-gray-900">{skill.name}</div>
                    <div className="text-sm text-gray-500">
                      {skill.canonical ? 'Canonical skill' : 'Custom skill'}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
          
          {/* Selected Skills */}
          {selectedSkills.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-2">
              {selectedSkills.map((skill) => (
                <span
                  key={skill.id}
                  className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800"
                >
                  {skill.name}
                  <button
                    type="button"
                    onClick={() => handleSkillRemove(skill.id)}
                    className="ml-1 text-blue-600 hover:text-blue-800"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* 5. Advanced (collapsible) */}
        <div className="mb-4">
          <button
            type="button"
            onClick={() => setAdvancedExpanded(!advancedExpanded)}
            className="flex items-center justify-between w-full px-4 py-2 text-left text-sm font-medium text-gray-700 bg-gray-50 rounded-lg hover:bg-gray-100"
          >
            <span>Advanced Filters</span>
            <svg
              className={`w-5 h-5 transform transition-transform ${advancedExpanded ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          
          {advancedExpanded && (
            <div className="mt-3 space-y-4 p-4 bg-gray-50 rounded-lg">
              {/* Minimum Skill Levels */}
              <div>
                <h5 className="text-sm font-medium text-gray-700 mb-3">Minimum Skill Levels</h5>
                <div className="space-y-3">
                  {skillDefinitions.map(skill => (
                    <div key={skill.id} className="flex items-center justify-between">
                      <div className="flex-1">
                        <label className="text-sm font-medium text-gray-700">{skill.name}</label>
                        <p className="text-xs text-gray-500">{skill.description}</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs text-gray-500">≥</span>
                        <select
                          value={skillLevels[skill.id] || 0}
                          onChange={(e) => handleSkillLevelChange(skill.id, parseInt(e.target.value))}
                          className="px-2 py-1 border border-gray-300 rounded text-sm"
                        >
                          <option value={0}>Any</option>
                          <option value={1}>1</option>
                          <option value={2}>2</option>
                          <option value={3}>3</option>
                          <option value={4}>4</option>
                          <option value={5}>5</option>
                        </select>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Tag Filtering */}
              <div>
                <h5 className="text-sm font-medium text-gray-700 mb-3">Tag Filtering</h5>
                <div>
                  <label className="text-xs font-medium text-gray-600 mb-2 block">Include Tags (must have):</label>
                  <div className="relative">
                    <input
                      ref={tagInputRef}
                      type="text"
                      value={tagSearchQuery}
                      onChange={handleTagSearchChange}
                      onFocus={() => setShowTagSuggestions(tagSuggestions.length > 0)}
                      placeholder="Search tags..."
                      className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                    />
                    
                    {(() => {
                      console.log('Tag dropdown condition check:', { showTagSuggestions, tagSuggestionsLength: tagSuggestions.length });
                      return showTagSuggestions && tagSuggestions.length > 0;
                    })() && (
                      <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-40 overflow-auto tag-suggestion-dropdown">
                        {tagSuggestions.map((tag) => (
                          <button
                            key={`include-${tag}`}
                            type="button"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              console.log('Button clicked for tag:', tag);
                              handleTagSelect(tag);
                            }}
                            className="w-full px-3 py-2 text-left hover:bg-gray-100 border-b border-gray-100 last:border-b-0 text-sm"
                          >
                            {tag}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  
                  {includeTags.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {includeTags.map(tag => (
                        <span
                          key={`include-${tag}`}
                          className="inline-flex items-center px-2 py-1 rounded text-xs bg-blue-100 text-blue-800"
                        >
                          {tag}
                          <button
                            type="button"
                            onClick={() => handleTagRemove(tag)}
                            className="ml-1 text-blue-600 hover:text-blue-800"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Sort Results */}
              <div>
                <h5 className="text-sm font-medium text-gray-700 mb-2">Sort Results By</h5>
                <div className="space-y-2">
                  {[
                    { value: 'distance', label: 'Distance (closest first)' },
                    { value: 'capability', label: 'Capability Score (highest first)' },
                    { value: 'combined', label: 'Combined (distance + score)' }
                  ].map(option => (
                    <label key={option.value} className="flex items-center">
                      <input
                        type="radio"
                        name="sortBy"
                        value={option.value}
                        checked={sortBy === option.value}
                        onChange={(e) => setSortBy(e.target.value as any)}
                        className="form-radio"
                      />
                      <span className="ml-2 text-sm text-gray-700">{option.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Error Display */}
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex">
              <svg className="w-5 h-5 text-red-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <span className="text-sm text-red-700">{error}</span>
            </div>
          </div>
        )}

        {/* 6. Search Button */}
        <button
          type="button"
          onClick={handleSearch}
          disabled={loading}
          className={`w-full px-4 py-2 rounded-lg font-medium transition-colors ${
            (locationMode || searchQuery.trim()) && !loading
              ? 'bg-blue-600 text-white hover:bg-blue-700'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          {loading ? (
            <span className="flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Searching...
            </span>
          ) : (
            'Search Civilians'
          )}
        </button>

        {/* Query Summary */}
        <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-800">
            <strong>Query:</strong> {getQuerySummary()}
          </p>
        </div>
      </div>
    </div>
  );
};

export default UnifiedSearchPanel;
