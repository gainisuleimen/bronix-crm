import type { EmployeeAnalytics } from "../types/analytics";

const ROLE_LABELS: Record<EmployeeAnalytics["role"], string> = {
  admin: "Администратор",
  manager: "Менеджер",
};

type EmployeeAnalyticsTableProps = {
  rows: EmployeeAnalytics[];
  isLoading: boolean;
  error: string;
  onRetry?: () => void;
};

function StatCell({ value, tone }: { value: number; tone?: "default" | "blue" | "amber" | "green" | "slate" }) {
  const toneClass =
    tone === "blue"
      ? "bg-blue-50 text-blue-800"
      : tone === "amber"
        ? "bg-amber-50 text-amber-800"
        : tone === "green"
          ? "bg-green-50 text-green-800"
          : tone === "slate"
            ? "bg-slate-100 text-slate-700"
            : "bg-slate-50 text-slate-900";

  return (
    <span className={`inline-flex min-w-8 justify-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${toneClass}`}>
      {value}
    </span>
  );
}

export function EmployeeAnalyticsTable({
  rows,
  isLoading,
  error,
  onRetry,
}: EmployeeAnalyticsTableProps) {
  if (isLoading) {
    return <p className="text-sm text-slate-500">Загрузка аналитики...</p>;
  }

  if (error) {
    return (
      <div className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
        {error}
        {onRetry && (
          <button type="button" className="ml-3 underline" onClick={onRetry}>
            Повторить
          </button>
        )}
      </div>
    );
  }

  if (rows.length === 0) {
    return (
      <p className="text-sm text-slate-500">
        Нет данных по сотрудникам. Назначьте ответственных в заявках.
      </p>
    );
  }

  return (
    <>
      <div className="space-y-3 lg:hidden">
        {rows.map((row) => (
          <article key={row.user_id} className="rounded-xl border bg-slate-50 p-4">
            <div className="font-medium text-slate-900">{row.full_name || "Без имени"}</div>
            <p className="mt-1 text-sm text-slate-600">{row.email}</p>
            <p className="text-sm text-slate-500">{ROLE_LABELS[row.role] ?? row.role}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              <StatCell value={row.total} />
              <StatCell value={row.new} tone="blue" />
              <StatCell value={row.in_progress} tone="amber" />
              <StatCell value={row.completed} tone="green" />
              <StatCell value={row.cancelled} tone="slate" />
            </div>
            <p className="mt-2 text-xs text-slate-500">
              Всего · Новые · В работе · Завершённые · Отменённые
            </p>
          </article>
        ))}
      </div>

      <div className="hidden overflow-x-auto lg:block">
        <table className="w-full min-w-[860px] text-left text-sm">
          <thead>
            <tr className="border-b text-slate-500">
              <th className="py-2 pr-3 font-medium">Сотрудник</th>
              <th className="py-2 pr-3 font-medium">Email</th>
              <th className="py-2 pr-3 font-medium">Роль</th>
              <th className="py-2 pr-3 font-medium">Всего</th>
              <th className="py-2 pr-3 font-medium">Новые</th>
              <th className="py-2 pr-3 font-medium">В работе</th>
              <th className="py-2 pr-3 font-medium">Завершённые</th>
              <th className="py-2 font-medium">Отменённые</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.user_id} className="border-b last:border-0">
                <td className="py-3 pr-3 align-top font-medium">
                  {row.full_name || "Без имени"}
                </td>
                <td className="py-3 pr-3 align-top">{row.email}</td>
                <td className="py-3 pr-3 align-top">{ROLE_LABELS[row.role] ?? row.role}</td>
                <td className="py-3 pr-3 align-top">
                  <StatCell value={row.total} />
                </td>
                <td className="py-3 pr-3 align-top">
                  <StatCell value={row.new} tone="blue" />
                </td>
                <td className="py-3 pr-3 align-top">
                  <StatCell value={row.in_progress} tone="amber" />
                </td>
                <td className="py-3 pr-3 align-top">
                  <StatCell value={row.completed} tone="green" />
                </td>
                <td className="py-3 align-top">
                  <StatCell value={row.cancelled} tone="slate" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
