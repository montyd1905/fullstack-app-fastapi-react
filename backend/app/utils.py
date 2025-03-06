from typing import Union, List
import redis
from redis.exceptions import ConnectionError
from enum import Enum
import json


class Settings(Enum):
    REDIS_TTL = 10 * 60  # cache city results in Redis for 10 minutes


class RedisWrapper:
    def __init__(self, ttl: int = Settings.REDIS_TTL.value):
        self.client = redis.Redis(host="redis", port=6379, db=0, decode_responses=True)
        self.ttl = ttl

    async def get(self, key: str) -> Union[dict, List[dict], None]:
        try:
            raw_result = self.client.get(key)
            result = json.loads(raw_result) if raw_result else None
            return result
        except ConnectionError:
            return None

    async def set(self, key: str, data: Union[dict, List[dict], None]):
        if data:
            try:
                self.client.set(key, json.dumps(data), ex=self.ttl)
            except ConnectionError:
                pass

        return
