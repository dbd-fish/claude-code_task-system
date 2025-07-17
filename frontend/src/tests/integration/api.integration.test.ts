import axios from 'axios';
import { login, logout, healthCheck, testConnection } from '../../services/api';

// Mock axios for integration tests
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

describe('API Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorageMock.getItem.mockClear();
    localStorageMock.setItem.mockClear();
    localStorageMock.removeItem.mockClear();
  });

  describe('Authentication Flow Integration', () => {
    it('should handle complete login flow', async () => {
      const mockLoginResponse = {
        data: {
          message: 'Login successful',
          user: {
            id: 1,
            username: 'testuser',
            email: 'test@example.com',
            firstName: 'Test',
            lastName: 'User'
          },
          token: 'mock-jwt-token'
        }
      };

      mockedAxios.create.mockReturnValue({
        post: jest.fn().mockResolvedValue(mockLoginResponse),
      } as any);

      const result = await login('testuser', 'password123');

      expect(result).toEqual(mockLoginResponse.data);
      expect(localStorageMock.setItem).toHaveBeenCalledWith('authToken', 'mock-jwt-token');
    });

    it('should handle login failure', async () => {
      const mockError = {
        response: {
          status: 401,
          data: {
            error: 'Invalid credentials'
          }
        }
      };

      mockedAxios.create.mockReturnValue({
        post: jest.fn().mockRejectedValue(mockError),
      } as any);

      await expect(login('testuser', 'wrongpassword')).rejects.toEqual(mockError);
      expect(localStorageMock.setItem).not.toHaveBeenCalled();
    });

    it('should handle logout flow', async () => {
      const mockLogoutResponse = {
        data: {
          message: 'Logged out successfully'
        }
      };

      mockedAxios.create.mockReturnValue({
        post: jest.fn().mockResolvedValue(mockLogoutResponse),
      } as any);

      await logout();

      expect(localStorageMock.removeItem).toHaveBeenCalledWith('authToken');
    });

    it('should handle logout with API error', async () => {
      const mockError = new Error('Network error');

      mockedAxios.create.mockReturnValue({
        post: jest.fn().mockRejectedValue(mockError),
      } as any);

      await logout();

      // Should still remove token even if API call fails
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('authToken');
    });
  });

  describe('API Client Configuration Integration', () => {
    it('should configure request interceptor with auth token', () => {
      const mockToken = 'test-auth-token';
      localStorageMock.getItem.mockReturnValue(mockToken);

      const mockInterceptor = jest.fn();
      const mockApiClient = {
        interceptors: {
          request: {
            use: mockInterceptor
          },
          response: {
            use: jest.fn()
          }
        }
      };

      mockedAxios.create.mockReturnValue(mockApiClient as any);

      // Import the module to trigger interceptor setup
      require('../../services/api');

      expect(mockInterceptor).toHaveBeenCalled();
      
      // Test the interceptor function
      const interceptorFunction = mockInterceptor.mock.calls[0][0];
      const mockConfig = { headers: {} };
      const modifiedConfig = interceptorFunction(mockConfig);

      expect(modifiedConfig.headers.Authorization).toBe(`Bearer ${mockToken}`);
    });

    it('should handle response interceptor for 401 errors', () => {
      const mockResponseInterceptor = jest.fn();
      const mockApiClient = {
        interceptors: {
          request: {
            use: jest.fn()
          },
          response: {
            use: mockResponseInterceptor
          }
        }
      };

      mockedAxios.create.mockReturnValue(mockApiClient as any);

      // Import the module to trigger interceptor setup
      require('../../services/api');

      expect(mockResponseInterceptor).toHaveBeenCalled();

      // Test the error interceptor function
      const errorInterceptor = mockResponseInterceptor.mock.calls[0][1];
      const mockError = {
        response: {
          status: 401
        }
      };

      expect(() => errorInterceptor(mockError)).toThrow();
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('authToken');
    });
  });

  describe('Health Check Integration', () => {
    it('should perform health check successfully', async () => {
      const mockHealthResponse = {
        data: {
          status: 'OK',
          timestamp: new Date().toISOString()
        }
      };

      mockedAxios.create.mockReturnValue({
        get: jest.fn().mockResolvedValue(mockHealthResponse),
      } as any);

      const result = await healthCheck();

      expect(result).toEqual(mockHealthResponse.data);
    });

    it('should handle health check failure', async () => {
      const mockError = new Error('Service unavailable');

      mockedAxios.create.mockReturnValue({
        get: jest.fn().mockRejectedValue(mockError),
      } as any);

      await expect(healthCheck()).rejects.toThrow('Service unavailable');
    });
  });

  describe('Connection Test Integration', () => {
    it('should test connection successfully', async () => {
      const mockConnectionResponse = {
        data: {
          message: 'Connection successful',
          database: 'connected',
          server: 'running'
        }
      };

      mockedAxios.create.mockReturnValue({
        get: jest.fn().mockResolvedValue(mockConnectionResponse),
      } as any);

      const result = await testConnection();

      expect(result).toEqual(mockConnectionResponse.data);
    });

    it('should handle connection test failure', async () => {
      const mockError = {
        response: {
          status: 500,
          data: {
            error: 'Database connection failed'
          }
        }
      };

      mockedAxios.create.mockReturnValue({
        get: jest.fn().mockRejectedValue(mockError),
      } as any);

      await expect(testConnection()).rejects.toEqual(mockError);
    });
  });

  describe('Error Handling Integration', () => {
    it('should handle network errors consistently', async () => {
      const networkError = {
        request: {},
        message: 'Network Error'
      };

      mockedAxios.create.mockReturnValue({
        post: jest.fn().mockRejectedValue(networkError),
      } as any);

      await expect(login('testuser', 'password123')).rejects.toEqual(networkError);
    });

    it('should handle server errors consistently', async () => {
      const serverError = {
        response: {
          status: 500,
          data: {
            error: 'Internal Server Error'
          }
        }
      };

      mockedAxios.create.mockReturnValue({
        post: jest.fn().mockRejectedValue(serverError),
      } as any);

      await expect(login('testuser', 'password123')).rejects.toEqual(serverError);
    });

    it('should handle validation errors consistently', async () => {
      const validationError = {
        response: {
          status: 400,
          data: {
            error: 'Username and password are required'
          }
        }
      };

      mockedAxios.create.mockReturnValue({
        post: jest.fn().mockRejectedValue(validationError),
      } as any);

      await expect(login('', '')).rejects.toEqual(validationError);
    });
  });

  describe('API Base URL Configuration', () => {
    it('should use correct base URL for development', () => {
      const originalEnv = process.env.NODE_ENV;
      (process.env as any).NODE_ENV = 'development';

      mockedAxios.create.mockClear();
      
      // Re-import to trigger new configuration
      jest.resetModules();
      require('../../services/api');

      expect(mockedAxios.create).toHaveBeenCalledWith({
        baseURL: 'http://localhost:5000',
        timeout: 10000,
        headers: {
          'Content-Type': 'application/json',
        },
      });

      (process.env as any).NODE_ENV = originalEnv;
    });

    it('should use correct timeout configuration', () => {
      mockedAxios.create.mockClear();
      
      // Re-import to trigger new configuration
      jest.resetModules();
      require('../../services/api');

      const createCall = mockedAxios.create.mock.calls[0]?.[0];
      expect(createCall?.timeout).toBe(10000);
    });
  });

  describe('Content Type Handling', () => {
    it('should send correct content type headers', () => {
      mockedAxios.create.mockClear();
      
      // Re-import to trigger new configuration
      jest.resetModules();
      require('../../services/api');

      const createCall = mockedAxios.create.mock.calls[0]?.[0];
      expect((createCall?.headers as any)?.['Content-Type']).toBe('application/json');
    });
  });
});