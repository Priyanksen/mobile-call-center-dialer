export interface LoginRequest {
  username: string;
  password: string;
}

export interface AuthTokens {
  access: string;
  refresh: string;
}

export interface LoginResponse extends AuthTokens {
  user?: {
    id: number;
    username: string;
    email: string;
  };
}
