export interface ApiError {
  message: string;
  status?: number;
  code?: string;
}

export const handleApiError = (error: any): ApiError => {
  if (error.response) {
    return {
      message: error.response.data?.error || error.response.data?.message || 'An error occurred',
      status: error.response.status,
      code: error.response.data?.code
    };
  } else if (error.request) {
    return {
      message: 'Network error: Unable to connect to server',
      status: 0,
      code: 'NETWORK_ERROR'
    };
  } else {
    return {
      message: error.message || 'An unexpected error occurred',
      code: 'UNKNOWN_ERROR'
    };
  }
};

export const showErrorMessage = (error: ApiError): void => {
  console.error('API Error:', error);
  
  // 開発環境では詳細なエラー情報を表示
  if (process.env.NODE_ENV === 'development') {
    alert(`Error: ${error.message}\nStatus: ${error.status || 'Unknown'}\nCode: ${error.code || 'Unknown'}`);
  } else {
    // 本番環境では簡潔なエラーメッセージ
    alert(error.message);
  }
};