import { Navigate } from "react-router-dom";

import { useAuth } from "../context/AuthContext";

export function GuestRoute({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex min-h-[calc(100vh-65px)] items-center justify-center text-slate-600">
        Загрузка...
      </div>
    );
  }

  if (user) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}
