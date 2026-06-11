import type { Client, ClientPayload } from "../types/client";
import { http } from "./http";

export async function fetchClients(search?: string): Promise<Client[]> {
  const { data } = await http.get<Client[]>("/api/clients", {
    params: search ? { search } : undefined,
  });
  return data;
}

export async function createClient(payload: ClientPayload): Promise<Client> {
  const { data } = await http.post<Client>("/api/clients", payload);
  return data;
}

export async function updateClient(id: number, payload: ClientPayload): Promise<Client> {
  const { data } = await http.put<Client>(`/api/clients/${id}`, payload);
  return data;
}

export async function deleteClient(id: number): Promise<void> {
  await http.delete(`/api/clients/${id}`);
}
