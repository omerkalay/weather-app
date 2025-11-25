// WeatherAPI.com API Key
const API_KEY = 'dd767c38d2084355bec112742252907';
const BASE_URL = 'https://api.weatherapi.com/v1';

// DOM Elements
const searchInput = document.getElementById('search-input');
const searchResults = document.getElementById('search-results');
const cityElement = document.getElementById('city');
const dateElement = document.getElementById('date');
const tempElement = document.getElementById('temp');
const descriptionElement = document.getElementById('description');
const weatherIconWrapper = document.querySelector('.weather-icon-wrapper'); // Changed selector
const humidityElement = document.getElementById('humidity');
const windElement = document.getElementById('wind');
const visibilityElement = document.getElementById('visibility');
const forecastContainer = document.getElementById('forecast-container');
const errorMessage = document.getElementById('error-message');
const errorText = document.getElementById('error-text');
const loadingElement = document.getElementById('loading');

// Event Listeners
searchInput.addEventListener('input', debounce(handleSearchInput, 300));

document.addEventListener('click', (e) => {
    if (!searchInput.contains(e.target) && !searchResults.contains(e.target)) {
        hideSearchResults();
    }
});

document.addEventListener('DOMContentLoaded', () => {
    updateDateTime();
    getWeather('Istanbul');
});

// Debounce
function debounce(func, wait) {
    let timeout;
    return function (...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, args), wait);
    };
}

// Search Logic
async function handleSearchInput() {
    const query = searchInput.value.trim();
    if (query.length < 2) {
        hideSearchResults();
        return;
    }
    try {
        const cities = await searchCities(query);
        displaySearchResults(cities);
    } catch (error) {
        console.error('Search failed:', error);
    }
}

async function searchCities(query) {
    const response = await fetch(`${BASE_URL}/search.json?key=${API_KEY}&q=${query}`);
    if (!response.ok) throw new Error('Failed to search cities');
    return await response.json();
}

function displaySearchResults(cities) {
    if (!cities || cities.length === 0) {
        hideSearchResults();
        return;
    }
    searchResults.innerHTML = '';
    cities.forEach(city => {
        const item = document.createElement('div');
        item.className = 'search-result-item';
        item.innerHTML = `
            <div class="city-info">
                <span class="city-name">${city.name}</span>
                <span class="country-code">${city.country}</span>
            </div>
            <i class="ph ph-arrow-right" style="font-size: 14px; opacity: 0.5;"></i>
        `;
        item.addEventListener('click', () => {
            selectCity(city.name);
        });
        searchResults.appendChild(item);
    });
    searchResults.classList.add('show');
}

function hideSearchResults() {
    searchResults.classList.remove('show');
}

function selectCity(cityName) {
    searchInput.value = cityName;
    hideSearchResults();
    getWeather(cityName);
}

// Weather Data Logic
async function getWeather(cityName) {
    showLoading(true);
    hideError();
    try {
        const data = await fetchWeatherData(`/forecast.json?q=${cityName}&days=5&aqi=no`);
        displayWeather(data);
        displayForecast(data);
    } catch (error) {
        console.error('Error:', error);
        showError('City not found');
    } finally {
        showLoading(false);
    }
}

async function fetchWeatherData(endpoint) {
    const response = await fetch(`${BASE_URL}${endpoint}&key=${API_KEY}`);
    if (!response.ok) throw new Error('Failed to fetch weather data');
    return await response.json();
}

// Display Current Weather
function displayWeather(data) {
    cityElement.textContent = data.location.name;
    tempElement.textContent = Math.round(data.current.temp_c);
    descriptionElement.textContent = data.current.condition.text;

    // Vector Icon Logic
    const code = data.current.condition.code;
    const isDay = data.current.is_day === 1;
    const iconClass = getWeatherIconClass(code, isDay);

    // Replace content of wrapper with new icon
    weatherIconWrapper.innerHTML = `<i class="${iconClass} weather-icon-main"></i>`;

    windElement.textContent = `${Math.round(data.current.wind_kph)} km/h`;
    humidityElement.textContent = `${data.current.humidity}%`;
    visibilityElement.textContent = `${data.current.vis_km} km`;
}

// Display Forecast (3 Days)
function displayForecast(data) {
    forecastContainer.innerHTML = '';

    // Show 3 days (Today + Next 2) to ensure we fill the grid on free tier
    const forecastDays = data.forecast.forecastday.slice(0, 3);

    forecastDays.forEach(dayData => {
        const date = new Date(dayData.date);
        const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });

        // Vector Icon Logic for Forecast
        const code = dayData.day.condition.code;
        // Forecast is usually "day" icon unless we have hourly. Use day icon.
        const iconClass = getWeatherIconClass(code, true);

        const item = document.createElement('div');
        item.className = 'forecast-item';
        item.innerHTML = `
            <span class="forecast-day">${dayName}</span>
            <i class="${iconClass} forecast-icon-vector"></i>
            <span class="forecast-temp">${Math.round(dayData.day.maxtemp_c)}°</span>
            <span class="forecast-low">${Math.round(dayData.day.mintemp_c)}°</span>
        `;

        forecastContainer.appendChild(item);
    });
}

// Icon Mapping Function (WeatherAPI Code -> Phosphor Class)
function getWeatherIconClass(code, isDay) {
    // Default
    let icon = 'ph-question';

    // Mapping based on WeatherAPI condition codes
    // https://www.weatherapi.com/docs/weather_conditions.json

    if (code === 1000) { // Sunny/Clear
        icon = isDay ? 'ph-sun' : 'ph-moon-stars';
    } else if (code === 1003) { // Partly cloudy
        icon = isDay ? 'ph-cloud-sun' : 'ph-cloud-moon';
    } else if (code === 1006 || code === 1009) { // Cloudy / Overcast
        icon = 'ph-cloud';
    } else if ([1030, 1135, 1147].includes(code)) { // Mist / Fog
        icon = 'ph-cloud-fog';
    } else if ([1063, 1180, 1183, 1186, 1189, 1192, 1195, 1240, 1243, 1246].includes(code)) { // Rain
        icon = 'ph-cloud-rain';
    } else if ([1066, 1114, 1117, 1210, 1213, 1216, 1219, 1222, 1225, 1255, 1258].includes(code)) { // Snow
        icon = 'ph-snowflake';
    } else if ([1069, 1204, 1207, 1237, 1249, 1252, 1261, 1264].includes(code)) { // Sleet / Ice
        icon = 'ph-cloud-snow';
    } else if ([1087, 1273, 1276, 1279, 1282].includes(code)) { // Thunder
        icon = 'ph-cloud-lightning';
    } else if ([1150, 1153, 1168, 1171].includes(code)) { // Drizzle
        icon = 'ph-drop';
    }

    return `ph ${icon}`;
}

// Utilities
function updateDateTime() {
    const now = new Date();
    dateElement.textContent = now.toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'short',
        day: 'numeric'
    });
}

function showLoading(show) {
    if (show) loadingElement.classList.add('show');
    else loadingElement.classList.remove('show');
}

function showError(msg) {
    errorText.textContent = msg;
    errorMessage.classList.add('show');
    setTimeout(() => {
        errorMessage.classList.remove('show');
    }, 3000);
}

function hideError() {
    errorMessage.classList.remove('show');
}