import axios, { AxiosInstance } from 'axios';
import { getSession } from 'next-auth/react';
import { getServerSession } from 'next-auth';
import { authConfig } from '@/lib/auth/auth.config';

export class ApiClient {
  private static instance: ApiClient;
  private client: AxiosInstance;
  private cache: Map<string, { data: any; timestamp: number }>;
  private pendingRequests: Map<string, Promise<any>>;

  private constructor() {
    const baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';
    
    this.client = axios.create({
      baseURL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.cache = new Map();
    this.pendingRequests = new Map();

    // Request interceptor for auth - works on client
    this.client.interceptors.request.use(
      async (config) => {
        try {
          // Try to get session from client first
          let session = null;
          
          // Check if we're in the browser
          if (typeof window !== 'undefined') {
            session = await getSession();
          } else {
            // Server-side - try to get server session
            try {
              session = await getServerSession(authConfig);
            } catch (error) {
              console.log('Server session not available, will use client session');
            }
          }
          
          console.log('API Client - Session:', session);
          console.log('API Client - Access Token:', session?.accessToken);
          
          if (session?.accessToken) {
            config.headers.Authorization = `Bearer ${session.accessToken}`;
          } else {
            console.warn('API Client - No access token found in session');
          }
        } catch (error) {
          console.error('API Client - Error getting session:', error);
        }
        return config;
      },
      (error) => {
        console.error('API Client - Request interceptor error:', error);
        return Promise.reject(error);
      }
    );

    // Response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => {
        console.log(`API Client - Response: ${response.config.url} - Status: ${response.status}`);
        return response;
      },
      (error) => {
        console.error('API Client - Response error:', {
          url: error.config?.url,
          status: error.response?.status,
          data: error.response?.data,
        });
        
        if (error.response?.status === 401) {
          if (typeof window !== 'undefined') {
            console.log('API Client - 401 Unauthorized, redirecting to login');
            window.location.href = '/login';
          }
        }
        return Promise.reject(error);
      }
    );
  }

  public static getInstance(): ApiClient {
    if (!ApiClient.instance) {
      ApiClient.instance = new ApiClient();
    }
    return ApiClient.instance;
  }

  private getCacheKey(url: string, params?: any): string {
    return `${url}${params ? JSON.stringify(params) : ''}`;
  }

  private isCacheValid(timestamp: number, ttl: number = 5 * 60 * 1000): boolean {
    return Date.now() - timestamp < ttl;
  }

  async get<T = any>(
    url: string,
    params?: any,
    options?: {
      cache?: boolean;
      ttl?: number;
      forceRefresh?: boolean;
    }
  ): Promise<T> {
    const cacheKey = this.getCacheKey(url, params);
    const { cache = true, ttl = 5 * 60 * 1000, forceRefresh = false } = options || {};

    if (cache && !forceRefresh) {
      const cached = this.cache.get(cacheKey);
      if (cached && this.isCacheValid(cached.timestamp, ttl)) {
        console.log(`API Client - Cache hit: ${url}`);
        return cached.data;
      }
    }

    if (this.pendingRequests.has(cacheKey)) {
      console.log(`API Client - Pending request: ${url}`);
      return this.pendingRequests.get(cacheKey)!;
    }

    console.log(`API Client - Making request: ${url}`);

    const requestPromise = this.client
      .get<T>(url, { params })
      .then((response) => {
        const data = response.data;
        if (cache) {
          this.cache.set(cacheKey, { data, timestamp: Date.now() });
        }
        this.pendingRequests.delete(cacheKey);
        return data;
      })
      .catch((error) => {
        this.pendingRequests.delete(cacheKey);
        throw error;
      });

    this.pendingRequests.set(cacheKey, requestPromise);
    return requestPromise;
  }

  async post<T = any>(
    url: string,
    data?: any,
    options?: {
      invalidateCache?: boolean;
      cacheKey?: string;
    }
  ): Promise<T> {
    console.log(`API Client - POST: ${url}`, data);

    try {
      const response = await this.client.post<T>(url, data);

      if (options?.invalidateCache) {
        if (options?.cacheKey) {
          this.cache.delete(options.cacheKey);
          console.log(`API Client - Cache invalidated: ${options.cacheKey}`);
        } else {
          this.cache.clear();
          console.log('API Client - All cache cleared');
        }
      }

      return response.data;
    } catch (error) {
      console.error(`API Client - POST error: ${url}`, error);
      throw error;
    }
  }

  async put<T = any>(
    url: string,
    data?: any,
    options?: {
      invalidateCache?: boolean;
      cacheKey?: string;
    }
  ): Promise<T> {
    console.log(`API Client - PUT: ${url}`, data);

    try {
      const response = await this.client.put<T>(url, data);

      if (options?.invalidateCache) {
        if (options?.cacheKey) {
          this.cache.delete(options.cacheKey);
          console.log(`API Client - Cache invalidated: ${options.cacheKey}`);
        } else {
          this.cache.clear();
          console.log('API Client - All cache cleared');
        }
      }

      return response.data;
    } catch (error) {
      console.error(`API Client - PUT error: ${url}`, error);
      throw error;
    }
  }

  async delete<T = any>(
    url: string,
    options?: {
      invalidateCache?: boolean;
      cacheKey?: string;
    }
  ): Promise<T> {
    console.log(`API Client - DELETE: ${url}`);

    try {
      const response = await this.client.delete<T>(url);

      if (options?.invalidateCache) {
        if (options?.cacheKey) {
          this.cache.delete(options.cacheKey);
          console.log(`API Client - Cache invalidated: ${options.cacheKey}`);
        } else {
          this.cache.clear();
          console.log('API Client - All cache cleared');
        }
      }

      return response.data;
    } catch (error) {
      console.error(`API Client - DELETE error: ${url}`, error);
      throw error;
    }
  }

  clearCache(key?: string): void {
    if (key) {
      this.cache.delete(key);
      console.log(`API Client - Cache cleared: ${key}`);
    } else {
      this.cache.clear();
      console.log('API Client - All cache cleared');
    }
  }

  async isAuthenticated(): Promise<boolean> {
    try {
      if (typeof window !== 'undefined') {
        const session = await getSession();
        return !!session?.accessToken;
      }
      return false;
    } catch (error) {
      return false;
    }
  }

  async getAccessToken(): Promise<string | undefined> {
    try {
      if (typeof window !== 'undefined') {
        const session = await getSession();
        return session?.accessToken;
      }
      return undefined;
    } catch (error) {
      return undefined;
    }
  }

  async getUser(): Promise<any> {
    try {
      if (typeof window !== 'undefined') {
        const session = await getSession();
        return session?.user;
      }
      return null;
    } catch (error) {
      return null;
    }
  }
}

export const apiClient = ApiClient.getInstance();