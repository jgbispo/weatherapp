// description: fetches weather data from openweathermap api

const getWeather = async (location) => {
  const res = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${location}&units=metric&appid=${process.env.NEXT_PUBLIC_WEATHER_API_KEY}`)
  const data = await res.json()
  if (data.cod === 200) {
    const { temp, humidity } = data.main
    return {
      temp,
      humidity,
      description: data.weather[0].description,
      location: data.name,
      weather: data.weather[0].main.toLowerCase(),
      country: data.sys.country,
      wind: data.wind.speed,
      pressure: data.main.pressure
    }
  } else {
    return {
      temp: 0,
      humidity: 0,
      location: 'Location not found',
      weather: 'clear',
      country: '--',
      description: 'not found',
      wind: 0,
      pressure: 0
    }
  }
}

export default getWeather