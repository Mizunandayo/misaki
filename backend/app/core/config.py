# backend/app/core/config.py



from __future__ import annotations
from functools import lru_cache
from typing import Literal
from pydantic import SecretStr, field_validator, AnyHttpUrl
from pydantic_settings import BaseSettings, SettingsConfigDict





class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
        case_sensitive=True,
    )

    ENVIRONMENT: Literal["development", "staging", "production"] = "development"

    DEMO_API_KEY: SecretStr

    DATABASE_URL: SecretStr
    SUPABASE_URL: AnyHttpUrl
    SUPABASE_ANON_KEY: SecretStr
    SUPABASE_SERVICE_ROLE_KEY: SecretStr

    REDIS_URL: SecretStr

    GEMINI_API_KEY: SecretStr
    BRIGHT_DATA_API_TOKEN: SecretStr
    BRIGHT_DATA_MCP_URL: AnyHttpUrl = "https://mcp.brightdata.com/sse"  # type: ignore

    # --- Day 3: AI/ML API gateway ---
    AIML_API_KEY: SecretStr = SecretStr("")
    AIML_BASE_URL: AnyHttpUrl = "https://api.aimlapi.com/v1"  # type: ignore
    AIML_DAILY_USD_CAP: float = 8.0
    # Drainage protection for the owner-funded keys. Gemini is the paid key
    # (~$10 total) and is the default route, so it gets a hard daily USD cap.
    # Bright Data runs on a hackathon coupon — capped by live (non-cached) MCP
    # call count per day. Both reset at UTC midnight. Override via env.
    GEMINI_DAILY_USD_CAP: float = 5.0
    BRIGHT_DATA_DAILY_CALL_CAP: int = 800
    LLM_PROVIDER: Literal["aiml", "gemini"] = "gemini"
    MCP_EVENT_CHANNEL: str = "misaki_mcp_events"
    MISAKI_SIGNING_KEY: SecretStr

    LANGFUSE_PUBLIC_KEY: str = ""
    LANGFUSE_SECRET_KEY: SecretStr = SecretStr("")
    LANGFUSE_HOST: AnyHttpUrl = "https://cloud.langfuse.com"  # type: ignore
    SENTRY_DSN: SecretStr | None = None

    CORS_ORIGINS: list[str] = ["http://localhost:3000"]
    ALLOWED_HOSTS: list[str] = ["localhost", "127.0.0.1"]

    @property
    def is_production(self) -> bool:
        return self.ENVIRONMENT == "production"

    @property
    def is_development(self) -> bool:
        return self.ENVIRONMENT == "development"

    @property
    def aiml_enabled(self) -> bool:
        return bool(self.AIML_API_KEY.get_secret_value().strip())

    @field_validator("DEMO_API_KEY", "MISAKI_SIGNING_KEY")
    @classmethod
    def secret_strength(cls, v: SecretStr) -> SecretStr:
        if len(v.get_secret_value()) < 16:
            raise ValueError("Secret must be at least 16 characters")
        return v

    @field_validator("CORS_ORIGINS", mode="before")
    @classmethod
    def parse_cors(cls, v: str | list[str]) -> list[str]:
        if isinstance(v, str):
            import json
            return json.loads(v)
        return v


@lru_cache(maxsize=1)
def get_settings() -> Settings:
    return Settings()  # type: ignore[call-arg]


settings = get_settings()
