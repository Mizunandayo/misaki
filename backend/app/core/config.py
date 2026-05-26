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

    # ENVIRONMENT
    ENVIRONMENT: Literal["development", "staging", "production"] = "development"

    # DEMO AUTH
    DEMO_API_KEY: SecretStr

    # DATABASE 
    DATABASE_URL: SecretStr
    SUPABASE_URL: AnyHttpUrl
    SUPABASE_ANON_KEY: SecretStr
    SUPABASE_SERVICE_ROLE_KEY: SecretStr

    # REDIS
    REDIS_URL: SecretStr

    # AI BRIGHT DATA
    GEMINI_API_KEY: SecretStr
    BRIGHT_DATA_API_TOKEN: SecretStr
    BRIGHT_DATA_MCP_URL: AnyHttpUrl = "https://mcp.brightdata.com/sse"  # type: ignore

    # OBSERVABILITY
    LANGFUSE_PUBLIC_KEY: str = ""
    LANGFUSE_SECRET_KEY: SecretStr = SecretStr("")
    LANGFUSE_HOST: AnyHttpUrl = "https://cloud.langfuse.com"  # type: ignore
    SENTRY_DSN: SecretStr | None = None

    # HTTP SECURITY
    CORS_ORIGINS: list[str] = ["http://localhost:3000"]
    ALLOWED_HOSTS: list[str] = ["localhost", "127.0.0.1"]




    # COMPUTED
    @property
    def is_production(self) -> bool:
        return self.ENVIRONMENT == "production"

    @property
    def is_development(self) -> bool:
        return self.ENVIRONMENT == "development"

    # VALIDATORS
    @field_validator("DEMO_API_KEY")
    @classmethod
    def demo_key_strength(cls, v: SecretStr) -> SecretStr:
        value = v.get_secret_value()
        if len(value) < 16:
            raise ValueError("DEMO_API_KEY must be at least 16 characters")
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