import { OAuth2Client } from 'google-auth-library';

/**
 * Verify Google credential (ID Token) or Access Token using Google Auth Library & Google APIs.
 * Ensures verified identity, sub, email, and email_verified state.
 */
export async function verifyGoogleToken({ credential, accessToken, token }) {
  const rawIdToken = credential || token;

  // 1. If ID Token (JWT Credential from GIS)
  if (rawIdToken) {
    try {
      const googleClientId = process.env.GOOGLE_CLIENT_ID || undefined;
      const client = new OAuth2Client(googleClientId);

      // If GOOGLE_CLIENT_ID is configured, verify against audience
      const ticket = await client.verifyIdToken({
        idToken: rawIdToken,
        audience: googleClientId || undefined,
      });

      const payload = ticket.getPayload();
      if (!payload || !payload.sub || !payload.email) {
        throw new Error('Google credential payload is incomplete.');
      }

      // Check issuer
      const validIssuers = ['accounts.google.com', 'https://accounts.google.com'];
      if (!validIssuers.includes(payload.iss)) {
        throw new Error('Invalid Google token issuer.');
      }

      const emailVerified = payload.email_verified === true || payload.email_verified === 'true';
      if (!emailVerified) {
        throw new Error('Your Google email address has not been verified by Google.');
      }

      return {
        googleId: payload.sub,
        email: payload.email.toLowerCase().trim(),
        emailVerified: true,
        name: payload.name || `${payload.given_name || ''} ${payload.family_name || ''}`.trim() || 'Google User',
        picture: payload.picture || '',
        givenName: payload.given_name || '',
        familyName: payload.family_name || '',
      };
    } catch (libraryErr) {
      // Direct tokeninfo endpoint fallback for maximum reliability
      try {
        const response = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(rawIdToken)}`);
        if (!response.ok) {
          throw new Error('Google verification rejected the token.');
        }
        const data = await response.json();
        if (!data.sub || !data.email) {
          throw new Error('Invalid Google token payload from verification service.');
        }
        const emailVerified = data.email_verified === true || data.email_verified === 'true';
        if (!emailVerified) {
          throw new Error('Google email is not verified.');
        }

        return {
          googleId: data.sub,
          email: data.email.toLowerCase().trim(),
          emailVerified: true,
          name: data.name || `${data.given_name || ''} ${data.family_name || ''}`.trim() || 'Google User',
          picture: data.picture || '',
          givenName: data.given_name || '',
          familyName: data.family_name || '',
        };
      } catch (fallbackErr) {
        console.error('[GoogleAuth] Token verification failed:', libraryErr.message, fallbackErr.message);
        const error = new Error('Google credential verification failed. Please try again.');
        error.statusCode = 401;
        throw error;
      }
    }
  }

  // 2. If Access Token from OAuth2 Token Client
  if (accessToken) {
    try {
      const response = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (!response.ok) {
        throw new Error('Google userinfo service rejected the access token.');
      }
      const data = await response.json();
      if (!data.sub || !data.email) {
        throw new Error('Incomplete profile received from Google userinfo.');
      }

      const emailVerified = data.email_verified === true || data.email_verified === 'true';
      if (!emailVerified) {
        throw new Error('Google email is not verified.');
      }

      return {
        googleId: data.sub,
        email: data.email.toLowerCase().trim(),
        emailVerified: true,
        name: data.name || `${data.given_name || ''} ${data.family_name || ''}`.trim() || 'Google User',
        picture: data.picture || '',
        givenName: data.given_name || '',
        familyName: data.family_name || '',
      };
    } catch (err) {
      console.error('[GoogleAuth] Access token verification failed:', err.message);
      const error = new Error('Google authentication failed. Please try again.');
      error.statusCode = 401;
      throw error;
    }
  }

  const error = new Error('No Google authentication credential provided.');
  error.statusCode = 400;
  throw error;
}

export default {
  verifyGoogleToken,
};
