// Type definitions for Civitas

export interface User {
  id: number;
  full_name?: string;
  dob?: string;
  address?: string;
  lat?: number;
  lon?: number;
  created_at: string;
}

export interface Profile {
  id: number;
  education_level: string;
  skills: string[];
  free_text?: string;
  availability: string;
  capability_score: number;
  tags_json?: string[];
  last_updated: string;
  status: string;
}

export interface CivilianMeResponse {
  user: User;
  profile?: Profile;
}

export interface SearchResult {
  user_id: number;
  education_level: string;
  skills: string[];
  availability: string;
  capability_score: number;
  tags: string[];
  lat: number;
  lon: number;
  status: string;
}

export interface SearchResponse {
  results: SearchResult[];
  total: number;
  page: number;
  limit: number;
}

export interface DetailResponse {
  user: User;
  profile: Profile;
  pii_revealed: boolean;
}

export interface CivilianSubmitRequest {
  submission_id: string;
  education_level: string;
  skills: string[];
  free_text?: string;
  availability: string;
  consent: boolean;
}

export interface RequestCreateRequest {
  type: 'info' | 'allocate';
  user_id: number;
  message?: string;
}

export interface AllocateRequest {
  user_id: number;
  resource_id?: number;
  mission_code: string;
}

export interface HeatmapPoint {
  lat: number;
  lon: number;
  weight: number;
}

export interface HeatmapResponse {
  points: HeatmapPoint[];
  bounds?: number[];
}

export interface SummaryStats {
  total_civilians: number;
  availability_breakdown: Record<string, number>;
  status_breakdown: Record<string, number>;
  average_capability_score: number;
  education_breakdown: Record<string, number>;
}

export interface OfflineQueueItem {
  id: string;
  type: 'submit' | 'request' | 'allocate';
  data: any;
  timestamp: number;
  retries: number;
}

export interface AuthState {
  user?: string;
  role?: 'civilian' | 'authority';
  isAuthenticated: boolean;
}

export const EDUCATION_LEVELS = [
  'No education',
  'Primary education',
  'Lower secondary education',
  'Upper secondary education',
  'Vocational qualification',
  "Bachelor's degree",
  "Master's degree",
  'Doctoral degree',
  'Other'
] as const;

export const AVAILABILITY_OPTIONS = [
  { value: 'immediate', label: 'Immediate (0-2 hours)' },
  { value: '24h', label: 'Within 24 hours' },
  { value: '48h', label: 'Within 48 hours' },
  { value: 'unavailable', label: 'Currently unavailable' }
] as const;

export const AVAILABLE_TAGS = [
  'medical',
  'technical', 
  'logistics',
  'communication',
  'leadership',
  'general'
] as const;
