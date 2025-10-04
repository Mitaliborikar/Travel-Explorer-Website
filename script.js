// API Configuration
const UNSPLASH_API_KEY = 'YOUR_UNSPLASH_API_KEY'; // Replace with your Unsplash API key
const OPENWEATHER_API_KEY = 'YOUR_OPENWEATHER_API_KEY'; // Replace with your OpenWeatherMap API key

// Toggle: set to false to run without external APIs (mock mode). When true, real APIs and keys are used.
const USE_API = false;

// DOM Elements
const searchInput = document.getElementById('searchInput');
const searchBtn = document.getElementById('searchBtn');
const destinationContent = document.getElementById('destinationContent');
const loadingSpinner = document.getElementById('loadingSpinner');
const errorMessage = document.getElementById('errorMessage');
const initialMessage = document.getElementById('initialMessage');
const photoGrid = document.getElementById('photoGrid');
const weatherIcon = document.getElementById('weatherIcon');
const temperature = document.getElementById('temperature');
const weatherDescription = document.getElementById('weatherDescription');
const humidity = document.getElementById('humidity');
const windSpeed = document.getElementById('windSpeed');
const locationName = document.getElementById('locationName');
const chips = document.querySelectorAll('.chip');

// Event Listeners
searchBtn.addEventListener('click', handleSearch);
// Use keydown (more reliable) to trigger search on Enter
searchInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
        handleSearch();
    }
});

chips.forEach(chip => {
    chip.addEventListener('click', () => {
        const location = chip.getAttribute('data-location');
        searchInput.value = location;
        handleSearch();
    });
});

// Main Search Handler
async function handleSearch() {
    const destination = searchInput.value.trim();
    
    if (!destination) {
        alert('Please enter a destination');
        return;
    }

    // Ensure developer has replaced API key placeholders when actually using APIs
    if (USE_API && (UNSPLASH_API_KEY === 'YOUR_UNSPLASH_API_KEY' || OPENWEATHER_API_KEY === 'YOUR_OPENWEATHER_API_KEY')) {
        alert('Please set your Unsplash and OpenWeatherMap API keys in script.js before searching or switch USE_API to false for mock mode.');
        return;
    }
    // Show loading state
    showLoading();

    try {
        // Fetch data from either real APIs or mock functions depending on USE_API
        const [weatherData, photos] = await Promise.all([
            USE_API ? fetchWeatherData(destination) : fetchMockWeather(destination),
            USE_API ? fetchPhotos(destination) : fetchMockPhotos(destination)
        ]);

        // Display results
        displayWeatherData(weatherData);
        displayPhotos(photos);
        showContent();
    } catch (error) {
        console.error('Error fetching data:', error);
        showError();
    }
}

// Fetch Weather Data
async function fetchWeatherData(city) {
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&units=metric&appid=${OPENWEATHER_API_KEY}`;
    
    const response = await fetch(url);
    
    if (!response.ok) {
        throw new Error('Weather data not found');
    }
    
    return await response.json();
}

// Fetch Photos from Unsplash
async function fetchPhotos(query) {
    const url = `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&per_page=12&client_id=${UNSPLASH_API_KEY}`;
    
    const response = await fetch(url);
    
    if (!response.ok) {
        throw new Error('Photos not found');
    }
    
    const data = await response.json();
    return data.results;
}

// Display Weather Data
function displayWeatherData(data) {
    // Defensive checks in case API shape is unexpected
    const temp = Math.round(data?.main?.temp ?? NaN);
    const description = data?.weather?.[0]?.description ?? '--';
    const icon = data?.weather?.[0]?.icon ?? '';
    const humidityValue = data?.main?.humidity ?? '--';
    const windSpeedValue = data?.wind?.speed ?? null; // meters/sec when units=metric
    const location = data?.name ? `${data.name}, ${data?.sys?.country ?? ''}` : '--';

    temperature.textContent = Number.isNaN(temp) ? '--°C' : `${temp}°C`;
    weatherDescription.textContent = description;
    humidity.textContent = `Humidity: ${humidityValue}%`;
    // Convert wind speed from m/s to km/h for display if available
    if (windSpeedValue !== null) {
        const windKmh = Math.round(windSpeedValue * 3.6);
        windSpeed.textContent = `Wind: ${windKmh} km/h`;
    } else {
        windSpeed.textContent = 'Wind: -- km/h';
    }
    locationName.textContent = location;
    
    // Set weather icon using emoji
    weatherIcon.textContent = getWeatherEmoji(icon);
}

// Get Weather Emoji based on icon code
function getWeatherEmoji(iconCode) {
    const emojiMap = {
        '01d': '☀️', // clear sky day
        '01n': '🌙', // clear sky night
        '02d': '⛅', // few clouds day
        '02n': '☁️', // few clouds night
        '03d': '☁️', // scattered clouds
        '03n': '☁️',
        '04d': '☁️', // broken clouds
        '04n': '☁️',
        '09d': '🌧️', // shower rain
        '09n': '🌧️',
        '10d': '🌦️', // rain day
        '10n': '🌧️', // rain night
        '11d': '⛈️', // thunderstorm
        '11n': '⛈️',
        '13d': '❄️', // snow
        '13n': '❄️',
        '50d': '🌫️', // mist
        '50n': '🌫️'
    };
    
    return emojiMap[iconCode] || '🌤️';
}

// Display Photos
function displayPhotos(photos) {
    photoGrid.innerHTML = '';
    
    if (photos.length === 0) {
        photoGrid.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: #666;">No photos found for this destination.</p>';
        return;
    }
    
    photos.forEach(photo => {
        const photoItem = document.createElement('div');
        photoItem.className = 'photo-item';
        
        photoItem.innerHTML = `
            <img src="${photo.urls.small}" alt="${photo.alt_description || 'Destination photo'}" loading="lazy">
            <div class="photo-credit">
                Photo by ${photo.user.name}
            </div>
        `;
        
        // Open full image on click
        photoItem.addEventListener('click', () => {
            window.open(photo.links.html, '_blank');
        });
        
        photoGrid.appendChild(photoItem);
    });
}

// UI State Management
function showLoading() {
    destinationContent.classList.add('hidden');
    errorMessage.classList.add('hidden');
    initialMessage.classList.add('hidden');
    loadingSpinner.classList.remove('hidden');
}

function showContent() {
    loadingSpinner.classList.add('hidden');
    errorMessage.classList.add('hidden');
    initialMessage.classList.add('hidden');
    destinationContent.classList.remove('hidden');
}

function showError() {
    loadingSpinner.classList.add('hidden');
    destinationContent.classList.add('hidden');
    initialMessage.classList.add('hidden');
    errorMessage.classList.remove('hidden');
}

// Smooth Scroll for Navigation
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// --- Mock data helpers (used when USE_API === false) ---
async function fetchMockWeather(city) {
    // Return a deterministic mock weather object similar to OpenWeatherMap's shape
    await new Promise(r => setTimeout(r, 300)); // simulate network
    return {
        name: city,
        sys: { country: 'XX' },
        main: { temp: 22.5, humidity: 55 },
        weather: [{ description: 'clear sky', icon: '01d' }],
        wind: { speed: 3.2 }
    };
}

async function fetchMockPhotos(query) {
    // Return an array of mock photo-like objects. We'll use Picsum for image URLs.
    await new Promise(r => setTimeout(r, 300)); // simulate network
    const results = [];
    for (let i = 1; i <= 8; i++) {
        const id = (i + Math.abs(hashCode(query))) % 1000; // pseudo varied id
        results.push({
            urls: { small: `https://picsum.photos/id/${id}/400/400` },
            alt_description: `${query} photo ${i}`,
            user: { name: 'Picsum' },
            links: { html: `https://picsum.photos/id/${id}` }
        });
    }
    return results;
}

function hashCode(str) {
    // simple hash for deterministic mock ids
    let h = 0;
    for (let i = 0; i < str.length; i++) {
        h = ((h << 5) - h) + str.charCodeAt(i);
        h |= 0;
    }
    return h;
}