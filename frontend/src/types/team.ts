export type TeamMember = {
  id: number;
  email: string;
  full_name: string | null;
  phone: string | null;
  position: string | null;
  photo_url: string | null;
  role: "admin" | "manager";
};

export type TeamMemberUpdatePayload = {
  full_name?: string | null;
  phone?: string | null;
  position?: string | null;
  photo_url?: string | null;
};
