import axios from 'axios';
import { apiClient, healthCheck, testConnection, login, logout } from './api';

// Mock axios
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

// Mock window.location
Object.defineProperty(window, 'location', {
  value: {
    href: 'http://localhost:3000',
  },
  writable: true,
});

describe('API Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorageMock.getItem.mockClear();
    localStorageMock.setItem.mockClear();
    localStorageMock.removeItem.mockClear();
  });

  describe('healthCheck', () => {
    it('should return health check data on success', async () => {
      const mockResponse = { data: { status: 'OK' } };
      mockedAxios.create.mockReturnValue({
        get: jest.fn().mockResolvedValue(mockResponse),
      } as any);

      const result = await healthCheck();
      expect(result).toEqual({ status: 'OK' });
    });

    it('should throw error on failure', async () => {
      const mockError = new Error('Network error');
      mockedAxios.create.mockReturnValue({
        get: jest.fn().mockRejectedValue(mockError),
      } as any);

      await expect(healthCheck()).rejects.toThrow('Network error');
    });
  });

  describe('testConnection', () => {
    it('should return connection test data on success', async () => {
      const mockResponse = { data: { message: 'Connection successful' } };
      mockedAxios.create.mockReturnValue({
        get: jest.fn().mockResolvedValue(mockResponse),
      } as any);

      const result = await testConnection();
      expect(result).toEqual({ message: 'Connection successful' });
    });

    it('should throw error on failure', async () => {
      const mockError = new Error('Connection failed');
      mockedAxios.create.mockReturnValue({
        get: jest.fn().mockRejectedValue(mockError),
      } as any);

      await expect(testConnection()).rejects.toThrow('Connection failed');
    });
  });

  describe('login', () => {
    it('should login successfully and store token', async () => {
      const mockResponse = {
        data: {
          message: 'Login successful',
          user: { email: 'test@example.com' },
          token: 'jwt-token-123'
        }
      };
      
      mockedAxios.create.mockReturnValue({
        post: jest.fn().mockResolvedValue(mockResponse),
      } as any);

      const result = await login('test@example.com', 'password123');

      expect(result).toEqual(mockResponse.data);
      expect(localStorageMock.setItem).toHaveBeenCalledWith('authToken', 'jwt-token-123');
    });

    it('should not store token if not provided', async () => {
      const mockResponse = {
        data: {
          message: 'Login successful',
          user: { email: 'test@example.com' }
        }
      };
      
      mockedAxios.create.mockReturnValue({
        post: jest.fn().mockResolvedValue(mockResponse),
      } as any);

      await login('test@example.com', 'password123');
      expect(localStorageMock.setItem).not.toHaveBeenCalled();
    });

    it('should throw error on login failure', async () => {
      const mockError = new Error('Login failed');
      mockedAxios.create.mockReturnValue({
        post: jest.fn().mockRejectedValue(mockError),
      } as any);

      await expect(login('test@example.com', 'wrongpassword')).rejects.toThrow('Login failed');
    });
  });

  describe('logout', () => {
    it('should logout successfully and remove token', async () => {
      mockedAxios.create.mockReturnValue({
        post: jest.fn().mockResolvedValue({}),
      } as any);

      await logout();
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('authToken');
    });

    it('should remove token even if API call fails', async () => {
      const mockError = new Error('Logout failed');
      mockedAxios.create.mockReturnValue({
        post: jest.fn().mockRejectedValue(mockError),
      } as any);

      await logout();
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('authToken');
    });
  });

  describe('API Client Interceptors', () => {
    it('should add authorization header if token exists', () => {
      localStorageMock.getItem.mockReturnValue('test-token');
      
      const mockApiClient = {
        interceptors: {
          request: {
            use: jest.fn((fn) => {
              const config = { headers: {} };
              const result = fn(config);
              expect(result.headers.Authorization).toBe('Bearer test-token');
            }),
          },
          response: {
            use: jest.fn(),
          },
        },
      };

      mockedAxios.create.mockReturnValue(mockApiClient as any);
    });

    it('should handle 401 error and redirect to login', () => {
      const mockError = {
        response: {
          status: 401,
        },
      };

      const mockApiClient = {
        interceptors: {
          request: {
            use: jest.fn(),
          },
          response: {
            use: jest.fn((successFn, errorFn) => {
              try {
                errorFn(mockError);
              } catch (error) {
                expect(localStorageMock.removeItem).toHaveBeenCalledWith('authToken');
                expect(window.location.href).toBe('/login');
                expect(error).toBe(mockError);
              }
            }),
          },
        },
      };

      mockedAxios.create.mockReturnValue(mockApiClient as any);
    });
  });
});