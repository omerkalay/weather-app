# Weather App

A sleek, modern weather application with a professional Crystal UI design. Built with vanilla web technologies and powered by WeatherAPI.com for real-time weather data.

## Live Demo

**Live Website**: [https://omerkalay.com/weather-app/](https://omerkalay.com/weather-app/)

Note: The live demo may not always work due to API token expiration or rate limits. For the best experience, clone the repository and use your own API key.

## Features

- **City Search**: Get weather information for any city worldwide with autocomplete.
- **Current Weather**: Temperature, feels like, humidity, wind speed, and visibility.
- **3-Day Forecast**: Detailed weather forecast with high/low temperatures.
- **Crystal UI**: Premium dark theme with sharp borders and glassmorphism effects.
- **Responsive Design**: Works perfectly on all devices.

## Quick Start

### 1. Clone the Repository
```bash
git clone https://github.com/omerkalay/weather-app.git
cd weather-app
```

### 2. Get Your API Key
- Go to [WeatherAPI.com](https://www.weatherapi.com/)
- Sign up for a free account
- Navigate to your account dashboard to find your API key

### 3. Configure API Key
- Open `script.js` file
- Replace the existing API key with your own:
```javascript
const API_KEY = 'YOUR_API_KEY_HERE'; // Replace with your WeatherAPI.com key
```

**Important**: 
- The current API key in the code is for demonstration purposes and may not work for you.
- API tokens have expiration dates and rate limits.
- Please get your own free API key from WeatherAPI.com for reliable access.

### 4. Open the Application
- Simply open `index.html` in your web browser.

## Technologies Used

- **HTML5**: Structure
- **CSS3**: Styling (Crystal UI, Flexbox, Grids)
- **JavaScript (ES6+)**: Logic and API integration
- **WeatherAPI.com**: Weather data API
- **Phosphor Icons**: High-quality vector icons
- **Google Fonts (Inter & Outfit)**: Typography

## File Structure

```
weather-app/
├── index.html          # Main HTML file
├── style.css           # CSS styles
├── script.js           # JavaScript code
├── README.md           # Project documentation
├── LICENSE             # MIT License
└── .gitignore          # Git ignore file
```

## Usage

1. Enter a city name in the search box.
2. Select from the dropdown suggestions.
3. View current weather information.
4. Check the 3-day forecast with high/low temperatures.

## Contributing

Feel free to fork the repository, create pull requests, or open issues for any suggestions or bug reports.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.