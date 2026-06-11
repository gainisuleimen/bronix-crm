import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { fetchDashboardSummary } from "../api/analytics";
import { DashboardStatCards } from "../components/dashboard/DashboardStatCards";
import { EmployeeCompletedBarChart } from "../components/dashboard/EmployeeCompletedBarChart";
import { LeadStatusPieChart } from "../components/dashboard/LeadStatusPieChart";
import { PageHeader } from "../components/layout/PageHeader";
import { PageShell } from "../components/layout/PageShell";
import { useAuth } from "../context/AuthContext";
import { getErrorMessage } from "../lib/errors";
import type { DashboardSummary } from "../types/analytics";

export function HomePage() {
  const { user } = useAuth();
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const loadDashboard = useCallback(async () => {
    setIsLoading(true);
    setError("");
    try {
      const data = await fetchDashboardSummary();
      setSummary(data);
    } catch (err) {
      setError(getErrorMessage(err, "Не удалось загрузить Dashboard"));
      setSummary(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  return (
    <PageShell>
      <PageHeader
        title="Dashboard"
        description={`Добро пожаловать, ${user?.full_name || user?.email}!`}
      >
        <button
          type="button"
          onClick={loadDashboard}
          disabled={isLoading}
          className="btn-secondary w-full sm:w-auto"
        >
          {isLoading ? "Обновление..." : "Обновить"}
        </button>
      </PageHeader>

      <div className="mt-4 flex flex-wrap gap-2 sm:gap-3">
        <Link to="/clients" className="btn-primary">
          Клиенты
        </Link>
        <Link to="/leads" className="btn-secondary">
          Заявки
        </Link>
        <Link to="/team" className="btn-secondary">
          Команда
        </Link>
      </div>

      {error && (
        <div className="mt-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
          <button type="button" className="ml-3 underline" onClick={loadDashboard}>
            Повторить
          </button>
        </div>
      )}

      {isLoading && !summary ? (
        <div className="mt-6 rounded-xl border bg-white px-4 py-12 text-center text-sm text-slate-500 sm:px-6">
          Загрузка Dashboard...
        </div>
      ) : summary ? (
        <div className="mt-6 space-y-6">
          <DashboardStatCards
            clientsTotal={summary.clients_total}
            leadsTotal={summary.leads_total}
            leadsNew={summary.leads_new}
            leadsInProgress={summary.leads_in_progress}
            leadsCompleted={summary.leads_completed}
            leadsCancelled={summary.leads_cancelled}
          />

          <div className="grid gap-6 md:grid-cols-2">
            <div className="rounded-xl border bg-white p-4 sm:p-5">
              <h2 className="text-lg font-medium">Распределение заявок</h2>
              <p className="mt-1 text-sm text-slate-600">Доля заявок по статусам</p>
              <div className="mt-4">
                <LeadStatusPieChart
                  leadsNew={summary.leads_new}
                  leadsInProgress={summary.leads_in_progress}
                  leadsCompleted={summary.leads_completed}
                  leadsCancelled={summary.leads_cancelled}
                />
              </div>
            </div>

            <div className="rounded-xl border bg-white p-4 sm:p-5">
              <h2 className="text-lg font-medium">Эффективность сотрудников</h2>
              <p className="mt-1 text-sm text-slate-600">
                Количество завершённых заявок по каждому сотруднику
              </p>
              <div className="mt-4">
                <EmployeeCompletedBarChart employees={summary.employees} />
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </PageShell>
  );
}
