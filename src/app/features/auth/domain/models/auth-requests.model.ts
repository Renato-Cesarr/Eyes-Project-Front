export interface UserRegistrationRequest {
  name: string;
  email: string;
}

export interface SetupPasswordRequest {
  token: string;
  password?: string;
}
