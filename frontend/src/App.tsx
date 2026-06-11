import { AppHeader } from "./components/layout/AppHeader";
import { AppRoutes } from "./routes/AppRoutes";

export default function App() {
  return (
    <div className="flex min-h-dvh flex-col">
      <AppHeader />
      <main className="flex-1">
        <AppRoutes />
      </main>
    </div>
  );
}
