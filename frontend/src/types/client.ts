export type Client = {
  id: number;
  full_name: string;
  phone: string | null;
  email: string | null;
  address: string | null;
  comment: string | null;
  created_at: string;
};

export type ClientPayload = {
  full_name: string;
  phone?: string | null;
  email?: string | null;
  address?: string | null;
  comment?: string | null;
};
