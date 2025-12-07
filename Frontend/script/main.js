const cities = [
    { left: 0.6, top: 0.4, name: "Warszawa", img: "https://go2warsaw.pl/wp-content/uploads/panorama-fot-mst-warszawa-4.jpg" },
    // { left: 0.46, top: 0.46, name: "Łódź" },
    { left: 0.5, top: 0.8, name: "Kraków", img: "https://polish-presidency.consilium.europa.eu/media/2xljqezp/54384915012_fc48f51f41_o.jpg?cc=0.11391683504101668,0.0000000000000001162045249594,0.11356012787117589,0&width=2080&height=1170&v=1db94ddf00c9000" },
    { left: 0.35, top: 0.3, name: "Bydgoszcz", img: "https://pulspodrozy.pl/wp-content/smush-webp/2024/12/byd5_anonymized.jpg.webp" },
    { left: 0.42, top: 0.06, name: "Gdańsk", img: "https://www.qubushotel.com/wp-content/uploads/1535628682_1594812197-1200x675.png" },
    { left: 0.018, top: 0.18, name: "Szczecin", img: "https://images.immediate.co.uk/production/volatile/sites/63/2024/08/szczecin-794fc03.jpeg?resize=1366,911" },
    // { left: 0.25, top: 0.38, name: "Poznań" },
    { left: 0.27, top: 0.6, name: "Wrocław", img: "https://dolnyslask.travel/_ipx/_/https://dst-cms.frogriot.com/wp-content/uploads/2024/10/shutterstock_ostrow_tumski_1920.png" },
    { left: 0.8, top: 0.58, name: "Lublin", img: "https://cdn.wiadomosci.onet.pl/1/rj4k9lBaHR0cHM6Ly9vY2RuLmV1L3B1bHNjbXMvTURBXy9iYjJhMTIyMGEzY2E2M2YzMjUyNGRmZDBmZWNhMTZhMC5qcGeSlQMAzNbNDvDNCGeTBc0JYM0E7N4AAqEwB6ExBA" },
    { left: 0.85, top: 0.28, name: "Białystok", img: "https://www.evertrek.pl/userdata/public/news/images/229.jpg" },
];

const prices = [-10, 20, 15, 80, 10, 0, 200, 8];

const PolandMap = document.getElementById("poland-map");
const citiesParent = document.getElementById("cities");
const infoWindow = document.getElementById("info-window");
const infoHeader = document.getElementById("info-header");
const infoImg = document.getElementById("info-img");
const canvas = document.getElementById("stock-graph");
const ctx = canvas.getContext("2d");
const currentNews = document.getElementsByClassName("news-bar");
const stockSection = document.getElementById("stock-section");
const collapseGraphButton = document.getElementById("collapse-graph-button");

const socialPanel = document.getElementById("social-panel");
const newsPanel = document.getElementById("news-panel");

const graphPaddingH = 8;
const graphPaddingW = 0;
const graphMultiply = 5;
const graphLinesAmount = 10;

const lerp = (x, y, a) => x * (1 - a) + y * a;

let selectedCity = "";
let loadedNews = [""];
let collapsedGraph = false;

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
            `<div class="city" id="` + cities[i].name + `" style="left: ` + cities[i].left * pw + `px; top: ` + cities[i].top * ph + `px" onclick="clickCity('` + cities[i].name + `', '` + cities[i].img + `')">
            <div class="city-point` + selectedColor + `"></div>
            <div class="city-name">` + cities[i].name + `</div>
        </div>`;
    }
}

function refreshCanvas() {
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

function refreshNewsBar(){
    for (let i = 0; i < currentNews.length; i++) {
        currentNews[i].innerHTML = loadedNews[0];
    }
}

function clickCity(name, img) {
    infoWindow.style.display = "unset";
    infoHeader.innerHTML = name;
    infoImg.src = img;
    selectedCity = name;
    refreshCities();
}

function polandClick() {
    selectedCity = "";
    refreshCities();
    infoWindow.style.display = "none";
}

function socialOpen() {
    socialPanel.style.display = "unset";
}

function socialClose() {
    socialPanel.style.display = "none";
}

function switchGraph() {
    collapsedGraph = !collapsedGraph;
    stockSection.style.display = collapsedGraph ? "none" : "table";
    collapseGraphButton.style.transform = "scaleX(" + (collapsedGraph ? -1 : 1) + ")";
}

function newsOpen() {
    newsPanel.style.display = "unset";
}

function newsClose() {
    newsPanel.style.display = "none";
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

fetch(new URL("http://localhost:8000/newsy")).then(res => res.json())
    .then(res => { loadedNews = res; refreshNewsBar(); });

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
        /*
        fetch(new URL("http://localhost:8000/set-cookie"),
            {
                method: "POST",
                body: JSON.stringify({ "value": 10 })
            }).then(res => res.json())
            .then(res => { console.log(res); });

        fetch(new URL("http://localhost:8000/cookie-info"),
            {
                method: "POST"
            }).then(res => res.json())
            .then(res => { console.log(res); });
        */

        fetch(new URL("http://localhost:8000/buy?nazwa=nanohard&ilosc=10"),
            {
                method: "GET",
                // body: JSON.stringify({ "value": 10 })
            }).then(res => res.json())
            .then(res => { console.log(res); });


    });




// fetch(new URL("http://localhost:8000/timings")).then(res => res.json())
//     .then(res => { console.log(res); });

// fetch(new URL("http://localhost:8000/region_firms"), {method: "POST", body: JSON.stringify({"asd": "alsdkj"})}).then(res => res.json())
//     .then(res => { console.log(res); });

function deleteAllCookies() {
    document.cookie.split(';').forEach(cookie => {
        const eqPos = cookie.indexOf('=');
        const name = eqPos > -1 ? cookie.substring(0, eqPos) : cookie;
        document.cookie = name + '=;expires=Thu, 01 Jan 1970 00:00:00 GMT';
    });
}