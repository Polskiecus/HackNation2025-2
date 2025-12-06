const cities = [
    { left: 180, top: 120, name: "Warszawa" },
    { left: 140, top: 140, name: "Łódź" }
];

const citiesParent = document.getElementById("cities");
const infoWindow = document.getElementById("info-window");
const infoHeader = document.getElementById("info-header");

let selectedCity = "";

refreshCities();

function refreshCities() {
    citiesParent.innerHTML = "";
    for (let i = 0; i < cities.length; i++) {
        let selectedColor = selectedCity == cities[i].name ? " selected-city" : "";
        citiesParent.innerHTML +=
            `<div class="city" id="` + cities[i].name + `" style="left: ` + cities[i].left + `px; top: ` + cities[i].top + `px">
        <div class="city-point` + selectedColor + `" onclick="clickCity('` + cities[i].name + `')"></div>
        <div class="city-name">` + cities[i].name + `</div>
    </div>`;
    }
}




function clickCity(city) {
    infoWindow.style.display = "unset";
    infoHeader.innerHTML = city;
    selectedCity = city;
    refreshCities();
}

function polandClick() {
    selectedCity = "";
    refreshCities();
    infoWindow.style.display = "none";
}

fetch(new URL("http://localhost:8000/log_in"),
    {
        method: "POST",
        body: JSON.stringify({
            "login": "User1",
            "pwd": "123"
        })

    }).then(res => res.json())
    .then(res => { console.log(res); });