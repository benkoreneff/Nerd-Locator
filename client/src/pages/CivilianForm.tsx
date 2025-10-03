import React, { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { civilianApi, OfflineQueue } from '../lib/api';
import { CivilianMeResponse, CivilianSubmitRequest, EDUCATION_LEVELS, AVAILABILITY_OPTIONS } from '../types';

export default function CivilianForm() {
  const [profile, setProfile] = useState<CivilianMeResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [educationLevel, setEducationLevel] = useState('');
  const [skills, setSkills] = useState<string[]>([]);
  const [skillInput, setSkillInput] = useState('');
  const [freeText, setFreeText] = useState('');
  const [availability, setAvailability] = useState('immediate');
  const [consent, setConsent] = useState(false);

  // Load existing profile
  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const response = await civilianApi.getMe();
      setProfile(response.data);
      
      // Pre-fill form if profile exists
      if (response.data.profile) {
        setEducationLevel(response.data.profile.education_level);
        setSkills(response.data.profile.skills);
        setFreeText(response.data.profile.free_text || '');
        setAvailability(response.data.profile.availability);
      }
    } catch (err) {
      console.error('Failed to load profile:', err);
      setError('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleSkillAdd = () => {
    if (skillInput.trim() && !skills.includes(skillInput.trim())) {
      setSkills([...skills, skillInput.trim()]);
      setSkillInput('');
    }
  };

  const handleSkillRemove = (skillToRemove: string) => {
    setSkills(skills.filter(skill => skill !== skillToRemove));
  };

  const handleSubmit = async () => {
    if (!consent) {
      setError('You must give consent to submit your profile');
      return;
    }

    if (!educationLevel || skills.length === 0 || !availability) {
      setError('Please fill in all required fields');
      return;
    }

    setSubmitting(true);
    setError(null);
    setSubmitSuccess(false);

    const submissionData: CivilianSubmitRequest = {
      submission_id: uuidv4(),
      education_level: educationLevel,
      skills,
      free_text: freeText || undefined,
      availability,
      consent: true,
    };

    try {
      await civilianApi.submitProfile(submissionData);
      setSubmitSuccess(true);
      await loadProfile(); // Reload to get updated data
    } catch (err: any) {
      console.error('Failed to submit profile:', err);
      
      // Check if it's a network error
      if (!navigator.onLine || err.code === 'NETWORK_ERROR') {
        // Queue for offline retry
        OfflineQueue.add({
          type: 'submit',
          data: submissionData,
        });
        setError('You are offline. Your submission has been queued and will be sent when you are back online.');
      } else {
        setError(err.response?.data?.detail || 'Failed to submit profile');
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-96">
        <div className="spinner"></div>
        <span className="ml-2">Loading profile...</span>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="card">
        <div className="card-header">
          <h2 className="text-xl font-semibold text-gray-900">
            Civilian Profile
          </h2>
          <p className="mt-1 text-sm text-gray-600">
            Submit your capabilities and availability for emergency coordination
          </p>
        </div>

        <div className="card-body space-y-6">
          {/* User Information (Read-only) */}
          {profile?.user && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-lg font-medium text-gray-900 mb-3">Your Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Full Name</label>
                  <p className="mt-1 text-sm text-gray-900">{profile.user.full_name}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Address</label>
                  <p className="mt-1 text-sm text-gray-900">{profile.user.address}</p>
                </div>
              </div>
            </div>
          )}

          {/* Education Level */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Education Level <span className="text-red-500">*</span>
            </label>
            <select
              value={educationLevel}
              onChange={(e) => setEducationLevel(e.target.value)}
              className="form-select"
            >
              <option value="">Select education level</option>
              {EDUCATION_LEVELS.map(level => (
                <option key={level} value={level}>
                  {level.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </option>
              ))}
            </select>
          </div>

          {/* Skills */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Skills <span className="text-red-500">*</span>
            </label>
            <div className="flex space-x-2 mb-2">
              <input
                type="text"
                value={skillInput}
                onChange={(e) => setSkillInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleSkillAdd())}
                placeholder="Add a skill..."
                className="form-input flex-1"
              />
              <button
                type="button"
                onClick={handleSkillAdd}
                className="btn btn-secondary"
              >
                Add
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {skills.map(skill => (
                <span
                  key={skill}
                  className="badge badge-primary flex items-center"
                >
                  {skill}
                  <button
                    onClick={() => handleSkillRemove(skill)}
                    className="ml-1 text-primary-600 hover:text-primary-800"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Free Text */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Additional Information
            </label>
            <textarea
              value={freeText}
              onChange={(e) => setFreeText(e.target.value)}
              placeholder="Describe your experience, certifications, or any other relevant information..."
              rows={4}
              className="form-input"
            />
          </div>

          {/* Availability */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Availability <span className="text-red-500">*</span>
            </label>
            <div className="space-y-2">
              {AVAILABILITY_OPTIONS.map(option => (
                <label key={option.value} className="flex items-center">
                  <input
                    type="radio"
                    name="availability"
                    value={option.value}
                    checked={availability === option.value}
                    onChange={(e) => setAvailability(e.target.value)}
                    className="form-checkbox"
                  />
                  <span className="ml-2 text-sm text-gray-700">{option.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Consent */}
          <div>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={consent}
                onChange={(e) => setConsent(e.target.checked)}
                className="form-checkbox"
              />
              <span className="ml-2 text-sm text-gray-700">
                I consent to the processing of my personal data for emergency coordination purposes <span className="text-red-500">*</span>
              </span>
            </label>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-4">
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

          {/* Success Message */}
          {submitSuccess && (
            <div className="bg-green-50 border border-green-200 rounded-md p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-green-800">Profile submitted successfully!</p>
                </div>
              </div>
            </div>
          )}

          {/* Existing Profile Display */}
          {profile?.profile && (
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="text-lg font-medium text-gray-900 mb-3">Current Profile</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Capability Score</label>
                  <p className="mt-1 text-sm text-gray-900">{profile.profile.capability_score}/100</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Status</label>
                  <span className={`mt-1 badge ${
                    profile.profile.status === 'available' ? 'badge-success' :
                    profile.profile.status === 'allocated' ? 'badge-warning' :
                    'badge-danger'
                  }`}>
                    {profile.profile.status}
                  </span>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Tags</label>
                  <div className="mt-1 flex flex-wrap gap-1">
                    {(profile.profile.tags_json || []).map(tag => (
                      <span key={tag} className="badge badge-primary text-xs">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Last Updated</label>
                  <p className="mt-1 text-sm text-gray-900">
                    {new Date(profile.profile.last_updated).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="card-footer">
          <button
            onClick={handleSubmit}
            disabled={submitting || !consent}
            className="btn btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? (
              <>
                <div className="spinner mr-2"></div>
                Submitting...
              </>
            ) : (
              profile?.profile ? 'Update Profile' : 'Submit Profile'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
