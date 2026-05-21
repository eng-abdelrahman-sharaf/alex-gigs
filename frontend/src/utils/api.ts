const BASE_URL = 'http://localhost:5000/api';

export function getCookie(name: string): string | null {
  if (typeof window === 'undefined') return null;
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(';').shift() || null;
  return null;
}

export function setCookie(name: string, value: string, days = 7) {
  if (typeof window === 'undefined') return;
  const date = new Date();
  date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
  const expires = `; expires=${date.toUTCString()}`;
  document.cookie = `${name}=${value || ""}${expires}; path=/; SameSite=Lax`;
}

export function deleteCookie(name: string) {
  if (typeof window === 'undefined') return;
  document.cookie = `${name}=; Max-Age=-99999999; path=/; SameSite=Lax`;
}

export async function apiFetch<T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<{ success: boolean; data?: T; error?: string }> {
  const token = getCookie('token');
  
  const headers = new Headers(options.headers);
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }
  
  if (!(options.body instanceof FormData) && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  try {
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    const result = await response.json();
    
    if (!response.ok) {
      return {
        success: false,
        error: result.error || result.message || 'Something went wrong',
      };
    }

    // Adapt to different response structures
    return {
      success: true,
      data: result.data !== undefined ? result.data : result,
    };
  } catch (err: any) {
    return {
      success: false,
      error: err.message || 'Network error connection failed',
    };
  }
}
