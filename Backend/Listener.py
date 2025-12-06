from math import lgamma

from fastapi import FastAPI, Request, Cookie
import random
import asyncio
from fastapi.middleware.cors import CORSMiddleware
from User import User

app = FastAPI()
Users: dict[str, User]   = {} #dict[login, user]
Cookies = {} #cos
RUN     = True

origins = ["*"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/get_username") #TO DO: IMPLEMENT, BARDZO WAZNE
async def get_login() -> str:
    global Cookies
    try:
        return Cookies[]
    except:
        return "login"


# may god have mercy upon me
async def RunAtIntervals(func):
	global RUN
	while RUN:
		func()
		await asyncio.sleep(1)

@app.get("/timings")
async def Timings():
	return "" #TODO:

@app.get("/player")
async def DaneGracza() -> str:
    login = get_login()
    if login in Users:
        return str(Users[login])
    return "{nie jestes zalogowany albo nie istniejesz}"

@app.get("/buy")
async def Buy(nazwa: str, ilosc: int) -> bool:
    login = get_login()
    if login in Users:
        return Users[login].sprzedaj_akcje(nazwa, ilosc)[0]
    return False

@app.get("/sell")
async def Sell(nazwa: str, ilosc: int) -> bool:
    login = get_login()
    if login in Users:
        return Users[login].kup_akcje(nazwa, ilosc)[0]
    return False

@app.get("/region_firms")
async def RegionFirms():
	return ""

@app.get("/firminfo/{}")
async def FirmInfo():
	return ""

@app.get("/newsy")
async def Newsy():
	return ""

@app.post("/log_in")
async def Login(request: Request):
	global Cookies, Users
	data = await request.json()

	if data["login"] not in Users:
		return "User does not exist!"

	else:
		if Users[data["login"]]["pwd"] == data["pwd"]:
			num_ = random.randint(0, 2**30)
			while num_ in Cookies:
				num_ = random.randint(0, 2**30)

			Cookies[num_] = data["login"]
			return num_

		else:
			return "Wrong Password!"

@app.post("/register")
async def Register(request: Request):
	global Users
	data = await request.json()

	if data["login"] in Users:
		return "User already exists!"

	else:
		Users[data["login"]] = {"pwd": data["pwd"]}
		return "User created!"

@app.post("/cookie-info")
async def CheckUser(cookie_: int = Cookie(None)):
	global Cookies

	if cookie_:
		if cookie_ in Cookies:
			return Cookies[cookie_]

		else:
			return "Wrong Cookie!"

	else:
		return "NO COOKIE?"
