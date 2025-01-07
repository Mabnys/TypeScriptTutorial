import { useCallback } from 'react';

const REFRESH_TOKEN_URL = 'http://localhost:8080/oauth/refresh_token';

export const useRefreshToken = () => {
  const refreshAccessToken = useCallback(async () => {
    // Get the refresh token from cookies
    const refreshToken = document.cookie
      .split('; ')
      .find(row => row.startsWith('refreshToken='))
      ?.split('=')[1];

    if (!refreshToken) {
      throw new Error('No refresh token found');
    }

    try {
      const response = await fetch(REFRESH_TOKEN_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refresh_token: refreshToken }),
      });

      if (!response.ok) {
        throw new Error('Failed to refresh token');
      }

      const data = await response.json();

      // Update the access token in cookies
      document.cookie = `authToken=${data.access_token}; path=/; max-age=3600; SameSite=Lax;`;

      // Optionally, update the refresh token if a new one is provided
      if (data.refresh_token) {
        document.cookie = `refreshToken=${data.refresh_token}; path=/; max-age=86400; SameSite=Lax;`;
      }

      return data.access_token;
    } catch (error) {
      console.error('Error refreshing token:', error);
      throw error;
    }
  }, []);

  return { refreshAccessToken };
};
