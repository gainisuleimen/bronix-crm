type DetailRowProps = {
  label: string;
  value: React.ReactNode;
};

export function DetailRow({ label, value }: DetailRowProps) {
  return (
    <div className="flex flex-col gap-0.5 sm:flex-row sm:gap-2">
      <span className="shrink-0 text-xs font-medium uppercase tracking-wide text-slate-500 sm:w-28 sm:normal-case sm:tracking-normal">
        {label}
      </span>
      <span className="min-w-0 break-words text-sm text-slate-900">{value}</span>
    </div>
  );
}
