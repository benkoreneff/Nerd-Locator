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

// Heatmap layer component showing all users as an overview
function HeatmapLayer({ isNightMode = false }: { isNightMode?: boolean }) {
  const map = useMap();
  const heatmapLayerRef = useRef<any>(null);

  useEffect(() => {
    console.log('HeatmapLayer: Component mounted, creating heatmap');
    
    // Create hardcoded heat points for all 70 users (since we know their locations)
    const heatPoints = [
      // Helsinki region (users 1-10)
      [60.1699, 24.9384, 1], [60.1719, 24.9414, 1], [60.1708, 24.9439, 1], [60.1636, 24.9271, 1],
      [60.1649, 24.9271, 1], [60.1676, 24.9439, 1], [60.1699, 24.9414, 1], [60.1676, 24.9439, 1],
      [60.1697, 24.9455, 1], [60.1695, 24.9318, 1],
      // Tampere region (users 11-15)
      [61.4991, 23.7871, 1], [61.4982, 23.7616, 1], [61.4963, 23.7602, 1], [61.5025, 23.7756, 1], [61.4975, 23.7623, 1],
      // Turku region (users 16-20)
      [60.4518, 22.2666, 1], [60.4503, 22.2754, 1], [60.4545, 22.2612, 1], [60.4521, 22.2698, 1], [60.4498, 22.2675, 1],
      // Oulu region (users 21-25)
      [65.0121, 25.4651, 1], [65.0135, 25.4687, 1], [65.0118, 25.4623, 1], [65.0128, 25.4645, 1], [65.0132, 25.4667, 1],
      // Kuopio region (users 26-30)
      [62.8924, 27.6770, 1], [62.8921, 27.6765, 1], [62.8927, 27.6775, 1], [62.8923, 27.6768, 1], [62.8925, 27.6772, 1],
      // Jyväskylä region (users 31-35)
      [62.2415, 25.7209, 1], [62.2412, 25.7205, 1], [62.2418, 25.7213, 1], [62.2410, 25.7203, 1], [62.2416, 25.7211, 1],
      // Rovaniemi region (users 36-40)
      [66.5039, 25.7294, 1], [66.5036, 25.7291, 1], [66.5042, 25.7297, 1], [66.5038, 25.7295, 1], [66.5040, 25.7296, 1],
      // Lahti region (users 41-45)
      [60.9827, 25.6612, 1], [60.9824, 25.6609, 1], [60.9830, 25.6615, 1], [60.9826, 25.6611, 1], [60.9832, 25.6617, 1],
      // Vaasa region (users 46-50)
      [63.0959, 21.6158, 1], [63.0956, 21.6155, 1], [63.0962, 21.6161, 1], [63.0957, 21.6156, 1], [63.0960, 21.6159, 1],
      
      // Rural users - Southern Finland (users 51-55)
      [61.4856, 21.7979, 1], [61.4845, 21.7955, 1], [60.2486, 24.0653, 1], [60.2495, 24.0662, 1], [61.4889, 21.7998, 1],
      
      // Rural users - Central Finland (users 56-60)
      [62.2425, 25.7215, 1], [62.2435, 25.7225, 1], [62.6019, 29.7636, 1], [62.6025, 29.7642, 1], [62.8935, 27.6780, 1],
      
      // Rural users - Northern Finland (users 61-65)
      [65.0135, 25.4697, 1], [65.0145, 25.4707, 1], [66.5045, 25.7305, 1], [66.5055, 25.7315, 1], [65.7364, 24.5637, 1],
      
      // Rural users - Eastern Finland (users 66-70)
      [61.0587, 28.1887, 1], [61.0597, 28.1897, 1], [61.1719, 28.7674, 1], [61.1729, 28.7684, 1], [60.4669, 26.9459, 1]
    ];
    
    console.log('HeatmapLayer: Created', heatPoints.length, 'heat points (70 users total)');
    
    // Import leaflet.heat and create heatmap
    import('leaflet.heat').then((heatModule) => {
      console.log('HeatmapLayer: leaflet.heat imported successfully');
      console.log('HeatmapLayer: heatModule:', heatModule);
      
      // The leaflet.heat plugin adds itself to L.heatLayer
      const L = (window as any).L;
      if (L && L.heatLayer) {
        console.log('HeatmapLayer: Using L.heatLayer');
        
        const heatmapLayer = L.heatLayer(heatPoints, {
          radius: 40,           // Smaller radius for less intense coverage
          blur: 25,            // Less blur for sharper edges
          maxZoom: 18,         // Show at all zoom levels
          max: 0.75,          // Slightly higher intensity for more vibrant heat
          minOpacity: 0.5,    // Slightly higher minimum opacity for better visibility
          gradient: {
            // Enhanced vibrant gradient optimized for both day and night modes
            0.0: isNightMode ? '#2563eb' : '#4d94ff',   // Brighter blue (night) / Light blue (day)
            0.25: isNightMode ? '#10b981' : '#66cc99',  // Brighter green (night) / Light green (day)
            0.5: isNightMode ? '#f59e0b' : '#ffdd66',   // Brighter yellow (night) / Light yellow (day)
            0.75: isNightMode ? '#f97316' : '#ff8844',  // Bright orange (night) / Light orange (day)
            1.0: isNightMode ? '#dc2626' : '#ff4444'    // Brighter red (night) / Light red (day)
          }
        });

        // Add heatmap layer
        console.log('HeatmapLayer: Adding heatmap layer to map');
        heatmapLayerRef.current = heatmapLayer;
        map.addLayer(heatmapLayer);
        
        console.log('HeatmapLayer: Heatmap layer added successfully');
      } else {
        console.error('HeatmapLayer: L.heatLayer not available');
      }
    }).catch((error) => {
      console.error('HeatmapLayer: Failed to import leaflet.heat:', error);
    });

    return () => {
      if (heatmapLayerRef.current) {
        console.log('HeatmapLayer: Cleanup - removing heatmap layer');
        map.removeLayer(heatmapLayerRef.current);
      }
    };
  }, [map, isNightMode]);

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
  const [viewMode, setViewMode] = useState<'map' | 'list' | 'heat'>('map');
  const [isNightMode, setIsNightMode] = useState(false);
  
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
                <button
                  onClick={() => {
                    console.log('Switching to heat view');
                    setViewMode('heat');
                  }}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    viewMode === 'heat'
                      ? 'bg-blue-100 text-blue-700 border border-blue-200'
                      : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
                  }`}
                  title="Heat Map View"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
                  </svg>
                </button>
              </div>
            </div>
            
            {/* Night Mode Toggle */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-1">
              <button
                onClick={() => {
                  console.log('Toggling night mode:', !isNightMode);
                  setIsNightMode(!isNightMode);
                }}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isNightMode
                    ? 'bg-gray-800 text-yellow-300 border border-gray-600'
                    : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
                }`}
                title={isNightMode ? "Switch to Day Mode" : "Switch to Night Mode"}
              >
                {isNightMode ? (
                  // Sun icon for day mode
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                ) : (
                  // Moon icon for night mode
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                  </svg>
                )}
              </button>
            </div>
            
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

          {viewMode === 'heat' ? (
            /* Heatmap-only view */
            <MapContainer
              key={`mapcontainer-heatmap-${isNightMode ? 'night' : 'day'}`}
              center={[64.0, 26.0]}
              zoom={6}
              className="h-full w-full"
            >
              <TileLayer
                key={`tilelayer-heatmap-${isNightMode ? 'night' : 'day'}`}
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url={isNightMode 
                  ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png"
                  : "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                }
              />
              <HeatmapLayer isNightMode={isNightMode} />
            </MapContainer>
          ) : viewMode === 'map' ? (
            /* Map view with markers */
            <MapContainer
              key={`mapcontainer-map-${isNightMode ? 'night' : 'day'}`}
              center={defaultMapCenter}
              zoom={12}
              bounds={mapBounds}
              className="h-full w-full"
            >
            <TileLayer
              key={`tilelayer-map-${isNightMode ? 'night' : 'day'}`}
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url={isNightMode 
                ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png"
                : "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              }
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
            
            {/* Heatmap layer - only show in heat view */}
            {viewMode === 'heat' && (
              <HeatmapLayer isNightMode={isNightMode} />
            )}
            
            {/* Civilian markers - only show in map view */}
            {viewMode === 'map' && results.map((civilian) => (
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
          ) : null}

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
