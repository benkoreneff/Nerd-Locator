import React, { useState } from 'react';
import { ResourceSpec, RESOURCE_CATEGORIES } from '../types';

interface ToolsAssetsProps {
  resources: ResourceSpec[];
  onResourcesChange: (resources: ResourceSpec[]) => void;
}

export default function ToolsAssets({ resources, onResourcesChange }: ToolsAssetsProps) {
  const [hasTools, setHasTools] = useState(resources.length > 0);

  const toggleResource = (category: string, subtype: string) => {
    const existingIndex = resources.findIndex(r => r.category === category && r.subtype === subtype);
    
    if (existingIndex >= 0) {
      // Remove resource
      const newResources = resources.filter((_, index) => index !== existingIndex);
      onResourcesChange(newResources);
    } else {
      // Add resource
      const newResource: ResourceSpec = {
        category,
        subtype,
        quantity: 1,
        specs: {}
      };
      onResourcesChange([...resources, newResource]);
    }
  };

  const updateResourceSpec = (category: string, subtype: string, specKey: string, value: any) => {
    const resourceIndex = resources.findIndex(r => r.category === category && r.subtype === subtype);
    if (resourceIndex >= 0) {
      const updatedResources = [...resources];
      updatedResources[resourceIndex] = {
        ...updatedResources[resourceIndex],
        specs: {
          ...updatedResources[resourceIndex].specs,
          [specKey]: value
        }
      };
      onResourcesChange(updatedResources);
    }
  };

  const updateResourceQuantity = (category: string, subtype: string, quantity: number) => {
    const resourceIndex = resources.findIndex(r => r.category === category && r.subtype === subtype);
    if (resourceIndex >= 0) {
      const updatedResources = [...resources];
      updatedResources[resourceIndex] = {
        ...updatedResources[resourceIndex],
        quantity: quantity || 1
      };
      onResourcesChange(updatedResources);
    }
  };

  const getResourceSpecs = (category: string, subtype: string) => {
    const resource = resources.find(r => r.category === category && r.subtype === subtype);
    return resource?.specs || {};
  };

  const getResourceQuantity = (category: string, subtype: string) => {
    const resource = resources.find(r => r.category === category && r.subtype === subtype);
    return resource?.quantity || 1;
  };

  const isResourceSelected = (category: string, subtype: string) => {
    return resources.some(r => r.category === category && r.subtype === subtype);
  };

  if (!hasTools) {
    return (
      <div className="space-y-4">
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="text-lg font-medium text-gray-900 mb-3">Tools & Assets</h3>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-700">Do you have tools or equipment that could support emergency operations?</span>
            <div className="flex space-x-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="hasTools"
                  checked={hasTools}
                  onChange={() => setHasTools(true)}
                  className="form-checkbox"
                />
                <span className="ml-2 text-sm text-gray-700">Yes</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="hasTools"
                  checked={!hasTools}
                  onChange={() => setHasTools(false)}
                  className="form-checkbox"
                />
                <span className="ml-2 text-sm text-gray-700">No</span>
              </label>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-gray-50 p-4 rounded-lg">
        <h3 className="text-lg font-medium text-gray-900 mb-3">Tools & Assets</h3>
        <div className="flex items-center space-x-4 mb-4">
          <span className="text-sm text-gray-700">Do you have tools or equipment that could support emergency operations?</span>
          <div className="flex space-x-4">
            <label className="flex items-center">
              <input
                type="radio"
                name="hasTools"
                checked={hasTools}
                onChange={() => setHasTools(true)}
                className="form-checkbox"
              />
              <span className="ml-2 text-sm text-gray-700">Yes</span>
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                name="hasTools"
                checked={!hasTools}
                onChange={() => {
                  setHasTools(false);
                  onResourcesChange([]);
                }}
                className="form-checkbox"
              />
              <span className="ml-2 text-sm text-gray-700">No</span>
            </label>
          </div>
        </div>

        {hasTools && (
          <div className="space-y-6">
            {Object.entries(RESOURCE_CATEGORIES).map(([categoryKey, category]) => (
              <div key={categoryKey} className="border border-gray-200 rounded-lg p-4">
                <h4 className="text-md font-medium text-gray-900 mb-3">{category.label}</h4>
                <div className="space-y-3">
                  {Object.entries(category.items).map(([subtypeKey, item]) => {
                    const isSelected = isResourceSelected(categoryKey, subtypeKey);
                    const specs = getResourceSpecs(categoryKey, subtypeKey);
                    const quantity = getResourceQuantity(categoryKey, subtypeKey);

                    return (
                      <div key={subtypeKey} className="space-y-2">
                        <div className="flex items-center space-x-3">
                          <label className="flex items-center">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => toggleResource(categoryKey, subtypeKey)}
                              className="form-checkbox"
                            />
                            <span className="ml-2 text-sm font-medium text-gray-700">{item.label}</span>
                          </label>
                          
                          {isSelected && item.specs.length === 0 && (
                            <input
                              type="number"
                              min="1"
                              value={quantity}
                              onChange={(e) => updateResourceQuantity(categoryKey, subtypeKey, parseInt(e.target.value) || 1)}
                              className="w-16 px-2 py-1 text-sm border border-gray-300 rounded"
                              placeholder="Qty"
                            />
                          )}
                        </div>

                        {isSelected && item.specs.length > 0 && (
                          <div className="ml-6 space-y-2 bg-white p-3 rounded border">
                            <div className="flex items-center space-x-2">
                              <label className="text-xs text-gray-600 w-12">Qty:</label>
                              <input
                                type="number"
                                min="1"
                                value={quantity}
                                onChange={(e) => updateResourceQuantity(categoryKey, subtypeKey, parseInt(e.target.value) || 1)}
                                className="w-16 px-2 py-1 text-sm border border-gray-300 rounded"
                              />
                            </div>
                            
                            {item.specs.map(specKey => (
                              <div key={specKey} className="flex items-center space-x-2">
                                <label className="text-xs text-gray-600 w-20">
                                  {specKey === 'kw' ? 'kW:' : 
                                   specKey === 'kwh' ? 'kWh:' :
                                   specKey === 'area_m2' ? 'Area (m²):' :
                                   specKey === 'cargo_m3' ? 'Cargo (m³):' :
                                   specKey === 'build_volume' ? 'Build Vol:' :
                                   specKey === 'call_sign' ? 'Call Sign:' :
                                   specKey === 'fuel' ? 'Fuel:' :
                                   specKey === 'type' ? 'Type:' :
                                   specKey === 'filaments' ? 'Filaments:' :
                                   specKey.charAt(0).toUpperCase() + specKey.slice(1) + ':'}
                                </label>
                                
                                {specKey === 'build_volume' ? (
                                  <select
                                    value={specs[specKey] || ''}
                                    onChange={(e) => updateResourceSpec(categoryKey, subtypeKey, specKey, e.target.value)}
                                    className="px-2 py-1 text-sm border border-gray-300 rounded"
                                  >
                                    <option value="">Select</option>
                                    <option value="small">Small</option>
                                    <option value="medium">Medium</option>
                                    <option value="large">Large</option>
                                  </select>
                                ) : specKey === 'fuel' ? (
                                  <select
                                    value={specs[specKey] || ''}
                                    onChange={(e) => updateResourceSpec(categoryKey, subtypeKey, specKey, e.target.value)}
                                    className="px-2 py-1 text-sm border border-gray-300 rounded"
                                  >
                                    <option value="">Select</option>
                                    <option value="gasoline">Gasoline</option>
                                    <option value="diesel">Diesel</option>
                                  </select>
                                ) : specKey === 'type' ? (
                                  <select
                                    value={specs[specKey] || ''}
                                    onChange={(e) => updateResourceSpec(categoryKey, subtypeKey, specKey, e.target.value)}
                                    className="px-2 py-1 text-sm border border-gray-300 rounded"
                                  >
                                    <option value="">Select</option>
                                    <option value="MIG">MIG</option>
                                    <option value="TIG">TIG</option>
                                  </select>
                                ) : specKey === 'filaments' ? (
                                  <div className="flex flex-wrap gap-1">
                                    {['PLA', 'ABS', 'PETG', 'Nylon'].map(filament => (
                                      <label key={filament} className="flex items-center">
                                        <input
                                          type="checkbox"
                                          checked={specs[specKey]?.includes(filament) || false}
                                          onChange={(e) => {
                                            const current = specs[specKey] || [];
                                            const updated = e.target.checked 
                                              ? [...current, filament]
                                              : current.filter(f => f !== filament);
                                            updateResourceSpec(categoryKey, subtypeKey, specKey, updated);
                                          }}
                                          className="form-checkbox mr-1"
                                        />
                                        <span className="text-xs">{filament}</span>
                                      </label>
                                    ))}
                                  </div>
                                ) : (
                                  <input
                                    type={specKey === 'call_sign' ? 'text' : 'number'}
                                    value={specs[specKey] || ''}
                                    onChange={(e) => updateResourceSpec(categoryKey, subtypeKey, specKey, e.target.value)}
                                    className="px-2 py-1 text-sm border border-gray-300 rounded flex-1"
                                    placeholder={specKey === 'call_sign' ? 'e.g., OH2ABC' : ''}
                                  />
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
