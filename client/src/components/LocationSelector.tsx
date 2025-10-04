import React, { useState, useEffect, useRef, useCallback } from 'react';
import { geocodeApi } from '../lib/api';

interface LocationSelectorProps {
  onLocationChange: (center: { lat: number; lon: number } | null, radius: number) => void;
  onSearch: (searchParams: any) => void;
  onSearchMethodChange: (method: string | null, details?: string) => void;
}

interface GeocodeResult {
  display_name: string;
  lat: number;
  lon: number;
  type: string;
  confidence: number;
}

const LocationSelector: React.FC<LocationSelectorProps> = ({ onLocationChange, onSearch, onSearchMethodChange }) => {
  const [locationMode, setLocationMode] = useState<'current' | 'search' | 'map' | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<GeocodeResult[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedPlace, setSelectedPlace] = useState<GeocodeResult | null>(null);
  const [radius, setRadius] = useState(50);
  const [useCurrentMapCenter, setUseCurrentMapCenter] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentLocation, setCurrentLocation] = useState<{ lat: number; lon: number } | null>(null);
  
  const searchTimeoutRef = useRef<NodeJS.Timeout>();
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Debounced search function
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

  // Handle search input changes
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

  // Handle place selection
  const handlePlaceSelect = (place: GeocodeResult) => {
    setSelectedPlace(place);
    setSearchQuery(''); // Clear the input field
    setShowSuggestions(false);
    setLocationMode('search');
    setCurrentLocation(null); // Clear current location when selecting a place
    console.log('Place selected:', place);
    onLocationChange({ lat: place.lat, lon: place.lon }, radius);
    onSearchMethodChange('search', place.display_name);
  };

  // Handle current location
  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by this browser');
      return;
    }

    setLoading(true);
    setError(null);
    
    // Add a fallback timeout to prevent infinite loading
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
        setSearchQuery(''); // Clear the input field
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
        maximumAge: 300000 // 5 minutes
      }
    );
  };

  // Handle map center option
  const handleUseMapCenter = () => {
    setLocationMode('map');
    setSelectedPlace(null);
    setSearchQuery(''); // Clear the input field
    setCurrentLocation(null); // Clear current location
    setUseCurrentMapCenter(true);
    onSearchMethodChange('map', 'Current map center');
    // We'll get the map center from the parent component
  };

  // Handle radius change
  const handleRadiusChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newRadius = parseInt(e.target.value);
    setRadius(newRadius);
    
    // Update location if we have a current selection
    if (locationMode === 'current' && currentLocation) {
      onLocationChange(currentLocation, newRadius);
    } else if (locationMode === 'search' && selectedPlace) {
      onLocationChange({ lat: selectedPlace.lat, lon: selectedPlace.lon }, newRadius);
    } else if (locationMode === 'map') {
      // For map center, we'll update when the search is triggered
      setUseCurrentMapCenter(true);
    }
  };

  // Handle search button click
  const handleSearch = async () => {
    if (!locationMode && !searchQuery.trim()) {
      setError('Please select a location method or enter an address first');
      return;
    }

    const searchParams = {
      radius_km: radius,
      status: ['available'], // Default to available only
      page: 1,
      limit: 50,
      sort_by: 'distance'
    };

    if (locationMode === 'current' && currentLocation) {
      searchParams.center_lat = currentLocation.lat;
      searchParams.center_lon = currentLocation.lon;
      console.log('Searching with current location:', currentLocation);
    } else if (locationMode === 'search' && selectedPlace) {
      searchParams.center_lat = selectedPlace.lat;
      searchParams.center_lon = selectedPlace.lon;
      console.log('Searching with selected place:', selectedPlace);
    } else if (locationMode === 'map') {
      // For map center, we'll let the parent component handle getting the center
      searchParams.use_map_center = true;
      console.log('Searching with map center');
    } else if (searchQuery.trim()) {
      // Auto-geocode the typed address
      console.log('Auto-geocoding address:', searchQuery);
      setLoading(true);
      try {
        const results = await geocodeApi.searchPlaces(searchQuery.trim());
        if (results.length > 0) {
          const place = results[0]; // Use the first (most relevant) result
          searchParams.center_lat = place.lat;
          searchParams.center_lon = place.lon;
          console.log('Auto-geocoded to:', place);
          
          // Update the search method display
          onSearchMethodChange('search', place.display_name);
          
          // Notify parent to center the map on this location
          onLocationChange({ lat: place.lat, lon: place.lon }, radius);
        } else {
          setError('Address not found. Please try a different address or select from suggestions.');
          setLoading(false);
          return;
        }
      } catch (err) {
        console.error('Geocoding failed:', err);
        setError('Failed to find address. Please try a different address or select from suggestions.');
        setLoading(false);
        return;
      } finally {
        setLoading(false);
      }
    } else {
      setError('Please select a location method or enter an address first');
      return;
    }

    console.log('Search params:', searchParams);
    onSearch(searchParams);
  };

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchInputRef.current && !searchInputRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-3">Location</h3>
        
        {/* Current Location Button */}
        <div className="mb-4">
          <button
            type="button"
            onClick={handleUseCurrentLocation}
            disabled={loading}
            className={`w-full px-4 py-2 rounded-lg border-2 transition-colors ${
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
        </div>

        {/* Place Search */}
        <div className="mb-4">
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
        </div>

        {/* Map Center Option */}
        <div className="mb-4">
          <button
            type="button"
            onClick={handleUseMapCenter}
            className={`w-full px-4 py-2 rounded-lg border-2 transition-colors ${
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

        {/* Radius Selection */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Search Radius: {radius} km
          </label>
          <input
            type="range"
            min="5"
            max="300"
            value={radius}
            onChange={handleRadiusChange}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
          />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>5 km</span>
            <span>150 km</span>
            <span>300 km</span>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex">
              <svg className="w-5 h-5 text-red-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <span className="text-sm text-red-700">{error}</span>
            </div>
          </div>
        )}

        {/* Search Button */}
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
      </div>
    </div>
  );
};

export default LocationSelector;
