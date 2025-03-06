import React, { useState } from 'react';

function WeatherApp() {
  const [city, setCity] = useState('');
  const [weather, setWeather] = useState(null);
  const [error, setError] = useState('');

  const fetchWeather = async () => {
  setError('');
  setWeather(null);
  try {
    // Call backend service for weather data
    const response = await fetch(`/weather?city=${city}`);
    if (!response.ok) {
      const errorData = await response.json();
      setError(errorData.detail || "Error fetching weather data");
      return;
    }
    const data = await response.json();
    setWeather(data);
  } catch (err) {
    console.log(err)
    setError('Network error');
  }
};


  return (
    <div style={{ padding: "20px" }}>
      <h1>Weather App</h1>
      <input
        type="text"
        value={city}
        placeholder="Enter city"
        onChange={(e) => setCity(e.target.value)}
      />
      <button onClick={fetchWeather}>Get Weather</button>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {weather && (
        <div>
          <h2>{weather.city}</h2>
          <p>Temperature: {weather.temperature}°C</p>
          <p>Humidity: {weather.humidity}%</p>
          <p>Pressure: {weather.pressure} hPa</p>
        </div>
      )}
    </div>
  );
}

export default WeatherApp;
