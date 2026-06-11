from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import JSONResponse

from app.core.security import decode_access_token

PUBLIC_PREFIXES = (
    "/health",
    "/docs",
    "/redoc",
    "/openapi.json",
    "/auth/register",
    "/auth/login",
)


class JWTAuthMiddleware(BaseHTTPMiddleware):
    """Проверяет JWT для всех маршрутов с префиксом /api."""

    async def dispatch(self, request: Request, call_next):
        # CORS preflight не содержит Authorization — пропускаем
        if request.method == "OPTIONS":
            return await call_next(request)

        path = request.url.path

        if not path.startswith("/api"):
            return await call_next(request)

        if any(path.startswith(prefix) for prefix in PUBLIC_PREFIXES):
            return await call_next(request)

        auth_header = request.headers.get("Authorization")
        if not auth_header or not auth_header.startswith("Bearer "):
            return JSONResponse(
                status_code=401,
                content={"detail": "Not authenticated"},
            )

        token = auth_header.removeprefix("Bearer ").strip()
        try:
            payload = decode_access_token(token)
            request.state.user_id = int(payload["sub"])
            request.state.role = payload.get("role")
        except (ValueError, KeyError):
            return JSONResponse(
                status_code=401,
                content={"detail": "Invalid or expired token"},
            )

        return await call_next(request)
