const form = document.getElementById('locationForm');
const weatherInfo = document.getElementById('weatherInfo');
const apiKey = 'e381ac7bf12f4b447c9784d4d1f96364'; // My OpenWeatherMap API key
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

    weatherInfo.innerHTML = `
        <h2>${name}</h2>
        <div class="weather-details">
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
    `;
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
});
