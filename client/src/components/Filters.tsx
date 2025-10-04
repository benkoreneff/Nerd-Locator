import React from 'react';
import { AVAILABLE_TAGS } from '../types';

interface FiltersProps {
  filters: {
    bbox: string;
    tags: string;
    minScore: number;
  };
  onFiltersChange: (filters: any) => void;
  onRefresh: () => void;
}

export default function Filters({ filters, onFiltersChange, onRefresh }: FiltersProps) {
  const handleTagToggle = (tag: string) => {
    const currentTags = filters.tags ? filters.tags.split(',') : [];
    const newTags = currentTags.includes(tag)
      ? currentTags.filter(t => t !== tag)
      : [...currentTags, tag];
    
    onFiltersChange({
      ...filters,
      tags: newTags.join(','),
    });
  };

  const clearFilters = () => {
    onFiltersChange({
      bbox: '',
      tags: '',
      minScore: 0,
    });
  };

  const hasActiveFilters = filters.bbox || filters.tags || filters.minScore > 0;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-gray-900">Filters</h3>
        <div className="flex space-x-2">
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="btn btn-secondary text-sm"
            >
              Clear Filters
            </button>
          )}
          <button
            onClick={onRefresh}
            className="btn btn-primary text-sm"
          >
            Refresh
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Bounding Box */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Bounding Box
          </label>
          <input
            type="text"
            value={filters.bbox}
            onChange={(e) => onFiltersChange({ ...filters, bbox: e.target.value })}
            placeholder="min_lat,min_lon,max_lat,max_lon"
            className="form-input text-sm"
          />
          <p className="mt-1 text-xs text-gray-500">
            Optional: Define search area
          </p>
        </div>

        {/* Minimum Score */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Minimum Score: {filters.minScore}
          </label>
          <input
            type="range"
            min="0"
            max="100"
            value={filters.minScore}
            onChange={(e) => onFiltersChange({ ...filters, minScore: parseInt(e.target.value) })}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>0</span>
            <span>100</span>
          </div>
        </div>

        {/* Active Filters Count */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Active Filters
          </label>
          <div className="bg-gray-100 p-3 rounded-md">
            <div className="text-sm text-gray-600">
              {hasActiveFilters ? (
                <div className="space-y-1">
                  {filters.bbox && <div>• Bounding box set</div>}
                  {filters.tags && <div>• {filters.tags.split(',').length} tag(s)</div>}
                  {filters.minScore > 0 && <div>• Min score: {filters.minScore}</div>}
                </div>
              ) : (
                <div className="text-gray-500">No filters active</div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Tags */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Capability Tags
        </label>
        <div className="flex flex-wrap gap-2">
          {AVAILABLE_TAGS.map(tag => {
            const isSelected = filters.tags.split(',').includes(tag);
            return (
              <button
                key={tag}
                onClick={() => handleTagToggle(tag)}
                className={`badge text-sm cursor-pointer transition-colors ${
                  isSelected 
                    ? 'badge-primary' 
                    : 'badge-gray hover:bg-gray-200'
                }`}
              >
                {tag}
              </button>
            );
          })}
        </div>
        <p className="mt-1 text-xs text-gray-500">
          Click tags to filter by capability type
        </p>
      </div>
    </div>
  );
}
