import '@testing-library/jest-dom';
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import WeatherApp from './WeatherApp';


describe('WeatherApp Component', () => {
  beforeEach(() => {
    jest.spyOn(global, 'fetch');
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('renders the WeatherApp component', () => {
    render(<WeatherApp />);
    expect(screen.getByText(/Weather App/i)).toBeInTheDocument();
  });

  test('fetches and displays weather data on successful API call', async () => {
    const fakeResponse = {
      city: "London",
      temperature: 25,
      humidity: 60,
      pressure: 1012,
    };

    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => fakeResponse,
    });

    render(<WeatherApp />);

    const input = screen.getByPlaceholderText("Enter city");
    const button = screen.getByText("Get Weather");

    fireEvent.change(input, { target: { value: "London" } });
    fireEvent.click(button);

    await waitFor(() => {
      expect(screen.getByText(/London/i)).toBeInTheDocument();
      expect(screen.getByText(/Temperature: 25°C/i)).toBeInTheDocument();
      expect(screen.getByText(/Humidity: 60%/i)).toBeInTheDocument();
      expect(screen.getByText(/Pressure: 1012 hPa/i)).toBeInTheDocument();
    });
  });

  test('displays error message when API call returns a non-OK response', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({ detail: "City not found" }),
    });

    render(<WeatherApp />);

    const input = screen.getByPlaceholderText("Enter city");
    const button = screen.getByText("Get Weather");

    fireEvent.change(input, { target: { value: "InvalidCity" } });
    fireEvent.click(button);

    await waitFor(() => {
      expect(screen.getByText(/City not found/i)).toBeInTheDocument();
    });
  });

  test('displays network error on fetch failure', async () => {
    global.fetch.mockRejectedValueOnce(new Error('Network Error'));

    render(<WeatherApp />);

    const input = screen.getByPlaceholderText("Enter city");
    const button = screen.getByText("Get Weather");

    fireEvent.change(input, { target: { value: "London" } });
    fireEvent.click(button);

    await waitFor(() => {
      expect(screen.getByText(/Network error/i)).toBeInTheDocument();
    });
  });
});
