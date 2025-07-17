import { handleApiError, showErrorMessage, ApiError } from './errorHandler';

// Mock alert function
global.alert = jest.fn();

describe('Error Handler', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (global.alert as jest.Mock).mockClear();
  });

  describe('handleApiError', () => {
    it('should handle response errors', () => {
      const mockError = {
        response: {
          status: 400,
          data: {
            error: 'Validation failed',
            code: 'VALIDATION_ERROR'
          }
        }
      };

      const result = handleApiError(mockError);

      expect(result).toEqual({
        message: 'Validation failed',
        status: 400,
        code: 'VALIDATION_ERROR'
      });
    });

    it('should handle response errors with message field', () => {
      const mockError = {
        response: {
          status: 500,
          data: {
            message: 'Internal server error'
          }
        }
      };

      const result = handleApiError(mockError);

      expect(result).toEqual({
        message: 'Internal server error',
        status: 500,
        code: undefined
      });
    });

    it('should handle response errors with no error data', () => {
      const mockError = {
        response: {
          status: 404,
          data: {}
        }
      };

      const result = handleApiError(mockError);

      expect(result).toEqual({
        message: 'An error occurred',
        status: 404,
        code: undefined
      });
    });

    it('should handle network errors', () => {
      const mockError = {
        request: {}
      };

      const result = handleApiError(mockError);

      expect(result).toEqual({
        message: 'Network error: Unable to connect to server',
        status: 0,
        code: 'NETWORK_ERROR'
      });
    });

    it('should handle unknown errors', () => {
      const mockError = {
        message: 'Something went wrong'
      };

      const result = handleApiError(mockError);

      expect(result).toEqual({
        message: 'Something went wrong',
        code: 'UNKNOWN_ERROR'
      });
    });

    it('should handle errors with no message', () => {
      const mockError = {};

      const result = handleApiError(mockError);

      expect(result).toEqual({
        message: 'An unexpected error occurred',
        code: 'UNKNOWN_ERROR'
      });
    });
  });

  describe('showErrorMessage', () => {
    const originalEnv = process.env.NODE_ENV;

    afterEach(() => {
      (process.env as any).NODE_ENV = originalEnv;
    });

    it('should show detailed error message in development', () => {
      (process.env as any).NODE_ENV = 'development';

      const error: ApiError = {
        message: 'Test error',
        status: 400,
        code: 'TEST_ERROR'
      };

      showErrorMessage(error);

      expect(global.alert).toHaveBeenCalledWith(
        'Error: Test error\nStatus: 400\nCode: TEST_ERROR'
      );
    });

    it('should show simple error message in production', () => {
      (process.env as any).NODE_ENV = 'production';

      const error: ApiError = {
        message: 'Test error',
        status: 400,
        code: 'TEST_ERROR'
      };

      showErrorMessage(error);

      expect(global.alert).toHaveBeenCalledWith('Test error');
    });

    it('should handle missing status and code in development', () => {
      (process.env as any).NODE_ENV = 'development';

      const error: ApiError = {
        message: 'Test error'
      };

      showErrorMessage(error);

      expect(global.alert).toHaveBeenCalledWith(
        'Error: Test error\nStatus: Unknown\nCode: Unknown'
      );
    });

    it('should log error to console', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      const error: ApiError = {
        message: 'Test error',
        status: 400,
        code: 'TEST_ERROR'
      };

      showErrorMessage(error);

      expect(consoleSpy).toHaveBeenCalledWith('API Error:', error);
      
      consoleSpy.mockRestore();
    });
  });
});