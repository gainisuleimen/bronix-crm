/**
 * Базовый URL API.
 * - dev без VITE_API_URL: пустая строка → запросы через proxy Vite
 * - production: обязателен VITE_API_URL (задаётся при сборке на Vercel)
 */
export function resolveApiBase(): string {
  const configured = import.meta.env.VITE_API_URL?.trim();
  if (configured) {
    return configured.replace(/\/$/, "");
  }
  if (import.meta.env.DEV) {
    return "";
  }
  return "";
}

export function requireApiBase(): string {
  const base = resolveApiBase();
  if (!base) {
    throw new Error(
      "VITE_API_URL не задан. Укажите URL backend при сборке (например https://your-api.onrender.com).",
    );
  }
  return base;
}
