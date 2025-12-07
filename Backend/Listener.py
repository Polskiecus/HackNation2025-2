from fastapi import FastAPI, Request, Cookie, Response
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from fastapi.middleware.cors import CORSMiddleware
from math import lgamma
import threading
import asyncio
import random
import time


from User import User
from Listener import *
from Gielda import *
from User import *
from NewsHandler import *
import time

app = FastAPI()
RUN = True

origins = ["*"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


bullshit_news = [
"Papież Pierdnął",
"Pies spadł z drzewa",
"Ktoś potrącił staruszkę",
"Prezydent znowu kłamie! SKANDL",
"GUS zapomniał opublikować danych",
"Szop się upił",
"tojoda kojolla na promocji",
"Dzień Matki już za tydzień",
"niedziela niehandlowa",
"słój pękł",
"jeden kubek nie wystarcza",
"pepsi kosztuje złotówke wiecej",
"alkohol w sejmie",
"dzisiaj pogoda jak zwykle",
"Ładna dziś pogoda",
"hPa wynosi 997",
"Szpitale pełne",
"prezydent spotkał się z bezdomnymi",
"nauczyciel zadał pracę domową !SZOK! teraz grozi mu więzienie",
"nic się nie stało",
"dziura czasoprzestrzenna odnaleziona w bydgoszczy",
"odkryta przód zadzidzia dzidy bojowej",
"metro w warszawie spóźniło się 2,5 minuty",
"bob budowniczy nie zbudował",
"listonosz pat nie zdążył",
"pękła guma w bolidzie ale dojehał do mety[PRAWDZIWA HISTORIA]",
"Polska wciąż pozostaje na pierwszym miejscu liczby wypadków samochodowych",
"SZOKUJĄCE PROJEKCJE: Polacy nie jedzą mięsa?!",
"Całe życie źle piłeś wode, amerykańscy naukowcy dokonali szokującego odkrycia",
"kawa się wystudziła",
"Biedronka w mszczonowie jednak się nie otworzy",
"Wojny pod empikiem! zajęli dział z beletrystyką!",
"Half life 3 wciąż nie wyszedł",
"GTA 6?!! ujawiona data"
]

@app.get("/players")
def Players():
	global main_users
	return [name for name in main_users]

def extract_login_from_request(cookie: int):
	try:
		global Cookies
		return Cookies[cookie]
	except:
		print("you retarded as fuck")
		pass

# may god have mercy upon me
async def RunAtIntervals():
	global RUN, main_scheduler
	while RUN:
		main_scheduler.check_for_update()
		await asyncio.sleep(1)

@app.get("/timings")
async def Timings(): #za ile sekund aktualizuje sie rynek
	global main_scheduler
	return main_scheduler.time_to_pass + main_scheduler.last_checked - time.time()

@app.get("/buy")
async def Buy(nazwa: str, ilosc: int) -> bool:
	data = await request.json()

	login = extract_login_from_request(data["cookie"])
	ilosc = data["ilosc"]
	nazwa = data["nazwa"]

	if login not in main_users:
		return False

	try:
		ilosc = int(ilosc)
	except:
		return False  # nie wykonalo sie

	return main_users[login].kup_akcje(nazwa, ilosc)[0]


@app.get("/sell")
async def Sell(request: Request) -> bool:
	data = await request.json()

	login = extract_login_from_request(data["cookie"])
	ilosc = data["ilosc"]
	nazwa = data["nazwa"]

	if login not in main_users:
		return False

	try:
		ilosc = int(ilosc)
	except:
		return False  # nie wykonalo sie

	return main_users[login].sprzedaj_akcje(nazwa, ilosc)[0]

@app.post("/region_firms")
async def RegionFirms(request: Request):
	global main_scheduler
	data = await request.json()
	region = data["region"]

	return [akcja for akcja in main_scheduler.akcje if region in akcja.region.split(";")]

@app.get("/firminfo")
async def FirmInfo(request: Request):
	global main_scheduler
	data = await request.json()

	try:
		firma = main_scheduler.akcje[data["nazwa"]]
		return {"shares_total": firma.shares_total, "shares_available": firma.shares_available, "value": firma.wartosc, "regiony": firma.region.split(";"), "values": firma.historic_value}
	except:
		return "I tried"

@app.get("/newsy")
async def Newsy():
	global main_scheduler
	temp = [main_scheduler.get_a_news()]
	if temp == [None]: temp = [some_bullshit()]
	elif random.rand() < 0.6: temp = [some_bullshit()]
	return temp

@app.post("/log_in")
async def Login(request: Request):
	global Cookies, main_users
	data = await request.json()

	if data["login"] not in main_users:
		return "User does not exist!"

	else:
		if main_users[data["login"]]["pwd"] == data["pwd"]:
			num_ = random.randint(0, 2**30)
			while num_ in Cookies:
				num_ = random.randint(0, 2**30)

			Cookies[num_] = data["login"]
			return num_

		else:
			return "Wrong Password!"

@app.post("/register")
async def Register(request: Request):
	global main_users
	data = await request.json()

	if data["login"] in main_users:
		return "User already exists!"

	else:
		main_users[data["login"]] = {"pwd": data["pwd"]}
		return "User created!"

@app.post("/cookie-info")
async def CheckUser(request: Request):
	global Cookies
	data = await request.json()

	if "cookie" not in data: return "NO COOKIE?"
	if data["cookie"] in Cookies: return Cookies[data["cookie"]]
	return "Invalid cookie"


def some_bullshit():
	global bullshit_news
	return random.choice(bullshit_news)

#def startup():
#	global RUN
#	while RUN:
#		main_scheduler.check_for_update()
#		time.sleep(0.2)

if True:

	main_users: dict[str, User] = read_users_from_file("../Users/users.json") #para [login][uzytkownik]
	main_scheduler              = Scheduler(loadAkcjeFromPath("../Firmy/"), 60) #to trzyma eventy i akcje
#siema
	Cookies                     = {} #cos
	RUN                         = True

