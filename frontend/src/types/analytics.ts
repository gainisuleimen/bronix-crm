export type EmployeeAnalytics = {
  user_id: number;
  full_name: string | null;
  email: string;
  role: "admin" | "manager";
  total: number;
  new: number;
  in_progress: number;
  completed: number;
  cancelled: number;
};

export type DashboardSummary = {
  clients_total: number;
  leads_total: number;
  leads_new: number;
  leads_in_progress: number;
  leads_completed: number;
  leads_cancelled: number;
  employees: EmployeeAnalytics[];
};
