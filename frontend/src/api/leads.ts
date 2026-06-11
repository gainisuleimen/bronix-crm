import type { Lead, LeadPayload, LeadSortField, LeadSortOrder, LeadStatus } from "../types/lead";
import { http } from "./http";

type LeadListParams = {
  search?: string;
  status?: LeadStatus;
  client_id?: number;
  scheduled_from?: string;
  scheduled_to?: string;
  sort_by?: LeadSortField;
  sort_order?: LeadSortOrder;
};

export async function fetchLeads(params?: LeadListParams): Promise<Lead[]> {
  const { data } = await http.get<Lead[]>("/api/leads", { params });
  return data;
}

export async function createLead(payload: LeadPayload): Promise<Lead> {
  const { data } = await http.post<Lead>("/api/leads", payload);
  return data;
}

export async function updateLead(id: number, payload: LeadPayload): Promise<Lead> {
  const { data } = await http.put<Lead>(`/api/leads/${id}`, payload);
  return data;
}

export async function deleteLead(id: number): Promise<void> {
  await http.delete(`/api/leads/${id}`);
}
