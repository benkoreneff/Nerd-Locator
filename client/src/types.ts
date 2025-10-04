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
  industry?: string;
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

export interface ResourceSpec {
  category: string;
  subtype: string;
  quantity?: number;
  specs?: Record<string, any>;
}

export interface CivilianSubmitRequest {
  submission_id: string;
  education_level: string;
  industry?: string;
  skills: string[];
  free_text?: string;
  resources?: ResourceSpec[];
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

export const INDUSTRY_OPTIONS = [
  'Healthcare & Medical',
  'Construction & Trades',
  'Electrical & Power',
  'Logistics & Transport',
  'IT & Cybersecurity',
  'Communications & Radio',
  'Manufacturing & Fabrication',
  'Public Safety & Rescue',
  'Agriculture & Rural Operations',
  'Education & Community Support'
] as const;

// Mapping from display names to backend keys
export const INDUSTRY_MAPPING: Record<string, string> = {
  'Healthcare & Medical': 'healthcare_medical',
  'Construction & Trades': 'construction_trades',
  'Electrical & Power': 'electrical_power',
  'Logistics & Transport': 'logistics_transport',
  'IT & Cybersecurity': 'it_cybersecurity',
  'Communications & Radio': 'communications_radio',
  'Manufacturing & Fabrication': 'manufacturing_fabrication',
  'Public Safety & Rescue': 'public_safety_rescue',
  'Agriculture & Rural Operations': 'agriculture_rural',
  'Education & Community Support': 'education_community'
};


export const AVAILABLE_TAGS = [
  'medical',
  'technical', 
  'logistics',
  'communication',
  'leadership',
  'general'
] as const;

// Resource categories and items for Tools & Assets
export const RESOURCE_CATEGORIES = {
  fabrication: {
    label: 'Fabrication',
    items: {
      '3d_printer': { label: '3D Printer', specs: ['quantity', 'build_volume', 'filaments'] },
      'cnc': { label: 'CNC Router / Mill', specs: [] },
      'laser': { label: 'Laser Cutter / Engraver', specs: [] }
    }
  },
  power: {
    label: 'Electronics & Power',
    items: {
      'generator': { label: 'Generator', specs: ['kw', 'fuel'] },
      'battery_bank': { label: 'Battery Bank / Inverter', specs: ['kwh'] },
      'solar': { label: 'Solar Panels', specs: ['kw'] }
    }
  },
  workshop: {
    label: 'Workshop & Space',
    items: {
      'garage': { label: 'Private Garage / Workshop', specs: ['area_m2'] },
      'warehouse': { label: 'Warehouse / Rentable Space', specs: [] }
    }
  },
  transport: {
    label: 'Vehicles & Transport',
    items: {
      'van_truck': { label: 'Van / Truck', specs: ['cargo_m3'] },
      'trailer': { label: 'Trailer', specs: [] },
      'offroad': { label: 'Off-road Vehicle', specs: [] }
    }
  },
  drone: {
    label: 'Drones & RC',
    items: {
      'fpv': { label: 'FPV Drone Pilot', specs: [] },
      'longrange': { label: 'Long-range UAV Experience', specs: [] },
      'rc_air': { label: 'RC Aircraft / Heli', specs: [] }
    }
  },
  heavy: {
    label: 'Tools & Heavy Equipment',
    items: {
      'forklift': { label: 'Forklift / Pallet Jack', specs: [] },
      'welder': { label: 'Welding Rig', specs: ['type'] },
      'tools': { label: 'General Power Tools', specs: [] }
    }
  },
  comms: {
    label: 'Communications',
    items: {
      'ham_license': { label: 'Amateur Radio License', specs: ['call_sign'] },
      'vhf_uhf': { label: 'VHF/UHF Radio Kit', specs: [] }
    }
  }
} as const;
