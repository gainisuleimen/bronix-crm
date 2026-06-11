import { Link } from "react-router-dom";

import { PageShell } from "../components/layout/PageShell";
import { CONTACT_LINKS, EXTERNAL_LINK_PROPS } from "../lib/contacts";

const CONTACT_ICONS: Record<string, string> = {
  instagram: "IG",
  telegram: "TG",
  whatsapp: "WA",
  email: "@",
  phone: "☎",
};

export function ContactsPage() {
  return (
    <PageShell>
      <div className="mx-auto max-w-4xl">
        <div className="rounded-2xl border bg-white p-5 shadow-sm sm:p-8">
          <p className="text-sm font-medium uppercase tracking-wide text-slate-500">Bronix CRM</p>
          <h1 className="mt-2 text-3xl font-semibold">Контакты</h1>
          <p className="mt-4 text-slate-700">
            Свяжитесь с нами удобным способом — мы ответим на вопросы о системе, демонстрации
            и подключении вашей команды.
          </p>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          {CONTACT_LINKS.map((contact) => (
            <a
              key={contact.id}
              href={contact.href}
              {...EXTERNAL_LINK_PROPS}
              className="group flex items-center gap-4 rounded-2xl border bg-white p-5 shadow-sm transition hover:border-slate-300 hover:shadow-md"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-900 text-sm font-semibold text-white">
                {CONTACT_ICONS[contact.id]}
              </div>
              <div>
                <div className="text-sm text-slate-500">{contact.label}</div>
                <div className="mt-0.5 font-medium text-slate-900 group-hover:underline">
                  {contact.value}
                </div>
              </div>
            </a>
          ))}
        </div>

        <p className="mt-8 text-center text-sm text-slate-500">
          Хотите узнать больше о возможностях системы?{" "}
          <Link to="/about" className="text-slate-900 underline hover:text-slate-700">
            Перейти на страницу «О системе»
          </Link>
        </p>
      </div>
    </PageShell>
  );
}
