const cities = [
    { left: 0.6, top: 0.4, name: "Warszawa" },
    // { left: 0.46, top: 0.46, name: "Łódź" },
    { left: 0.5, top: 0.8, name: "Kraków" },
    { left: 0.35, top: 0.3, name: "Bydgoszcz" },
    { left: 0.42, top: 0.06, name: "Gdańsk" },
    { left: 0.018, top: 0.18, name: "Szczecin" },
    // { left: 0.25, top: 0.38, name: "Poznań" },
    { left: 0.27, top: 0.6, name: "Wrocław" },
    { left: 0.8, top: 0.58, name: "Lublin" },
    { left: 0.85, top: 0.28, name: "Białystok" },
];

const prices = [-10, 20, 15, 80, 10, 0, 200, 8];

const PolandMap = document.getElementById("poland-map");
const citiesParent = document.getElementById("cities");
const infoWindow = document.getElementById("info-window");
const infoHeader = document.getElementById("info-header");
const canvas = document.getElementById("stock-graph");
const ctx = canvas.getContext("2d");

const graphPaddingH = 8;
const graphPaddingW = 0;
const graphMultiply = 5;
const graphLinesAmount = 10;

const lerp = (x, y, a) => x * (1 - a) + y * a;

let selectedCity = "";

refreshCities();
refreshCanvas();

function refreshCities() {
    citiesParent.innerHTML = "";
    for (let i = 0; i < cities.length; i++) {
        let selectedColor = selectedCity == cities[i].name ? " selected-city" : "";
        let rect = PolandMap.getBoundingClientRect();
        let pw = rect.width;
        let ph = rect.height;
        citiesParent.innerHTML +=
            `<div class="city" id="` + cities[i].name + `" style="left: ` + cities[i].left * pw + `px; top: ` + cities[i].top * ph + `px">
        <div class="city-point` + selectedColor + `" onclick="clickCity('` + cities[i].name + `')"></div>
        <div class="city-name">` + cities[i].name + `</div>
    </div>`;
    }
}

function refreshCanvas(){
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    ctx.beginPath();
    const cw = (canvas.width - 2 * graphPaddingW);
    const ch = (canvas.height - 2 * graphPaddingH);
    const step = cw / (prices.length - 1);
    let minVal = prices[0];
    let maxVal = prices[0];
    for (let i = 1; i < prices.length; i++) {
        if (prices[i] < minVal)
            minVal = prices[i];
        else if (prices[i] > maxVal)
            maxVal = prices[i];
    }

    minVal = Math.round(minVal * graphMultiply) / graphMultiply - graphMultiply;
    maxVal = Math.round(maxVal * graphMultiply) / graphMultiply + graphMultiply;
    console.log(minVal + " and " + maxVal);

    ctx.strokeStyle = "gray";
    for (let i = 0; i < graphLinesAmount; i++) {
        let y = Math.round(graphPaddingH + ch / (graphLinesAmount - 1) * i);
        ctx.moveTo(graphPaddingW, y);
        ctx.lineTo(graphPaddingW + cw, y);
    }
    ctx.stroke();
    // ctx.endPath();
    ctx.beginPath();
    ctx.strokeStyle = "orange";
    for (let i = 0; i < prices.length; i++) {
        let im = -minVal;
        let y = lerp(canvas.height - graphPaddingH, graphPaddingH, (prices[i] + im) / (maxVal + im));
        if (i == 0)
            ctx.moveTo(graphPaddingW, y);
        else
            ctx.lineTo(step * i + graphPaddingW, y);
    }
    ctx.lineTo(graphPaddingW + cw, canvas.height + 2);
    ctx.lineTo(graphPaddingW, canvas.height + 2);
    // ctx.fillStyle = "#ffbb0050";
    const grad = ctx.createLinearGradient(0, 0, 0, ch * 1.5);
    grad.addColorStop(0, "#ffbb0050");
    grad.addColorStop(1, "#ffbb0000");
    ctx.fillStyle = grad;
    ctx.fill();
    ctx.stroke();
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

fetch(new URL("http://localhost:8000/register"),
    {
        method: "POST",
        body: JSON.stringify({
            "login": "User1",
            "pwd": "123"
        })

    }).then(res => res.json())
    .then(res => { console.log(res); });

id = 0;

// deleteAllCookies();

fetch(new URL("http://localhost:8000/log_in"),
    {
        method: "POST",
        body: JSON.stringify({
            "login": "User1",
            "pwd": "123"
        })

    }).then(res => res.json())
    .then(res => {
        console.log(res);
        id = res;
        // document.cookie = "expires=Thu, 01 Jan 1970 00:00:00 GMT";
        // document.cookie = id;
        console.log(document.cookie);

        fetch(new URL("http://localhost:8000/set-cookie"),
            {
                method: "POST",
                body: JSON.stringify({"value": 10})
            }).then(res => res.json())
            .then(res => { console.log(res); });

        fetch(new URL("http://localhost:8000/cookie-info"),
            {
                method: "POST"
            }).then(res => res.json())
            .then(res => { console.log(res); });

            

    });

function deleteAllCookies() {
    document.cookie.split(';').forEach(cookie => {
        const eqPos = cookie.indexOf('=');
        const name = eqPos > -1 ? cookie.substring(0, eqPos) : cookie;
        document.cookie = name + '=;expires=Thu, 01 Jan 1970 00:00:00 GMT';
    });
}