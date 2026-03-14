export interface User {
  id: string;
  email: string;
  nickname: string;
  avatar?: string;
  settings: UserSettings;
  createdAt: string;
  updatedAt: string;
}

export interface UserSettings {
  aiMode: boolean;
  theme: 'light' | 'dark' | 'system';
  voiceAutoStop: boolean;
  voiceAutoStopDelay: number; // ms
  language: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  nickname: string;
}

export interface AuthResponse {
  user: Omit<User, 'settings'> & { settings: UserSettings };
  accessToken: string;
  refreshToken: string;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}
