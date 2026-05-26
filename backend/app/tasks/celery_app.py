from __future__ import annotations

from celery import Celery

from app.core.config import settings

celery_app = Celery(
    "misaki",
    broker=settings.REDIS_URL.get_secret_value(),
    backend=settings.REDIS_URL.get_secret_value(),
    include=["app.tasks.scrape_bills"],
)




celery_app.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="UTC",
    enable_utc=True,
    task_track_started=True,
    task_time_limit=300,
    task_soft_time_limit=240,
    worker_prefetch_multiplier=1,
    worker_max_tasks_per_child=50,
)

celery_app.conf.beat_schedule = {
    "scrape-texas-every-4-hours": {
        "task": "app.tasks.scrape_bills.scrape_jurisdiction",
        "schedule": 4 * 60 * 60,
        "args": ("TX",),
    },
    "scrape-california-every-4-hours": {
        "task": "app.tasks.scrape_bills.scrape_jurisdiction",
        "schedule": 4 * 60 * 60,
        "args": ("CA",),
    },
}