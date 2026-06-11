import axios from "axios";

export function getErrorMessage(error: unknown, fallback = "Произошла ошибка"): string {
  if (!axios.isAxiosError(error)) {
    return fallback;
  }

  if (!error.response) {
    const code = error.code ? ` (${error.code})` : "";
    if (error.code === "ECONNABORTED") {
      return `Превышено время ожидания ответа сервера${code}. Проверьте доступность backend.`;
    }
    return `Не удалось подключиться к серверу${code}. Проверьте VITE_API_URL и что backend запущен.`;
  }

  const detail = error.response?.data?.detail;

  if (typeof detail === "string") {
    return detail;
  }

  if (Array.isArray(detail)) {
    return detail
      .map((item) => (typeof item?.msg === "string" ? item.msg : "Ошибка валидации"))
      .join(". ");
  }

  return fallback;
}
