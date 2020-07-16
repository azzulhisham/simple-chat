function getCurrentWeather()
{
    var locationName = $('#inputLocationName').val();
    window.location = "getcurrentweather?search=" + locationName;
}


