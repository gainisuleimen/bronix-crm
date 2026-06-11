import {
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

type LeadStatusSlice = {
  name: string;
  value: number;
  color: string;
};

type LeadStatusPieChartProps = {
  leadsNew: number;
  leadsInProgress: number;
  leadsCompleted: number;
  leadsCancelled: number;
};

const STATUS_COLORS = {
  new: "#3b82f6",
  in_progress: "#f59e0b",
  completed: "#22c55e",
  cancelled: "#64748b",
} as const;

export function LeadStatusPieChart({
  leadsNew,
  leadsInProgress,
  leadsCompleted,
  leadsCancelled,
}: LeadStatusPieChartProps) {
  const data: LeadStatusSlice[] = [
    { name: "Новые", value: leadsNew, color: STATUS_COLORS.new },
    { name: "В работе", value: leadsInProgress, color: STATUS_COLORS.in_progress },
    { name: "Завершённые", value: leadsCompleted, color: STATUS_COLORS.completed },
    { name: "Отменённые", value: leadsCancelled, color: STATUS_COLORS.cancelled },
  ].filter((item) => item.value > 0);

  const total = leadsNew + leadsInProgress + leadsCompleted + leadsCancelled;

  if (total === 0) {
    return (
      <div className="flex h-[220px] items-center justify-center text-sm text-slate-500 sm:h-72">
        Нет заявок для отображения
      </div>
    );
  }

  return (
    <div className="h-[220px] w-full sm:h-72">
      <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie
          data={data}
          dataKey="value"
          nameKey="name"
          cx="50%"
          cy="50%"
          innerRadius={56}
          outerRadius={96}
          paddingAngle={2}
        >
          {data.map((entry) => (
            <Cell key={entry.name} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip
          formatter={(value) => [`${value ?? 0} шт.`, "Количество"]}
          contentStyle={{ borderRadius: "0.5rem", borderColor: "#e2e8f0" }}
        />
        <Legend />
      </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
