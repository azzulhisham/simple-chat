function getCurrentWeatherRaw()
{
    var searchLocationName = document.getElementById('searchLocation');
    var weatherRawData = document.getElementById('weatherRawData');

    weatherRawData.textContent = 'Loading...';
    
    fetch('/rawweather?search=' + searchLocationName.value).then((response) => {
        response.json().then((data) => {
            weatherRawData.textContent = JSON.stringify(data);
        });       
    });   
}
