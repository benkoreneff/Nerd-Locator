import React, { useState, useEffect, useRef, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { searchApi, allocationApi, statsApi, advancedSearchApi, OfflineQueue } from '../lib/api';
import { SearchResult, DetailResponse, HeatmapResponse, AdvancedSearchRequest } from '../types';
import Drawer from '../components/Drawer';
import HeatmapToggle from '../components/HeatmapToggle';
import SkillLevelPill from '../components/SkillLevelPill';
import UnifiedSearchPanel from '../components/UnifiedSearchPanel';

// Fix for default markers in React Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

// Component to handle radius circle overlay
const RadiusCircleOverlay: React.FC<{ 
  center: { lat: number; lon: number } | null, 
  radius: number | null
}> = ({ center, radius }) => {
  const map = useMap();
  const circleRef = useRef<L.Circle | null>(null);

  useEffect(() => {
    if (!center || !radius) return;

    // Remove existing circle
    if (circleRef.current) {
      map.removeLayer(circleRef.current);
    }

    // Create new circle
    const circle = L.circle([center.lat, center.lon], {
      radius: radius * 1000, // Convert km to meters
      color: '#3b82f6',
      fillColor: '#3b82f6',
      fillOpacity: 0.1,
      weight: 2,
      dashArray: '5, 5'
    });

    circleRef.current = circle;
    map.addLayer(circle);

    // Cleanup
    return () => {
      if (circleRef.current) {
        map.removeLayer(circleRef.current);
      }
    };
  }, [center, radius, map]);

  return null;
};

// Component to track map center changes
const MapCenterTracker: React.FC<{ onCenterChange: (center: { lat: number; lon: number }) => void }> = ({ onCenterChange }) => {
  const map = useMap();

  useEffect(() => {
    const handleMoveEnd = () => {
      const center = map.getCenter();
      onCenterChange({ lat: center.lat, lon: center.lng });
    };

    map.on('moveend', handleMoveEnd);
    // Initial center
    handleMoveEnd();

    return () => {
      map.off('moveend', handleMoveEnd);
    };
  }, [map, onCenterChange]);

  return null;
};

// Component to capture map reference
const MapRef: React.FC<{ onMapReady: (map: L.Map) => void }> = ({ onMapReady }) => {
  const map = useMap();
  
  useEffect(() => {
    onMapReady(map);
  }, [map, onMapReady]);
  
  return null;
};

// Component to show map center indicator
const MapCenterIndicator: React.FC<{ 
  center: { lat: number; lon: number } | null,
  radius: number | null
}> = ({ center, radius }) => {
  const map = useMap();

  useEffect(() => {
    if (!center) return;

    // Create a custom icon for the center point
    const centerIcon = L.divIcon({
      className: 'map-center-indicator',
      html: `
        <div style="
          width: 20px;
          height: 20px;
          border: 3px solid #3b82f6;
          border-radius: 50%;
          background: white;
          box-shadow: 0 2px 4px rgba(0,0,0,0.2);
          position: relative;
        ">
          <div style="
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            width: 8px;
            height: 8px;
            background: #3b82f6;
            border-radius: 50%;
          "></div>
        </div>
      `,
      iconSize: [20, 20],
      iconAnchor: [10, 10]
    });

    // Create marker for center point
    const centerMarker = L.marker([center.lat, center.lon], { 
      icon: centerIcon,
      zIndexOffset: 1000 // Ensure it's above other markers
    });

    map.addLayer(centerMarker);

    // Cleanup
    return () => {
      map.removeLayer(centerMarker);
    };
  }, [center, map]);

  return null;
};

// Heatmap layer component
function HeatmapLayer({ points }: { points: HeatmapResponse['points'] }) {
  const map = useMap();
  const heatmapLayerRef = useRef<any>(null);

  useEffect(() => {
    if (points.length > 0) {
      // Dynamically import leaflet.heat
      import('leaflet.heat').then((heat) => {
        const heatmapLayer = heat.default(
          points.map(p => [p.lat, p.lon, p.weight]),
          {
            radius: 25,
            blur: 15,
            maxZoom: 17,
          }
        );

        if (heatmapLayerRef.current) {
          map.removeLayer(heatmapLayerRef.current);
        }

        heatmapLayerRef.current = heatmapLayer;
        map.addLayer(heatmapLayer);
      });
    } else if (heatmapLayerRef.current) {
      map.removeLayer(heatmapLayerRef.current);
      heatmapLayerRef.current = null;
    }

    return () => {
      if (heatmapLayerRef.current) {
        map.removeLayer(heatmapLayerRef.current);
      }
    };
  }, [points, map]);

  return null;
}

export default function AuthorityMap() {
  // Helper function to calculate distance between two points
  const calculateDistance = (point1: { lat: number; lon: number }, point2: { lat: number; lon: number }): string => {
    const R = 6371; // Earth's radius in kilometers
    const dLat = (point2.lat - point1.lat) * Math.PI / 180;
    const dLon = (point2.lon - point1.lon) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(point1.lat * Math.PI / 180) * Math.cos(point2.lat * Math.PI / 180) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const distance = R * c;
    return `${distance.toFixed(1)}km`;
  };

  // Helper function to generate CSV content
  const generateCSV = (results: SearchResult[]): string => {
    const headers = ['Rank', 'ID', 'Status', 'Distance', 'Score', 'Skills', 'Tags', 'Education', 'Availability'];
    const csvRows = [headers.join(',')];
    
    results.forEach((civilian, index) => {
      const distance = searchCenter ? calculateDistance(searchCenter, { lat: civilian.lat, lon: civilian.lon }) : 'N/A';
      const row = [
        index + 1,
        civilian.user_id,
        civilian.status,
        distance,
        civilian.capability_score,
        `"${civilian.skills.join('; ')}"`,
        `"${civilian.tags.join('; ')}"`,
        civilian.education_level,
        civilian.availability
      ];
      csvRows.push(row.join(','));
    });
    
    return csvRows.join('\n');
  };

  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedCivilian, setSelectedCivilian] = useState<DetailResponse | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [showHeatmap, setShowHeatmap] = useState(false);
  const [heatmapData, setHeatmapData] = useState<HeatmapResponse | null>(null);
  const [viewMode, setViewMode] = useState<'map' | 'list'>('map');
  
  // Debug: Log view mode changes
  useEffect(() => {
    console.log('Current view mode:', viewMode);
  }, [viewMode]);
  
  // Location selector state
  const [searchCenter, setSearchCenter] = useState<{ lat: number; lon: number } | null>(null);
  const [searchRadius, setSearchRadius] = useState<number | null>(null);
  const [searchGeometry, setSearchGeometry] = useState<any>(null);
  const [mapCenter, setMapCenter] = useState<{ lat: number; lon: number } | null>(null);
  const [currentSearchMethod, setCurrentSearchMethod] = useState<string | null>(null);
  const [currentSearchDetails, setCurrentSearchDetails] = useState<string | null>(null);
  const [currentSearchParams, setCurrentSearchParams] = useState<any>(null);
  const mapRef = useRef<L.Map | null>(null);
  
  // Filter state
  const [filters, setFilters] = useState({
    bbox: '',
    tags: '',
    minScore: 0,
  });

  // Load initial data
  useEffect(() => {
    loadData();
  }, []);

  // Load data when filters change
  useEffect(() => {
    loadData();
  }, [filters]);

  const loadData = async () => {
    setLoading(true);
    setError(null);

    try {
      // Load search results
      const searchParams = {
        bbox: filters.bbox || undefined,
        tags: filters.tags || undefined,
        min_score: filters.minScore || undefined,
        limit: 100,
      };

      const [searchResponse, heatmapResponse] = await Promise.all([
        searchApi.search(searchParams),
        statsApi.getHeatmap(searchParams),
      ]);

      setResults(searchResponse.data.results);
      setHeatmapData(heatmapResponse.data);
    } catch (err: any) {
      console.error('Failed to load data:', err);
      setError('Failed to load civilian data');
    } finally {
      setLoading(false);
    }
  };

  const handleCivilianClick = async (userId: number) => {
    try {
      // Pass current search context for query-relevant scoring
      const searchContext = currentSearchParams ? {
        skills: currentSearchParams.skills,
        include_tags: currentSearchParams.include_tags,
        search_query: currentSearchParams.search_query
      } : undefined;
      
      const response = await searchApi.getDetail(userId, searchContext);
      setSelectedCivilian(response.data);
      setDrawerOpen(true);
    } catch (err: any) {
      console.error('Failed to load civilian details:', err);
      setError('Failed to load civilian details');
    }
  };

  const handleRequestInfo = async (userId: number, message: string) => {
    try {
      await allocationApi.createRequest({
        type: 'info',
        user_id: userId,
        message,
      });
      
      // Close drawer and refresh data
      setDrawerOpen(false);
      setSelectedCivilian(null);
      loadData();
    } catch (err: any) {
      console.error('Failed to create request:', err);
      setError('Failed to send request');
    }
  };

  const handleAllocate = async (userId: number, missionCode: string) => {
    try {
      await allocationApi.allocate({
        user_id: userId,
        mission_code: missionCode,
      });
      
      // Close drawer and refresh data
      setDrawerOpen(false);
      setSelectedCivilian(null);
      loadData();
    } catch (err: any) {
      console.error('Failed to allocate civilian:', err);
      setError('Failed to allocate civilian');
    }
  };

  // Handle location change from LocationSelector
  const handleLocationChange = (center: { lat: number; lon: number } | null, radius: number) => {
    setSearchCenter(center);
    setSearchRadius(radius);
    
    // If we have a center, recenter the map with appropriate zoom
    if (center) {
      const mapInstance = mapRef.current;
      if (mapInstance) {
        // Set zoom level based on search radius for better visibility
        let zoomLevel = 10; // Default zoom
        if (radius <= 10) zoomLevel = 13;      // City level
        else if (radius <= 25) zoomLevel = 12; // Regional level  
        else if (radius <= 50) zoomLevel = 11; // County level
        else if (radius <= 100) zoomLevel = 10; // State level
        else zoomLevel = 9; // Country level
        
        mapInstance.setView([center.lat, center.lon], zoomLevel);
        console.log(`Map centered on ${center.lat}, ${center.lon} with zoom ${zoomLevel} for ${radius}km radius`);
      }
    }
  };

  // Handle advanced search
  const handleAdvancedSearch = async (searchParams: any) => {
    console.log('handleAdvancedSearch called with:', searchParams);
    setLoading(true);
    setError(null);
    
    // Store current search parameters for detail calls
    setCurrentSearchParams(searchParams);
    
    try {
      let request: AdvancedSearchRequest = {
        ...searchParams,
        page: 1,
        limit: 50,
        sort_by: 'distance'
      };

      // Handle map center case
      if (searchParams.use_map_center && mapCenter) {
        request.center_lat = mapCenter.lat;
        request.center_lon = mapCenter.lon;
        console.log('Using map center:', mapCenter);
      }

      console.log('Sending search request:', request);
      const response = await advancedSearchApi.search(request);
      console.log('Search response:', response);
      
      setResults(response.results);
      setSearchGeometry(response.search_geometry);
      
      // Store search center and radius for circle overlay
      if (response.search_center && response.search_radius_km) {
        setSearchCenter(response.search_center);
        setSearchRadius(response.search_radius_km);
      }
      
    } catch (err) {
      console.error('Advanced search failed:', err);
      setError('Search failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Handle map center change
  const handleMapCenterChange = useCallback((center: { lat: number; lon: number }) => {
    setMapCenter(center);
  }, []);

  // Handle map ready
  const handleMapReady = useCallback((map: L.Map) => {
    mapRef.current = map;
  }, []);

  // Handle search method change
  const handleSearchMethodChange = (method: string | null, details?: string) => {
    setCurrentSearchMethod(method);
    setCurrentSearchDetails(details || null);
  };

  const handleRetryPending = async () => {
    try {
      await OfflineQueue.processQueue();
      loadData();
    } catch (err) {
      console.error('Failed to retry pending requests:', err);
    }
  };

  // Calculate map center and bounds
  const defaultMapCenter: [number, number] = [60.1699, 24.9384]; // Helsinki
  const mapBounds = heatmapData?.bounds ? [
    [heatmapData.bounds[0], heatmapData.bounds[1]],
    [heatmapData.bounds[2], heatmapData.bounds[3]]
  ] as [[number, number], [number, number]] : undefined;

  return (
    <div className="h-screen flex flex-col">
      {/* Header with controls */}
      <div className="bg-white shadow-sm border-b border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">
            Civilian Resource Map
          </h2>
          
          <div className="flex items-center space-x-4">
            {/* View Toggle */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-1">
              <div className="flex space-x-1">
                <button
                  onClick={() => {
                    console.log('Switching to map view');
                    setViewMode('map');
                  }}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    viewMode === 'map'
                      ? 'bg-blue-100 text-blue-700 border border-blue-200'
                      : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
                  }`}
                  title="Map View"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                  </svg>
                </button>
                <button
                  onClick={() => {
                    console.log('Switching to list view');
                    setViewMode('list');
                  }}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    viewMode === 'list'
                      ? 'bg-blue-100 text-blue-700 border border-blue-200'
                      : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
                  }`}
                  title="List View"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                  </svg>
                </button>
              </div>
            </div>
            
            <HeatmapToggle
              showHeatmap={showHeatmap}
              onToggle={setShowHeatmap}
            />
            
            {OfflineQueue.getPendingCount() > 0 && (
              <button
                onClick={handleRetryPending}
                className="btn btn-warning text-sm"
              >
                Retry {OfflineQueue.getPendingCount()} pending
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Unified Search Panel */}
      <div className="bg-gray-50 border-b border-gray-200 p-4">
        <UnifiedSearchPanel
          onLocationChange={handleLocationChange}
          onSearch={handleAdvancedSearch}
          onSearchMethodChange={handleSearchMethodChange}
        />
      </div>

      {/* Error message */}
      {error && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Main content area with flexible layout */}
      <div className="flex-1 flex">
        {/* Map container */}
        <div className={`relative transition-all duration-300 ${drawerOpen ? 'flex-1' : 'flex-1'}`}>
          {loading && (
            <div className="absolute top-4 left-4 z-[1000] bg-white p-3 rounded-lg shadow-lg">
              <div className="flex items-center">
                <div className="spinner mr-2"></div>
                <span className="text-sm">Loading...</span>
              </div>
            </div>
          )}

          {/* Search Method Display */}
          {currentSearchMethod && (
            <div className="bg-blue-50 border-l-4 border-blue-400 p-3 mb-4">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-blue-800">
                    Search Method: {currentSearchMethod === 'current' ? 'My Location' : 
                                   currentSearchMethod === 'search' ? 'Selected Place' : 
                                   'Map Center'}
                  </p>
                  {currentSearchDetails && (
                    <p className="text-sm text-blue-700">{currentSearchDetails}</p>
                  )}
                  {searchRadius && (
                    <p className="text-sm text-blue-600">Radius: {searchRadius}km</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {viewMode === 'map' && (
            <MapContainer
              center={defaultMapCenter}
              zoom={12}
              bounds={mapBounds}
              className="h-full w-full"
            >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            
            {/* Map reference capture */}
            <MapRef onMapReady={handleMapReady} />
            
            {/* Map center tracker */}
            <MapCenterTracker onCenterChange={handleMapCenterChange} />
            
            {/* Search radius circle overlay */}
            {searchCenter && searchRadius && (
              <RadiusCircleOverlay 
                center={searchCenter} 
                radius={searchRadius} 
              />
            )}
            
            {/* Map center indicator */}
            {searchCenter && (
              <MapCenterIndicator 
                center={searchCenter} 
                radius={searchRadius} 
              />
            )}
            
            {/* Heatmap layer */}
            {showHeatmap && heatmapData && (
              <HeatmapLayer points={heatmapData.points} />
            )}
            
            {/* Civilian markers */}
            {results.map((civilian) => (
              <Marker
                key={civilian.user_id}
                position={[civilian.lat, civilian.lon]}
                eventHandlers={{
                  click: () => handleCivilianClick(civilian.user_id),
                }}
              >
                <Popup>
                  <div className="p-2">
                    <h3 className="font-medium text-gray-900">
                      Civilian #{civilian.user_id}
                    </h3>
                    <div className="mt-2 space-y-1 text-sm">
                      <p><strong>Education:</strong> {civilian.education_level}</p>
                      <p><strong>Score:</strong> {civilian.capability_score}/100</p>
                      <p><strong>Status:</strong> 
                        <span className={`ml-1 badge ${
                          civilian.status === 'available' ? 'badge-success' :
                          civilian.status === 'allocated' ? 'badge-warning' :
                          'badge-danger'
                        }`}>
                          {civilian.status}
                        </span>
                      </p>
                      <div className="mt-2">
                        <strong>Skills:</strong>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {civilian.skills.slice(0, 3).map(skill => (
                            <span key={skill} className="badge badge-primary text-xs">
                              {skill}
                            </span>
                          ))}
                          {civilian.skills.length > 3 && (
                            <span className="text-xs text-gray-500">
                              +{civilian.skills.length - 3} more
                            </span>
                          )}
                        </div>
                      </div>
                      {civilian.skill_levels && Object.keys(civilian.skill_levels).length > 0 && (
                        <div className="mt-2">
                          <strong>Skill Levels:</strong>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {Object.entries(civilian.skill_levels)
                              .filter(([_, level]) => level >= 3)
                              .slice(0, 3)
                              .map(([skillName, level]) => (
                                <SkillLevelPill
                                  key={skillName}
                                  skillName={skillName.replace('_', ' ')}
                                  level={level}
                                />
                              ))}
                            {Object.entries(civilian.skill_levels).filter(([_, level]) => level >= 3).length > 3 && (
                              <span className="text-xs text-gray-500">
                                +{Object.entries(civilian.skill_levels).filter(([_, level]) => level >= 3).length - 3} more
                              </span>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                    <button
                      onClick={() => handleCivilianClick(civilian.user_id)}
                      className="mt-3 btn btn-primary text-xs"
                    >
                      View Details
                    </button>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
          )}

          {/* List View */}
          {viewMode === 'list' && (
            <div className="h-full w-full bg-white">
              <div className="p-4 border-b border-gray-200 flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-900">
                  Search Results ({results.length})
                </h3>
                <button
                  onClick={() => {
                    // Export CSV functionality
                    const csvContent = generateCSV(results);
                    const blob = new Blob([csvContent], { type: 'text/csv' });
                    const url = window.URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = 'civilians-search-results.csv';
                    a.click();
                    window.URL.revokeObjectURL(url);
                  }}
                  className="px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700"
                >
                  Export CSV
                </button>
              </div>
              
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Rank
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        ID
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Distance
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Score
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Skills
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Tags
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {results.map((civilian, index) => (
                      <tr key={civilian.user_id} className="hover:bg-gray-50">
                        <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          #{index + 1}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                          #{civilian.user_id}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            civilian.status === 'available' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {civilian.status}
                          </span>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                          {searchCenter ? calculateDistance(searchCenter, { lat: civilian.lat, lon: civilian.lon }) : 'N/A'}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                          <div className="flex items-center">
                            <span className="font-semibold">{civilian.capability_score}</span>
                            <span className="text-gray-500 ml-1">/100</span>
                          </div>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <div className="flex flex-wrap gap-1">
                            {civilian.skills.slice(0, 3).map((skill, skillIndex) => (
                              <span key={skillIndex} className="inline-flex px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded">
                                {skill}
                              </span>
                            ))}
                            {civilian.skills.length > 3 && (
                              <span className="inline-flex px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded">
                                +{civilian.skills.length - 3}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <div className="flex flex-wrap gap-1">
                            {civilian.tags.slice(0, 2).map((tag, tagIndex) => (
                              <span key={tagIndex} className="inline-flex px-2 py-1 text-xs bg-purple-100 text-purple-800 rounded">
                                {tag}
                              </span>
                            ))}
                            {civilian.tags.length > 2 && (
                              <span className="inline-flex px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded">
                                +{civilian.tags.length - 2}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleCivilianClick(civilian.user_id)}
                              className="text-blue-600 hover:text-blue-900"
                            >
                              View Details
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Drawer as sidebar */}
        <Drawer
          isOpen={drawerOpen}
          onClose={() => {
            setDrawerOpen(false);
            setSelectedCivilian(null);
          }}
          civilian={selectedCivilian}
          onRequestInfo={handleRequestInfo}
          onAllocate={handleAllocate}
        />
      </div>

      {/* Results summary */}
      <div className="bg-white border-t border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-600">
            Showing {results.length} civilian{results.length !== 1 ? 's' : ''}
            {searchCenter && searchRadius && ` within ${searchRadius}km radius`}
          </div>
          
          <div className="flex items-center space-x-4 text-sm text-gray-600">
            <span>
              Available: {results.filter(r => r.status === 'available').length}
            </span>
            <span>
              Allocated: {results.filter(r => r.status === 'allocated').length}
            </span>
            <span>
              Avg Score: {results.length > 0 ? 
                Math.round(results.reduce((sum, r) => sum + r.capability_score, 0) / results.length) : 
                0
              }
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
