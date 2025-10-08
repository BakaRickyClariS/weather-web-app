const API_URL = 'https://weather-backend.zeabur.app/api/weather/kaohsiung'

let updateInterval = null

// 取得天氣資料
async function fetchWeather() {
  try {
    const loadingEl = document.getElementById('loading')
    if (loadingEl) loadingEl.style.display = 'block'

    const response = await fetch(API_URL)
    const result = await response.json()

    if (result.success && result.data && result.data.forecasts) {
      displayWeather(result.data.forecasts)
      updateLastUpdateTime()
    } else {
      throw new Error('資料格式錯誤')
    }
  } catch (error) {
    console.error('取得天氣資料失敗:', error)
    document.getElementById('weather-container').innerHTML = `
      <div class="error">無法取得天氣資料，請稍後再試</div>
    `
  } finally {
    const loadingEl = document.getElementById('loading')
    if (loadingEl) loadingEl.style.display = 'none'
  }
}

// 顯示天氣資料
function displayWeather(forecasts) {
  const container = document.getElementById('weather-container')

  const weatherHTML = forecasts.map(item => {
    const time = item.startTime.split(' ')[1].substring(0, 5)
    const period = getPeriod(time)
    const weatherEmoji = getWeatherEmoji(item.weather)

    return `
      <div class="weather-card">
        <div class="time-period">${period}</div>
        <div class="time">${time}</div>
        <div class="weather-icon">${weatherEmoji}</div>
        <div class="weather-desc">${item.weather}</div>
        <div class="temp-row">
          <span class="temp-high">🔺 ${item.maxTemp}</span>
          <span class="temp-low">🔻 ${item.minTemp}</span>
        </div>
        <div class="details">
          <div class="detail-item">
            <span>💧 降雨機率</span>
            <span>${item.rain}</span>
          </div>
          <div class="detail-item">
            <span>🧭 舒適度</span>
            <span>${item.comfort}</span>
          </div>
          ${item.windSpeed ? `
          <div class="detail-item">
            <span>💨 風速</span>
            <span>${item.windSpeed}</span>
          </div>` : ''}
        </div>
      </div>
    `
  }).join('')

  container.innerHTML = weatherHTML
}

// 判斷時段
function getPeriod(time) {
  const hour = parseInt(time.split(':')[0])
  if (hour >= 6 && hour < 12) return '早上'
  if (hour >= 12 && hour < 18) return '下午'
  if (hour >= 18 && hour < 24) return '晚上'
  return '凌晨'
}

// 取得天氣 emoji
function getWeatherEmoji(weather) {
  const emojiMap = {
    '晴': '☀️',
    '多雲': '⛅',
    '陰': '☁️',
    '雨': '🌧️',
    '雷雨': '⛈️',
    '陣雨': '🌦️',
    '大雨': '🌧️',
    '豪雨': '🌧️'
  }

  for (let key in emojiMap) {
    if (weather.includes(key)) {
      return emojiMap[key]
    }
  }
  return '🌤️'
}

// 更新最後更新時間
function updateLastUpdateTime() {
  const now = new Date()
  const timeString = now.toLocaleTimeString('zh-TW', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  })
  document.getElementById('last-update').textContent = `最後更新：${timeString}`
}

// 初始化
document.addEventListener('DOMContentLoaded', () => {
  fetchWeather()

  // 每 10 分鐘自動更新
  updateInterval = setInterval(fetchWeather, 10 * 60 * 1000)

  // 手動重新整理按鈕
  document.getElementById('refresh-btn').addEventListener('click', () => {
    fetchWeather()
  })
})
