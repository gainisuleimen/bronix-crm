import { useCallback, useEffect, useState } from "react";

import { fetchClients } from "../api/clients";
import { createLead, deleteLead, fetchLeads, updateLead } from "../api/leads";
import { fetchTeamMembers } from "../api/team";
import { LeadForm } from "../components/LeadForm";
import { PageHeader } from "../components/layout/PageHeader";
import { PageShell } from "../components/layout/PageShell";
import { DetailRow } from "../components/ui/DetailRow";
import { useAuth } from "../context/AuthContext";
import {
  formatDateTime,
  formatScheduledDate,
  formatScheduledTime,
} from "../lib/datetime";
import { getErrorMessage } from "../lib/errors";
import type { Client } from "../types/client";
import type { Lead, LeadPayload, LeadSortField, LeadSortOrder, LeadStatus } from "../types/lead";
import { LEAD_STATUS_LABELS, LEAD_STATUS_OPTIONS } from "../types/lead";
import type { TeamMember } from "../types/team";

function statusBadgeClass(status: LeadStatus) {
  switch (status) {
    case "new":
      return "bg-blue-100 text-blue-800";
    case "in_progress":
      return "bg-amber-100 text-amber-800";
    case "completed":
      return "bg-green-100 text-green-800";
    case "cancelled":
      return "bg-slate-200 text-slate-700";
    default:
      return "bg-slate-100 text-slate-700";
  }
}

const SORT_LABELS: Record<LeadSortField, string> = {
  created_at: "Дата создания",
  scheduled_date: "Дата выполнения",
  deadline_at: "Крайний срок",
};

export function LeadsPage() {
  const { user } = useAuth();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [searchInput, setSearchInput] = useState("");
  const [statusInput, setStatusInput] = useState<LeadStatus | "">("");
  const [clientInput, setClientInput] = useState("");
  const [scheduledFromInput, setScheduledFromInput] = useState("");
  const [scheduledToInput, setScheduledToInput] = useState("");
  const [sortByInput, setSortByInput] = useState<LeadSortField>("created_at");
  const [sortOrderInput, setSortOrderInput] = useState<LeadSortOrder>("desc");
  const [filters, setFilters] = useState({
    search: "",
    status: "" as LeadStatus | "",
    clientId: "",
    scheduledFrom: "",
    scheduledTo: "",
    sortBy: "created_at" as LeadSortField,
    sortOrder: "desc" as LeadSortOrder,
  });
  const [leadsLoading, setLeadsLoading] = useState(true);
  const [clientsLoading, setClientsLoading] = useState(true);
  const [teamLoading, setTeamLoading] = useState(true);
  const [leadsError, setLeadsError] = useState("");
  const [clientsError, setClientsError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [editingLead, setEditingLead] = useState<Lead | null>(null);

  const loadTeamMembers = useCallback(async () => {
    setTeamLoading(true);
    try {
      const data = await fetchTeamMembers();
      setTeamMembers(data);
    } catch {
      setTeamMembers([]);
    } finally {
      setTeamLoading(false);
    }
  }, []);

  const loadClients = useCallback(async () => {
    setClientsLoading(true);
    setClientsError("");
    try {
      const data = await fetchClients();
      setClients(data);
    } catch (err) {
      setClientsError(getErrorMessage(err, "Не удалось загрузить клиентов"));
      setClients([]);
    } finally {
      setClientsLoading(false);
    }
  }, []);

  const loadLeads = useCallback(async () => {
    setLeadsLoading(true);
    setLeadsError("");
    try {
      const data = await fetchLeads({
        search: filters.search || undefined,
        status: filters.status || undefined,
        client_id: filters.clientId ? Number(filters.clientId) : undefined,
        scheduled_from: filters.scheduledFrom || undefined,
        scheduled_to: filters.scheduledTo || undefined,
        sort_by: filters.sortBy,
        sort_order: filters.sortOrder,
      });
      setLeads(data);
    } catch (err) {
      setLeadsError(getErrorMessage(err, "Не удалось загрузить заявки"));
      setLeads([]);
    } finally {
      setLeadsLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    loadClients();
    loadTeamMembers();
  }, [loadClients, loadTeamMembers]);

  useEffect(() => {
    loadLeads();
  }, [loadLeads]);

  async function handleCreate(payload: LeadPayload) {
    await createLead(payload);
    setEditingLead(null);
    setSuccessMessage("Заявка успешно добавлена");
    await loadLeads();
  }

  async function handleUpdate(payload: LeadPayload) {
    if (!editingLead) return;
    await updateLead(editingLead.id, payload);
    setEditingLead(null);
    setSuccessMessage("Заявка обновлена");
    await loadLeads();
  }

  async function handleDelete(lead: Lead) {
    const confirmed = window.confirm(`Удалить заявку «${lead.title}»?`);
    if (!confirmed) return;

    try {
      await deleteLead(lead.id);
      if (editingLead?.id === lead.id) {
        setEditingLead(null);
      }
      setSuccessMessage("Заявка удалена");
      await loadLeads();
    } catch (err) {
      setLeadsError(getErrorMessage(err, "Не удалось удалить заявку"));
    }
  }

  function handleFiltersSubmit(event: React.FormEvent) {
    event.preventDefault();
    setSuccessMessage("");
    setFilters({
      search: searchInput.trim(),
      status: statusInput,
      clientId: clientInput,
      scheduledFrom: scheduledFromInput,
      scheduledTo: scheduledToInput,
      sortBy: sortByInput,
      sortOrder: sortOrderInput,
    });
  }

  function clearFilters() {
    setSearchInput("");
    setStatusInput("");
    setClientInput("");
    setScheduledFromInput("");
    setScheduledToInput("");
    setSortByInput("created_at");
    setSortOrderInput("desc");
    setSuccessMessage("");
    setFilters({
      search: "",
      status: "",
      clientId: "",
      scheduledFrom: "",
      scheduledTo: "",
      sortBy: "created_at",
      sortOrder: "desc",
    });
  }

  const hasActiveFilters =
    filters.search ||
    filters.status ||
    filters.clientId ||
    filters.scheduledFrom ||
    filters.scheduledTo ||
    filters.sortBy !== "created_at" ||
    filters.sortOrder !== "desc";

  return (
    <PageShell>
        <PageHeader
          title="Заявки"
          description="Учёт заявок с планированием даты и времени выполнения"
        />

        {successMessage && (
          <div className="mt-4 rounded-lg bg-green-50 px-4 py-3 text-sm text-green-800">
            {successMessage}
          </div>
        )}

        {clientsError && (
          <div className="mt-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
            {clientsError}
          </div>
        )}

        <form
          className="mt-6 grid gap-3 rounded-xl border bg-white p-4 sm:grid-cols-2 lg:grid-cols-3 xl:flex xl:flex-wrap xl:items-end"
          onSubmit={handleFiltersSubmit}
        >
          <div className="sm:col-span-2 lg:col-span-1 xl:min-w-[200px] xl:flex-1">
            <label className="mb-1 block text-xs font-medium text-slate-500">Поиск</label>
            <input
              type="search"
              placeholder="Название, описание, клиент..."
              className="input-field"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
            />
          </div>

          <div className="w-full">
            <label className="mb-1 block text-xs font-medium text-slate-500">Статус</label>
            <select
              className="input-field"
              value={statusInput}
              onChange={(e) => setStatusInput(e.target.value as LeadStatus | "")}
            >
              <option value="">Все</option>
              {LEAD_STATUS_OPTIONS.map((status) => (
                <option key={status} value={status}>
                  {LEAD_STATUS_LABELS[status]}
                </option>
              ))}
            </select>
          </div>

          <div className="w-full">
            <label className="mb-1 block text-xs font-medium text-slate-500">Клиент</label>
            <select
              className="input-field"
              value={clientInput}
              onChange={(e) => setClientInput(e.target.value)}
              disabled={clientsLoading}
            >
              <option value="">Все</option>
              {clients.map((client) => (
                <option key={client.id} value={client.id}>
                  {client.full_name}
                </option>
              ))}
            </select>
          </div>

          <div className="w-full">
            <label className="mb-1 block text-xs font-medium text-slate-500">Дата с</label>
            <input
              type="date"
              className="input-field"
              value={scheduledFromInput}
              onChange={(e) => setScheduledFromInput(e.target.value)}
            />
          </div>

          <div className="w-full">
            <label className="mb-1 block text-xs font-medium text-slate-500">Дата по</label>
            <input
              type="date"
              className="input-field"
              value={scheduledToInput}
              onChange={(e) => setScheduledToInput(e.target.value)}
            />
          </div>

          <div className="w-full">
            <label className="mb-1 block text-xs font-medium text-slate-500">Сортировка</label>
            <select
              className="input-field"
              value={sortByInput}
              onChange={(e) => setSortByInput(e.target.value as LeadSortField)}
            >
              {Object.entries(SORT_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>

          <div className="w-full">
            <label className="mb-1 block text-xs font-medium text-slate-500">Порядок</label>
            <select
              className="input-field"
              value={sortOrderInput}
              onChange={(e) => setSortOrderInput(e.target.value as LeadSortOrder)}
            >
              <option value="desc">По убыванию</option>
              <option value="asc">По возрастанию</option>
            </select>
          </div>

          <div className="flex flex-col gap-2 sm:col-span-2 sm:flex-row lg:col-span-3 xl:col-span-1">
            <button type="submit" className="btn-primary w-full sm:w-auto">
              Применить
            </button>
            {hasActiveFilters && (
              <button type="button" onClick={clearFilters} className="btn-secondary w-full sm:w-auto">
                Сброс
              </button>
            )}
          </div>
        </form>

        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          <div className="order-2 rounded-xl border bg-white p-4 sm:p-5 lg:sticky lg:top-20 lg:order-1 lg:self-start">
            <h2 className="text-lg font-medium">
              {editingLead ? "Редактирование заявки" : "Новая заявка"}
            </h2>
            <div className="mt-4">
              <LeadForm
                key={editingLead?.id ?? "new"}
                clients={clients}
                clientsLoading={clientsLoading}
                teamMembers={teamMembers}
                teamLoading={teamLoading}
                defaultAssigneeId={user?.id}
                initial={editingLead}
                onSubmit={editingLead ? handleUpdate : handleCreate}
                onCancel={editingLead ? () => setEditingLead(null) : undefined}
              />
            </div>
          </div>

          <div className="order-1 rounded-xl border bg-white p-4 sm:p-5 lg:order-2">
            <div className="flex items-center justify-between gap-2">
              <h2 className="text-lg font-medium">Список заявок</h2>
              <span className="text-sm text-slate-500">Всего: {leads.length}</span>
            </div>

            {leadsError && (
              <div className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
                {leadsError}
                <button
                  type="button"
                  className="ml-3 underline"
                  onClick={() => loadLeads()}
                >
                  Повторить
                </button>
              </div>
            )}

            {leadsLoading ? (
              <p className="mt-6 text-sm text-slate-500">Загрузка...</p>
            ) : leads.length === 0 ? (
              <p className="mt-6 text-sm text-slate-500">
                {hasActiveFilters
                  ? "Ничего не найдено"
                  : "Заявок пока нет. Добавьте первую ниже."}
              </p>
            ) : (
              <>
                <div className="mt-4 space-y-3 lg:hidden">
                  {leads.map((lead) => (
                    <article key={lead.id} className="rounded-xl border bg-slate-50 p-4">
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <div className="min-w-0 font-medium text-slate-900">{lead.title}</div>
                        <span
                          className={`inline-flex shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium ${statusBadgeClass(lead.status)}`}
                        >
                          {LEAD_STATUS_LABELS[lead.status]}
                        </span>
                      </div>
                      {lead.description && (
                        <p className="mt-2 line-clamp-3 text-sm text-slate-500">{lead.description}</p>
                      )}
                      <div className="mt-3 space-y-2">
                        <DetailRow label="Клиент" value={lead.client_name} />
                        <DetailRow label="Ответственный" value={lead.assigned_to_name || "—"} />
                        <DetailRow label="Дата" value={formatScheduledDate(lead.scheduled_date)} />
                        <DetailRow label="Время" value={formatScheduledTime(lead.scheduled_time)} />
                        <DetailRow label="Срок" value={formatDateTime(lead.deadline_at)} />
                      </div>
                      <div className="mt-4 flex gap-3">
                        <button
                          type="button"
                          onClick={() => {
                            setEditingLead(lead);
                            setSuccessMessage("");
                          }}
                          className="min-h-10 text-sm text-slate-900 underline"
                        >
                          Изменить
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(lead)}
                          className="min-h-10 text-sm text-red-600 underline"
                        >
                          Удалить
                        </button>
                      </div>
                    </article>
                  ))}
                </div>

                <div className="mt-4 hidden overflow-x-auto lg:block">
                <table className="w-full min-w-[980px] text-left text-sm">
                  <thead>
                    <tr className="border-b text-slate-500">
                      <th className="py-2 pr-3 font-medium">Заявка</th>
                      <th className="py-2 pr-3 font-medium">Клиент</th>
                      <th className="py-2 pr-3 font-medium">Ответственный</th>
                      <th className="py-2 pr-3 font-medium">Дата</th>
                      <th className="py-2 pr-3 font-medium">Время</th>
                      <th className="py-2 pr-3 font-medium">Крайний срок</th>
                      <th className="py-2 pr-3 font-medium">Статус</th>
                      <th className="py-2 font-medium">Действия</th>
                    </tr>
                  </thead>
                  <tbody>
                    {leads.map((lead) => (
                      <tr key={lead.id} className="border-b last:border-0">
                        <td className="py-3 pr-3 align-top">
                          <div className="font-medium">{lead.title}</div>
                          {lead.description && (
                            <p className="mt-1 line-clamp-2 text-slate-500">{lead.description}</p>
                          )}
                        </td>
                        <td className="py-3 pr-3 align-top">{lead.client_name}</td>
                        <td className="py-3 pr-3 align-top">
                          {lead.assigned_to_name || "—"}
                        </td>
                        <td className="py-3 pr-3 align-top whitespace-nowrap">
                          {formatScheduledDate(lead.scheduled_date)}
                        </td>
                        <td className="py-3 pr-3 align-top whitespace-nowrap">
                          {formatScheduledTime(lead.scheduled_time)}
                        </td>
                        <td className="py-3 pr-3 align-top whitespace-nowrap">
                          {formatDateTime(lead.deadline_at)}
                        </td>
                        <td className="py-3 pr-3 align-top">
                          <span
                            className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${statusBadgeClass(lead.status)}`}
                          >
                            {LEAD_STATUS_LABELS[lead.status]}
                          </span>
                        </td>
                        <td className="py-3 align-top">
                          <div className="flex flex-col gap-1">
                            <button
                              type="button"
                              onClick={() => {
                                setEditingLead(lead);
                                setSuccessMessage("");
                              }}
                              className="text-left text-slate-900 underline"
                            >
                              Изменить
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDelete(lead)}
                              className="text-left text-red-600 underline"
                            >
                              Удалить
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              </>
            )}
          </div>
        </div>
    </PageShell>
  );
}
