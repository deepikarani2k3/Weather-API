const apiKey = "7260a2b34c8ade2fb13cbe6f06b7818b";
const searchBtn = document.getElementById("searchBtn");
const locBtn = document.getElementById("locBtn");
const cityInput = document.getElementById("cityInput");
const weatherInfo = document.getElementById("weatherInfo");
const forecastDiv = document.getElementById("forecast");
const errorDiv = document.getElementById("error");
const recentCitiesDiv = document.getElementById("recentCities");
const cityDropdown = document.getElementById("cityDropdown");
const unitToggle = document.getElementById("unitToggle");
const suggestionsBox = document.getElementById("suggestions");

let isCelsius = true;
let currentTempC = null;
let forecastData = []; 

// Fetch weather by city
async function fetchWeather(city) {
  try {
    const res = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`
    );
    if (!res.ok) throw new Error("City not found");
    const data = await res.json();
    displayWeather(data);
    fetchForecast(data.coord.lat, data.coord.lon);
    saveRecentCity(city);
  } catch (err) {
    showError(err.message);
  }
}

// Display weather
function displayWeather(data) {
  errorDiv.classList.add("hidden");
  weatherInfo.classList.remove("hidden");

  document.getElementById("cityName").innerText = `${data.name}, ${data.sys.country}`;
  document.getElementById("date").innerText = new Date().toDateString();
  currentTempC = data.main.temp;
  document.getElementById("temp").innerText = `${Math.round(currentTempC)} °C`;
  document.getElementById("desc").innerText = data.weather[0].description;
  document.getElementById("details").innerText =
    `Humidity: ${data.main.humidity}% | Wind: ${data.wind.speed} m/s`;

  const icon = data.weather[0].icon;
  document.getElementById("weatherIcon").src = `https://openweathermap.org/img/wn/${icon}@2x.png`;
    // Background change
  const condition = data.weather[0].main.toLowerCase();
  document.body.classList.remove("rainy", "cloudy", "sunny");
  if (condition.includes("rain")) document.body.classList.add("rainy");
  else if (condition.includes("cloud")) document.body.classList.add("cloudy");
  else document.body.classList.add("sunny");

  // Extreme weather alert
  if (currentTempC > 40) {
    showError("🔥 Extreme heat alert! Stay hydrated.");
  } else if (currentTempC < 5) {
    showError("❄️ Cold weather alert! Dress warmly.");
  }

  // Unit toggle
  unitToggle.onclick = () => {
    if (isCelsius) {
      let f = (currentTempC * 9) / 5 + 32;
      document.getElementById("temp").innerText = `${Math.round(f)} °F`;
      renderForecast("imperial");
    } else {
      document.getElementById("temp").innerText = `${Math.round(currentTempC)} °C`;
      renderForecast("metric");
    }
    isCelsius = !isCelsius;
  };
}


