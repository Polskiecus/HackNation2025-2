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

const businessColors = {
    "Paruwex": "#f46e51",
    "BydgoszczEnterprises": "#FFFFFF",
    "NanoHard": "#ff1532",
    "Ropucha": "#0b9e3c",
    "DVDProjectBlue": "#2944f0",
    "Dino-zaur": "#27f418",
    "Dzida": "#bc4414",
};

let prices = [-10, 20, 15, 80, 10, 0, 200, 8];

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

const game = document.getElementById("game");
const login = document.getElementById("login");

const loginInput = document.getElementById("login-input");
const passwordInput = document.getElementById("password-input");

const nickname = document.getElementById("nickname");
const timer = document.getElementById("date");

const playersList = document.getElementById("players-list");
const newsList = document.getElementById("news-list");
const businessRegionList = document.getElementById("business-region-list");
const businessName = document.getElementById("business-name");

const transactionPanel = document.getElementById("transaction-panel");
const transactionSummary = document.getElementById("transaction-summary");
const transactionHeader = document.getElementById("transaction-header");
const transactionSlider = document.getElementById("transaction-slider");
const transactionButton = document.getElementById("transaction-button");

const sharesData = document.getElementById("shares-data");

const moneyText = document.getElementById("money");
const walletText = document.getElementById("wallet-text");

const raidPanel = document.getElementById("raid-panel");
const raidWheel = document.getElementById("raid-wheel");


const peepPanel = document.getElementById("peep-panel");
const peepHeader = document.getElementById("peep-header");
const peepEstimated = document.getElementById("peep-estimated");

const graphPaddingH = 8;
const graphPaddingW = 0;
const graphMultiply = 5;
const graphLinesAmount = 10;

let lastServerTime = 0;

const lerp = (x, y, a) => x * (1 - a) + y * a;

let selectedCity = "";
let loadedNews = [""];
let collapsedGraph = true;
let selectedBusiness = "";
let transactionType = "";
let loggedUser = "";
let mouseOnPanel = false;
let inGame = false;
let id = -1;
let currentSharePrice = 0;
let currentRemainingShares = 0;
let mySharesAmount = 0;
let raidingPlayer = "";
let spinRotation = 0;
let spinTime = 0;
let spinTimer = 0;
let spinMultiplier = 1;
let spinning = false;
let peepTarget = "";

// console.log(document.cookie);
// if (document.cookie != "")
// {
//     onLogin(document.cookie);
// }

refreshCities();
// refreshCanvas();


setInterval(() => {
    loop();
}, 500);

function loop() {
    fetch(new URL("http://localhost:8000/timings")).then(res => res.json())
        .then(res => {
            timer.innerHTML = Math.round(res);
            if (lastServerTime < res && inGame) {
                let audio = new Audio("audio/bell-sound.wav");
                audio.play();

                businessClick(selectedBusiness, false);
            }
            lastServerTime = res;
        });
    fetch(new URL("http://localhost:8000/newsy")).then(res => res.json())
        .then(res => { loadedNews = res; refreshNewsBar(); });

    if (inGame) {
        fetch(new URL("http://localhost:8000/money"),
            {
                method: "POST",
                body: JSON.stringify({
                    "token": id
                })

            }).then(res => res.json())
            .then(res => {
                moneyText.innerHTML = r2(res) + " zł";
            });

        fetch(new URL("http://localhost:8000/acc_value"),
            {
                method: "POST",
                body: JSON.stringify({
                    "token": id
                })

            }).then(res => res.json())
            .then(res => {
                walletText.innerHTML = "Wartość portfela wynosi: " + r2(res) + " zł";
            });
    }
}

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
    if (selectedBusiness == "")
        return;

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

    ctx.strokeStyle = "gray";
    for (let i = 0; i < graphLinesAmount; i++) {
        let y = Math.round(graphPaddingH + ch / (graphLinesAmount - 1) * i);
        ctx.moveTo(graphPaddingW, y);
        ctx.lineTo(graphPaddingW + cw, y);
    }
    ctx.stroke();
    // ctx.endPath();
    ctx.beginPath();
    ctx.strokeStyle = businessColors[selectedBusiness];
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
    grad.addColorStop(0, businessColors[selectedBusiness] + "50");
    grad.addColorStop(1, businessColors[selectedBusiness] + "00");
    ctx.fillStyle = grad;
    ctx.fill();
    ctx.stroke();
}

function refreshNewsBar() {
    for (let i = 0; i < currentNews.length; i++) {
        currentNews[i].innerHTML = loadedNews[0];
    }
}

function clickCity(name, img) {
    fetch(new URL("http://localhost:8000/region_firms"),
        {
            method: "POST",
            body: JSON.stringify({
                "region": name
            })

        }).then(res => res.json())
        .then(res => {
            infoWindow.style.display = "unset";
            infoHeader.innerHTML = name;
            infoImg.src = img;
            selectedCity = name;
            refreshCities();
            businessRegionList.innerHTML = "";
            for (let i = 0; i < res.length; i++) {
                businessRegionList.innerHTML += `
                <button id="business-region-item" onclick="businessClick('` + res[i] + `', true)">
                <table>
                <tr>
                <td>
                    <img src="sprites/` + res[i] + `Icon.png">
                    <td>
                    <td>
                    ` + res[i] + `
                    </td>
                    </tr>
                    </table>
                </button>
                `;

            }
        });
}

function polandClick() {
    selectedCity = "";
    refreshCities();
    infoWindow.style.display = "none";
}

function socialOpen() {
    socialPanel.style.display = "unset";
    playersList.innerHTML = `
    <tr>
                        <th>Nazwa</th>
                        <th>Fundusze</th>
                        <th></th>
                        <th></th>
                    </tr>`;
    fetch(new URL("http://localhost:8000/players")).then(res => res.json())
        .then(res => {
            for (let i = 0; i < res.length; i++) {
                if (res[i] != loggedUser) {
                    playersList.innerHTML += `<tr><td class='player-list-item'>` +
                        res[i] +
                        `</td>
                    <td>?</td>
                    <td><button class='social-button' onclick='raid("` + res[i] + `")'>Sabotaż</button></td>
                    <td><button class='social-button' onclick='check("` + res[i] + `")'>Sprawdź</button></td></tr>`;
                }
            }
        });
}

function socialClose() {
    socialPanel.style.display = "none";
}

function switchGraph() {
    collapsedGraph = !collapsedGraph;
    stockSection.style.display = collapsedGraph ? "none" : "table";
    // collapseGraphButton.style.transform = "scaleX(" + (collapsedGraph ? -1 : 1) + ")";
}

function newsOpen() {
    newsPanel.style.display = "unset";
    newsList.innerHTML = "";
    for (let i = 0; i < loadedNews.length; i++) {
        newsList.innerHTML += `<div class="news-list-item">` + loadedNews[i] + `</div>`;
    }
}

function newsClose() {
    newsPanel.style.display = "none";
}

function signIn() {
    fetch(new URL("http://localhost:8000/log_in"),
        {
            method: "POST",
            body: JSON.stringify({
                "login": loginInput.value,
                "pwd": passwordInput.value
            })

        }).then(res => res.json())
        .then(res => {
            // console.log(res);
            let resId = parseInt(res);


            if (!isNaN(resId)) {
                onLogin(res);
            }
            else {
                alert(res);
            }
        });
}

function onLogin(idValue) {
    id = idValue;
    console.log(id);
    fetch(new URL("http://localhost:8000/cookie-info"),
        {
            method: "POST",
            body: JSON.stringify({ "cookie": id })
        }).then(res => res.json())
        .then(res => {
            console.log(res);

            nickname.innerHTML = "Witaj, " + res;
            document.cookie = idValue;
            loggedUser = res;
            login.style.display = "none";
            game.style.display = "unset";
            inGame = true;
            refreshCities();
            refreshCanvas();
            loop();
        });
}

function signUp() {
    console.log("SIGNUP");
    fetch(new URL("http://localhost:8000/register"),
        {
            method: "POST",
            body: JSON.stringify({
                "login": loginInput.value,
                "pwd": passwordInput.value
            })

        }).then(res => res.json())
        .then(res => { alert(res); });
}

function businessClick(name, withSwitch) {
    fetch(new URL("http://localhost:8000/firminfo"),
        {
            method: "POST",
            body: JSON.stringify({
                "nazwa": name
            })

        }).then(res => res.json())
        .then(res => {
            if (selectedBusiness != "" && withSwitch)
                document.getElementById(selectedBusiness + "Button").classList.remove("selected-button");

            prices = res.values;
            let lastBusiness = selectedBusiness;
            selectedBusiness = name;
            businessName.innerHTML = name;

            currentSharePrice = r2(res.value / res.shares_total);
            sharesData.innerHTML = "Ilość pozostałych akcji: " + res.shares_available + "<br>Cena za akcję: " + currentSharePrice + " zł";

            fetch(new URL("http://localhost:8000/shares_amount"),
                {
                    method: "POST",
                    body: JSON.stringify({
                        "token": id,
                        "akcja": selectedBusiness
                    })

                }).then(res2 => res2.json())
                .then(res2 => {
                    sharesData.innerHTML += "<br>Ilość Twoich akcji: " + res2;
                    mySharesAmount = res2;
                });

            if (withSwitch && (collapsedGraph || lastBusiness != selectedBusiness))
                document.getElementById(selectedBusiness + "Button").classList.add("selected-button");
            console.log(document.getElementById(selectedBusiness + "Button"));
            refreshCanvas();
            if (withSwitch && (collapsedGraph || lastBusiness == selectedBusiness))
                switchGraph();
        });
}

function transactionClose() {
    transactionPanel.style.display = "none";
}

function openTransaction(type) {
    transactionPanel.style.display = "unset";
    if (type == "buy") {
        transactionHeader.innerHTML = "KUP";
        fetch(new URL("http://localhost:8000/firminfo"),
            {
                method: "POST",
                body: JSON.stringify({
                    "nazwa": selectedBusiness
                })

            }).then(res => res.json())
            .then(res => {
                currentSharePrice = r2(res.value / res.shares_total);
                currentRemainingShares = res.shares_available;
                fetch(new URL("http://localhost:8000/money"),
                    {
                        method: "POST",
                        body: JSON.stringify({
                            "token": id
                        })

                    }).then(res2 => res2.json())
                    .then(res2 => {
                        console.log(res2);
                        let amount = Math.min(res2 / currentSharePrice, currentRemainingShares);
                        transactionSlider.max = amount;
                    });
            });
    }
    else {
        transactionHeader.innerHTML = "SPRZEDAJ";
        transactionSlider.max = mySharesAmount;
    }
    transactionType = type;


    transactionSlider.value = 0;
    updateTransactionSummary();
}

function updateTransactionSummary() {
    transactionSummary.innerHTML = transactionSlider.value + " akcji firmy " + selectedBusiness + " za kwotę " + r2(currentSharePrice * transactionSlider.value) + " zł";
}

function confirmTransaction() {
    console.log(selectedBusiness + " " + transactionSlider.value + " " + id);
    fetch(new URL("http://localhost:8000/" + transactionType),
        {
            method: "POST",
            body: JSON.stringify({
                "cookie": id,
                "ilosc": transactionSlider.value,
                "nazwa": selectedBusiness
            })

        }).then(res => res.json())
        .then(res => {
            console.log(res);
            if (res) {
                transactionClose();
                businessClick(selectedBusiness, false);
            }
        });
}

function raid(raided) {
    raidingPlayer = raided;
    raidPanel.style.display = "unset";
    raidWheel.style.transform = "rotate(0deg)";
}

function sendRaid(success) {
    fetch(new URL("http://localhost:8000/raid"),
        {
            method: "POST",
            body: JSON.stringify({ "cookie": id, "raided": raidingPlayer, "success": success })
        }).then(res => res.json())
        .then(res => {
            alert(res ? "Sabotaż przeszedł pomyślnie" : "Sabotaż się nie powiódł");
        });
}

function addMoney() {
    fetch(new URL("http://localhost:8000/NBP"),
        {
            method: "POST",
            body: JSON.stringify({ "token": id, "money": 1000 })
        }).then(res => res.json())
        .then(res => {
            console.log(res);
        });
}

function spinRaidWheel() {
    if (spinning)
        return;
    spinTime = Math.random() * 1080 + 1080;
    spinTimer = 0;
    spinMultiplier = Math.random() * 0.5 + 0.5;
    spinning = true;
    spinLoop();
}

function spinLoop() {
    spinTimer += 0.01 * spinMultiplier;
    raidWheel.style.transform = "rotate(" + lerp(0, spinTime, easeOutCubic(spinTimer)) + "deg)";
    if (spinTimer < 1) {
        setTimeout(() => {
            spinLoop();
        }, 20);
    }
    else {
        setTimeout(() => {
            let sc = spinTime % 360;
            let res = !(sc < 17 || sc > 347 || (sc > 168 && sc < 196));
            sendRaid(res);
            raidClose();
            spinning = false;
        }, 500);
    }
}

function raidClose() {
    raidPanel.style.display = "none";
}

function check(target) {
    peepTarget = target;
    let s = (Math.random() < 0.4);
    // console.log(s);
    fetch(new URL("http://localhost:8000/peep"),
        {
            method: "POST",
            body: JSON.stringify({ "cookie": id, "woman": target, "success": s})
        }).then(res => res.json())
        .then(res => {
            peepHeader.innerHTML = peepTarget;
            peepEstimated.innerHTML = res <= 10 ? "Niepowodzenie" : "Szacowana wartość majątku: ~" + r2(res) + " zł";
            peepPanel.style.display = "unset";
        });
}

function peepClose() {
    peepPanel.style.display = "none";
}

$("#transaction-panel").click(function (e) {
    if (e.target !== this) return;
    transactionClose();
});

$("#news-panel").click(function (e) {
    if (e.target !== this) return;
    newsClose();
});

$("#social-panel").click(function (e) {
    if (e.target !== this) return;
    socialClose();
});

$("#raid-panel").click(function (e) {
    if (e.target !== this) return;
    raidClose();
});

$("#peep-panel").click(function (e) {
    if (e.target !== this) return;
    peepClose();
});

// deleteAllCookies();

// fetch(new URL("http://localhost:8000/newsy")).then(res => res.json())
//     .then(res => { loadedNews = res; refreshNewsBar(); });

// fetch(new URL("http://localhost:8000/log_in"),
//     {
//         method: "POST",
//         body: JSON.stringify({
//             "login": "User1",
//             "pwd": "123"
//         })

//     }).then(res => res.json())
//     .then(res => {
//         console.log(res);
//         id = res;
//         // document.cookie = "expires=Thu, 01 Jan 1970 00:00:00 GMT";
//         // document.cookie = id;
//         console.log(document.cookie);
//         /*
//         fetch(new URL("http://localhost:8000/set-cookie"),
//             {
//                 method: "POST",
//                 body: JSON.stringify({ "value": 10 })
//             }).then(res => res.json())
//             .then(res => { console.log(res); });

//         fetch(new URL("http://localhost:8000/cookie-info"),
//             {
//                 method: "POST"
//             }).then(res => res.json())
//             .then(res => { console.log(res); });
//         */

//         fetch(new URL("http://localhost:8000/buy?nazwa=nanohard&ilosc=10"),
//             {
//                 method: "GET",
//                 // body: JSON.stringify({ "value": 10 })
//             }).then(res => res.json())
//             .then(res => { console.log(res); });


//     });




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


function r2(a) {
    return Math.round(a * 100) / 100;
}

function easeOutCubic(x) {
    return 1 - Math.pow(1 - x, 3);
}