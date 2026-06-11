import { Link } from "react-router-dom";

type AuthLayoutProps = {
  title: string;
  subtitle: string;
  children: React.ReactNode;
  footerText: string;
  footerLink: string;
  footerLinkLabel: string;
};

export function AuthLayout({
  title,
  subtitle,
  children,
  footerText,
  footerLink,
  footerLinkLabel,
}: AuthLayoutProps) {
  return (
    <div className="flex min-h-[calc(100dvh-3.5rem)] items-center justify-center bg-slate-50 px-4 py-8 sm:py-10">
      <div className="w-full max-w-md rounded-2xl border bg-white p-6 shadow-sm sm:p-8">
        <h1 className="text-2xl font-semibold text-slate-900">{title}</h1>
        <p className="mt-2 text-sm text-slate-600">{subtitle}</p>
        <div className="mt-6">{children}</div>
        <p className="mt-6 text-center text-sm text-slate-600">
          {footerText}{" "}
          <Link className="font-medium text-slate-900 underline" to={footerLink}>
            {footerLinkLabel}
          </Link>
        </p>
      </div>
    </div>
  );
}
