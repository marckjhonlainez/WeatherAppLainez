document.addEventListener("DOMContentLoaded", function() {
    const apiKey = "zNTeyYJOz1kr636X5pv6CftXKAAJePAV"; // Replace with your actual API key
    const form = document.getElementById("cityForm");
    const weatherDiv = document.getElementById("weather");

    form.addEventListener("submit", function(event) {
        event.preventDefault();
        const city = document.getElementById("cityInput").value;
        getWeather(city);
    });

    function getWeather(city) {
        const locationUrl = `http://dataservice.accuweather.com/locations/v1/cities/search?apikey=${apiKey}&q=${city}`;

        fetch(locationUrl)
            .then(response => response.json())
            .then(locationData => {
                if (locationData && locationData.length > 0) {
                    const locationKey = locationData[0].Key;
                    fetchWeatherData(locationKey);
                } else {
                    weatherDiv.innerHTML = `<p class="error-message">City not found.</p>`;
                }
            })
            .catch(error => {
                console.error("Error fetching location data:", error);
                weatherDiv.innerHTML = `<p class="error-message">Error fetching location data.</p>`;
            });
    }

    function fetchWeatherData(locationKey) {
        const currentConditionsUrl = `http://dataservice.accuweather.com/currentconditions/v1/${locationKey}?apikey=${apiKey}`;
        const hourlyForecastUrl = `http://dataservice.accuweather.com/forecasts/v1/hourly/1hour/${locationKey}?apikey=${apiKey}&metric=true`;
        const dailyForecastUrl = `http://dataservice.accuweather.com/forecasts/v1/daily/5day/${locationKey}?apikey=${apiKey}&metric=true`;

        // Fetch current conditions
        fetch(currentConditionsUrl)
            .then(response => response.json())
            .then(currentData => {
                if (currentData && currentData.length > 0) {
                    const currentWeather = currentData[0];
                    // Fetch hourly forecast
                    fetch(hourlyForecastUrl)
                        .then(response => response.json())
                        .then(hourlyData => {
                            // Fetch daily forecast
                            fetch(dailyForecastUrl)
                                .then(response => response.json())
                                .then(dailyData => {
                                    // Display weather and forecasts
                                    displayWeather(currentWeather, hourlyData, dailyData);
                                })
                                .catch(error => {
                                    console.error("Error fetching daily forecast:", error);
                                    weatherDiv.innerHTML = `<p class="error-message">Error fetching daily forecast.</p>`;
                                });
                        })
                        .catch(error => {
                            console.error("Error fetching hourly forecast:", error);
                            weatherDiv.innerHTML = `<p class="error-message">Error fetching hourly forecast.</p>`;
                        });
                } else {
                    weatherDiv.innerHTML = `<p class="error-message">No weather data available.</p>`;
                }
            })
            .catch(error => {
                console.error("Error fetching current conditions:", error);
                weatherDiv.innerHTML = `<p class="error-message">Error fetching current conditions.</p>`;
            });
    }

    function displayWeather(currentWeather, hourlyForecast, dailyForecast) {
        const temperature = currentWeather.Temperature.Metric.Value;
        const weather = currentWeather.WeatherText;

        let hourlyForecastContent = `<h3>Hourly Forecast (Next 1 Hour)</h3><ul>`;
        for (let i = 0; i < 1; i++) {
            hourlyForecastContent += `<li>${hourlyForecast[i].DateTime}: ${hourlyForecast[i].Temperature.Value}°C, ${hourlyForecast[i].IconPhrase}</li>`;
        }
        hourlyForecastContent += `</ul>`;

        let dailyForecastContent = `<h3>Daily Forecast (Next 5 Days)</h3><ul class="daily-forecast">`;
        for (let i = 0; i < 5; i++) {
            const date = new Date(dailyForecast.DailyForecasts[i].Date);
            const dayOfWeek = date.toLocaleDateString('en-US', { weekday: 'long' });
            const maxTemp = dailyForecast.DailyForecasts[i].Temperature.Maximum.Value;
            const minTemp = dailyForecast.DailyForecasts[i].Temperature.Minimum.Value;
            const weatherDescription = dailyForecast.DailyForecasts[i].Day.IconPhrase;

            dailyForecastContent += `
                <li>
                    <div class="day">${dayOfWeek}</div>
                    <div class="temp">High ${maxTemp}°C, Low ${minTemp}°C</div>
                    <div class="weather">${weatherDescription}</div>
                </li>
            `;
        }
        dailyForecastContent += `</ul>`;

        const weatherContent = `
            <h2>Current Weather</h2>
            <p class="temperature">Temperature: ${temperature}°C</p>
            <p class="weather-description">Weather: ${weather}</p>
            ${hourlyForecastContent}
            ${dailyForecastContent}
        `;
        weatherDiv.innerHTML = weatherContent;
    }
});
