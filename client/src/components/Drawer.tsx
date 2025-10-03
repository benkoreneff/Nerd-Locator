import React, { useState } from 'react';
import { DetailResponse } from '../types';

interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  civilian: DetailResponse | null;
  onRequestInfo: (userId: number, message: string) => void;
  onAllocate: (userId: number, missionCode: string) => void;
}

export default function Drawer({ isOpen, onClose, civilian, onRequestInfo, onAllocate }: DrawerProps) {
  const [requestMessage, setRequestMessage] = useState('');
  const [missionCode, setMissionCode] = useState('');
  const [showRequestForm, setShowRequestForm] = useState(false);
  const [showAllocateForm, setShowAllocateForm] = useState(false);

  if (!isOpen || !civilian) return null;

  const handleRequestSubmit = () => {
    if (requestMessage.trim()) {
      onRequestInfo(civilian.user.id, requestMessage);
      setRequestMessage('');
      setShowRequestForm(false);
    }
  };

  const handleAllocateSubmit = () => {
    if (missionCode.trim()) {
      onAllocate(civilian.user.id, missionCode);
      setMissionCode('');
      setShowAllocateForm(false);
    }
  };

  const resetForms = () => {
    setShowRequestForm(false);
    setShowAllocateForm(false);
    setRequestMessage('');
    setMissionCode('');
  };

  const handleClose = () => {
    resetForms();
    onClose();
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-40"
        onClick={handleClose}
      />

      {/* Drawer */}
      <div className="fixed right-0 top-0 h-full w-full max-w-lg bg-white shadow-xl z-50 transform transition-transform duration-300 ease-in-out">
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">
              Civilian Details
            </h2>
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* Basic Info */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-lg font-medium text-gray-900 mb-3">Basic Information</h3>
              <div className="space-y-2">
                <div>
                  <span className="text-sm font-medium text-gray-700">ID:</span>
                  <span className="ml-2 text-sm text-gray-900">#{civilian.user.id}</span>
                </div>
                
                {civilian.pii_revealed ? (
                  <>
                    <div>
                      <span className="text-sm font-medium text-gray-700">Name:</span>
                      <span className="ml-2 text-sm text-gray-900">{civilian.user.full_name}</span>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-700">Address:</span>
                      <span className="ml-2 text-sm text-gray-900">{civilian.user.address}</span>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-700">Location:</span>
                      <span className="ml-2 text-sm text-gray-900">
                        {civilian.user.lat?.toFixed(4)}, {civilian.user.lon?.toFixed(4)}
                      </span>
                    </div>
                  </>
                ) : (
                  <div className="text-sm text-gray-500 italic">
                    Personal information hidden until allocation
                  </div>
                )}
              </div>
            </div>

            {/* Profile Info */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-lg font-medium text-gray-900 mb-3">Profile Information</h3>
              <div className="space-y-3">
                <div>
                  <span className="text-sm font-medium text-gray-700">Education:</span>
                  <span className="ml-2 text-sm text-gray-900">
                    {civilian.profile.education_level.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </span>
                </div>
                
                <div>
                  <span className="text-sm font-medium text-gray-700">Capability Score:</span>
                  <span className="ml-2 text-sm text-gray-900">
                    {civilian.profile.capability_score}/100
                  </span>
                </div>
                
                <div>
                  <span className="text-sm font-medium text-gray-700">Availability:</span>
                  <span className="ml-2 text-sm text-gray-900">
                    {civilian.profile.availability}
                  </span>
                </div>
                
                <div>
                  <span className="text-sm font-medium text-gray-700">Status:</span>
                  <span className={`ml-2 badge ${
                    civilian.profile.status === 'available' ? 'badge-success' :
                    civilian.profile.status === 'allocated' ? 'badge-warning' :
                    'badge-danger'
                  }`}>
                    {civilian.profile.status}
                  </span>
                </div>
              </div>
            </div>

            {/* Skills */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-3">Skills</h3>
              <div className="flex flex-wrap gap-2">
                {civilian.profile.skills.map(skill => (
                  <span key={skill} className="badge badge-primary">
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            {/* Tags */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-3">Capability Tags</h3>
              <div className="flex flex-wrap gap-2">
                {(civilian.profile.tags_json || []).map(tag => (
                  <span key={tag} className="badge badge-gray">
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Free Text */}
            {civilian.profile.free_text && (
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-3">Additional Information</h3>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-700 whitespace-pre-wrap">
                    {civilian.profile.free_text}
                  </p>
                </div>
              </div>
            )}

            {/* Last Updated */}
            <div className="text-sm text-gray-500">
              Last updated: {new Date(civilian.profile.last_updated).toLocaleString()}
            </div>
          </div>

          {/* Actions */}
          <div className="border-t border-gray-200 p-6">
            {civilian.profile.status === 'available' && (
              <div className="space-y-3">
                {!showRequestForm && !showAllocateForm && (
                  <div className="flex space-x-3">
                    <button
                      onClick={() => setShowRequestForm(true)}
                      className="btn btn-secondary flex-1"
                    >
                      Request Information
                    </button>
                    <button
                      onClick={() => setShowAllocateForm(true)}
                      className="btn btn-primary flex-1"
                    >
                      Allocate
                    </button>
                  </div>
                )}

                {/* Request Form */}
                {showRequestForm && (
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Request Message
                      </label>
                      <textarea
                        value={requestMessage}
                        onChange={(e) => setRequestMessage(e.target.value)}
                        placeholder="Enter your message to the civilian..."
                        rows={3}
                        className="form-input"
                      />
                    </div>
                    <div className="flex space-x-3">
                      <button
                        onClick={handleRequestSubmit}
                        disabled={!requestMessage.trim()}
                        className="btn btn-success flex-1 disabled:opacity-50"
                      >
                        Send Request
                      </button>
                      <button
                        onClick={() => setShowRequestForm(false)}
                        className="btn btn-secondary"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}

                {/* Allocate Form */}
                {showAllocateForm && (
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Mission Code
                      </label>
                      <input
                        type="text"
                        value={missionCode}
                        onChange={(e) => setMissionCode(e.target.value)}
                        placeholder="Enter mission code..."
                        className="form-input"
                      />
                    </div>
                    <div className="flex space-x-3">
                      <button
                        onClick={handleAllocateSubmit}
                        disabled={!missionCode.trim()}
                        className="btn btn-success flex-1 disabled:opacity-50"
                      >
                        Allocate Civilian
                      </button>
                      <button
                        onClick={() => setShowAllocateForm(false)}
                        className="btn btn-secondary"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {civilian.profile.status === 'allocated' && (
              <div className="text-center">
                <div className="text-sm text-gray-600 mb-2">
                  This civilian is already allocated
                </div>
                {civilian.pii_revealed && (
                  <div className="text-xs text-green-600">
                    ✓ Personal information revealed after allocation
                  </div>
                )}
              </div>
            )}

            {civilian.profile.status === 'unavailable' && (
              <div className="text-center text-sm text-gray-600">
                This civilian is currently unavailable
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
