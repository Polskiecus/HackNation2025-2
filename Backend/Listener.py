from fastapi import FastAPI, Request, Cookie, Response
#from apscheduler.schedulers.asyncio import AsyncIOScheduler
from fastapi.middleware.cors import CORSMiddleware
from math import lgamma
#import threading
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
reset = 0
bs = ""

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
	main_scheduler.check_for_update()
	return main_scheduler.time_to_pass + main_scheduler.last_checked - time.time()

@app.post("/buy")
async def Buy(request: Request) -> bool:
	global main_scheduler
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

	return main_users[login].kup_akcje(main_scheduler.akcje[nazwa], ilosc)


@app.post("/sell")
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

	return main_users[login].sprzedaj_akcje(main_scheduler.akcje[nazwa], ilosc)

@app.post("/region_firms")
async def RegionFirms(request: Request):
	global main_scheduler
	data = await request.json()
	region = data["region"]

	return [akcja for akcja in main_scheduler.akcje if region in main_scheduler.akcje[akcja].region.split(";")]

@app.post("/firminfo")
async def FirmInfo(request: Request):
	global main_scheduler
	data = await request.json()

	try:
		firma = main_scheduler.akcje[data["nazwa"]]
		return {"shares_total": firma.shares_total, "shares_available": firma.remaining_shares, "value": firma.wartosc, "regiony": firma.region.split(";"), "values": firma.historic_value}
	except:
		return "I tried"

@app.get("/newsy")
async def Newsy():
	global main_scheduler, bs, reset
	temp = [main_scheduler.get_a_news()]
	
	if temp != [None]:
		return [temp[0].nazwa]

	elif reset + 10 < time.time(): 
		bs = some_bullshit()
		reset=time.time()
		return [bs]

	else:
		return [bs]

@app.post("/log_in")
async def Login(request: Request):
	global Cookies, main_users
	data = await request.json()

	if data["login"] not in main_users:
		return "User does not exist!"

	else:
		if main_users[data["login"]].password == data["pwd"]:
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
		main_users[data["login"]] = User(data["login"], data["pwd"])
		return "User created!"

@app.post("/cookie-info")
async def CheckUser(request: Request):
	global Cookies
	data = await request.json()
	#print(Cookies, data["cookie"])
	if data["cookie"] not in Cookies: return "NO COOKIE?"
	if data["cookie"] in Cookies: return Cookies[data["cookie"]]
	return "Invalid cookie"


def some_bullshit():
	global bullshit_news
	return random.choice(bullshit_news)

@app.post("/raid")
async def Raid(request: Request) -> bool:
	global Cookies, main_users, main_scheduler
	data = await request.json()
	login = extract_login_from_request(data["cookie"])
	if data["success"] == False:
		return main_users[login].get_raided(main_scheduler)
	who_got_raided = data["raided"]
	did_it = main_users[who_got_raided].get_raided(main_scheduler)
	if did_it:
		main_users[login].bilans += 69 #nice
	return did_it

@app.post("/acc_value")
async def AccValue(request: Request):
	global Cookies, main_users, main_scheduler
	data = await request.json()
	user = main_users[Cookies[data["token"]]]

	out = 0
	for share in main_scheduler.akcje:
		if share in user.akcje:
			out += user.akcje[share] * main_scheduler.akcje[share].shareprice()

	return out

@app.post("/peep")
async def Peep(request: Request):
	data = await request.json()
	login = extract_login_from_request(data["cookie"])
	woman = data["woman"]
	success = data["success"]

	if success == False:
		main_users[login].bilans = 0
		return True
	return main_users[woman].get_networth(main_scheduler)[1] * uniform(0.7, 1/0.7)
#def startup():
#	global RUN
#	while RUN:
#		main_scheduler.check_for_update()
#		time.sleep(0.2)

@app.post("/money")
async def Money(request: Request):
	global Cookies, main_users
	data = await request.json()
	user = main_users[Cookies[data["token"]]]

	return user.bilans

@app.post("/shares_amount")
async def amount(request: Request):
	global Cookies, main_users
	data = await request.json()
	user = main_users[Cookies[data["token"]]]

	if data["akcja"] in user.akcje:
		return user.akcje[data["akcja"]]
	else:
		return 0

@app.post("/NBP")
async def NBP(request: Request):
	global Coookies, main_users
	data = await request.json()
	user = main_users[Cookies[data["token"]]]
	money = data["money"]

	user.bilans += money

@app.get("/news-full")
async def news2():
	global main_scheduler, bs

	if main_scheduler.get_a_news():
		t = main_scheduler.get_a_news()
		return {"nazwa":t.nazwa,"tresc":t.tresc,"efekty":t.efekty}

	else:
		return {"nazwa":bs,"tresc":"","efekty":{}}

if True:

	main_users: dict[str, User] = read_users_from_file("../Users/users.json") #para [login][uzytkownik]
	main_scheduler              = Scheduler(loadAkcjeFromPath("../Firmy/"), 10) #to trzyma eventy i akcje
#siema
	Cookies                     = {} #cos
	RUN                         = True

