const apiKey = '15ac461aa2a216ffa69c9c371323583a';

const translations = {
  en: {
    label: "Choose your language:",
    avgTemp: 'Avg Temp',
    feelsLike: 'Avg Feels Like',
    humidity: 'Avg Humidity',
    weather: 'Weather',
    loading: 'Loading forecast...',
    errorLocation: 'Could not get your location.',
    errorForecast: 'Could not get forecast.',
    weekdays: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
  },
  el: {
    label: "Επιλέξτε τη γλώσσα σας:",
    avgTemp: 'Μ.Ο. Θερμοκρασίας',
    feelsLike: 'Μ.Ο. Αίσθηση Θερμοκρασίας',
    humidity: 'Μ.Ο. Υγρασίας',
    weather: 'Καιρός',
    loading: 'Φόρτωση πρόγνωσης...',
    errorLocation: 'Δεν ήταν δυνατή η λήψη της τοποθεσίας σας.',
    errorForecast: 'Δεν ήταν δυνατή η λήψη πρόγνωσης.',
    weekdays: ["Κυριακή", "Δευτέρα", "Τρίτη", "Τετάρτη", "Πέμπτη", "Παρασκευή", "Σάββατο"]
  },
  es: {
    label: "Elige tu idioma:",
    avgTemp: 'Temp Prom.',
    feelsLike: 'Temp Sensación',
    humidity: 'Humedad Prom.',
    weather: 'Clima',
    loading: 'Cargando pronóstico...',
    errorLocation: 'No se pudo obtener tu ubicación.',
    errorForecast: 'No se pudo obtener el pronóstico.',
   weekdays: ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"]
  }
};

let currentLang = navigator.language.split('-')[0];

if (!translations[currentLang]) {
  currentLang = 'en';
}

window.onload = () => {
  fetch('https://ipapi.co/json/')
    .then(res => res.json())
    .then(location => {
      const city = location.city;
      getForecast(city);
    })
    .catch(err => {
      document.getElementById('weather').textContent = translations[currentLang].errorLocation;
      console.error(err);
    });

  translateContent();
};

function getForecast(locationFromInput) {

  const location = locationFromInput || document.getElementById('locationInput').value;
  if (!location) return;

  fetch(`https://api.openweathermap.org/data/2.5/forecast?q=${encodeURIComponent(location)}&appid=${apiKey}&units=metric`)

    .then(response => {

      if (!response.ok) throw new Error("Location not found");
      return response.json();

    })

    .then(forecastData => {

      const groupedByDay = {};

      forecastData.list.forEach(item => {

        const date = new Date(item.dt * 1000);
        const weekday = date.getDay();
        const dateString = date.toLocaleDateString();

        if (!groupedByDay[dateString]) groupedByDay[dateString] = [];
        groupedByDay[dateString].push(item);

      });

      const output = Object.entries(groupedByDay).slice(0, 7).map(([date, entries]) => {

        const temps = entries.map(e => e.main.temp);
        const feels = entries.map(e => e.main.feels_like);
        const humidities = entries.map(e => e.main.humidity);
        const descriptions = entries.map(e => e.weather[0].description);
      
        const avg = arr => Math.round(arr.reduce((a, b) => a + b, 0) / arr.length);
        const mostCommonDesc = descriptions.sort((a,b) =>
          descriptions.filter(v => v===a).length - descriptions.filter(v => v===b).length
        ).pop();
      
        const weekday = new Date(entries[0].dt * 1000).getDay(); 
        const weekdayName = translations[currentLang].weekdays[weekday];
      
        return `

          <div class="neumorphic neumorphic-card hvr-float" style="margin: 15px;">

            <h3>${weekdayName}, ${new Date(date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</h3>
            <h4> ${forecastData.city.name},${forecastData.city.country} </h4>
            <p>🌡️ ${translations[currentLang].avgTemp}: ${avg(temps)}°C</p>
            <p>🤗 ${translations[currentLang].feelsLike}: ${avg(feels)}°C</p>
            <p>💧 ${translations[currentLang].humidity}: ${avg(humidities)}%</p>
            <p>🌤️ ${translations[currentLang].weather}: ${mostCommonDesc}</p>

          </div>
        `;

      }).join('');


      document.getElementById('weather').innerHTML = output;
    })
    .catch(error => {

      document.getElementById('weather').textContent = translations[currentLang].errorForecast;
      console.error('Error:', error);

    });
}

function translateContent() {

  document.querySelector('label[for="language-select"]').textContent = translations[currentLang].label;
  document.getElementById('weather').textContent = translations[currentLang].loading;
  document.getElementById('Caution').textContent = translations[currentLang].caution;

}