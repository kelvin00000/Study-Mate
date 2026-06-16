export interface ApiError {
  success: false;
  type: string;
  message: string;
  details?: Record<string, string>;
}
export async function apiCall(url: string, options: RequestInit) {
  const baseUrl = 'http://localhost:5000/api';
  //  import.meta.env.VITE_API_BASE_URL;
  
    
  const response = await fetch(`${baseUrl}${url}`, options);

  // Try to parse JSON body (could fail if server doesn't send JSON)
  let data;
  try {
    data = await response.json();
  } catch {
    throw {
      type: "NETWORK_ERROR",
      message: "Invalid server response",
    };
  }

  if (!response.ok) {
    // This is an error response
    // Assume server sends structured error matching ApiError interface
    const error: ApiError = data;
    throw error;
  }
  return data;
}
