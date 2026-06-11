import * as XLSX from "xlsx";

import { fetchEmployeeAnalytics } from "../api/analytics";
import { fetchTeamMembers } from "../api/team";
import { resolveMediaUrl } from "./media";
import type { EmployeeAnalytics } from "../types/analytics";
import type { TeamMember } from "../types/team";

const ROLE_LABELS: Record<TeamMember["role"], string> = {
  admin: "Администратор",
  manager: "Менеджер",
};

function emptyStats(): Pick<
  EmployeeAnalytics,
  "total" | "new" | "in_progress" | "completed" | "cancelled"
> {
  return {
    total: 0,
    new: 0,
    in_progress: 0,
    completed: 0,
    cancelled: 0,
  };
}

function memberToRow(member: TeamMember, stats: EmployeeAnalytics | undefined) {
  const work = stats ?? emptyStats();

  return {
    ФИО: member.full_name ?? "",
    Email: member.email,
    Телефон: member.phone ?? "",
    Должность: member.position ?? "",
    Роль: ROLE_LABELS[member.role] ?? member.role,
    "Ссылка на фото": resolveMediaUrl(member.photo_url) ?? "",
    "Всего заявок": work.total,
    "Новые заявки": work.new,
    "В работе": work.in_progress,
    "Завершённые": work.completed,
    "Отменённые": work.cancelled,
  };
}

function buildFilename(): string {
  const date = new Date().toISOString().slice(0, 10);
  return `team_${date}.xlsx`;
}

export async function exportTeamToExcel(search?: string): Promise<number> {
  const [members, analytics] = await Promise.all([
    fetchTeamMembers(search),
    fetchEmployeeAnalytics(),
  ]);

  if (members.length === 0) {
    return 0;
  }

  const analyticsByUserId = new Map(analytics.map((row) => [row.user_id, row]));
  const rows = members.map((member) => memberToRow(member, analyticsByUserId.get(member.id)));

  const worksheet = XLSX.utils.json_to_sheet(rows);
  worksheet["!cols"] = [
    { wch: 28 },
    { wch: 28 },
    { wch: 18 },
    { wch: 24 },
    { wch: 16 },
    { wch: 36 },
    { wch: 14 },
    { wch: 14 },
    { wch: 12 },
    { wch: 14 },
    { wch: 12 },
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Команда");
  XLSX.writeFile(workbook, buildFilename());

  return members.length;
}
