import type {
  LoginPayload,
  RegisterPayload,
  TokenResponse,
  User,
} from "../types/auth";
import { http } from "./http";

export async function registerUser(payload: RegisterPayload): Promise<User> {
  const { data } = await http.post<User>("/auth/register", payload);
  return data;
}

export async function loginUser(payload: LoginPayload): Promise<TokenResponse> {
  const { data } = await http.post<TokenResponse>("/auth/login", payload);
  return data;
}

export async function fetchCurrentUser(): Promise<User> {
  const { data } = await http.get<User>("/auth/me");
  return data;
}
