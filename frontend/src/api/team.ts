import type { TeamMember, TeamMemberUpdatePayload } from "../types/team";
import { http } from "./http";

export async function fetchTeamMembers(search?: string): Promise<TeamMember[]> {
  const { data } = await http.get<TeamMember[]>("/api/team", {
    params: search ? { search } : undefined,
  });
  return data;
}

export async function updateTeamMember(
  id: number,
  payload: TeamMemberUpdatePayload,
): Promise<TeamMember> {
  const { data } = await http.put<TeamMember>(`/api/team/${id}`, payload);
  return data;
}

export async function uploadTeamMemberPhoto(id: number, file: File): Promise<TeamMember> {
  const formData = new FormData();
  formData.append("file", file);

  const { data } = await http.post<TeamMember>(`/api/team/${id}/photo`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
}

export async function deleteTeamMemberPhoto(id: number): Promise<TeamMember> {
  const { data } = await http.delete<TeamMember>(`/api/team/${id}/photo`);
  return data;
}

export async function deleteTeamMember(id: number): Promise<void> {
  await http.delete(`/api/team/${id}`);
}
