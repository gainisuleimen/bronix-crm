import { useCallback, useEffect, useState } from "react";

import { createClient, deleteClient, fetchClients, updateClient } from "../api/clients";
import { ClientForm } from "../components/ClientForm";
import { PageHeader } from "../components/layout/PageHeader";
import { PageShell } from "../components/layout/PageShell";
import { DetailRow } from "../components/ui/DetailRow";
import { getErrorMessage } from "../lib/errors";
import { exportClientsToExcel } from "../lib/exportClients";
import type { Client, ClientPayload } from "../types/client";

function formatDate(value: string) {
  return new Date(value).toLocaleString("ru-RU", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [exportMessage, setExportMessage] = useState("");
  const [isExporting, setIsExporting] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);

  const loadClients = useCallback(async (query?: string) => {
    setIsLoading(true);
    setError("");
    try {
      const data = await fetchClients(query);
      setClients(data);
    } catch (err) {
      setError(getErrorMessage(err, "Не удалось загрузить клиентов"));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadClients(search || undefined);
  }, [loadClients, search]);

  async function handleCreate(payload: ClientPayload) {
    await createClient(payload);
    setEditingClient(null);
    await loadClients(search || undefined);
  }

  async function handleUpdate(payload: ClientPayload) {
    if (!editingClient) return;
    await updateClient(editingClient.id, payload);
    setEditingClient(null);
    await loadClients(search || undefined);
  }

  async function handleDelete(client: Client) {
    const confirmed = window.confirm(`Удалить клиента «${client.full_name}»?`);
    if (!confirmed) return;

    try {
      await deleteClient(client.id);
      if (editingClient?.id === client.id) {
        setEditingClient(null);
      }
      await loadClients(search || undefined);
    } catch (err) {
      setError(getErrorMessage(err, "Не удалось удалить клиента"));
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
      const count = await exportClientsToExcel(search || undefined);
      setExportMessage(
        count > 0
          ? `Экспортировано клиентов: ${count}`
          : "Нет клиентов для экспорта — файл не создан",
      );
    } catch (err) {
      setError(getErrorMessage(err, "Не удалось экспортировать клиентов"));
    } finally {
      setIsExporting(false);
    }
  }

  return (
    <PageShell>
        <PageHeader title="Клиенты" description="Учёт клиентов CRM-системы">
          <form className="flex w-full flex-col gap-2 sm:flex-row sm:items-center" onSubmit={handleSearchSubmit}>
            <input
              type="search"
              placeholder="Поиск по имени, телефону, email..."
              className="input-field sm:max-w-xs"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
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
          <div className="mt-4 rounded-lg bg-green-50 px-4 py-3 text-sm text-green-800">
            {exportMessage}
          </div>
        )}

        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          <div className="order-2 rounded-xl border bg-white p-4 sm:p-5 lg:order-1">
            <h2 className="text-lg font-medium">
              {editingClient ? "Редактирование клиента" : "Новый клиент"}
            </h2>
            <div className="mt-4">
              <ClientForm
                key={editingClient?.id ?? "new"}
                initial={editingClient}
                onSubmit={editingClient ? handleUpdate : handleCreate}
                onCancel={editingClient ? () => setEditingClient(null) : undefined}
              />
            </div>
          </div>

          <div className="order-1 rounded-xl border bg-white p-4 sm:p-5 lg:order-2">
            <div className="flex items-center justify-between gap-2">
              <h2 className="text-lg font-medium">Список клиентов</h2>
              <span className="text-sm text-slate-500">Всего: {clients.length}</span>
            </div>

            {error && (
              <div className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>
            )}

            {isLoading ? (
              <p className="mt-6 text-sm text-slate-500">Загрузка...</p>
            ) : clients.length === 0 ? (
              <p className="mt-6 text-sm text-slate-500">
                {search ? "Ничего не найдено" : "Клиентов пока нет. Добавьте первого."}
              </p>
            ) : (
              <>
                <div className="mt-4 space-y-3 md:hidden">
                  {clients.map((client) => (
                    <article key={client.id} className="rounded-xl border bg-slate-50 p-4">
                      <div className="font-medium text-slate-900">{client.full_name}</div>
                      <div className="mt-3 space-y-2">
                        <DetailRow label="Телефон" value={client.phone || "—"} />
                        <DetailRow label="Email" value={client.email || "—"} />
                        <DetailRow label="Создан" value={formatDate(client.created_at)} />
                      </div>
                      <div className="mt-4 flex gap-3">
                        <button
                          type="button"
                          onClick={() => setEditingClient(client)}
                          className="min-h-10 text-sm text-slate-900 underline"
                        >
                          Изменить
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(client)}
                          className="min-h-10 text-sm text-red-600 underline"
                        >
                          Удалить
                        </button>
                      </div>
                    </article>
                  ))}
                </div>

                <div className="mt-4 hidden overflow-x-auto md:block">
                  <table className="w-full min-w-[640px] text-left text-sm">
                    <thead>
                      <tr className="border-b text-slate-500">
                        <th className="py-2 pr-3 font-medium">ФИО</th>
                        <th className="py-2 pr-3 font-medium">Телефон</th>
                        <th className="py-2 pr-3 font-medium">Email</th>
                        <th className="py-2 pr-3 font-medium">Создан</th>
                        <th className="py-2 font-medium">Действия</th>
                      </tr>
                    </thead>
                    <tbody>
                      {clients.map((client) => (
                        <tr key={client.id} className="border-b last:border-0">
                          <td className="py-3 pr-3 align-top font-medium">{client.full_name}</td>
                          <td className="py-3 pr-3 align-top">{client.phone || "—"}</td>
                          <td className="py-3 pr-3 align-top">{client.email || "—"}</td>
                          <td className="py-3 pr-3 align-top whitespace-nowrap">
                            {formatDate(client.created_at)}
                          </td>
                          <td className="py-3 align-top">
                            <div className="flex flex-col gap-1">
                              <button
                                type="button"
                                onClick={() => setEditingClient(client)}
                                className="text-left text-slate-900 underline"
                              >
                                Изменить
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDelete(client)}
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

        {clients.some((c) => c.address || c.comment) && (
          <div className="mt-6 rounded-xl border bg-white p-4 sm:p-5">
            <h2 className="text-lg font-medium">Дополнительные данные</h2>
            <div className="mt-4 space-y-3">
              {clients.map((client) =>
                client.address || client.comment ? (
                  <div key={`extra-${client.id}`} className="rounded-lg border p-3 text-sm">
                    <div className="font-medium">{client.full_name}</div>
                    {client.address && (
                      <p className="mt-1 text-slate-600">
                        <span className="text-slate-500">Адрес:</span> {client.address}
                      </p>
                    )}
                    {client.comment && (
                      <p className="mt-1 text-slate-600">
                        <span className="text-slate-500">Комментарий:</span> {client.comment}
                      </p>
                    )}
                  </div>
                ) : null,
              )}
            </div>
          </div>
        )}
    </PageShell>
  );
}
