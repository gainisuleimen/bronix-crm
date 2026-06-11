export type UserRole = "admin" | "manager";

export type User = {
  id: number;
  email: string;
  full_name: string | null;
  phone?: string | null;
  position?: string | null;
  photo_url?: string | null;
  is_active: boolean;
  role: UserRole;
  created_at: string;
};

export type TokenResponse = {
  access_token: string;
  token_type: string;
};

export type RegisterPayload = {
  email: string;
  password: string;
  full_name?: string;
  role: UserRole;
};

export type LoginPayload = {
  email: string;
  password: string;
};
