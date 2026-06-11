import { Link } from "react-router-dom";

import { PageShell } from "../components/layout/PageShell";

const ADVANTAGES = [
  {
    title: "Единая база клиентов",
    description: "Все контакты, история заявок и коммуникации хранятся в одном месте.",
  },
  {
    title: "Контроль заявок",
    description: "Статусы, ответственные, даты и крайние сроки — ничего не теряется.",
  },
  {
    title: "Аналитика команды",
    description: "Dashboard с показателями эффективности каждого сотрудника.",
  },
  {
    title: "Экспорт данных",
    description: "Выгрузка клиентов в Excel для отчётов и резервного копирования.",
  },
];

const AUDIENCE = [
  "Малый и средний бизнес",
  "Отделы продаж и клиентского сервиса",
  "Агентства и студии с проектной работой",
  "Стартапы, которым нужна простая CRM без лишней сложности",
];

export function AboutPage() {
  return (
    <PageShell>
      <div className="mx-auto max-w-4xl">
        <div className="rounded-2xl border bg-white p-5 shadow-sm sm:p-8">
          <p className="text-sm font-medium uppercase tracking-wide text-slate-500">Bronix CRM</p>
          <h1 className="mt-2 text-3xl font-semibold">О системе</h1>
          <p className="mt-4 text-lg text-slate-700">
            Bronix CRM — современная система для управления клиентами, заявками и командой.
            Помогает выстроить прозрачный процесс работы с клиентской базой от первого
            обращения до завершения сделки.
          </p>
        </div>

        <section className="mt-8 rounded-2xl border bg-white p-5 shadow-sm sm:p-8">
          <h2 className="text-xl font-semibold">Назначение CRM</h2>
          <p className="mt-3 text-slate-700 leading-relaxed">
            Система создана для централизованного учёта клиентов и заявок, планирования работы
            менеджеров и анализа результатов. Bronix CRM объединяет карточки клиентов, воронку
            заявок, профили сотрудников и аналитический Dashboard — всё необходимое для ежедневной
            работы отдела продаж или сервисной команды.
          </p>
        </section>

        <section className="mt-8 rounded-2xl border bg-white p-5 shadow-sm sm:p-8">
          <h2 className="text-xl font-semibold">Преимущества системы</h2>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            {ADVANTAGES.map((item) => (
              <article key={item.title} className="rounded-xl border bg-slate-50 p-5">
                <h3 className="font-medium text-slate-900">{item.title}</h3>
                <p className="mt-2 text-sm text-slate-600">{item.description}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="mt-8 rounded-2xl border bg-white p-5 shadow-sm sm:p-8">
          <h2 className="text-xl font-semibold">Для кого подходит</h2>
          <ul className="mt-4 space-y-3">
            {AUDIENCE.map((item) => (
              <li key={item} className="flex items-start gap-3 text-slate-700">
                <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-slate-900" />
                {item}
              </li>
            ))}
          </ul>
        </section>

        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            to="/contacts"
            className="rounded-lg bg-slate-900 px-4 py-2 text-sm text-white hover:bg-slate-800"
          >
            Связаться с нами
          </Link>
          <Link
            to="/register"
            className="rounded-lg border bg-white px-4 py-2 text-sm hover:bg-slate-50"
          >
            Начать работу
          </Link>
        </div>
      </div>
    </PageShell>
  );
}
