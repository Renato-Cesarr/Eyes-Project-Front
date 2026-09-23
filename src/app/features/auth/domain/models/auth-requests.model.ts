export interface AccessRequestCommand {
  name: string;
  email: string;
  reason?: string;
}

export interface AccessRequestReceipt {
  message: string;
}

export interface SetupPasswordRequest {
  token: string;
  password: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  token: string;
  password: string;
}
