import { useCallback, useEffect, useState } from "react";

import {
  deleteTeamMember,
  deleteTeamMemberPhoto,
  fetchTeamMembers,
  updateTeamMember,
  uploadTeamMemberPhoto,
} from "../api/team";
import { TeamMemberForm } from "../components/TeamMemberForm";
import { PageHeader } from "../components/layout/PageHeader";
import { PageShell } from "../components/layout/PageShell";
import { useAuth } from "../context/AuthContext";
import { getErrorMessage } from "../lib/errors";
import { exportTeamToExcel } from "../lib/exportTeam";
import { resolveMediaUrl } from "../lib/media";
import type { TeamMember, TeamMemberUpdatePayload } from "../types/team";

const ROLE_LABELS: Record<TeamMember["role"], string> = {
  admin: "Администратор",
  manager: "Менеджер",
};

function getInitials(member: TeamMember): string {
  const source = member.full_name?.trim() || member.email;
  const parts = source.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return source.slice(0, 2).toUpperCase();
}

function canEditMember(currentUserId: number, currentUserRole: string, member: TeamMember): boolean {
  return member.id === currentUserId || currentUserRole === "admin";
}

function MemberAvatar({ member }: { member: TeamMember }) {
  const [photoFailed, setPhotoFailed] = useState(false);
  const photoUrl = resolveMediaUrl(member.photo_url);
  const showPhoto = photoUrl && !photoFailed;

  if (showPhoto) {
    return (
      <img
        src={photoUrl}
        alt={member.full_name || member.email}
        className="h-24 w-24 rounded-full border-4 border-white object-cover shadow-sm"
        onError={() => setPhotoFailed(true)}
      />
    );
  }

  return (
    <div className="flex h-24 w-24 items-center justify-center rounded-full border-4 border-white bg-slate-200 text-xl font-semibold text-slate-600 shadow-sm">
      {getInitials(member)}
    </div>
  );
}

type TeamMemberCardProps = {
  member: TeamMember;
  canEdit: boolean;
  canDelete: boolean;
  isEditing: boolean;
  onEdit: () => void;
  onDelete: () => void;
};

function TeamMemberCard({
  member,
  canEdit,
  canDelete,
  isEditing,
  onEdit,
  onDelete,
}: TeamMemberCardProps) {
  return (
    <article
      className={`overflow-hidden rounded-xl border bg-white shadow-sm transition hover:shadow-md ${
        isEditing ? "ring-2 ring-slate-900" : ""
      }`}
    >
      <div className="bg-gradient-to-br from-slate-800 to-slate-600 px-6 pb-12 pt-8">
        <div className="-mb-12 flex justify-center">
          <MemberAvatar member={member} />
        </div>
      </div>

      <div className="px-6 pb-6 pt-16 text-center">
        <h2 className="text-lg font-semibold text-slate-900">
          {member.full_name || "Без имени"}
        </h2>
        {member.position && (
          <p className="mt-1 text-sm text-slate-500">{member.position}</p>
        )}
        <span className="mt-3 inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
          {ROLE_LABELS[member.role] ?? member.role}
        </span>
      </div>

      <dl className="space-y-3 border-t px-6 py-5 text-sm">
        <div>
          <dt className="text-slate-500">Email</dt>
          <dd className="mt-0.5 break-all font-medium text-slate-900">{member.email}</dd>
        </div>
        <div>
          <dt className="text-slate-500">Телефон</dt>
          <dd className="mt-0.5 font-medium text-slate-900">{member.phone || "—"}</dd>
        </div>
      </dl>

      {(canEdit || canDelete) && (
        <div className="space-y-2 border-t px-6 py-4">
          {canEdit && (
            <button
              type="button"
              onClick={onEdit}
              className="w-full rounded-lg border px-3 py-2 text-sm hover:bg-slate-50"
            >
              {isEditing ? "Редактируется" : "Редактировать профиль"}
            </button>
          )}
          {canDelete && (
            <button
              type="button"
              onClick={onDelete}
              className="w-full rounded-lg border border-red-200 px-3 py-2 text-sm text-red-600 hover:bg-red-50"
            >
              Удалить сотрудника
            </button>
          )}
        </div>
      )}
    </article>
  );
}

export function TeamPage() {
  const { user, refreshUser } = useAuth();
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [exportMessage, setExportMessage] = useState("");
  const [isExporting, setIsExporting] = useState(false);
  const [editingMember, setEditingMember] = useState<TeamMember | null>(null);

  const loadMembers = useCallback(async (query?: string) => {
    setIsLoading(true);
    setError("");
    try {
      const data = await fetchTeamMembers(query);
      setMembers(data);
      setEditingMember((current) => {
        if (!current) return null;
        return data.find((member) => member.id === current.id) ?? null;
      });
    } catch (err) {
      setError(getErrorMessage(err, "Не удалось загрузить команду"));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadMembers(search || undefined);
  }, [loadMembers, search]);

  async function handleUpdate(
    payload: TeamMemberUpdatePayload,
    photoFile: File | null,
  ) {
    if (!editingMember) return;

    if (photoFile) {
      await uploadTeamMemberPhoto(editingMember.id, photoFile);
    }

    await updateTeamMember(editingMember.id, payload);

    if (user?.id === editingMember.id) {
      await refreshUser();
    }

    await loadMembers(search || undefined);
  }

  async function handleRemovePhoto() {
    if (!editingMember) return;

    await deleteTeamMemberPhoto(editingMember.id);

    if (user?.id === editingMember.id) {
      await refreshUser();
    }

    await loadMembers(search || undefined);
  }

  async function handleDelete(member: TeamMember) {
    const name = member.full_name || member.email;
    const confirmed = window.confirm(`Удалить сотрудника «${name}»? Это действие нельзя отменить.`);
    if (!confirmed) return;

    setError("");
    try {
      await deleteTeamMember(member.id);
      if (editingMember?.id === member.id) {
        setEditingMember(null);
      }
      await loadMembers(search || undefined);
    } catch (err) {
      setError(getErrorMessage(err, "Не удалось удалить сотрудника"));
    }
  }

  function handleSearchSubmit(event: React.FormEvent) {
    event.preventDefault();
    setSearch(searchInput.trim());
  }

  function clearSearch() {
    setSearchInput("");
    setSearch("");
  }

  async function handleExport() {
    setExportMessage("");
    setIsExporting(true);
    try {
      const count = await exportTeamToExcel(search || undefined);
      setExportMessage(
        count > 0
          ? `Экспортировано сотрудников: ${count}`
          : "Нет сотрудников для экспорта — файл не создан",
      );
    } catch (err) {
      setError(getErrorMessage(err, "Не удалось экспортировать команду"));
    } finally {
      setIsExporting(false);
    }
  }

  return (
    <PageShell>
        <PageHeader
          title="Команда"
          description="Сотрудники компании и их контактные данные"
        >
          <form
            onSubmit={handleSearchSubmit}
            className="flex w-full flex-col gap-2 sm:flex-row sm:items-center"
          >
            <input
              type="search"
              value={searchInput}
              onChange={(event) => setSearchInput(event.target.value)}
              placeholder="Поиск по имени, email, телефону..."
              className="input-field sm:max-w-xs"
            />
            <div className="flex gap-2">
              <button type="submit" className="btn-primary flex-1 sm:flex-none">
                Найти
              </button>
              {search && (
                <button type="button" onClick={clearSearch} className="btn-secondary">
                  Сброс
                </button>
              )}
            </div>
          </form>
          <button
            type="button"
            onClick={handleExport}
            disabled={isExporting}
            className="btn-secondary w-full sm:w-auto"
          >
            {isExporting ? "Экспорт..." : "Экспорт в Excel"}
          </button>
        </PageHeader>

        {exportMessage && (
          <div className="mb-4 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">
            {exportMessage}
          </div>
        )}

        {error && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-2">
          <div className="order-2 rounded-xl border bg-white p-4 sm:p-5 lg:sticky lg:top-20 lg:order-1 lg:self-start">
            <h2 className="text-lg font-medium">
              {editingMember ? "Редактирование профиля" : "Профиль сотрудника"}
            </h2>
            <p className="mt-1 text-sm text-slate-600">
              {editingMember
                ? "Измените имя, должность, телефон или загрузите фото"
                : "Выберите карточку сотрудника, чтобы отредактировать профиль"}
            </p>

            <div className="mt-4">
              {editingMember ? (
                <TeamMemberForm
                  key={editingMember.id}
                  initial={editingMember}
                  onSubmit={handleUpdate}
                  onRemovePhoto={handleRemovePhoto}
                  onCancel={() => setEditingMember(null)}
                />
              ) : (
                <div className="rounded-lg border border-dashed px-4 py-8 text-center text-sm text-slate-500">
                  Нажмите «Редактировать профиль» на своей карточке или на карточке сотрудника,
                  если вы администратор.
                </div>
              )}
            </div>
          </div>

          <div className="order-1 lg:order-2">
            {isLoading ? (
              <div className="rounded-xl border bg-white px-6 py-12 text-center text-slate-500">
                Загрузка...
              </div>
            ) : members.length === 0 ? (
              <div className="rounded-xl border bg-white px-6 py-12 text-center text-slate-500">
                {search ? "Сотрудники не найдены" : "В команде пока нет активных сотрудников"}
              </div>
            ) : (
              <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-2">
                {members.map((member) => {
                  const editable = user
                    ? canEditMember(user.id, user.role, member)
                    : false;
                  const deletable =
                    user?.role === "admin" && user.id !== member.id;

                  return (
                    <TeamMemberCard
                      key={member.id}
                      member={member}
                      canEdit={editable}
                      canDelete={deletable}
                      isEditing={editingMember?.id === member.id}
                      onEdit={() => setEditingMember(member)}
                      onDelete={() => handleDelete(member)}
                    />
                  );
                })}
              </div>
            )}
          </div>
        </div>
    </PageShell>
  );
}
