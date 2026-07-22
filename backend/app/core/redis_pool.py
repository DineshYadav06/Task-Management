import logging
from typing import Optional
import redis
from app.core.config import settings

logger = logging.getLogger(__name__)

class RedisClient:
    """
    Singleton Redis client wrapper with graceful fallback when running without Redis locally.
    """
    _instance: Optional[redis.Redis] = None
    _is_available: bool = False

    @classmethod
    def get_client(cls) -> Optional[redis.Redis]:
        if cls._instance is None:
            try:
                client = redis.from_url(
                    settings.REDIS_URL,
                    decode_responses=True,
                    socket_connect_timeout=2
                )
                client.ping()
                cls._instance = client
                cls._is_available = True
                logger.info("Successfully connected to Redis instance.")
            except Exception as exc:
                logger.warning(f"Redis connection failed ({exc}). Operating in fallback/in-memory mode.")
                cls._is_available = False
                cls._instance = None
        return cls._instance

    @classmethod
    def is_available(cls) -> bool:
        if cls._instance is None:
            cls.get_client()
        return cls._is_available

redis_client = RedisClient()
