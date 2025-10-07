// API client for Kokonaisturvallisuus MVP
import axios, { AxiosResponse } from 'axios';
import {
  CivilianMeResponse,
  CivilianSubmitRequest,
  SearchResponse,
  DetailResponse,
  RequestCreateRequest,
  AllocateRequest,
  HeatmapResponse,
  SummaryStats,
  OfflineQueueItem,
  SkillOption
} from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth headers
api.interceptors.request.use((config) => {
  const authState = getAuthHeaders();
  if (authState.user && authState.role) {
    config.headers['X-Demo-User'] = authState.user;
    config.headers['X-Role'] = authState.role;
  }
  return config;
});

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.code === 'NETWORK_ERROR' || !navigator.onLine) {
      // Handle offline case
      console.warn('Network error, request will be queued for retry');
    }
    return Promise.reject(error);
  }
);

// Auth state management (simple localStorage-based)
export function setAuthHeaders(user: string, role: 'civilian' | 'authority') {
  localStorage.setItem('auth_user', user);
  localStorage.setItem('auth_role', role);
}

export function getAuthHeaders(): { user?: string; role?: string } {
  return {
    user: localStorage.getItem('auth_user') || undefined,
    role: localStorage.getItem('auth_role') || undefined,
  };
}

export function clearAuthHeaders() {
  localStorage.removeItem('auth_user');
  localStorage.removeItem('auth_role');
}

// Civilian API
export const civilianApi = {
  getMe: (): Promise<AxiosResponse<CivilianMeResponse>> =>
    api.get('/civilian/me'),

  submitProfile: (data: CivilianSubmitRequest): Promise<AxiosResponse<any>> =>
    api.post('/civilian/submit', data),

  getTags: (): Promise<AxiosResponse<{ tags: string[]; education_levels: string[] }>> =>
    api.get('/civilian/tags'),
};

// Search API
export const searchApi = {
  search: (params: {
    bbox?: string;
    tags?: string;
    min_score?: number;
    availability?: string;
    page?: number;
    limit?: number;
  }): Promise<AxiosResponse<SearchResponse>> =>
    api.get('/search/', { params }),

  getDetail: (
    userId: number, 
    searchContext?: {
      skills?: string[];
      include_tags?: string[];
      search_query?: string;
    }
  ): Promise<AxiosResponse<DetailResponse>> => {
    const params: any = {};
    if (searchContext?.skills) {
      // FastAPI expects array parameters to be passed multiple times
      params.skills = searchContext.skills;
    }
    if (searchContext?.include_tags) {
      params.include_tags = searchContext.include_tags;
    }
    if (searchContext?.search_query) {
      params.search_query = searchContext.search_query;
    }
    
    return api.get(`/search/detail/${userId}`, { 
      params,
      paramsSerializer: {
        indexes: null // This allows arrays to be serialized as multiple params
      }
    });
  },
};

// Allocation API
export const allocationApi = {
  createRequest: (data: RequestCreateRequest): Promise<AxiosResponse<any>> =>
    api.post('/allocate/requests', data),

  allocate: (data: AllocateRequest): Promise<AxiosResponse<any>> =>
    api.post('/allocate/allocate', data),

  listRequests: (): Promise<AxiosResponse<any[]>> =>
    api.get('/allocate/requests'),

  listAllocations: (): Promise<AxiosResponse<any[]>> =>
    api.get('/allocate/allocations'),
};

// Stats API
export const statsApi = {
  getHeatmap: (params: {
    bbox?: string;
    tags?: string;
    min_score?: number;
    availability?: string;
  }): Promise<AxiosResponse<HeatmapResponse>> =>
    api.get('/stats/heatmap', { params }),

  getSummary: (): Promise<AxiosResponse<SummaryStats>> =>
    api.get('/stats/summary'),
};

// Admin API
export const adminApi = {
  exportJson: (): Promise<AxiosResponse<any>> =>
    api.get('/admin/export.json'),

  exportCsv: (): Promise<AxiosResponse<Blob>> =>
    api.get('/admin/export.csv', { responseType: 'blob' }),

  seedData: (): Promise<AxiosResponse<any>> =>
    api.post('/admin/seed'),

  clearData: (): Promise<AxiosResponse<any>> =>
    api.delete('/admin/clear'),
};

// Health check
export const healthApi = {
  check: (): Promise<AxiosResponse<{ status: string }>> =>
    api.get('/healthz'),
};

// Utility function to download CSV
export function downloadCsv(blob: Blob, filename: string = 'kokonaisturvallisuus_export.csv') {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
}

// Offline queue management
export class OfflineQueue {
  private static readonly QUEUE_KEY = 'offline_queue';

  static add(item: Omit<OfflineQueueItem, 'id' | 'timestamp' | 'retries'>): void {
    const queue = this.getQueue();
    const newItem: OfflineQueueItem = {
      id: Math.random().toString(36).substr(2, 9),
      timestamp: Date.now(),
      retries: 0,
      ...item,
    };
    queue.push(newItem);
    this.saveQueue(queue);
  }

  static getQueue(): OfflineQueueItem[] {
    try {
      const stored = localStorage.getItem(this.QUEUE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }

  static saveQueue(queue: OfflineQueueItem[]): void {
    localStorage.setItem(this.QUEUE_KEY, JSON.stringify(queue));
  }

  static remove(id: string): void {
    const queue = this.getQueue();
    const filtered = queue.filter(item => item.id !== id);
    this.saveQueue(filtered);
  }

  static clear(): void {
    localStorage.removeItem(this.QUEUE_KEY);
  }

  static getPendingCount(): number {
    return this.getQueue().length;
  }

  // Process queued items when back online
  static async processQueue(): Promise<void> {
    const queue = this.getQueue();
    const processedIds: string[] = [];

    for (const item of queue) {
      try {
        let response;
        
        switch (item.type) {
          case 'submit':
            response = await civilianApi.submitProfile(item.data);
            break;
          case 'request':
            response = await allocationApi.createRequest(item.data);
            break;
          case 'allocate':
            response = await allocationApi.allocate(item.data);
            break;
          default:
            console.warn('Unknown queue item type:', item.type);
            continue;
        }

        if (response.status >= 200 && response.status < 300) {
          processedIds.push(item.id);
        } else {
          // Increment retry count
          item.retries++;
          if (item.retries >= 3) {
            console.error('Max retries reached for item:', item.id);
            processedIds.push(item.id); // Remove from queue after max retries
          }
        }
      } catch (error) {
        console.error('Failed to process queued item:', item.id, error);
        item.retries++;
        if (item.retries >= 3) {
          processedIds.push(item.id);
        }
      }
    }

    // Remove processed items
    if (processedIds.length > 0) {
      const filtered = queue.filter(item => !processedIds.includes(item.id));
      this.saveQueue(filtered);
    }
  }
}

// Listen for online/offline events
window.addEventListener('online', () => {
  console.log('Back online, processing queued requests...');
  OfflineQueue.processQueue();
});

window.addEventListener('offline', () => {
  console.log('Gone offline, requests will be queued');
});

// Skills API
export const skillsApi = {
  async suggestSkills(query: string, limit: number = 10): Promise<{ results: SkillOption[] }> {
    const response = await api.get(`/skills/suggest`, {
      params: { q: query, limit }
    });
    return response.data;
  },

  async createSkill(name: string): Promise<SkillOption> {
    const response = await api.post('/skills/', { name });
    return response.data;
  }
};

// Equipment API
export const equipmentApi = {
  async suggestEquipment(query: string, limit: number = 10): Promise<string[]> {
    const response = await api.get(`/search/equipment/suggest`, {
      params: { q: query }
    });
    return response.data;
  }
};

// Geocoding API
export const geocodeApi = {
  async searchPlaces(query: string, limit: number = 5): Promise<GeocodeResult[]> {
    const response = await api.get(`/geocode/geocode`, {
      params: { q: query, limit }
    });
    return response.data;
  },

  async reverseGeocode(lat: number, lon: number): Promise<GeocodeResult> {
    const response = await api.get(`/geocode/geocode/reverse`, {
      params: { lat, lon }
    });
    return response.data;
  }
};

// Advanced Search API
export const advancedSearchApi = {
  async search(request: AdvancedSearchRequest): Promise<AdvancedSearchResponse> {
    const response = await api.post('/search/advanced', request);
    return response.data;
  }
};

export default api;