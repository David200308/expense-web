export interface JwtPayload {
  sub: string;
  walletAddress: string;
  iat?: number;
  exp?: number;
}

export interface LoginRequest {
  walletAddress: string;
  signature: string;
  message: string;
}

export interface AuthResponse {
  user: {
    id: string;
    walletAddress: string;
    currency: string;
    email: string | null;
    createdAt: Date;
    updatedAt: Date;
  };
  token: string;
}
