import * as XLSX from "xlsx";

import { fetchClients } from "../api/clients";
import type { Client } from "../types/client";

function formatCreatedAt(value: string): string {
  return new Date(value).toLocaleString("ru-RU", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function clientToRow(client: Client) {
  return {
    ФИО: client.full_name,
    Телефон: client.phone ?? "",
    Email: client.email ?? "",
    Адрес: client.address ?? "",
    "Дата создания": formatCreatedAt(client.created_at),
  };
}

function buildFilename(): string {
  const date = new Date().toISOString().slice(0, 10);
  return `clients_${date}.xlsx`;
}

export async function exportClientsToExcel(search?: string): Promise<number> {
  const clients = await fetchClients(search);
  if (clients.length === 0) {
    return 0;
  }

  const rows = clients.map(clientToRow);

  const worksheet = XLSX.utils.json_to_sheet(rows);
  worksheet["!cols"] = [
    { wch: 28 },
    { wch: 18 },
    { wch: 28 },
    { wch: 36 },
    { wch: 20 },
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Клиенты");
  XLSX.writeFile(workbook, buildFilename());

  return clients.length;
}
