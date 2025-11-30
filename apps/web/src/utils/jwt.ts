interface DecodedToken {
  userId: string;
  email: string;
  iat: number; // issued at (timestamp in seconds)
  exp: number; // expiration (timestamp in seconds)
}

// decode token
export const decodeToken = (token: string): DecodedToken | null => {
  try {
    // JWT format: header.payload.signature
    const parts = token.split('.');
    if (parts.length !== 3) {
      return null;
    }

    // Decode the payload (base64url)
    const payload = parts[1];
    const decoded = JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')));
    return decoded as DecodedToken;
  } catch (error) {
    console.error('Failed to decode token:', error);
    return null;
  }
};

// check token expiry
export const isTokenExpired = (token: string | null): boolean => {
  if (!token) return true;

  const decoded = decodeToken(token);
  if (!decoded || !decoded.exp) {
    return true;
  }

  // exp is in seconds, Date.now() is in milliseconds
  const currentTime = Date.now() / 1000;
  const isExpired = decoded.exp < currentTime;

  if (isExpired) {
    console.warn('Token has expired');
  }

  return isExpired;
};
