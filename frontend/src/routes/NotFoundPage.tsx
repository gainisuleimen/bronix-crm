import { Link } from "react-router-dom";

import { PageShell } from "../components/layout/PageShell";

export function NotFoundPage() {
  return (
    <PageShell>
      <div className="mx-auto max-w-4xl">
        <h1 className="text-2xl font-semibold">Страница не найдена</h1>
        <p className="mt-2 text-slate-700">
          Проверьте адрес или вернитесь на главную.
        </p>
        <Link
          className="mt-5 inline-flex rounded-lg bg-slate-900 px-4 py-2 text-white"
          to="/"
        >
          На главную
        </Link>
      </div>
    </PageShell>
  );
}

