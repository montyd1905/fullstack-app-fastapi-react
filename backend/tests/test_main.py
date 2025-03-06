import httpx
import pytest
from fastapi.testclient import TestClient
from app.main import app
from dotenv import load_dotenv

load_dotenv("../../.env")

client = TestClient(app)


class FakeResponse:
    def __init__(self, json_data, status_code=200):
        self._json = json_data
        self.status_code = status_code

    def json(self):
        return self._json

    def raise_for_status(self):
        # Only raise if the status code is not 200
        if self.status_code != 200:
            raise httpx.HTTPStatusError("Client error", request=None, response=self)


async def fake_get_success(self, url, **kwargs):
    params = kwargs.get("params", {})
    return FakeResponse(
        {
            "cod": 200,
            "name": params.get("q", "Unknown"),
            "main": {"temp": 25.0, "humidity": 60, "pressure": 1012},
        },
        200,
    )


async def fake_get_failure(self, url, **kwargs):
    params = kwargs.get("params", {})
    return FakeResponse({"cod": 500, "message": "Invalid API key"}, 200)


def test_get_weather_success(monkeypatch):
    # Patch httpx.AsyncClient.get with fake_get_success
    monkeypatch.setattr(httpx.AsyncClient, "get", fake_get_success)
    response = client.get("/weather/?city=London")
    assert response.status_code == 200
    data = response.json()
    assert data["city"] == "London"
    assert data["temperature"] == 25.0
    assert data["humidity"] == 60
    assert data["pressure"] == 1012


def test_get_weather_failure(monkeypatch):
    # Patch httpx.AsyncClient.get with fake_get_failure
    monkeypatch.setattr(httpx.AsyncClient, "get", fake_get_failure)
    response = client.get("/weather/?city=InvalidCity")
    assert response.status_code == 500
