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

// Fetch forecast
async function fetchForecast(lat, lon) {
    try {
        const res = await fetch(
            `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`
        );
        const data = await res.json();
        forecastData = data.list;
        renderForecast("metric");
    } catch (err) {
        showError("Unable to fetch forecast");
    }
}

// Render forecast (metric/imperial toggle supported)
function renderForecast(unit = "metric") {
    forecastDiv.innerHTML = "";
    forecastDiv.classList.remove("hidden");

    const daily = forecastData.filter(item => item.dt_txt.includes("12:00:00"));

    daily.forEach(day => {
        const card = document.createElement("div");
        card.className = "bg-white/30 backdrop-blur-lg rounded-2xl shadow-lg p-4 text-center";

        let tempC = day.main.temp;
        let temp = unit === "metric"
            ? `${Math.round(tempC)} °C`
            : `${Math.round((tempC * 9) / 5 + 32)} °F`;

        const wind = `${day.wind.speed} m/s`;
        const humidity = `${day.main.humidity}%`;
        const icon = `https://openweathermap.org/img/wn/${day.weather[0].icon}@2x.png`;

        card.innerHTML = `
      <h3 class="text-white font-semibold">${new Date(day.dt_txt).toDateString()}</h3>
      <img src="${icon}" class="mx-auto w-12 h-12" />
      <p class="text-white text-lg">${temp}</p>
      <p class="text-white text-sm">💨 ${wind} | 💧 ${humidity}</p>
    `;

        forecastDiv.appendChild(card);
    });
}

// Error
function showError(msg) {
    weatherInfo.classList.add("hidden");
    forecastDiv.classList.add("hidden");
    errorDiv.classList.remove("hidden");
    errorDiv.innerText = "⚠️ " + msg;
    setTimeout(() => errorDiv.classList.add("hidden"), 3000);
}

// Save recent cities
function saveRecentCity(city) {
    city = city.charAt(0).toUpperCase() + city.slice(1).toLowerCase();
    let cities = JSON.parse(localStorage.getItem("recentCities")) || [];
    if (!cities.includes(city)) {
        cities.unshift(city);
        localStorage.setItem("recentCities", JSON.stringify(cities));
    }
    updateDropdown();
}

// Update dropdown
function updateDropdown() {
    let cities = JSON.parse(localStorage.getItem("recentCities")) || [];
    if (cities.length > 0) {
        recentCitiesDiv.classList.remove("hidden");
        cityDropdown.innerHTML = `<option value="">-- Select City --</option>`;
        cities.forEach(c => {
            cityDropdown.innerHTML += `<option value="${c}">${c}</option>`;
        });
    }
}

// Event Listeners
searchBtn.onclick = () => {
    const city = cityInput.value.trim();
    if (city === "") return showError("Please enter a city name");
    fetchWeather(city);
};

locBtn.onclick = () => {
    navigator.geolocation.getCurrentPosition(
        pos => fetchWeatherByCoords(pos.coords.latitude, pos.coords.longitude),
        () => showError("Location access denied")
    );
};

async function fetchWeatherByCoords(lat, lon) {
    try {
        const res = await fetch(
            `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`
        );
        const data = await res.json();
        displayWeather(data);
        fetchForecast(lat, lon);
        saveRecentCity(data.name);
    } catch {
        showError("Unable to fetch location weather");
    }
}

cityDropdown.onchange = () => {
    if (cityDropdown.value !== "") fetchWeather(cityDropdown.value);
};

// Suggestions (autocomplete)
cityInput.addEventListener("input", async () => {
  const query = cityInput.value.trim();
  if (query.length < 2) {
    suggestionsBox.classList.add("hidden");
    return;
  }

  try {
    const res = await fetch(
      `https://api.openweathermap.org/geo/1.0/direct?q=${query}&limit=5&appid=${apiKey}`
    );
    const cities = await res.json();

    if (cities.length === 0) {
      suggestionsBox.classList.add("hidden");
      return;
    }

    suggestionsBox.innerHTML = "";
    cities.forEach(c => {
      const li = document.createElement("li");
      li.innerText = `${c.name}, ${c.country}`;
      li.onclick = () => {
        cityInput.value = `${c.name}`;
        suggestionsBox.classList.add("hidden");
        fetchWeather(c.name);
      };
      suggestionsBox.appendChild(li);
    });

    suggestionsBox.classList.remove("hidden");
  } catch (err) {
    console.error("Error fetching city suggestions:", err);
  }
});

// Load recent cities on startup
updateDropdown();
