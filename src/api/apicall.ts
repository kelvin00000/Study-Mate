export interface ApiError {
  success: false;
  type: string;
  message: string;
  details?: Record<string, string>;
}
export async function apiCall(url: string, options: RequestInit) {
  const baseUrl = import.meta.env.VITE_API_BASE_URL;

  let response: Response;
  try {
    response = await fetch(`${baseUrl}${url}`, options);
  } catch {
    throw {
      success: false,
      type: "NETWORK_ERROR",
      message: "Unable to reach the server. Please check your internet connection.",
    } as ApiError;
  }

  // 5xx server errors — may not have a JSON body
  if (response.status >= 500) {
    let message = "Something went wrong on our end. Please try again.";
    try {
      const body = await response.json();
      if (body?.message) message = body.message;
    } catch {
      // no parseable body
    }
    throw {
      success: false,
      type: "SERVER_ERROR",
      message,
    } as ApiError;
  }

  // Try to parse JSON body
  let data;
  try {
    data = await response.json();
  } catch {
    throw {
      success: false,
      type: "NETWORK_ERROR",
      message: "Invalid server response",
    } as ApiError;
  }

  if (!response.ok) {
    const error: ApiError = data;
    throw error;
  }
  return data;
}
