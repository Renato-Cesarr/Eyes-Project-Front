export interface UserRegistrationRequest {
  name: string;
  email: string;
}

export interface SetupPasswordRequest {
  token: string;
  password?: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  token: string;
  password?: string;
}
