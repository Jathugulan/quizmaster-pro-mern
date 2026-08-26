/**
 * Google Identity Services (GIS) Frontend Helper
 * Handles Google OAuth 2.0 / GIS Account Picker flow.
 */

export const GOOGLE_CLIENT_ID =
  import.meta.env.VITE_GOOGLE_CLIENT_ID ||
  '';

/**
 * Ensures the Google Identity Services (GIS) script is loaded.
 */
export function loadGoogleScript() {
  return new Promise((resolve, reject) => {
    if (typeof window !== 'undefined' && window.google?.accounts) {
      return resolve(window.google);
    }

    const existingScript = document.getElementById('google-gsi-script');
    if (existingScript) {
      existingScript.addEventListener('load', () => resolve(window.google));
      existingScript.addEventListener('error', (err) => reject(err));
      return;
    }

    const script = document.createElement('script');
    script.id = 'google-gsi-script';
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = () => resolve(window.google);
    script.onerror = () => reject(new Error('Failed to load Google Identity Services SDK'));
    document.head.appendChild(script);
  });
}

/**
 * Triggers the official Google Account Picker dialog.
 * Returns a Promise that resolves with { token } (ID Token) or { accessToken }.
 */
export async function triggerGoogleOAuth(clientId = GOOGLE_CLIENT_ID) {
  const activeClientId = (clientId || '').trim();

  if (!activeClientId) {
    throw new Error('Google Client ID is missing. Please configure VITE_GOOGLE_CLIENT_ID in frontend/.env.');
  }

  await loadGoogleScript();

  if (!window.google?.accounts) {
    throw new Error('Google Identity Services SDK is not available.');
  }

  return new Promise((resolve, reject) => {
    try {
      if (window.google.accounts.oauth2) {
        const client = window.google.accounts.oauth2.initTokenClient({
          client_id: activeClientId,
          scope: 'openid email profile',
          prompt: 'select_account',
          callback: (response) => {
            if (response.error) {
              if (response.error === 'popup_closed_by_user' || response.error === 'access_denied') {
                return reject({ isCancelled: true, message: 'Google account selection was cancelled.' });
              }
              return reject(new Error(response.error_description || response.error || 'Google authentication failed.'));
            }
            if (response.access_token) {
              return resolve({ accessToken: response.access_token });
            }
            reject(new Error('No access token received from Google Identity Services.'));
          },
          error_callback: (err) => {
            if (err?.type === 'popup_closed') {
              return reject({ isCancelled: true, message: 'Google account selection was cancelled.' });
            }
            reject(new Error('Google OAuth window encountered an error.'));
          },
        });

        // Request account picker dialog
        client.requestAccessToken({ prompt: 'select_account' });
        return;
      }

      reject(new Error('Google Identity Services OAuth2 client is not initialized.'));
    } catch (err) {
      reject(err);
    }
  });
}

export default {
  loadGoogleScript,
  triggerGoogleOAuth,
  GOOGLE_CLIENT_ID,
};

