from fastapi import FastAPI, Request, Cookie
import random
import asyncio
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()
Users   = {}
Cookies = {}
RUN     = True

origins = ["*"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# may god have mercy upon me
async def RunAtIntervals(func):
	global RUN
	while RUN:
		func()
		await asyncio.sleep(1)

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
