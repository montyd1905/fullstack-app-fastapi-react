import React, { useState } from 'react';

function WeatherApp() {
  const [city, setCity] = useState('');
  const [weather, setWeather] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const fetchWeather = async () => {
    setError('');
    setWeather(null);
    setLoading(true);
    try {
      // Call backend service for weather data
      const response = await fetch(`/weather?city=${city}`);
      if (response.ok) {
        const data = await response.json();
        setWeather(data);
      } else {

        if (response.status === 404) {
          setError(`City: ${city} not found`);
        } else {
          setError('API error');
        }

      }
    } catch (err) {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      fetchWeather();
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      {/* Inline CSS for the loader */}
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        .loader {
          border: 4px solid #f3f3f3;
          border-top: 4px solid #3498db;
          border-radius: 50%;
          width: 24px;
          height: 24px;
          animation: spin 1s linear infinite;
          margin: 10px auto;
        }
      `}</style>
      <h1>Weather App</h1>
      <input
        type="text"
        value={city}
        placeholder="Enter city"
        onChange={(e) => setCity(e.target.value)}
        onKeyDown={handleKeyDown}
      />
      <button onClick={fetchWeather}>Get Weather</button>
      {loading && <div className="loader" aria-label="loading spinner"></div>}
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
