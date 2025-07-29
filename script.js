// WeatherAPI.com API Key - Replace with your own API key
const API_KEY = 'dd767c38d2084355bec112742252907';
const BASE_URL = 'https://api.weatherapi.com/v1';

// DOM Elements
const searchInput = document.getElementById('search-input');
const searchBtn = document.getElementById('search-btn');
const searchResults = document.getElementById('search-results');
const cityElement = document.getElementById('city');
const dateElement = document.getElementById('date');
const tempElement = document.getElementById('temp');
const descriptionElement = document.getElementById('description');
const weatherIcon = document.getElementById('weather-icon');
const feelsLikeElement = document.getElementById('feels-like');
const humidityElement = document.getElementById('humidity');
const windElement = document.getElementById('wind');
const visibilityElement = document.getElementById('visibility');
const forecastContainer = document.getElementById('forecast-container');
const errorMessage = document.getElementById('error-message');
const loadingElement = document.getElementById('loading');

// Event Listeners - Only dropdown selection

// Search input event listeners for autocomplete
searchInput.addEventListener('input', debounce(handleSearchInput, 300));
searchInput.addEventListener('focus', () => {
    if (searchInput.value.trim()) {
        handleSearchInput();
    }
});

// Close search results when clicking outside
document.addEventListener('click', (e) => {
    if (!searchInput.contains(e.target) && !searchResults.contains(e.target)) {
        hideSearchResults();
    }
});

// Initialize with default city
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded, starting Istanbul weather fetch...');
    // Hide error message initially
    hideError();
    updateDateTime();
    
    // Get real weather data for Istanbul
    getWeather('Istanbul');
});

// Debounce function to limit API calls
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Handle search input for autocomplete
async function handleSearchInput() {
    const query = searchInput.value.trim();
    
    if (query.length < 2) {
        hideSearchResults();
        return;
    }

    try {
        const cities = await searchCities(query);
        if (cities.length > 0) {
            displaySearchResults(cities);
        } else {
            showSampleCities(query);
        }
    } catch (error) {
        console.error('API search failed, using sample cities:', error);
        showSampleCities(query);
    }
}

// Sample cities for fallback
function showSampleCities(query) {
    const sampleCities = [
        { name: 'Ankara', country: 'TR', lat: 39.9334, lon: 32.8597 },
        { name: 'Istanbul', country: 'TR', lat: 41.0082, lon: 28.9784 },
        { name: 'Izmir', country: 'TR', lat: 38.4192, lon: 27.1287 },
        { name: 'London', country: 'GB', lat: 51.5074, lon: -0.1278 },
        { name: 'New York', country: 'US', lat: 40.7128, lon: -74.0060 },
        { name: 'Paris', country: 'FR', lat: 48.8566, lon: 2.3522 },
        { name: 'Tokyo', country: 'JP', lat: 35.6762, lon: 139.6503 },
        { name: 'Berlin', country: 'DE', lat: 52.5200, lon: 13.4050 },
        { name: 'Rome', country: 'IT', lat: 41.9028, lon: 12.4964 },
        { name: 'Madrid', country: 'ES', lat: 40.4168, lon: -3.7038 }
    ];
    
    const filteredCities = sampleCities.filter(city => 
        city.name.toLowerCase().includes(query.toLowerCase())
    );
    
    if (filteredCities.length > 0) {
        displaySearchResults(filteredCities);
    } else {
        hideSearchResults();
    }
}

// Search cities using WeatherAPI.com
async function searchCities(query) {
    const response = await fetch(`${BASE_URL}/search.json?key=${API_KEY}&q=${query}`);
    
    if (!response.ok) {
        throw new Error('Failed to search cities');
    }
    
    const data = await response.json();
    return data.map(city => ({
        name: city.name,
        country: city.country,
        lat: city.lat,
        lon: city.lon
    }));
}

// Display search results in dropdown
function displaySearchResults(cities) {
    if (cities.length === 0) {
        hideSearchResults();
        return;
    }

    searchResults.innerHTML = '';
    
    cities.forEach(city => {
        const resultItem = document.createElement('div');
        resultItem.className = 'search-result-item';
        resultItem.innerHTML = `
            <i class="fas fa-map-marker-alt"></i>
            <div>
                <div class="city-name">${city.name}</div>
                <div class="coordinates">${city.lat.toFixed(2)}, ${city.lon.toFixed(2)}</div>
            </div>
            <div class="country-name">${city.country}</div>
        `;
        
        resultItem.addEventListener('click', () => {
            selectCity(city);
        });
        
        searchResults.appendChild(resultItem);
    });
    
    searchResults.classList.add('show');
}

// Hide search results
function hideSearchResults() {
    searchResults.classList.remove('show');
}

// Select a city from search results
function selectCity(city) {
    searchInput.value = city.name;
    hideSearchResults();
    getWeather(city.name);
}

// Get weather by coordinates
async function getWeatherByCoords(lat, lon, cityName) {
    showLoading(true);
    hideError();

    try {
        // Get current weather and forecast
        const weatherData = await fetchWeatherData(`/forecast.json?q=${lat},${lon}&days=5&aqi=no`);
        
        displayWeather(weatherData);
        displayForecast(weatherData);
        
        // Update background based on weather
        updateBackground(weatherData.current.condition.text);
        
    } catch (error) {
        console.error('Error fetching weather data:', error);
        showError('Failed to load weather data. Please try again.');
    } finally {
        showLoading(false);
    }
}

// Get current weather data
async function getWeather(city = null) {
    const cityName = city || searchInput.value.trim();
    
    console.log('getWeather called with city:', cityName);
    
    if (!cityName) {
        showError('Please enter a city name.');
        return;
    }
    
    // Check if we're already showing this city (only for search, not initial load)
    if (cityElement.textContent === cityName && cityElement.textContent !== '') {
        console.log('Already showing weather for:', cityName);
        return; // Don't fetch again if it's the same city
    }
    

    
    showLoading(true);
    hideError();

    try {
        console.log('Fetching weather data for:', cityName);
        // Get weather data directly by city name
        const weatherData = await fetchWeatherData(`/forecast.json?q=${cityName}&days=4&aqi=no`);
        
        console.log('Weather data received:', weatherData);
        console.log('Weather icon URL:', weatherData.current.condition.icon);
        console.log('Forecast data:', weatherData.forecast);
        console.log('Forecast days:', weatherData.forecast.forecastday);
        
        displayWeather(weatherData);
        displayForecast(weatherData);
        
        // Update background based on weather
        updateBackground(weatherData.current.condition.text);
        
    } catch (error) {
        console.error('Error fetching weather data:', error);
        showError('City not found. Please enter a valid city name.');
    } finally {
        showLoading(false);
    }
}

// Fetch data from WeatherAPI.com
async function fetchWeatherData(endpoint) {
    const response = await fetch(`${BASE_URL}${endpoint}&key=${API_KEY}`);
    
    if (!response.ok) {
        throw new Error('Failed to fetch weather data');
    }
    
    return await response.json();
}

// Display current weather
function displayWeather(data) {
    cityElement.textContent = data.location.name;
    tempElement.textContent = Math.round(data.current.temp_c);
    descriptionElement.textContent = data.current.condition.text;
    
    const iconUrl = data.current.condition.icon;
    const secureIconUrl = iconUrl.startsWith('//') ? 'https:' + iconUrl : 
                         iconUrl.startsWith('http://') ? iconUrl.replace('http://', 'https://') : iconUrl;
    
    weatherIcon.src = secureIconUrl;
    
    weatherIcon.onerror = function() {
        console.error('Failed to load weather icon:', secureIconUrl);
        // Set a fallback icon
        weatherIcon.src = 'icon.png';
    };
    
    // Add onload handler to confirm successful loading
    weatherIcon.onload = function() {
        console.log('Weather icon loaded successfully:', secureIconUrl);
    };
    
    // Update favicon with current weather icon
    const favicon = document.getElementById('favicon');
    if (favicon) {
        favicon.href = secureIconUrl;
    }
    
    // Update weather stats
    feelsLikeElement.textContent = `${Math.round(data.current.feelslike_c)}°C`;
    humidityElement.textContent = `${data.current.humidity}%`;
    windElement.textContent = `${Math.round(data.current.wind_kph)} km/h`;
    visibilityElement.textContent = `${(data.current.vis_km).toFixed(1)} km`;
}

// Display 4-day forecast
function displayForecast(data) {
    forecastContainer.innerHTML = '';
    
    const dailyForecasts = data.forecast.forecastday.slice(0, 4);
    
    dailyForecasts.forEach((forecast, index) => {
        const date = new Date(forecast.date);
        const day = getDayName(date.getDay());
        const maxTemp = Math.round(forecast.day.maxtemp_c);
        const minTemp = Math.round(forecast.day.mintemp_c);
        const iconUrl = forecast.day.condition.icon;
        
        const forecastCard = document.createElement('div');
        forecastCard.className = 'forecast-card';
        
        const secureIconUrl = iconUrl.startsWith('//') ? 'https:' + iconUrl : 
                             iconUrl.startsWith('http://') ? iconUrl.replace('http://', 'https://') : iconUrl;
        
        forecastCard.innerHTML = `
            <div class="day">${day}</div>
            <img src="${secureIconUrl}" alt="weather" onerror="console.error('Failed to load forecast icon:', '${secureIconUrl}')">
            <div class="temp-range">
                <div class="temp-high">
                    <span class="temp-dot hot"></span>
                    <span class="temp-value">${maxTemp}°</span>
                </div>
                <div class="temp-low">
                    <span class="temp-dot cold"></span>
                    <span class="temp-value">${minTemp}°</span>
                </div>
            </div>
        `;
        
        forecastContainer.appendChild(forecastCard);
    });
}

// Get day name in English
function getDayName(dayIndex) {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    return days[dayIndex];
}

// Update date and time
function updateDateTime() {
    const now = new Date();
    const options = { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    };
    dateElement.textContent = now.toLocaleDateString('en-US', options);
}

// Update background based on weather condition
function updateBackground(weatherMain) {
    const body = document.body;
    
    // Remove existing weather classes
    body.className = body.className.replace(/weather-\w+/g, '');
    
    // Add appropriate weather class
    switch (weatherMain.toLowerCase()) {
        case 'clear':
            body.classList.add('weather-sunny');
            break;
        case 'clouds':
            body.classList.add('weather-cloudy');
            break;
        case 'rain':
        case 'drizzle':
            body.classList.add('weather-rainy');
            break;
        case 'snow':
            body.classList.add('weather-snowy');
            break;
        case 'thunderstorm':
            body.classList.add('weather-stormy');
            break;
        default:
            // Keep default gradient
            break;
    }
}

// Show/hide loading
function showLoading(show) {
    if (show) {
        loadingElement.classList.add('show');
    } else {
        loadingElement.classList.remove('show');
    }
}

// Show error message
function showError(message) {
    errorMessage.querySelector('span').textContent = message;
    errorMessage.classList.add('show');
}

// Hide error message
function hideError() {
    errorMessage.classList.remove('show');
}

// Add some sample data for demonstration (when API key is not available)
function loadSampleData() {
    showSampleWeatherForCity({ name: 'New York', country: 'US' });
}

// Show sample weather data for specific city
function showSampleWeatherForCity(city) {
    // Sample weather data for different cities
    const cityWeatherData = {
        'Ankara': {
            temp: 18,
            feels_like: 20,
            humidity: 45,
            description: 'sunny',
            icon: '01d',
            wind: 2.1
        },
        'Istanbul': {
            temp: 22,
            feels_like: 24,
            humidity: 70,
            description: 'partly cloudy',
            icon: '02d',
            wind: 3.5
        },
        'Izmir': {
            temp: 25,
            feels_like: 27,
            humidity: 60,
            description: 'clear sky',
            icon: '01d',
            wind: 2.8
        },
        'London': {
            temp: 15,
            feels_like: 13,
            humidity: 80,
            description: 'rain',
            icon: '10d',
            wind: 4.2
        },
        'New York': {
            temp: 25,
            feels_like: 27,
            humidity: 65,
            description: 'partly cloudy',
            icon: '02d',
            wind: 3.3
        },
        'Paris': {
            temp: 20,
            feels_like: 22,
            humidity: 75,
            description: 'cloudy',
            icon: '03d',
            wind: 2.5
        },
        'Tokyo': {
            temp: 28,
            feels_like: 30,
            humidity: 85,
            description: 'clear sky',
            icon: '01d',
            wind: 1.8
        },
        'Berlin': {
            temp: 16,
            feels_like: 14,
            humidity: 70,
            description: 'scattered clouds',
            icon: '03d',
            wind: 3.1
        },
        'Rome': {
            temp: 24,
            feels_like: 26,
            humidity: 65,
            description: 'sunny',
            icon: '01d',
            wind: 2.0
        },
        'Madrid': {
            temp: 30,
            feels_like: 32,
            humidity: 40,
            description: 'clear sky',
            icon: '01d',
            wind: 1.5
        }
    };
    
    const weatherData = cityWeatherData[city.name] || cityWeatherData['New York'];
    
    const sampleWeather = {
        name: city.name,
        main: {
            temp: weatherData.temp,
            feels_like: weatherData.feels_like,
            humidity: weatherData.humidity
        },
        weather: [{
            description: weatherData.description,
            icon: weatherData.icon
        }],
        wind: {
            speed: weatherData.wind
        },
        visibility: 10000
    };
    
    displayWeather(sampleWeather);
    
    // Sample forecast data with variations
    const sampleForecast = {
        list: [
            { dt: Date.now() / 1000, main: { temp: weatherData.temp }, weather: [{ icon: weatherData.icon }] },
            { dt: (Date.now() + 86400000) / 1000, main: { temp: weatherData.temp + 2 }, weather: [{ icon: '01d' }] },
            { dt: (Date.now() + 172800000) / 1000, main: { temp: weatherData.temp - 3 }, weather: [{ icon: '10d' }] },
            { dt: (Date.now() + 259200000) / 1000, main: { temp: weatherData.temp + 1 }, weather: [{ icon: '03d' }] },
            { dt: (Date.now() + 345600000) / 1000, main: { temp: weatherData.temp - 1 }, weather: [{ icon: '02d' }] }
        ]
    };
    
    displayForecast(sampleForecast);
}

// Check if API key is set
if (API_KEY === 'YOUR_API_KEY_HERE') {
    console.error('Please set your API key in script.js');
    showError('API key not configured. Please add your OpenWeatherMap API key.');
}

 