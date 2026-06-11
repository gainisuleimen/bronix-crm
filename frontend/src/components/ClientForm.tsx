import { FormEvent, useEffect, useState } from "react";

import { getErrorMessage } from "../lib/errors";
import type { Client, ClientPayload } from "../types/client";

type ClientFormProps = {
  initial?: Client | null;
  onSubmit: (payload: ClientPayload) => Promise<void>;
  onCancel?: () => void;
};

const emptyForm = {
  full_name: "",
  phone: "",
  email: "",
  address: "",
  comment: "",
};

export function ClientForm({ initial, onSubmit, onCancel }: ClientFormProps) {
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isEdit = Boolean(initial);

  useEffect(() => {
    if (initial) {
      setForm({
        full_name: initial.full_name,
        phone: initial.phone ?? "",
        email: initial.email ?? "",
        address: initial.address ?? "",
        comment: initial.comment ?? "",
      });
    } else {
      setForm(emptyForm);
    }
  }, [initial]);

  function updateField(field: keyof typeof form, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function buildPayload(): ClientPayload {
    return {
      full_name: form.full_name.trim(),
      phone: form.phone.trim() || null,
      email: form.email.trim() || null,
      address: form.address.trim() || null,
      comment: form.comment.trim() || null,
    };
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError("");

    if (!form.full_name.trim()) {
      setError("Укажите ФИО клиента");
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(buildPayload());
      if (!isEdit) {
        setForm(emptyForm);
      }
    } catch (err) {
      setError(getErrorMessage(err, "Не удалось сохранить клиента"));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label className="mb-1 block text-sm font-medium text-slate-700" htmlFor="full_name">
            ФИО *
          </label>
          <input
            id="full_name"
            required
            className="w-full rounded-lg border px-3 py-2 outline-none focus:border-slate-500"
            value={form.full_name}
            onChange={(e) => updateField("full_name", e.target.value)}
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700" htmlFor="phone">
            Телефон
          </label>
          <input
            id="phone"
            className="w-full rounded-lg border px-3 py-2 outline-none focus:border-slate-500"
            value={form.phone}
            onChange={(e) => updateField("phone", e.target.value)}
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700" htmlFor="email">
            Email
          </label>
          <input
            id="email"
            type="email"
            className="w-full rounded-lg border px-3 py-2 outline-none focus:border-slate-500"
            value={form.email}
            onChange={(e) => updateField("email", e.target.value)}
          />
        </div>

        <div className="sm:col-span-2">
          <label className="mb-1 block text-sm font-medium text-slate-700" htmlFor="address">
            Адрес
          </label>
          <input
            id="address"
            className="w-full rounded-lg border px-3 py-2 outline-none focus:border-slate-500"
            value={form.address}
            onChange={(e) => updateField("address", e.target.value)}
          />
        </div>

        <div className="sm:col-span-2">
          <label className="mb-1 block text-sm font-medium text-slate-700" htmlFor="comment">
            Комментарий
          </label>
          <textarea
            id="comment"
            rows={3}
            className="w-full rounded-lg border px-3 py-2 outline-none focus:border-slate-500"
            value={form.comment}
            onChange={(e) => updateField("comment", e.target.value)}
          />
        </div>
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
          {isSubmitting ? "Сохранение..." : isEdit ? "Сохранить изменения" : "Добавить клиента"}
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
