import { FormEvent, useState } from "react";
import { useNavigate } from "react-router-dom";

import { AuthLayout } from "../components/AuthLayout";
import { getErrorMessage, useAuth } from "../context/AuthContext";
import type { UserRole } from "../types/auth";

export function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [role, setRole] = useState<UserRole>("manager");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      await register({
        email,
        password,
        full_name: fullName || undefined,
        role,
      });
      navigate("/", { replace: true });
    } catch (err) {
      setError(getErrorMessage(err, "Не удалось зарегистрироваться"));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <AuthLayout
      title="Регистрация"
      subtitle="Создайте аккаунт в CRM"
      footerText="Уже есть аккаунт?"
      footerLink="/login"
      footerLinkLabel="Войти"
    >
      <form className="space-y-4" onSubmit={handleSubmit}>
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700" htmlFor="fullName">
            Имя
          </label>
          <input
            id="fullName"
            type="text"
            className="w-full rounded-lg border px-3 py-2 outline-none focus:border-slate-500"
            placeholder="Иван"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700" htmlFor="email">
            Email
          </label>
          <input
            id="email"
            type="email"
            required
            autoComplete="email"
            className="w-full rounded-lg border px-3 py-2 outline-none focus:border-slate-500"
            placeholder="ivan@gmail.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <p className="mt-1 text-xs text-slate-500">
            Можно любой email в формате name@gmail.com (не обязательно настоящий)
          </p>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700" htmlFor="password">
            Пароль
          </label>
          <input
            id="password"
            type="password"
            required
            minLength={6}
            autoComplete="new-password"
            className="w-full rounded-lg border px-3 py-2 outline-none focus:border-slate-500"
            placeholder="Минимум 6 символов"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700" htmlFor="role">
            Роль
          </label>
          <select
            id="role"
            className="w-full rounded-lg border px-3 py-2 outline-none focus:border-slate-500"
            value={role}
            onChange={(e) => setRole(e.target.value as UserRole)}
          >
            <option value="manager">Менеджер</option>
            <option value="admin">Администратор</option>
          </select>
        </div>

        {error && (
          <div className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full rounded-lg bg-slate-900 px-4 py-2.5 font-medium text-white hover:bg-slate-800 disabled:opacity-60"
        >
          {isSubmitting ? "Создаём..." : "Зарегистрироваться"}
        </button>
      </form>
    </AuthLayout>
  );
}
