import { FormEvent, useState } from "react";
import { useNavigate } from "react-router-dom";

import { AuthLayout } from "../components/AuthLayout";
import { getErrorMessage, useAuth } from "../context/AuthContext";

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      await login({ email, password });
      navigate("/", { replace: true });
    } catch (err) {
      setError(getErrorMessage(err, "Не удалось войти"));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <AuthLayout
      title="Вход"
      subtitle="Войдите в Bronix CRM"
      footerText="Нет аккаунта?"
      footerLink="/register"
      footerLinkLabel="Зарегистрироваться"
    >
      <form className="space-y-4" onSubmit={handleSubmit}>
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
            autoComplete="current-password"
            className="w-full rounded-lg border px-3 py-2 outline-none focus:border-slate-500"
            placeholder="Минимум 6 символов"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        {error && (
          <div className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full rounded-lg bg-slate-900 px-4 py-2.5 font-medium text-white hover:bg-slate-800 disabled:opacity-60"
        >
          {isSubmitting ? "Входим..." : "Войти"}
        </button>
      </form>
    </AuthLayout>
  );
}
