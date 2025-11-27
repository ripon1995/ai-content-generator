// User Types
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
}

// Auth Request Types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

// Auth Response Types
export interface AuthResponse {
  user: User;
  access_token: string;
  refresh_token: string;
}
