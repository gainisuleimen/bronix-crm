type PageShellProps = {
  children: React.ReactNode;
};

export function PageShell({ children }: PageShellProps) {
  return (
    <div className="min-h-[calc(100dvh-3.5rem)] bg-slate-50 text-slate-900">
      <div className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 sm:py-8 lg:py-10">
        {children}
      </div>
    </div>
  );
}
