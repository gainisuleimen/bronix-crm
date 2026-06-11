import { FormEvent, useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { getErrorMessage } from "../lib/errors";
import {
  datetimeLocalToIso,
  normalizeTimeValue,
  timeToInputValue,
  toDatetimeLocalValue,
} from "../lib/datetime";
import type { Client } from "../types/client";
import type { Lead, LeadPayload, LeadStatus } from "../types/lead";
import { LEAD_STATUS_LABELS, LEAD_STATUS_OPTIONS } from "../types/lead";
import type { TeamMember } from "../types/team";

type LeadFormProps = {
  clients: Client[];
  clientsLoading?: boolean;
  teamMembers: TeamMember[];
  teamLoading?: boolean;
  defaultAssigneeId?: number;
  initial?: Lead | null;
  onSubmit: (payload: LeadPayload) => Promise<void>;
  onCancel?: () => void;
};

const emptyForm = {
  client_id: "",
  title: "",
  description: "",
  status: "new" as LeadStatus,
  assigned_to_id: "",
  scheduled_date: "",
  scheduled_time: "",
  deadline_at: "",
};

function memberLabel(member: TeamMember): string {
  return member.full_name || member.email;
}

export function LeadForm({
  clients,
  clientsLoading = false,
  teamMembers,
  teamLoading = false,
  defaultAssigneeId,
  initial,
  onSubmit,
  onCancel,
}: LeadFormProps) {
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isEdit = Boolean(initial);

  useEffect(() => {
    if (initial) {
      setForm({
        client_id: String(initial.client_id),
        title: initial.title,
        description: initial.description ?? "",
        status: initial.status,
        assigned_to_id: initial.assigned_to_id ? String(initial.assigned_to_id) : "",
        scheduled_date: initial.scheduled_date ?? "",
        scheduled_time: timeToInputValue(initial.scheduled_time),
        deadline_at: toDatetimeLocalValue(initial.deadline_at),
      });
      return;
    }

    setForm({
      ...emptyForm,
      client_id: clients[0] ? String(clients[0].id) : "",
      assigned_to_id: defaultAssigneeId ? String(defaultAssigneeId) : "",
    });
  }, [initial?.id, defaultAssigneeId]);

  useEffect(() => {
    if (!initial && !form.client_id && clients[0]) {
      setForm((prev) => ({ ...prev, client_id: String(clients[0].id) }));
    }
  }, [clients, initial, form.client_id]);

  useEffect(() => {
    if (!initial && !form.assigned_to_id && defaultAssigneeId) {
      setForm((prev) => ({ ...prev, assigned_to_id: String(defaultAssigneeId) }));
    }
  }, [defaultAssigneeId, initial, form.assigned_to_id]);

  function buildPayload(): LeadPayload {
    return {
      client_id: Number(form.client_id),
      title: form.title.trim(),
      description: form.description.trim() || null,
      status: form.status,
      assigned_to_id: form.assigned_to_id ? Number(form.assigned_to_id) : null,
      scheduled_date: form.scheduled_date.trim() || null,
      scheduled_time: normalizeTimeValue(form.scheduled_time),
      deadline_at: datetimeLocalToIso(form.deadline_at),
    };
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError("");

    if (!form.client_id) {
      setError("Выберите клиента");
      return;
    }
    if (!form.title.trim()) {
      setError("Укажите название заявки");
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(buildPayload());
      if (!isEdit) {
        setForm({
          ...emptyForm,
          client_id: clients[0] ? String(clients[0].id) : "",
          assigned_to_id: defaultAssigneeId ? String(defaultAssigneeId) : "",
        });
      }
    } catch (err) {
      setError(getErrorMessage(err, "Не удалось сохранить заявку"));
    } finally {
      setIsSubmitting(false);
    }
  }

  if (clientsLoading || teamLoading) {
    return <p className="text-sm text-slate-500">Загрузка данных формы...</p>;
  }

  if (clients.length === 0) {
    return (
      <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
        <p className="font-medium">Сначала нужен клиент</p>
        <p className="mt-1">
          Заявку можно создать только для существующего клиента. Добавьте клиента на отдельной
          странице.
        </p>
        <Link
          to="/clients"
          className="mt-3 inline-flex rounded-lg bg-slate-900 px-4 py-2 text-white hover:bg-slate-800"
        >
          Перейти к клиентам
        </Link>
      </div>
    );
  }

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <div>
        <label className="mb-1 block text-sm font-medium text-slate-700" htmlFor="client_id">
          Клиент *
        </label>
        <select
          id="client_id"
          required
          className="w-full rounded-lg border px-3 py-2 outline-none focus:border-slate-500"
          value={form.client_id}
          onChange={(e) => setForm((prev) => ({ ...prev, client_id: e.target.value }))}
        >
          <option value="">Выберите клиента</option>
          {clients.map((client) => (
            <option key={client.id} value={client.id}>
              {client.full_name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-slate-700" htmlFor="assigned_to_id">
          Ответственный
        </label>
        <select
          id="assigned_to_id"
          className="w-full rounded-lg border px-3 py-2 outline-none focus:border-slate-500"
          value={form.assigned_to_id}
          onChange={(e) => setForm((prev) => ({ ...prev, assigned_to_id: e.target.value }))}
        >
          <option value="">Не назначен</option>
          {teamMembers.map((member) => (
            <option key={member.id} value={member.id}>
              {memberLabel(member)}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-slate-700" htmlFor="title">
          Название заявки *
        </label>
        <input
          id="title"
          required
          className="w-full rounded-lg border px-3 py-2 outline-none focus:border-slate-500"
          value={form.title}
          onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700" htmlFor="scheduled_date">
            Дата выполнения
          </label>
          <input
            id="scheduled_date"
            type="date"
            className="w-full rounded-lg border px-3 py-2 outline-none focus:border-slate-500"
            value={form.scheduled_date}
            onChange={(e) => setForm((prev) => ({ ...prev, scheduled_date: e.target.value }))}
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700" htmlFor="scheduled_time">
            Время выполнения
          </label>
          <input
            id="scheduled_time"
            type="time"
            className="w-full rounded-lg border px-3 py-2 outline-none focus:border-slate-500"
            value={form.scheduled_time}
            onChange={(e) => setForm((prev) => ({ ...prev, scheduled_time: e.target.value }))}
          />
        </div>
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-slate-700" htmlFor="deadline_at">
          Крайний срок выполнения
        </label>
        <input
          id="deadline_at"
          type="datetime-local"
          className="w-full rounded-lg border px-3 py-2 outline-none focus:border-slate-500"
          value={form.deadline_at}
          onChange={(e) => setForm((prev) => ({ ...prev, deadline_at: e.target.value }))}
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-slate-700" htmlFor="status">
          Статус
        </label>
        <select
          id="status"
          className="w-full rounded-lg border px-3 py-2 outline-none focus:border-slate-500"
          value={form.status}
          onChange={(e) =>
            setForm((prev) => ({ ...prev, status: e.target.value as LeadStatus }))
          }
        >
          {LEAD_STATUS_OPTIONS.map((status) => (
            <option key={status} value={status}>
              {LEAD_STATUS_LABELS[status]}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-slate-700" htmlFor="description">
          Описание
        </label>
        <textarea
          id="description"
          rows={4}
          className="w-full rounded-lg border px-3 py-2 outline-none focus:border-slate-500"
          value={form.description}
          onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
        />
      </div>

      {error && (
        <div className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>
      )}

      <div className="flex flex-wrap gap-2">
        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-60"
        >
          {isSubmitting ? "Сохранение..." : isEdit ? "Сохранить изменения" : "Добавить заявку"}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="rounded-lg border px-4 py-2 text-sm hover:bg-slate-50"
          >
            Отмена
          </button>
        )}
      </div>
    </form>
  );
}
