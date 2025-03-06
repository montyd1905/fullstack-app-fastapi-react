import os
import httpx
from http import HTTPStatus
from fastapi import APIRouter, HTTPException
from ..models.weather import WeatherResponse
from ..utils import RedisWrapper
from enum import Enum


class Settings(Enum):
    REQUEST_TIMEOUT = 10


router = APIRouter()
_redis = RedisWrapper()

OPENWEATHER_API_KEY = os.getenv("OPENWEATHER_API_KEY")
BASE_URL = "http://api.openweathermap.org/data/2.5/weather"


@router.get("/", response_model=WeatherResponse)
async def get_weather(city: str):

    # check cache first
    cached = await _redis.get(city)

    if cached:
        return cached

    # live call: cache entry expired or does not exist

    params = {"q": city, "appid": OPENWEATHER_API_KEY, "units": "metric"}

    async with httpx.AsyncClient(timeout=Settings.REQUEST_TIMEOUT.value) as client:

        try:

            response = await client.get(BASE_URL, params=params)
            response.raise_for_status()

        except httpx.RequestError as e:

            raise HTTPException(
                status_code=HTTPStatus.INTERNAL_SERVER_ERROR,
                detail="Error fetching weather data",
            ) from e

    data = response.json()

    if data.get("cod") != HTTPStatus.OK:

        raise HTTPException(
            status_code=data.get("cod", HTTPStatus.INTERNAL_SERVER_ERROR),
            detail=data.get("message", "Error fetching weather data"),
        )

    response = WeatherResponse(
        city=data["name"],
        temperature=data["main"]["temp"],
        humidity=data["main"]["humidity"],
        pressure=data["main"]["pressure"],
    )

    await _redis.set(city, response.model_dump())

    return response
