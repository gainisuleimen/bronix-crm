export type LeadStatus = "new" | "in_progress" | "completed" | "cancelled";
export type LeadSortField = "created_at" | "scheduled_date" | "deadline_at";
export type LeadSortOrder = "asc" | "desc";

export type Lead = {
  id: number;
  client_id: number;
  client_name: string;
  title: string;
  description: string | null;
  status: LeadStatus;
  assigned_to_id: number | null;
  assigned_to_name: string | null;
  scheduled_date: string | null;
  scheduled_time: string | null;
  deadline_at: string | null;
  created_at: string;
};

export type LeadPayload = {
  client_id: number;
  title: string;
  description?: string | null;
  status: LeadStatus;
  assigned_to_id?: number | null;
  scheduled_date?: string | null;
  scheduled_time?: string | null;
  deadline_at?: string | null;
};

export const LEAD_STATUS_LABELS: Record<LeadStatus, string> = {
  new: "Новая",
  in_progress: "В работе",
  completed: "Завершена",
  cancelled: "Отменена",
};

export const LEAD_STATUS_OPTIONS: LeadStatus[] = [
  "new",
  "in_progress",
  "completed",
  "cancelled",
];
