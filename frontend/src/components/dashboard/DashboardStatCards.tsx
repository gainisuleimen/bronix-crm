type StatCardProps = {
  label: string;
  value: number;
  tone?: "default" | "blue" | "amber" | "green" | "slate" | "violet";
};

const toneClasses: Record<NonNullable<StatCardProps["tone"]>, string> = {
  default: "border-slate-200 bg-white text-slate-900",
  blue: "border-blue-100 bg-blue-50 text-blue-900",
  amber: "border-amber-100 bg-amber-50 text-amber-900",
  green: "border-green-100 bg-green-50 text-green-900",
  slate: "border-slate-200 bg-slate-100 text-slate-800",
  violet: "border-violet-100 bg-violet-50 text-violet-900",
};

function StatCard({ label, value, tone = "default" }: StatCardProps) {
  return (
    <div className={`rounded-xl border p-3 sm:p-4 ${toneClasses[tone]}`}>
      <div className="text-xs text-slate-600 sm:text-sm">{label}</div>
      <div className="mt-1 text-2xl font-semibold sm:mt-2 sm:text-3xl">{value}</div>
    </div>
  );
}

type DashboardStatCardsProps = {
  clientsTotal: number;
  leadsTotal: number;
  leadsNew: number;
  leadsInProgress: number;
  leadsCompleted: number;
  leadsCancelled: number;
};

export function DashboardStatCards({
  clientsTotal,
  leadsTotal,
  leadsNew,
  leadsInProgress,
  leadsCompleted,
  leadsCancelled,
}: DashboardStatCardsProps) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-6">
      <StatCard label="Клиенты" value={clientsTotal} tone="violet" />
      <StatCard label="Заявки" value={leadsTotal} />
      <StatCard label="Новые" value={leadsNew} tone="blue" />
      <StatCard label="В работе" value={leadsInProgress} tone="amber" />
      <StatCard label="Завершённые" value={leadsCompleted} tone="green" />
      <StatCard label="Отменённые" value={leadsCancelled} tone="slate" />
    </div>
  );
}
