import { FormEvent, useEffect, useMemo, useState } from "react";

import { getErrorMessage } from "../lib/errors";
import { resolveMediaUrl } from "../lib/media";
import type { TeamMember, TeamMemberUpdatePayload } from "../types/team";

type TeamMemberFormProps = {
  initial: TeamMember;
  onSubmit: (payload: TeamMemberUpdatePayload, photoFile: File | null) => Promise<void>;
  onRemovePhoto: () => Promise<void>;
  onCancel?: () => void;
};

const emptyForm = {
  full_name: "",
  phone: "",
  position: "",
};

export function TeamMemberForm({
  initial,
  onSubmit,
  onRemovePhoto,
  onCancel,
}: TeamMemberFormProps) {
  const [form, setForm] = useState(emptyForm);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRemovingPhoto, setIsRemovingPhoto] = useState(false);

  const currentPhotoUrl = useMemo(
    () => resolveMediaUrl(photoPreview ?? initial.photo_url),
    [initial.photo_url, photoPreview],
  );

  useEffect(() => {
    setForm({
      full_name: initial.full_name ?? "",
      phone: initial.phone ?? "",
      position: initial.position ?? "",
    });
    setPhotoFile(null);
    setPhotoPreview(null);
    setError("");
  }, [initial]);

  useEffect(() => {
    if (!photoFile) {
      setPhotoPreview(null);
      return;
    }

    const objectUrl = URL.createObjectURL(photoFile);
    setPhotoPreview(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [photoFile]);

  function updateField(field: keyof typeof form, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function buildPayload(): TeamMemberUpdatePayload {
    return {
      full_name: form.full_name.trim(),
      phone: form.phone.trim() || null,
      position: form.position.trim() || null,
    };
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError("");

    if (!form.full_name.trim()) {
      setError("Укажите ФИО сотрудника");
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(buildPayload(), photoFile);
    } catch (err) {
      setError(getErrorMessage(err, "Не удалось сохранить профиль"));
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleRemovePhoto() {
    if (!initial.photo_url && !photoFile) return;

    const confirmed = window.confirm("Удалить фото профиля?");
    if (!confirmed) return;

    setIsRemovingPhoto(true);
    setError("");
    try {
      if (photoFile) {
        setPhotoFile(null);
        return;
      }
      await onRemovePhoto();
    } catch (err) {
      setError(getErrorMessage(err, "Не удалось удалить фото"));
    } finally {
      setIsRemovingPhoto(false);
    }
  }

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <div className="flex items-center gap-4">
        {currentPhotoUrl ? (
          <img
            src={currentPhotoUrl}
            alt={initial.full_name || initial.email}
            className="h-20 w-20 rounded-full border object-cover"
          />
        ) : (
          <div className="flex h-20 w-20 items-center justify-center rounded-full border bg-slate-100 text-sm text-slate-500">
            Нет фото
          </div>
        )}

        <div className="space-y-2">
          <label className="block text-sm font-medium text-slate-700" htmlFor="photo">
            Фото профиля
          </label>
          <input
            id="photo"
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            className="block w-full text-sm text-slate-600 file:mr-3 file:rounded-lg file:border-0 file:bg-slate-900 file:px-3 file:py-2 file:text-sm file:text-white hover:file:bg-slate-800"
            onChange={(event) => setPhotoFile(event.target.files?.[0] ?? null)}
          />
          {(initial.photo_url || photoFile) && (
            <button
              type="button"
              onClick={handleRemovePhoto}
              disabled={isRemovingPhoto}
              className="text-sm text-red-600 underline disabled:opacity-60"
            >
              {isRemovingPhoto ? "Удаление..." : "Удалить фото"}
            </button>
          )}
        </div>
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-slate-700" htmlFor="email">
          Email
        </label>
        <input
          id="email"
          disabled
          className="w-full rounded-lg border bg-slate-50 px-3 py-2 text-slate-500"
          value={initial.email}
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-slate-700" htmlFor="full_name">
          ФИО *
        </label>
        <input
          id="full_name"
          required
          className="w-full rounded-lg border px-3 py-2 outline-none focus:border-slate-500"
          value={form.full_name}
          onChange={(event) => updateField("full_name", event.target.value)}
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-slate-700" htmlFor="position">
          Должность
        </label>
        <input
          id="position"
          className="w-full rounded-lg border px-3 py-2 outline-none focus:border-slate-500"
          value={form.position}
          onChange={(event) => updateField("position", event.target.value)}
          placeholder="Менеджер по продажам"
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
          onChange={(event) => updateField("phone", event.target.value)}
          placeholder="+7 (999) 123-45-67"
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
          {isSubmitting ? "Сохранение..." : "Сохранить изменения"}
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
