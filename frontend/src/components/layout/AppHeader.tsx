import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

import { useAuth } from "../../context/AuthContext";

type NavLink = {
  to: string;
  label: string;
  requiresAuth?: boolean;
};

const PUBLIC_LINKS: NavLink[] = [
  { to: "/about", label: "О системе" },
  { to: "/contacts", label: "Контакты" },
];

const AUTH_LINKS: NavLink[] = [
  { to: "/clients", label: "Клиенты", requiresAuth: true },
  { to: "/leads", label: "Заявки", requiresAuth: true },
  { to: "/team", label: "Команда", requiresAuth: true },
];

function navLinkClass(isActive: boolean, mobile = false) {
  const base = mobile
    ? "block rounded-lg px-3 py-2.5 text-base"
    : "text-sm";
  return isActive
    ? `${base} font-medium text-slate-900 ${mobile ? "bg-slate-100" : ""}`
    : `${base} text-slate-600 hover:text-slate-900 ${mobile ? "hover:bg-slate-50" : ""}`;
}

export function AppHeader() {
  const { user, logout, isLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  function handleLogout() {
    logout();
    navigate("/login");
  }

  const dashboardPath = user ? "/" : "/login";

  return (
    <header className="sticky top-0 z-40 border-b bg-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3 sm:px-6 sm:py-4">
        <div className="flex min-w-0 items-center gap-3">
          <Link to={dashboardPath} className="truncate font-semibold text-slate-900">
            Bronix CRM
          </Link>
          <nav className="hidden items-center gap-4 md:flex lg:gap-6">
            {PUBLIC_LINKS.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={navLinkClass(location.pathname === link.to)}
              >
                {link.label}
              </Link>
            ))}
            {user &&
              AUTH_LINKS.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className={navLinkClass(location.pathname === link.to)}
                >
                  {link.label}
                </Link>
              ))}
          </nav>
        </div>

        <div className="flex items-center gap-2">
          <nav className="hidden items-center gap-2 text-sm md:flex">
            {isLoading ? (
              <span className="text-slate-500">...</span>
            ) : user ? (
              <>
                <span className="hidden max-w-[200px] truncate text-slate-600 lg:inline">
                  {user.full_name || user.email} ({user.role})
                </span>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="min-h-10 rounded-lg border px-3 py-2 hover:bg-slate-50"
                >
                  Выйти
                </button>
              </>
            ) : (
              <>
                <Link
                  className="min-h-10 rounded-lg border px-3 py-2 leading-10 hover:bg-slate-50"
                  to="/login"
                >
                  Вход
                </Link>
                <Link
                  className="min-h-10 rounded-lg bg-slate-900 px-3 py-2 leading-10 text-white hover:bg-slate-800"
                  to="/register"
                >
                  Регистрация
                </Link>
              </>
            )}
          </nav>

          <button
            type="button"
            className="inline-flex min-h-10 min-w-10 items-center justify-center rounded-lg border md:hidden"
            aria-expanded={menuOpen}
            aria-label={menuOpen ? "Закрыть меню" : "Открыть меню"}
            onClick={() => setMenuOpen((open) => !open)}
          >
            {menuOpen ? (
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
              </svg>
            ) : (
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M4 7h16M4 12h16M4 17h16" strokeLinecap="round" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {menuOpen && (
        <>
          <button
            type="button"
            className="fixed inset-0 z-40 bg-slate-900/40 md:hidden"
            aria-label="Закрыть меню"
            onClick={() => setMenuOpen(false)}
          />
          <div className="fixed inset-x-0 top-[57px] z-50 max-h-[calc(100dvh-57px)] overflow-y-auto border-b bg-white px-4 py-4 shadow-lg md:hidden sm:top-[65px] sm:max-h-[calc(100dvh-65px)]">
            <nav className="space-y-1">
              {user && (
                <Link
                  to="/"
                  className={navLinkClass(location.pathname === "/", true)}
                >
                  Dashboard
                </Link>
              )}
              {PUBLIC_LINKS.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className={navLinkClass(location.pathname === link.to, true)}
                >
                  {link.label}
                </Link>
              ))}
              {user &&
                AUTH_LINKS.map((link) => (
                  <Link
                    key={link.to}
                    to={link.to}
                    className={navLinkClass(location.pathname === link.to, true)}
                  >
                    {link.label}
                  </Link>
                ))}
            </nav>

            <div className="mt-4 space-y-2 border-t pt-4">
              {isLoading ? (
                <p className="px-3 text-sm text-slate-500">Загрузка...</p>
              ) : user ? (
                <>
                  <p className="px-3 text-sm text-slate-600">
                    {user.full_name || user.email}
                    <span className="text-slate-400"> · {user.role}</span>
                  </p>
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="w-full rounded-lg border px-3 py-2.5 text-left text-sm hover:bg-slate-50"
                  >
                    Выйти
                  </button>
                </>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  <Link
                    className="rounded-lg border px-3 py-2.5 text-center text-sm hover:bg-slate-50"
                    to="/login"
                  >
                    Вход
                  </Link>
                  <Link
                    className="rounded-lg bg-slate-900 px-3 py-2.5 text-center text-sm text-white hover:bg-slate-800"
                    to="/register"
                  >
                    Регистрация
                  </Link>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </header>
  );
}
