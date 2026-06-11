import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import type { EmployeeAnalytics } from "../../types/analytics";

type EmployeeCompletedBarChartProps = {
  employees: EmployeeAnalytics[];
};

function employeeLabel(employee: EmployeeAnalytics): string {
  const name = employee.full_name || employee.email;
  return name.length > 14 ? `${name.slice(0, 12)}…` : name;
}

export function EmployeeCompletedBarChart({ employees }: EmployeeCompletedBarChartProps) {
  const data = employees.map((employee) => ({
    name: employeeLabel(employee),
    completed: employee.completed,
    fullName: employee.full_name || employee.email,
  }));

  if (data.length === 0) {
    return (
      <div className="flex h-[220px] items-center justify-center text-sm text-slate-500 sm:h-72">
        Нет данных по сотрудникам
      </div>
    );
  }

  return (
    <div className="h-[240px] w-full sm:h-72">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 4, left: 0, bottom: 4 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
          <XAxis
            dataKey="name"
            tick={{ fontSize: 11 }}
            interval={0}
            angle={-35}
            textAnchor="end"
            height={80}
          />
          <YAxis allowDecimals={false} tick={{ fontSize: 11 }} width={28} />
          <Tooltip
            formatter={(value) => [`${value ?? 0} шт.`, "Завершённые"]}
            labelFormatter={(_, payload) =>
              (payload?.[0]?.payload as { fullName?: string })?.fullName ?? ""
            }
            contentStyle={{ borderRadius: "0.5rem", borderColor: "#e2e8f0" }}
          />
          <Bar dataKey="completed" fill="#22c55e" radius={[6, 6, 0, 0]} maxBarSize={48} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
