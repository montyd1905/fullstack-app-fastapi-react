from pydantic import BaseModel


class WeatherResponse(BaseModel):
    city: str
    temperature: float
    humidity: int
    pressure: int
