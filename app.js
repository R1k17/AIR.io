let countries = [];
let country = '';
let states = [];
let state = '';
let cities = [];
let city = '';
let aqi = 0;
let lng = 0;
let lat = 0;
let tooltip = false;

const AIR_VISUAL_API = 'https://api.airvisual.com/v2/';
const API_KEY = 'jAFKiAYnvLwL5HYjJ';
const AIR_DATA = 'https://api.airvisual.com/v2/city';

/* Map Api functionality */
function initMap() {
    let uluru = {lat: lat, lng: lng};
    let map = new google.maps.Map(document.getElementById('map'), {
      zoom: 8,
      center: uluru,
      disableDefaultUI: true
    });
    let marker = new google.maps.Marker({
        position: uluru,
        sName: "Marker Name",
        map: map,
        label: {
            text: city + ': ' + aqi,
            fontSize: '22px',
        },
        icon: {
            path: google.maps.SymbolPath.CIRCLE,
            scale: 80,
            fillColor: pollutionChecker(),
            fillOpacity: 0.4,
            strokeWeight: 0.4,
        },
    });
    let contentData = aqi;
    const infowindowText =  '<div id="iw-container">' +
                                '<div class="iw-title boxShadow">' +
                                    '<h2>' + city + '</h2>' +
                                '</div>' +
                                '<div class="iw-text">' +
                                    '<p>The current Air Quality Index of ' + city + ' is ' + contentData + '.</p>' +
                                '</div>' +
                            '</div>';

    let infowindow = new google.maps.InfoWindow({
        content: infowindowText,
        maxWidth: 250,
    })

    google.maps.event.addListener(marker, 'click', function() {
        if (tooltip) {
            infowindow.close();
            tooltip = false;
        } else {
            infowindow.open(map, marker);
            tooltip = true;
        }
    });

    google.maps.event.addListener(marker, 'mouseover', function() {
        infowindow.open(map, marker);
    })

    google.maps.event.addListener(marker, 'mouseout', function() {
        infowindow.close();
    })

    // removes the default infowindowBg
    google.maps.event.addListenerOnce(map, 'idle', function(){
        jQuery('.gm-style-iw').prev('div').remove();
    });
}

/* AirQuality API functionality */
function getCountriesFromAPI() {
    $.ajax({
        method: 'GET',
        dataType: 'JSON',
        url: AIR_VISUAL_API + `countries?key=${API_KEY}`,
        success: (data) => {
            let list = data.data.map(obj => {
                return obj.country;
            });
            countryListCreator(list);
        },
        error: () => console.log('GET states failed')
    });
}

function getStatesFromAPI() {
    $.ajax({
        method: 'GET',
        dataType: 'JSON',
        url: AIR_VISUAL_API + `states?country=${country}&key=${API_KEY}`,
        success: (data) => {
            let list = data.data.map(obj => {
                return obj.state;
            });
            stateListCreator(list);
        },
        error: () => console.log('GET states failed')
    });
}

function getCitiesFromAPI() {
    $.ajax({
        method: 'GET',
        dataType: 'JSON',
        url: AIR_VISUAL_API + `cities?state=${state}&country=${country}&key=${API_KEY}`,
        success: (data) => {
            let list = data.data.map(obj => {
                return obj.city;
            });
            cityListCreator(list);
        },
        error: () => console.log('GET cities failed')
    });
}

function getAirDataFromAPI(callback) {
  const query = {
    city: city,
    state: state,
    country: country,
    key: API_KEY,
  }
  $.getJSON(AIR_DATA, query, callback);
}

/* COUNTRIES functionality */
function countryListCreator(data){
  countries = data;
  country = countries[0];
  countryListMenuCreator();
}

function countryListMenuCreator() {
  let result = countries.map(function(menuCountry){
    return renderCountryOption(menuCountry);
  })
  $('#countryList').html(result);
  displaySelectedCountry();
  countryUpdate();
}

function renderCountryOption(menuCountry){
  return `<option value="${menuCountry}">${menuCountry}</option>`;
}

function countrySelectHandler() {
    $('#countryList').on('change', function() {
        countryUpdate(this);
    });
}

function countryUpdate(currentCountry = country){
    $('select[id="stateList"]').text('');
    $('select[id="cityList"]').text('');
    if (typeof currentCountry !== "string") {
        let selectedCountry = $("option:selected", currentCountry);
        country = selectedCountry[0].innerText;
    }
    displaySelectedCountry();
    getStatesFromAPI();
}

function displaySelectedCountry() {
    $('#countryList').val(country);
}

/* STATES functionality */
function stateListCreator(data = states){
    states = data.map((state) => {
        return state;
    });
    state = states[0];
    stateListMenuCreator();
}

function stateListMenuCreator() {
    let result = states.map(function(state) {
        return renderStateOption(state);
    })
    $('#stateList').html(result);
    displaySelectedState();
    stateUpdate();
}

function renderStateOption(menuState) {
    return `<option value="${menuState}">${menuState}</option>`;
}

function stateSelectHandler() {
    $('#stateList').on('change', function() {
        stateUpdate(this);
    })
}

function stateUpdate(currentState = state){
    $('select[id="cityList"]').text('');
    if (typeof currentState !== "string") {
        let selectedState = $("option:selected", currentState);
        state = selectedState[0].innerText;
    }
    displaySelectedState();
    getCitiesFromAPI();
}

function displaySelectedState() {
    $('#stateList').val(state);
}

/* Cities Functionality */
function cityListCreator(data = cities){
    cities = data.map((city) => {
        return city;
    });
    city = cities[0];
    cityListMenuCreator();
}

function cityListMenuCreator() {
    let result = cities.map(function(city) {
        return renderCityOption(city);
    })
    $('#cityList').html(result);
    displaySelectedCity();
    getAirDataFromAPI(displaySearchData);
}

function renderCityOption(menuCity) {
    return `<option value="${menuCity}">${menuCity}</option>`;
}

function citySelectHandler() {
    $('#cityList').on('change', function() {
        // get the value of city if they select
        // change the global city letiable to their selection
        let selectedCity = $("option:selected", this);
        city = selectedCity[0].innerText;
        getAirDataFromAPI(displaySearchData);
    })
}

function displaySelectedCity() {
    $('#cityList').val(city);
}

/* Air quality functionality */
function displaySearchData(data) {
    aqi = data.data.current.pollution.aqius;
    lng = data.data.location.coordinates[0];
    lat = data.data.location.coordinates[1];
    initMap();
}

/* difining different colors based on aqi */
function pollutionChecker(){
    switch (true) {
        case (aqi <= 25):
        // darkgreen
            return '#27ae60';
        case (25 < aqi && aqi <= 50):
        // lightgreen
            return '#2ecc71';
        case (50 < aqi && aqi <= 75):
        // yellow
            return '#ffeaa7';
        case (75 < aqi && aqi <=100):
        // orange
            return '#fdcb6e';
        case (100 < aqi && aqi <= 125):
        // lightred
            return '#e17055';
        case (125 < aqi):
        // red
            return '#d63031';
    }
}

function toggleHelp(){
    let currentState = true;

    $('#helpBtn').on('click', function(){
        if(currentState){
            // target the helpText div and then populate it with the p
            $('#helpText').html(`<p>The selected city ${city} has a current air quality index of ${aqi}.</p>`);
            // change the class of helpBtn
            $('#helpBtn > #universalIcon').toggleClass('btnClicked', 'fa-universal-access');
            currentState = false;
        } else {
            // depopulating the div
            $('#helpText').html('');
            // change the class back again
            $('#helpBtn > #universalIcon').toggleClass('btnClicked', 'fa-universal-access');
            currentState = true;
        }
    })
}

function toggleAqiInfo(){
    let currentState = true;

    $('#aqiList').on('click', function(){
        if(currentState){
            // target the agiInfo div and then populate it with the ul
            $('#aqiInfo').html('<table>' +
                                    '<tr>'+'<th>Range</th><th>Air Pollution</th></tr>'+
                                    '<tr>'+'<td>0 - 25:</td><td>excelent air</td></tr>'+
                                    '<tr>'+'<td>25 - 50</td><td>good air</td></tr>'+
                                    '<tr>'+'<td>50 - 75</td><td>moderate air</td></tr>'+
                                    '<tr>'+'<td>75 - 100</td><td>lightly polluted air</td></tr>'+
                                    '<tr>'+'<td>100 - 125</td><td>moderately polluted air</td></tr>'+
                                    '<tr>'+'<td>125 <</td><td>highly polluted air</td></tr>'+
                                '</table>'
                                );
            // change the class of aqiListBtn
            $('#aqiList > #listIcon').toggleClass('btnClicked', 'fa-list-ul');
            currentState = false;
        } else {
            // depopulating the div
            $('#aqiInfo').html('');
            // change the class back again
            $('#aqiList > #listIcon').toggleClass('btnClicked', 'fa-list-ul');
            currentState = true;
        }
    })
}

function startApp() {
    getCountriesFromAPI();
    countrySelectHandler();
    stateSelectHandler();
    citySelectHandler();
    toggleHelp();
    toggleAqiInfo();
}

$(startApp());
