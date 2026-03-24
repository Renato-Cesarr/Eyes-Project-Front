export interface AuthCredentials {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: import('./user.model').User;
  token: string;
  expiresIn: number;
}
