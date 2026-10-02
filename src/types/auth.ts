import { SafeUserT } from "./user";

export interface IRegistrationData {
  email: string;
  token: string | null;
}

export interface ILoginData {
  accessToken: string;
  refreshToken: string;
  userData: SafeUserT;
}

export interface IForgotPasswordData {
  email: string;
  token: string | null;
}

export interface IResendOtpData {
  email: string;
  token: string | null;
}

export interface IVerifyResetOtpData {
  email: string;
  token: string | null;
}

export interface IRefreshTokenData {
  accessToken: string;
  refreshToken: string;
  userData: AuthSession;
}

export type AuthSession = {
  id: string;
  email: string;
  refreshToken: string;
  previousRefreshToken: string;
  rotateTokenAt: string;
};
