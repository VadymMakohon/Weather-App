const form = document.getElementById('locationForm');
const weatherInfo = document.getElementById('weatherInfo');
const apiKey = 'e381ac7bf12f4b447c9784d4d1f96364'; // Your OpenWeatherMap API key
let isCelsius = true;

form.addEventListener('submit', async function (event) {
    event.preventDefault();
    weatherInfo.innerHTML = '<div class="loading-spinner"></div>';

    const city = form.city.value;

    try {
        const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`);
        const data = await response.json();

        if (response.ok) {
            displayWeather(data);
            await fetchForecast(city);
        } else {
            weatherInfo.innerHTML = `<p id="errorInfo">Error: ${data.message}</p>`;
        }
    } catch (error) {
        console.error('Error fetching weather data:', error);
        weatherInfo.innerHTML = '<p id="errorInfo">Something went wrong. Please try again later.</p>';
    }
});

function displayWeather(data) {
    const { name, main, weather, wind } = data;
    const temperature = main.temp;
    const description = weather[0].description;
    const icon = `http://openweathermap.org/img/wn/${weather[0].icon}.png`;
    const backgroundClass = getBackgroundClass(weather[0].main);

    weatherInfo.innerHTML = `
        <h2>${name}</h2>
        <div class="weather-details ${backgroundClass}">
            <img src="${icon}" alt="${description}" class="weather-icon">
            <div>
                <p>Temperature: <span id="temperature">${temperature}</span>°<span id="unit">C</span></p>
                <p>Description: ${description}</p>
                <p>Humidity: ${main.humidity}%</p>
                <p>Wind Speed: ${wind.speed} m/s</p>
            </div>
        </div>
        <div class="unit-toggle-container">
            <button class="unit-toggle" onclick="toggleUnits()">Toggle to °F</button>
        </div>
        <div id="forecast"></div>
    `;

    document.body.className = backgroundClass;
}

async function fetchForecast(city) {
    try {
        const response = await fetch(`https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}&units=metric`);
        const data = await response.json();

        if (response.ok) {
            displayForecast(data);
        } else {
            document.getElementById('forecast').innerHTML = `<p id="errorInfo">Error: ${data.message}</p>`;
        }
    } catch (error) {
        console.error('Error fetching forecast data:', error);
        document.getElementById('forecast').innerHTML = '<p id="errorInfo">Something went wrong. Please try again later.</p>';
    }
}

function displayForecast(data) {
    let forecastHtml = '<h3>3-Day Forecast</h3>';
    for (let i = 0; i < 3; i++) {
        const forecast = data.list[i * 8]; // every 8th entry is a new day (3-hour intervals)
        const date = new Date(forecast.dt_txt).toLocaleDateString();
        const temperature = forecast.main.temp;
        const description = forecast.weather[0].description;
        const icon = `http://openweathermap.org/img/wn/${forecast.weather[0].icon}.png`;

        forecastHtml += `
            <div class="forecast-item">
                <h4>${date}</h4>
                <img src="${icon}" alt="${description}" class="weather-icon">
                <p>Temperature: ${temperature}°C</p>
                <p>Description: ${description}</p>
            </div>
        `;
    }
    document.getElementById('forecast').innerHTML = forecastHtml;
}

function getBackgroundClass(weather) {
    switch (weather.toLowerCase()) {
        case 'clear':
            return 'clear-sky';
        case 'clouds':
            return 'cloudy';
        case 'rain':
            return 'rainy';
        case 'snow':
            return 'snowy';
        case 'thunderstorm':
            return 'stormy';
        default:
            return 'default-weather';
    }
}

function toggleUnits() {
    const temperatureElement = document.getElementById('temperature');
    const unitElement = document.getElementById('unit');
    const toggleButton = document.querySelector('.unit-toggle');

    let temperature = parseFloat(temperatureElement.textContent);

    if (isCelsius) {
        temperature = (temperature * 9 / 5) + 32;
        unitElement.textContent = 'F';
        toggleButton.textContent = 'Toggle to °C';
    } else {
        temperature = (temperature - 32) * 5 / 9;
        unitElement.textContent = 'C';
        toggleButton.textContent = 'Toggle to °F';
    }

    temperatureElement.textContent = temperature.toFixed(1);
    isCelsius = !isCelsius;
}

function getLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(async function (position) {
            const lat = position.coords.latitude;
            const lon = position.coords.longitude;

            try {
                const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`);
                const data = await response.json();

                if (response.ok) {
                    displayWeather(data);
                } else {
                    weatherInfo.innerHTML = `<p id="errorInfo">Error: ${data.message}</p>`;
                }
            } catch (error) {
                console.error('Error fetching weather data:', error);
                weatherInfo.innerHTML = '<p id="errorInfo">Something went wrong. Please try again later.</p>';
            }
        });
    } else {
        weatherInfo.innerHTML = '<p id="errorInfo">Geolocation is not supported by this browser.</p>';
    }
}

document.addEventListener('DOMContentLoaded', function () {
    getLocation();
    initializeAutocomplete();
});

function initializeAutocomplete() {
    const input = document.getElementById('city');
    const autocomplete = new google.maps.places.Autocomplete(input);
    autocomplete.setFields(['address_components', 'geometry', 'icon', 'name']);
    autocomplete.addListener('place_changed', () => {
        const place = autocomplete.getPlace();
        if (!place.geometry) {
            console.log("No details available for input: '" + place.name + "'");
            return;
        }
        const lat = place.geometry.location.lat();
        const lon = place.geometry.location.lng();
        fetchWeatherByCoordinates(lat, lon);
    });
}

async function fetchWeatherByCoordinates(lat, lon) {
    try {
        const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`);
        const data = await response.json();

        if (response.ok) {
            displayWeather(data);
        } else {
            weatherInfo.innerHTML = `<p id="errorInfo">Error: ${data.message}</p>`;
        }
    } catch (error) {
        console.error('Error fetching weather data:', error);
        weatherInfo.innerHTML = '<p id="errorInfo">Something went wrong. Please try again later.</p>';
    }
}
