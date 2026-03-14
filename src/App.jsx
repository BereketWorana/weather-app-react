import { useState, useEffect } from 'react'

const API_KEY = import.meta.env.VITE_API_KEY

const weatherBg = (code) => {
  if (!code) return 'linear-gradient(135deg, #1a1a2e, #16213e)'
  if (code >= 200 && code < 300) return 'linear-gradient(135deg, #373b44, #4286f4)'
  if (code >= 300 && code < 600) return 'linear-gradient(135deg, #314755, #26a0da)'
  if (code >= 600 && code < 700) return 'linear-gradient(135deg, #83a4d4, #b6fbff)'
  if (code >= 700 && code < 800) return 'linear-gradient(135deg, #606c88, #3f4c6b)'
  if (code === 800) return 'linear-gradient(135deg, #2980b9, #6dd5fa)'
  return 'linear-gradient(135deg, #4b79a1, #283e51)'
}

const getIcon = (code) => {
  if (!code) return '🌡️'
  if (code >= 200 && code < 300) return '⛈️'
  if (code >= 300 && code < 400) return '🌦️'
  if (code >= 500 && code < 600) return '🌧️'
  if (code >= 600 && code < 700) return '❄️'
  if (code >= 700 && code < 800) return '🌫️'
  if (code === 800) return '☀️'
  if (code === 801) return '🌤️'
  if (code === 802) return '⛅'
  return '☁️'
}

const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

export default function App() {
  const [city, setCity] = useState('Addis Ababa')
  const [input, setInput] = useState('')
  const [weather, setWeather] = useState(null)
  const [forecast, setForecast] = useState([])
  const [hourly, setHourly] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const fetchWeather = async (cityName) => {
    setLoading(true)
    setError('')
    try {
      const [curr, fore] = await Promise.all([
        fetch(`https://api.openweathermap.org/data/2.5/weather?q=${cityName}&appid=${API_KEY}&units=metric`).then(r => r.json()),
        fetch(`https://api.openweathermap.org/data/2.5/forecast?q=${cityName}&appid=${API_KEY}&units=metric`).then(r => r.json())
      ])
      if (curr.cod !== 200) { setError('City not found. Try again!'); setLoading(false); return }
      setWeather(curr)
      const daily = {}
      fore.list.forEach(item => {
        const date = new Date(item.dt * 1000)
        const day = days[date.getDay()]
        if (!daily[day]) daily[day] = { min: item.main.temp_min, max: item.main.temp_max, code: item.weather[0].id, day }
        else {
          daily[day].min = Math.min(daily[day].min, item.main.temp_min)
          daily[day].max = Math.max(daily[day].max, item.main.temp_max)
        }
      })
      setForecast(Object.values(daily).slice(0, 7))
      setHourly(fore.list.slice(0, 6))
    } catch {
      setError('Something went wrong. Check your connection.')
    }
    setLoading(false)
  }

  useEffect(() => { fetchWeather(city) }, [])

  const search = () => {
    if (!input.trim()) return
    setCity(input)
    fetchWeather(input)
    setInput('')
  }

  const bg = weatherBg(weather?.weather[0]?.id)

  return (
    <div style={{ minHeight: '100vh', background: bg, display: 'flex', justifyContent: 'center', padding: '24px 16px', transition: 'background 1s' }}>
      <div style={{ width: '100%', maxWidth: '420px', color: '#fff' }}>

        {/* Search */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '32px' }}>
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && search()}
            placeholder="Search city..."
            style={{ flex: 1, padding: '12px 16px', borderRadius: '30px', border: 'none', background: 'rgba(255,255,255,0.2)', color: '#fff', fontSize: '15px', outline: 'none', backdropFilter: 'blur(10px)' }}
          />
          <button onClick={search} style={{ padding: '12px 20px', borderRadius: '30px', border: 'none', background: 'rgba(255,255,255,0.3)', color: '#fff', cursor: 'pointer', fontSize: '18px' }}>🔍</button>
        </div>

        {error && <p style={{ textAlign: 'center', color: '#ffcccc', marginBottom: '16px' }}>{error}</p>}

        {loading && <p style={{ textAlign: 'center', fontSize: '18px' }}>Loading...</p>}

        {!loading && weather && (
          <>
            {/* Hero */}
            <div style={{ textAlign: 'center', marginBottom: '32px' }}>
              <p style={{ fontSize: '16px', opacity: 0.8, marginBottom: '4px' }}>📍 {weather.name}, {weather.sys.country}</p>
              <div style={{ fontSize: '96px', lineHeight: 1 }}>{getIcon(weather.weather[0].id)}</div>
              <h1 style={{ fontSize: '72px', fontWeight: '200', margin: '8px 0' }}>{Math.round(weather.main.temp)}°</h1>
              <p style={{ fontSize: '20px', textTransform: 'capitalize', opacity: 0.9 }}>{weather.weather[0].description}</p>
              <p style={{ opacity: 0.7, marginTop: '4px' }}>Feels like {Math.round(weather.main.feels_like)}° · H:{Math.round(weather.main.temp_max)}° L:{Math.round(weather.main.temp_min)}°</p>
            </div>

            {/* Hourly */}
            <div style={{ background: 'rgba(255,255,255,0.15)', borderRadius: '20px', padding: '16px', marginBottom: '16px', backdropFilter: 'blur(10px)' }}>
              <p style={{ fontSize: '12px', opacity: 0.7, marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '1px' }}>Hourly forecast</p>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                {hourly.map((h, i) => {
                  const date = new Date(h.dt * 1000)
                  const hr = date.getHours()
                  const ampm = hr >= 12 ? 'pm' : 'am'
                  const hour = hr % 12 || 12
                  return (
                    <div key={i} style={{ textAlign: 'center' }}>
                      <p style={{ fontSize: '12px', opacity: 0.7 }}>{i === 0 ? 'Now' : `${hour}${ampm}`}</p>
                      <p style={{ fontSize: '20px', margin: '4px 0' }}>{getIcon(h.weather[0].id)}</p>
                      <p style={{ fontSize: '13px', fontWeight: '600' }}>{Math.round(h.main.temp)}°</p>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* 7 day */}
            <div style={{ background: 'rgba(255,255,255,0.15)', borderRadius: '20px', padding: '16px', marginBottom: '16px', backdropFilter: 'blur(10px)' }}>
              <p style={{ fontSize: '12px', opacity: 0.7, marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '1px' }}>7-day forecast</p>
              {forecast.map((d, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 0', borderBottom: i < forecast.length - 1 ? '1px solid rgba(255,255,255,0.1)' : 'none' }}>
                  <p style={{ width: '48px', fontWeight: '500' }}>{i === 0 ? 'Today' : d.day}</p>
                  <span style={{ fontSize: '20px' }}>{getIcon(d.code)}</span>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <span style={{ opacity: 0.7 }}>{Math.round(d.min)}°</span>
                    <span style={{ fontWeight: '600' }}>{Math.round(d.max)}°</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
              {[
                { label: 'Humidity', value: `${weather.main.humidity}%`, icon: '💧' },
                { label: 'Wind', value: `${Math.round(weather.wind.speed)} km/h`, icon: '💨' },
                { label: 'Feels like', value: `${Math.round(weather.main.feels_like)}°`, icon: '🌡️' },
                { label: 'Pressure', value: `${weather.main.pressure} hPa`, icon: '🔵' },
              ].map((s, i) => (
                <div key={i} style={{ background: 'rgba(255,255,255,0.15)', borderRadius: '16px', padding: '16px', backdropFilter: 'blur(10px)' }}>
                  <p style={{ fontSize: '24px', marginBottom: '4px' }}>{s.icon}</p>
                  <p style={{ fontSize: '13px', opacity: 0.7 }}>{s.label}</p>
                  <p style={{ fontSize: '22px', fontWeight: '600' }}>{s.value}</p>
                </div>
              ))}
            </div>

            {/* Sunrise Sunset */}
            <div style={{ background: 'rgba(255,255,255,0.15)', borderRadius: '20px', padding: '16px', backdropFilter: 'blur(10px)', display: 'flex', justifyContent: 'space-around', textAlign: 'center' }}>
              <div>
                <p style={{ fontSize: '32px' }}>🌅</p>
                <p style={{ fontSize: '12px', opacity: 0.7 }}>Sunrise</p>
                <p style={{ fontWeight: '600' }}>{new Date(weather.sys.sunrise * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
              </div>
              <div>
                <p style={{ fontSize: '32px' }}>🌇</p>
                <p style={{ fontSize: '12px', opacity: 0.7 }}>Sunset</p>
                <p style={{ fontWeight: '600' }}>{new Date(weather.sys.sunset * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}