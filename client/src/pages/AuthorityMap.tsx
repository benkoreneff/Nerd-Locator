import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { searchApi, allocationApi, statsApi, OfflineQueue } from '../lib/api';
import { SearchResult, DetailResponse, HeatmapResponse } from '../types';
import Filters from '../components/Filters';
import Drawer from '../components/Drawer';
import HeatmapToggle from '../components/HeatmapToggle';

// Fix for default markers in React Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

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
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedCivilian, setSelectedCivilian] = useState<DetailResponse | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [showHeatmap, setShowHeatmap] = useState(false);
  const [heatmapData, setHeatmapData] = useState<HeatmapResponse | null>(null);
  
  // Filter state
  const [filters, setFilters] = useState({
    bbox: '',
    tags: '',
    minScore: 0,
    availability: '',
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
        availability: filters.availability || undefined,
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
      const response = await searchApi.getDetail(userId);
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

  const handleRetryPending = async () => {
    try {
      await OfflineQueue.processQueue();
      loadData();
    } catch (err) {
      console.error('Failed to retry pending requests:', err);
    }
  };

  // Calculate map center and bounds
  const mapCenter: [number, number] = [60.1699, 24.9384]; // Helsinki
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

      {/* Filters */}
      <div className="bg-gray-50 border-b border-gray-200 p-4">
        <Filters
          filters={filters}
          onFiltersChange={setFilters}
          onRefresh={loadData}
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

      {/* Map */}
      <div className="flex-1 relative">
        {loading && (
          <div className="absolute top-4 left-4 z-[1000] bg-white p-3 rounded-lg shadow-lg">
            <div className="flex items-center">
              <div className="spinner mr-2"></div>
              <span className="text-sm">Loading...</span>
            </div>
          </div>
        )}

        <MapContainer
          center={mapCenter}
          zoom={12}
          bounds={mapBounds}
          className="h-full w-full"
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          
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
                    <p><strong>Availability:</strong> {civilian.availability}</p>
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
                    <div className="mt-2">
                      <strong>Tags:</strong>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {civilian.tags.map(tag => (
                          <span key={tag} className="badge badge-gray text-xs">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
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
      </div>

      {/* Results summary */}
      <div className="bg-white border-t border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-600">
            Showing {results.length} civilian{results.length !== 1 ? 's' : ''}
            {filters.bbox && ' in selected area'}
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

      {/* Drawer */}
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
  );
}
