import { useCallback } from 'react';
import { jwtDecode } from 'jwt-decode'; // Make sure to install this package: npm install jwt-decode

const REFRESH_TOKEN_URL = 'http://localhost:8080/oauth/refresh_token';

interface DecodedToken {
  exp: number;
  // Add other properties from your token as needed
}

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

    // Get the current access token
    const currentAccessToken = document.cookie
      .split('; ')
      .find(row => row.startsWith('authToken='))
      ?.split('=')[1];

    if (currentAccessToken) {
      // Decode the current access token
      const decodedAccessToken = jwtDecode<DecodedToken>(currentAccessToken);
      
      // Check if the current access token is still valid
      if (decodedAccessToken.exp * 1000 > Date.now()) {
        console.log('Current access token is still valid');
        return currentAccessToken;
      }
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

      // Validate the new access token
      if (!data.access_token) {
        throw new Error('No access token received');
      }

      // Decode the new access token
      const decodedNewToken = jwtDecode<DecodedToken>(data.access_token);

      // Compare the new access token with the refresh token
      if (decodedNewToken.exp <= Date.now() / 1000) {
        throw new Error('New access token is already expired');
      }

      // Update the access token in cookies
      document.cookie = `authToken=${data.access_token}; path=/; max-age=3600; SameSite=Lax;`;

      // Optionally, update the refresh token if a new one is provided
      if (data.refresh_token) {
        document.cookie = `refreshToken=${data.refresh_token}; path=/; max-age=86400; SameSite=Lax;`;
      }

      console.log('Access token refreshed successfully');
      return data.access_token;
    } catch (error) {
      console.error('Error refreshing token:', error);
      throw error;
    }
  }, []);

  return { refreshAccessToken };
};
