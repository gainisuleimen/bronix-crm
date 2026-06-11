import type { DashboardSummary, EmployeeAnalytics } from "../types/analytics";
import { http } from "./http";

export async function fetchDashboardSummary(): Promise<DashboardSummary> {
  const { data } = await http.get<DashboardSummary>("/api/analytics/dashboard");
  return data;
}

export async function fetchEmployeeAnalytics(): Promise<EmployeeAnalytics[]> {
  const { data } = await http.get<EmployeeAnalytics[]>("/api/analytics/employees");
  return data;
}
